import { prisma } from '@whats-up-addis/database';
import { sendEmail } from '../services/email.service.js';
import { getUpcomingEvents } from '../services/event.service.js';
import { buildGenericEmail } from '../services/template.service.js';

const GENERIC_FREQUENCY_DAYS = 7;

function isDue(lastSentAt: Date | null): boolean {
  if (!lastSentAt) return true;
  const elapsed = (Date.now() - lastSentAt.getTime()) / (1000 * 60 * 60 * 24);
  return elapsed >= GENERIC_FREQUENCY_DAYS;
}

export async function runGenericJob(): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  console.log(`[generic] Starting generic digest job`);

  const events = await getUpcomingEvents(6);
  if (events.length === 0) {
    console.log('[generic] No upcoming events, skipping');
    return;
  }

  // Users with zero subscriptions and generic emails enabled
  const allUsers = await prisma.user.findMany({
    where: {
      subscriptions: { none: {} },
    },
    select: {
      id: true,
      email: true,
      name: true,
      notificationSettings: {
        select: { genericEmailOptOut: true, lastGenericSentAt: true },
      },
    },
  });

  let sent = 0;
  let skipped = 0;

  for (const user of allUsers) {
    const optOut = user.notificationSettings?.genericEmailOptOut ?? false;
    if (optOut) {
      skipped++;
      continue;
    }

    const lastSentAt = user.notificationSettings?.lastGenericSentAt ?? null;
    if (!isDue(lastSentAt)) {
      skipped++;
      continue;
    }

    try {
      const unsubscribeUrl = `${appUrl}/profile?tab=notifications`;
      const html = buildGenericEmail({ events, appUrl, unsubscribeUrl });

      await sendEmail({
        to: user.email,
        toName: user.name,
        subject: "What's Up Addis — Events You Might Like",
        htmlContent: html,
      });

      await prisma.userNotificationSettings.upsert({
        where: { userId: user.id },
        update: { lastGenericSentAt: new Date() },
        create: { userId: user.id, lastGenericSentAt: new Date() },
      });

      sent++;
      console.log(`[generic] Sent to ${user.email}`);
    } catch (err) {
      console.error(`[generic] Failed for ${user.email}:`, err);
    }
  }

  console.log(`[generic] Done. Sent: ${sent}, Skipped: ${skipped}`);
}
