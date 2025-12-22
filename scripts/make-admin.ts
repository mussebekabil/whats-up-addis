import { prisma } from '@whats-up-addis/database';

async function makeAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: tsx scripts/make-admin.ts <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });

    console.log(`✓ Successfully made ${user.name} (${user.email}) an ADMIN`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
