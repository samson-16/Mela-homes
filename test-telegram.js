// Test Telegram Configuration
// Run this with: node test-telegram.js

require('dotenv').config({ path: '.env.local' });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

console.log("🔍 Testing Telegram Configuration...\n");

// Check environment variables
console.log("1. Environment Variables:");
console.log(`   TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN ? "✅ Set" : "❌ Not set"}`);
console.log(`   TELEGRAM_CHANNEL_ID: ${TELEGRAM_CHANNEL_ID ? "✅ Set" : "❌ Not set"}`);

if (!TELEGRAM_BOT_TOKEN) {
  console.log("\n❌ ERROR: TELEGRAM_BOT_TOKEN is not set in .env.local");
  console.log("   Add: TELEGRAM_BOT_TOKEN=your_bot_token_here");
  process.exit(1);
}

if (!TELEGRAM_CHANNEL_ID) {
  console.log("\n❌ ERROR: TELEGRAM_CHANNEL_ID is not set in .env.local");
  console.log("   Add: TELEGRAM_CHANNEL_ID=@your_channel_username");
  process.exit(1);
}

console.log(`   Token starts with: ${TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
console.log(`   Channel ID: ${TELEGRAM_CHANNEL_ID}\n`);

// Test bot token validity
console.log("2. Testing Bot Token...");
fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`)
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      console.log(`   ✅ Bot token is valid!`);
      console.log(`   Bot name: @${data.result.username}`);
      console.log(`   Bot ID: ${data.result.id}\n`);
      
      // Test sending a message
      console.log("3. Testing Channel Access...");
      return fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHANNEL_ID,
          text: "🧪 Test message from Mela Homes\n\nIf you see this, the integration is working!",
          parse_mode: "HTML"
        })
      });
    } else {
      console.log(`   ❌ Bot token is invalid!`);
      throw new Error(data.description);
    }
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      console.log(`   ✅ Successfully posted to channel!`);
      console.log(`   Message ID: ${data.result.message_id}`);
      console.log(`\n✅ All tests passed! Telegram integration is working.`);
    } else {
      console.log(`   ❌ Failed to post to channel!`);
      console.log(`   Error: ${data.description}`);
      console.log(`\n   Common issues:`);
      console.log(`   - Bot is not an admin in the channel`);
      console.log(`   - Channel ID is incorrect`);
      console.log(`   - Channel is private and bot wasn't added`);
    }
  })
  .catch(err => {
    console.log(`   ❌ Error: ${err.message}`);
  });
