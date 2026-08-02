import * as cron from 'node-cron';
import { runDigestJob } from './jobs/digest.job.js';
import { runGenericJob } from './jobs/generic.job.js';

const CRON_SCHEDULE = process.env.EMAIL_SCHEDULER_SCHEDULE || '0 20 * * *'; // Daily at 20:00

console.log('Email scheduler starting...');

cron.schedule(CRON_SCHEDULE, async () => {
  const ts = new Date().toISOString();
  console.log(`\n[${ts}] Daily digest tick`);
  try {
    await runDigestJob();
    await runGenericJob();
  } catch (err) {
    console.error('Unhandled error in digest tick:', err);
  }
});

console.log(`Email scheduler running. Digest fires on schedule: ${CRON_SCHEDULE}`);
