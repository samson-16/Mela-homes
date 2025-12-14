# Telegram Integration Setup Guide

## Prerequisites

1. **Telegram Bot**: Create a bot using @BotFather
2. **Telegram Channel**: Create a public or private channel
3. **Deployed Website**: Your app must be deployed with HTTPS

## Step 1: Create Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` command
3. Follow the prompts to create your bot
4. Copy the **bot token** (looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Step 2: Create Telegram Channel

1. Create a new channel in Telegram
2. Make it public or private
3. Add your bot as an administrator:
   - Go to channel settings
   - Administrators → Add Administrator
   - Search for your bot and add it
   - Give it permission to post messages

## Step 3: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_CHANNEL_ID=@your_channel_username
NEXT_PUBLIC_MINI_APP_URL=https://your-deployed-domain.com
```

**Note**: For private channels, use the channel ID (e.g., `-1001234567890`) instead of username.

## Step 4: Set Up Mini App

1. In BotFather, send `/newapp`
2. Select your bot
3. Provide app details:
   - **Title**: Mela Homes
   - **Description**: Find and post rental listings
   - **Photo**: Upload an app icon (640x360px)
   - **Demo GIF/Video**: Optional
   - **URL**: Your deployed website URL (must be HTTPS)

4. You'll receive a short name for your Mini App

## Step 5: Set Up Menu Button (Optional)

1. In BotFather, send `/setmenubutton`
2. Select your bot
3. Choose "Edit menu button"
4. Enter button text: "Open App"
5. Enter your Mini App URL

## Step 6: Set Up Webhook

After deploying your app, set up the webhook:

1. Send a POST request to set the webhook:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
```

2. Verify webhook is set:
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

## Step 7: Test the Integration

1. **Test Listing Creation**:
   - Create a new listing on your website
   - Check if it appears in your Telegram channel
   - Verify photos are included
   - Test the "Contact Info" button

2. **Test Mini App**:
   - Open your bot in Telegram
   - Click the menu button to open the Mini App
   - Browse listings
   - Test navigation and interactions

## Troubleshooting

### Listings not appearing in channel
- Verify bot is admin in the channel
- Check bot token is correct
- Check channel ID/username is correct
- Look for errors in browser console

### Contact Info button not working
- Verify webhook is set up correctly
- Check webhook URL is accessible
- Test webhook endpoint: `GET https://your-domain.com/api/telegram/webhook`

### Mini App not loading
- Ensure your site is deployed with HTTPS
- Check Telegram WebApp SDK is loaded
- Verify NEXT_PUBLIC_MINI_APP_URL is set correctly

## Features

### Telegram Channel Posts
- Automatic posting when listings are created
- Formatted messages with emojis
- Photo galleries (up to 10 photos)
- Inline keyboard with "Contact Info" button
- "View Details" button opens Mini App

### Telegram Mini App
- Full website functionality in Telegram
- Native Telegram theme integration
- Back button support
- Haptic feedback
- Optimized for mobile

### Contact Info Flow
1. User clicks "Contact Info" button in channel
2. Bot sends private message with:
   - Property description
   - Phone number (copyable)
4. User can directly contact owner

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | Bot token from BotFather | `1234567890:ABC...` |
| `TELEGRAM_CHANNEL_ID` | Channel username or ID | `@melahomes` or `-1001234567890` |
| `NEXT_PUBLIC_MINI_APP_URL` | Deployed website URL | `https://mela-homes.vercel.app` |

## Security Notes

- Never commit `.env.local` to version control
- Bot token should be kept secret
- Validate initData on server-side for Mini App auth
- Use HTTPS for all production deployments
