// API Route: Post Listing to Telegram Channel
import { NextRequest, NextResponse } from "next/server";
import { telegramService } from "@/lib/telegram-service";
import { TelegramMessageFormatter } from "@/lib/telegram-message-formatter";

export async function POST(request: NextRequest) {
  try {
    const listing = await request.json();

    // Validate required fields
    if (!listing.description || !listing.location || !listing.monthly_rent) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if Telegram is configured
    if (!telegramService.isConfigured()) {
      console.warn("Telegram not configured, skipping channel post");
      return NextResponse.json(
        {
          success: false,
          error: "Telegram not configured",
          skipped: true,
        },
        { status: 200 }
      );
    }

    // Format the message
    const message = TelegramMessageFormatter.formatListingMessage(listing);
    
    // Create inline keyboard
    const keyboard = TelegramMessageFormatter.createListingKeyboard(
      listing.id,
      listing.phone_number
    );

    // Log photo URLs for debugging
    console.log("Posting to Telegram with:", {
      listingId: listing.id,
      photoCount: listing.photos?.length || 0,
      photos: listing.photos,
    });

    // Send to Telegram channel
    const result = await telegramService.sendListingToChannel(
      message,
      listing.photos || [],
      keyboard
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
      });
    } else {
      console.error("Telegram posting failed:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error posting to Telegram:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
