# GramJS Migration Guide

## What Changed?

The Telegram scraper has been **updated to use your personal Telegram account** instead of a bot. This allows you to:

✅ **Read messages from private groups** you're a member of
✅ **Access message history** from before you joined
✅ **No need for admin permissions** - just be a group member
✅ **Works with any group you belong to** (public or private)

## Key Differences

### Before (Bot API with Telegraf)

- ❌ Required creating a bot via @BotFather
- ❌ Bot must be added to the group
- ❌ Needed admin permissions for channels
- ❌ Couldn't access private groups you don't own
- ❌ No access to historical messages

### Now (MTProto with telegram/gramjs)

- ✅ Uses your personal Telegram account
- ✅ Works with any group you're a member of
- ✅ No admin permissions needed
- ✅ Can read private groups
- ✅ Full access to message history

## New Setup Process

### 1. Get Telegram API Credentials

1. Go to https://my.telegram.org/apps
2. Login with your phone number
3. Click "API development tools"
4. Create a new application:
   - App title: "Whats Up Addis Scraper" (or any name)
   - Short name: "whatsup" (or any short name)
   - Platform: Other
5. Copy your `api_id` (number) and `api_hash` (string)

### 2. Update Environment Variables

**Remove these (no longer needed):**

```env
TELEGRAM_BOT_TOKEN=...  # DELETE THIS
```

**Add these instead:**

```env
TELEGRAM_API_ID=1234567
TELEGRAM_API_HASH=abc123def456...
```

### 3. First Time Authentication

When you run the scraper for the first time:

```bash
pnpm telegram:dev
```

You'll be prompted to:

1. **Enter your phone number** (with country code, e.g., +251912345678)
2. **Enter the verification code** (sent to your Telegram app)
3. **Enter your 2FA password** (if you have two-factor authentication enabled)

After successful authentication, a session file `.telegram-session` will be created in the project root. This file allows the scraper to reconnect without asking for credentials again.

**Important:** Keep `.telegram-session` secure! It contains your login session.

### 4. Update Database Sources

Now you can add **any group chat ID** that you're a member of:

```sql
-- For public groups/channels (use username)
INSERT INTO telegram_sources (id, name, chat_id, chat_type, is_active, category_id)
VALUES (
  gen_random_uuid(),
  'Events Addis',
  '@eventsaddis',  -- Public channel username
  'channel',
  true,
  '<category-id>'
);

-- For private groups (use numeric chat ID)
INSERT INTO telegram_sources (id, name, chat_id, chat_type, is_active, category_id)
VALUES (
  gen_random_uuid(),
  'Private Events Group',
  '-1001234567890',  -- Numeric chat ID (negative for groups)
  'group',
  true,
  '<category-id>'
);
```

### 5. Getting Chat IDs for Private Groups

To find the chat ID of a private group:

**Method 1: Using the scraper**

1. Run the scraper in listen mode
2. Send a test message in the group
3. Check the logs for the chat ID

**Method 2: Using Telegram Web**

1. Open Telegram Web (web.telegram.org)
2. Open the group chat
3. Look at the URL: `https://web.telegram.org/k/#-1001234567890`
4. The number after `#` is the chat ID

**Method 3: Using a bot temporarily**

1. Add @userinfobot to the group
2. Forward a message from the group to the bot
3. The bot will tell you the chat ID
4. Remove the bot from the group

## Session Management

### Session File Location

- **File:** `.telegram-session` (in project root)
- **Contains:** Encrypted session data
- **Security:** Keep this file secure! It allows access to your Telegram account

### Managing Sessions

**Clear session (logout):**

```bash
rm .telegram-session
```

**Session expires:** Sessions can expire if:

- You change your password
- You revoke sessions from Telegram settings
- Long period of inactivity

If session expires, just run the scraper again and re-authenticate.

## Code Changes Summary

### TelegramClientService

**Before:**

```typescript
// Bot-based approach
import { Telegraf } from 'telegraf';
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
```

**After:**

```typescript
// User account approach
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
const client = new TelegramClient(
  session,
  parseInt(process.env.TELEGRAM_API_ID),
  process.env.TELEGRAM_API_HASH
);
```

### Key API Differences

| Feature         | Bot API (Telegraf) | MTProto (telegram)      |
| --------------- | ------------------ | ----------------------- |
| Authentication  | Bot token          | Phone + code + password |
| Message history | No                 | Yes (full history)      |
| Private groups  | No (unless admin)  | Yes (if member)         |
| Download media  | Via fileId         | Direct API.Photo object |
| Listen to chats | Automatic          | Requires chat entity    |

## Troubleshooting

### "TELEGRAM_API_ID and TELEGRAM_API_HASH are required"

- Make sure you've added both variables to your `.env` file
- `TELEGRAM_API_ID` should be a number (no quotes)
- `TELEGRAM_API_HASH` should be a string

### "Phone number invalid"

- Include country code (e.g., +251912345678, not 0912345678)
- Don't include spaces or dashes

### "Session revoked"

- Delete `.telegram-session` file
- Run the scraper again to re-authenticate

### "Cannot get entity for chatId"

- Make sure you're a member of that group
- For numeric chat IDs, include the negative sign for groups: `-1001234567890`
- For public groups, use the username with @: `@groupname`

### "Flood wait"

- Telegram rate limiting - wait the specified time
- Reduce frequency of requests
- Consider using cron mode instead of listen mode

## Security Considerations

### Your Telegram Account

- The scraper uses **your personal account**, not a bot
- Be careful with rate limits - don't spam requests
- Telegram may flag unusual activity
- Don't share your session file

### Session File

- `.telegram-session` contains encrypted authentication
- Add to `.gitignore` (already done)
- Keep it secure like a password
- Don't commit to version control

### Recommendations

1. Use a separate Telegram account for scraping (optional but recommended)
2. Don't share session files
3. Monitor your Telegram "Active Sessions" regularly
4. Set up 2FA on your Telegram account
5. Use environment-specific session files in production

## Benefits of This Approach

### For Your Use Case

Since you mentioned you're **not admin of the group** and want to **extract messages from a private group**:

✅ **Perfect solution!** You just need to be a member
✅ Can read all messages (past and future)
✅ No special permissions needed
✅ Works with private groups
✅ Access to full message history

### Performance

- **Faster**: Direct MTProto protocol
- **More reliable**: No bot intermediary
- **Better history**: Full access to past messages
- **Richer data**: More message metadata available

## Migration Checklist

- [ ] Go to https://my.telegram.org/apps and create an app
- [ ] Copy `api_id` and `api_hash`
- [ ] Update `.env` file with new credentials
- [ ] Remove old `TELEGRAM_BOT_TOKEN` from `.env`
- [ ] Run `pnpm install` to get new dependencies
- [ ] Run `pnpm telegram:dev` for first-time setup
- [ ] Enter phone number when prompted
- [ ] Enter verification code from Telegram
- [ ] Enter 2FA password (if enabled)
- [ ] Verify `.telegram-session` file was created
- [ ] Update database with correct chat IDs
- [ ] Test with a private group you're a member of

## Example: Complete Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Update .env file
cat >> .env << EOF
TELEGRAM_API_ID=1234567
TELEGRAM_API_HASH=abc123def456...
EOF

# 3. First run (will prompt for authentication)
pnpm telegram:dev

# Output:
# Connecting to Telegram...
# Please enter your phone number: +251912345678
# Please enter the code you received: 12345
# Connected to Telegram as John Doe
# Session saved successfully

# 4. Add groups to database
psql $DATABASE_URL -c "
INSERT INTO telegram_sources (id, name, chat_id, chat_type, is_active)
VALUES (gen_random_uuid(), 'My Private Group', '-1001234567890', 'group', true);
"

# 5. Run the scraper
pnpm telegram:dev

# Output:
# Starting Telegram listener...
# Found 1 active Telegram sources
# Listening to 1 Telegram sources
# Added listener for: -1001234567890
# Bot is listening for messages in 1 chats...
```

## Need Help?

Common issues and solutions:

1. **Authentication fails**: Check phone number format (include country code)
2. **Can't find group**: Verify you're a member and chat ID is correct
3. **Session expires**: Delete `.telegram-session` and re-authenticate
4. **Rate limiting**: Reduce request frequency or use cron mode
5. **Library errors**: Ensure `telegram` package is installed correctly

---

**Note:** This is a significant change in how the scraper authenticates. The old bot-based approach won't work anymore. Follow this guide carefully to migrate successfully.
