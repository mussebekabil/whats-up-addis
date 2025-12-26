# Quick Reference - GramJS Setup

## ✅ What You Can Do Now

Since you're using **your personal Telegram account** (not a bot):

- ✅ Read messages from **private groups** you're a member of
- ✅ Access **full message history**
- ✅ **No admin permissions** needed
- ✅ Works with **any group** you belong to

## 🚀 Quick Setup (5 Steps)

### 1. Get API Credentials

```
https://my.telegram.org/apps
→ Login with your phone
→ Create new app
→ Copy api_id and api_hash
```

### 2. Update .env

```env
TELEGRAM_API_ID=1234567
TELEGRAM_API_HASH=abc123def456...
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. First Run (Authentication)

```bash
pnpm telegram:dev

# You'll be prompted:
# → Phone number: +251912345678
# → Code: 12345 (from Telegram app)
# → Password: (if 2FA enabled)
```

### 5. Add Private Group

```sql
INSERT INTO telegram_sources (id, name, chat_id, chat_type, is_active)
VALUES (
  gen_random_uuid(),
  'My Private Group',
  '-1001234567890',  -- Numeric chat ID / @LinkUpAddis
  'group', -- channel
  true
);
```

## 📱 Getting Chat ID for Private Groups

### Method 1: From Logs

```bash
# Run scraper
pnpm telegram:dev

# Send message in group
# Check logs for: "Received message from unknown source: -1001234567890"
```

### Method 2: Telegram Web

```
1. Open web.telegram.org
2. Open the group
3. Check URL: .../#-1001234567890
4. Copy the number (including minus sign)
```

### Method 3: Forward to Bot

```
1. Add @userinfobot to group temporarily
2. Forward any message from group to bot
3. Bot tells you the chat ID
4. Remove bot
```

## 🔐 Session Management

### Session File

- **Location**: `.telegram-session` (project root)
- **Contains**: Your authenticated session
- **Keep secure!** Don't share or commit

### Clear Session (Logout)

```bash
rm .telegram-session
# Next run will ask for authentication again
```

## 💻 Run Commands

```bash
# Development (with auto-reload)
pnpm telegram:dev

# Run once (for testing)
pnpm telegram:scrape

# Production
pnpm --filter @whats-up-addis/telegram-scraper start
```

## 🛠️ Common Chat ID Formats

```sql
-- Public channel (use @username)
chat_id: '@eventsaddis'
chat_type: 'channel'

-- Private channel (numeric ID)
chat_id: '-1001234567890'
chat_type: 'channel'

-- Private group (numeric ID)
chat_id: '-1001234567890'
chat_type: 'group'

-- Supergroup (numeric ID)
chat_id: '-1001234567890'
chat_type: 'supergroup'
```

## ❗ Troubleshooting

### "API credentials required"

```bash
# Check .env has both:
TELEGRAM_API_ID=1234567  # (number, no quotes)
TELEGRAM_API_HASH=abc... # (string)
```

### "Phone number invalid"

```
Use format: +251912345678
NOT: 0912345678
```

### "Cannot get entity"

```
✓ Make sure you're a member of the group
✓ Use correct chat ID format (with - for groups)
✓ For private groups: -1001234567890
✓ For public groups: @groupname
```

### "Session revoked"

```bash
rm .telegram-session
pnpm telegram:dev  # Re-authenticate
```

## 📊 Example: Complete Working Setup

```bash
# 1. Environment variables
cat >> .env << 'EOF'
TELEGRAM_API_ID=1234567
TELEGRAM_API_HASH=abc123def456
ANTHROPIC_API_KEY=sk-ant-...
CLOUDINARY_CLOUD_NAME=mycloud
CLOUDINARY_API_KEY=123456
CLOUDINARY_API_SECRET=abc123
DATABASE_URL=postgresql://user:pass@localhost/db
EOF

# 2. First authentication
pnpm telegram:dev
# → Enter phone: +251912345678
# → Enter code: 12345
# → Session saved ✓

# 3. Add private group
psql $DATABASE_URL << 'EOF'
INSERT INTO telegram_sources (id, name, chat_id, chat_type, is_active)
VALUES (gen_random_uuid(), 'Events Group', '-1001234567890', 'group', true);
EOF

# 4. Start scraper
pnpm telegram:dev

# Output:
# Connecting to Telegram...
# Connected to Telegram as John Doe
# Starting Telegram listener...
# Found 1 active Telegram sources
# Added listener for: -1001234567890
# Bot is listening for messages in 1 chats...
```

## 🎯 Your Use Case

> "I am not the admin of the telegram group. The telegram group is private, my telegram account is part of that group."

**Perfect!** This solution is designed for exactly this scenario:

1. ✅ You don't need to be admin
2. ✅ Works with private groups
3. ✅ Just need to be a member
4. ✅ Can read all messages (past and future)

### Steps for Your Private Group

```bash
# 1. Get the chat ID
# Option A: Send test message and check logs
# Option B: Use Telegram Web URL
# Option C: Use @userinfobot

# 2. Add to database
INSERT INTO telegram_sources (id, name, chat_id, chat_type, is_active)
VALUES (gen_random_uuid(), 'Private Events', '-1001234567890', 'group', true);

# 3. Start scraper
pnpm telegram:dev

# 4. Events will be extracted automatically!
```

## 📁 Files You'll Need

```
.env                      # Your credentials
.telegram-session         # Auto-created on first run
apps/telegram-scraper/    # The service code
```

## 🔗 Useful Links

- **Get API credentials**: https://my.telegram.org/apps
- **Anthropic API**: https://console.anthropic.com/
- **Cloudinary**: https://cloudinary.com/console
- **Full docs**: See README.md and GRAMJS-MIGRATION.md

## ⚡ Pro Tips

1. **Test first**: Use a test group to verify everything works
2. **Rate limits**: Don't spam requests, Telegram will rate limit you
3. **Session file**: Backup `.telegram-session` - saves re-authentication
4. **2FA**: If enabled, you'll be prompted for password
5. **Multiple groups**: Add multiple `telegram_sources` - scraper handles all

## 📞 Need More Help?

- **Migration guide**: GRAMJS-MIGRATION.md
- **Full setup**: README.md
- **Step-by-step**: QUICKSTART.md

---

**TL;DR:**

1. Get api_id/api_hash from my.telegram.org/apps
2. Add to .env
3. Run `pnpm telegram:dev`
4. Enter phone + code
5. Add chat_id to database
6. Done! 🎉
