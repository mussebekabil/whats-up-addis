import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
// @ts-ignore - no types available
import input from 'input';

/**
 * This script generates a Telegram session string that can be used
 * for non-interactive authentication in production environments like Railway.
 *
 * Run this locally once to generate your session string, then add it
 * to your Railway environment variables as TELEGRAM_SESSION_STRING.
 */
async function generateSession() {
  const apiId = parseInt(process.env.TELEGRAM_API_ID || '');
  const apiHash = process.env.TELEGRAM_API_HASH || '';

  if (!apiId || !apiHash) {
    console.error('Error: TELEGRAM_API_ID and TELEGRAM_API_HASH are required');
    console.log(
      '\nPlease set these environment variables before running this script.'
    );
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('Telegram Session Generator');
  console.log('='.repeat(60));
  console.log(
    '\nThis will authenticate with Telegram and generate a session string.'
  );
  console.log('You will need to:');
  console.log(
    '1. Enter your phone number (with country code, e.g., +1234567890)'
  );
  console.log('2. Enter the verification code sent to your Telegram app');
  console.log('3. Enter your 2FA password (if enabled)');
  console.log('\n');

  const session = new StringSession('');
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  });

  try {
    await client.start({
      phoneNumber: async () => {
        return await input.text('Phone number (with country code): ');
      },
      password: async () => {
        return await input.text('2FA password (if enabled): ');
      },
      phoneCode: async () => {
        return await input.text('Verification code: ');
      },
      onError: (err) => {
        console.error('Authentication error:', err);
      },
    });

    const sessionString = client.session.save() as unknown as string;
    const me = await client.getMe();

    console.log('\n' + '='.repeat(60));
    console.log('✓ Authentication Successful!');
    console.log('='.repeat(60));
    console.log(`\nAuthenticated as: ${(me as any).firstName || 'User'}`);
    console.log('\n' + '-'.repeat(60));
    console.log('Your Session String:');
    console.log('-'.repeat(60));
    console.log(sessionString);
    console.log('-'.repeat(60));
    console.log('\n⚠️  IMPORTANT: Keep this session string secure!');
    console.log('\nNext steps:');
    console.log('1. Copy the session string above');
    console.log('2. In Railway, add it as an environment variable:');
    console.log('   Variable name: TELEGRAM_SESSION_STRING');
    console.log('   Variable value: [paste the session string]');
    console.log('3. Redeploy your application');
    console.log(
      '\n✓ Your app will now authenticate without interactive input!'
    );
    console.log('='.repeat(60) + '\n');

    await client.disconnect();
  } catch (error) {
    console.error('\n❌ Failed to generate session:', error);
    process.exit(1);
  }
}

generateSession();
