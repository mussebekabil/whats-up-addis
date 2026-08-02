import { prisma } from '@whats-up-addis/database';
import { sendEmail } from '../services/email.service.js';
import { getUpcomingEventsForCategories } from '../services/event.service.js';
import { buildDigestEmail } from '../services/template.service.js';

const FREQUENCY_DAYS: Record<string, number> = {
  EVERY_3_DAYS: 3,
  WEEKLY: 7,
};

function isDue(lastSentAt: Date | null, frequencyDays: number): boolean {
  if (!lastSentAt) return true;
  const elapsed =
    (Date.now() - lastSentAt.getTime()) / (1000 * 60 * 60 * 24);
  return elapsed >= frequencyDays;
}

function generateManageUrl(appUrl: string): string {
  return `${appUrl}/profile?tab=notifications`;
}

export async function runDigestJob(): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  console.log(`[digest] Starting subscribed-user digest job`);

  const usersWithSubs = await prisma.userCategorySubscription.findMany({
    select: { userId: true, categoryId: true },
  });

  const userIdToCategories = new Map<string, string[]>();
  for (const { userId, categoryId } of usersWithSubs) {
    const cats = userIdToCategories.get(userId) ?? [];
    cats.push(categoryId);
    userIdToCategories.set(userId, cats);
  }

  const userIds = [...userIdToCategories.keys()];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, name: true },
  });

  const settingsMap = new Map(
    (
      await prisma.userNotificationSettings.findMany({
        where: { userId: { in: userIds } },
      })
    ).map((s) => [s.userId, s])
  );

  let sent = 0;
  let skipped = 0;

  for (const user of users) {
    const categoryIds = userIdToCategories.get(user.id) ?? [];
    const settings = settingsMap.get(user.id);
    const frequency = settings?.digestFrequency ?? 'EVERY_3_DAYS';
    const frequencyDays = FREQUENCY_DAYS[frequency] ?? 3;
    const lastSentAt = settings?.lastDigestSentAt ?? null;
    if (!isDue(lastSentAt, frequencyDays)) {
      skipped++;
      continue;
    }

    const events = await getUpcomingEventsForCategories(categoryIds);
    if (events.length === 0) {
      skipped++;
      continue;
    }

    try {
      const html = buildDigestEmail({
        userName: user.name,
        events,
        appUrl,
        unsubscribeUrl: generateManageUrl(appUrl),
      });

      await sendEmail({
        to: user.email,
        toName: user.name,
        subject: "What's Up Addis — Your Event Digest",
        htmlContent: html,
      });

      await prisma.userNotificationSettings.upsert({
        where: { userId: user.id },
        update: { lastDigestSentAt: new Date() },
        create: { userId: user.id, lastDigestSentAt: new Date() },
      });

      sent++;
      console.log(`[digest] Sent to ${user.email}`);
    } catch (err) {
      console.error(`[digest] Failed for ${user.email}:`, err);
    }
  }

  console.log(`[digest] Done. Sent: ${sent}, Skipped: ${skipped}`);
}
