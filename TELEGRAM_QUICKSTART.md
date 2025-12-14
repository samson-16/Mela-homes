# Quick Start: Adding Your Telegram Credentials

## What You Need

1. Your **Telegram Bot Token** (from @BotFather)
2. Your **Telegram Channel ID** or username

## Setup Steps

### 1. Add Environment Variables

Open your `.env.local` file and add these lines:

```env
TELEGRAM_BOT_TOKEN=paste_your_bot_token_here
TELEGRAM_CHANNEL_ID=@your_channel_username
NEXT_PUBLIC_MINI_APP_URL=http://localhost:3000
```

### 2. Make Sure Bot is Admin

1. Open your Telegram channel
2. Go to channel info → Administrators
3. Add your bot as administrator
4. Give it permission to "Post Messages"

### 3. Test It!

1. Restart your dev server: `npm run dev`
2. Create a new listing on your website
3. Check your Telegram channel - the listing should appear!

## What Happens When You Post a Listing?

✅ Listing is saved to your database  
✅ Listing is posted to your Telegram channel with:
- Formatted message with emojis
- All photos (up to 10)
- "Contact Info" button
- "View Details" button (opens Mini App)

## Troubleshooting

**Listing not appearing in channel?**
- Check bot token is correct
- Verify bot is admin in channel
- Check browser console for errors

**Need help?** See [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md) for detailed instructions.
