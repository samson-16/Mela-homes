// API Route: Telegram Webhook Handler
import { NextRequest, NextResponse } from "next/server";
import { telegramService } from "@/lib/telegram-service";
import { TelegramMessageFormatter } from "@/lib/telegram-message-formatter";
import type { TelegramWebhookUpdate } from "@/types/telegram";
import api from "@/lib/axios";

export async function POST(request: NextRequest) {
  try {
    const update: TelegramWebhookUpdate = await request.json();

    // Handle callback queries (button clicks)
    if (update.callback_query) {
      const { callback_query } = update;
      const callbackData = callback_query.data || "";

      // Handle "Contact Info" button
      if (callbackData.startsWith("contact_")) {
        const listingId = callbackData.replace("contact_", "");

        try {
          // Fetch listing details from API
          const response = await api.get(`/rent-listings/${listingId}/`);
          const listing = response.data.data || response.data;

          // Format contact message
          const contactMessage = TelegramMessageFormatter.formatContactMessage(
            listing.phone_number,
            listing.description || listing.property_type
          );

          // Send contact info to user via private message
          await telegramService.sendMessage({
            chat_id: callback_query.from.id,
            text: contactMessage,
            parse_mode: "HTML",
          });

          // Answer the callback query
          await telegramService.answerCallbackQuery(
            callback_query.id,
            "Contact info sent to your private messages! 📱"
          );
        } catch (error) {
          console.error("Error fetching listing:", error);
          await telegramService.answerCallbackQuery(
            callback_query.id,
            "Sorry, could not retrieve contact information.",
            true
          );
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Telegram webhook endpoint is active",
  });
}
