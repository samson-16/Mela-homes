// Telegram Bot API Service

import type {
  TelegramApiResponse,
  TelegramMessage,
  TelegramSendMessageParams,
  TelegramSendPhotoParams,
  TelegramSendMediaGroupParams,
  TelegramInputMedia,
} from "@/types/telegram";

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

export class TelegramService {
  private botToken: string;
  private channelId: string;

  constructor(botToken?: string, channelId?: string) {
    this.botToken = botToken || process.env.TELEGRAM_BOT_TOKEN || "";
    this.channelId = channelId || process.env.TELEGRAM_CHANNEL_ID || "";

    if (!this.botToken) {
      console.warn("Telegram bot token not configured");
    }
    if (!this.channelId) {
      console.warn("Telegram channel ID not configured");
    }
  }

  /**
   * Check if Telegram is properly configured
   */
  isConfigured(): boolean {
    return !!(this.botToken && this.channelId);
  }

  /**
   * Validate and normalize photo URL for Telegram
   * Telegram requires publicly accessible HTTP/HTTPS URLs
   */
  private normalizePhotoUrl(photoUrl: string): string | null {
    try {
      // Skip base64 images - Telegram can't access them
      if (photoUrl.startsWith("data:")) {
        console.warn("Skipping base64 image - Telegram requires HTTP/HTTPS URLs");
        return null;
      }

      // Skip empty or invalid URLs
      if (!photoUrl || photoUrl.trim() === "") {
        return null;
      }

      // If it's already a full URL, validate it
      if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
        // Validate URL format
        const url = new URL(photoUrl);
        // Skip localhost URLs in production
        if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
          console.warn(`Skipping localhost URL: ${photoUrl}`);
          return null;
        }
        return photoUrl;
      }

      // If it's a relative URL, try to convert it to absolute
      // Use the backend API URL as base since that's where photos are stored
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (baseUrl) {
        // Remove /api suffix if present to get the base domain
        const domain = baseUrl.replace(/\/api\/?$/, "");
        
        // Remove leading slash from relative URL
        const relativePath = photoUrl.startsWith("/") ? photoUrl.substring(1) : photoUrl;
        
        const absoluteUrl = `${domain}/${relativePath}`;
        
        // Validate the constructed URL
        new URL(absoluteUrl);
        return absoluteUrl;
      }

      console.warn(`Could not convert relative URL to absolute: ${photoUrl}`);
      return null;
    } catch (error) {
      console.error(`Invalid photo URL: ${photoUrl}`, error);
      return null;
    }
  }

  /**
   * Send a text message to a chat
   */
  async sendMessage(
    params: TelegramSendMessageParams
  ): Promise<TelegramApiResponse<TelegramMessage>> {
    const url = `${TELEGRAM_API_BASE}${this.botToken}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      return await response.json();
    } catch (error) {
      console.error("Error sending Telegram message:", error);
      return {
        ok: false,
        description: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send a photo to a chat
   */
  async sendPhoto(
    params: TelegramSendPhotoParams
  ): Promise<TelegramApiResponse<TelegramMessage>> {
    const url = `${TELEGRAM_API_BASE}${this.botToken}/sendPhoto`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      return await response.json();
    } catch (error) {
      console.error("Error sending Telegram photo:", error);
      return {
        ok: false,
        description: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send multiple photos as a media group
   */
  async sendMediaGroup(
    params: TelegramSendMediaGroupParams
  ): Promise<TelegramApiResponse<TelegramMessage[]>> {
    const url = `${TELEGRAM_API_BASE}${this.botToken}/sendMediaGroup`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      return await response.json();
    } catch (error) {
      console.error("Error sending Telegram media group:", error);
      return {
        ok: false,
        description: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send a listing to the configured channel
   */
  async sendListingToChannel(
    message: string,
    photos: string[],
    replyMarkup?: any
  ): Promise<{ success: boolean; error?: string; messageId?: number }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: "Telegram not configured",
      };
    }

    try {
      // Validate and normalize photo URLs
      const validPhotos = photos
        .map((url) => this.normalizePhotoUrl(url))
        .filter((url): url is string => url !== null);

      console.log(`Processing ${photos.length} photos, ${validPhotos.length} valid for Telegram`);

      if (validPhotos.length > 0) {
        // If there are photos, send as media group with caption on first photo
        if (validPhotos.length === 1) {
          // Single photo
          const result = await this.sendPhoto({
            chat_id: this.channelId,
            photo: validPhotos[0],
            caption: message,
            parse_mode: "HTML",
            reply_markup: replyMarkup,
          });

          if (result.ok && result.result) {
            return {
              success: true,
              messageId: result.result.message_id,
            };
          } else {
            return {
              success: false,
              error: result.description || "Failed to send photo",
            };
          }
        } else {
          // Multiple photos - send as media group
          const media: TelegramInputMedia[] = validPhotos.slice(0, 10).map((photo, index) => ({
            type: "photo" as const,
            media: photo,
            ...(index === 0 && {
              caption: message,
              parse_mode: "HTML" as const,
            }),
          }));

          const mediaResult = await this.sendMediaGroup({
            chat_id: this.channelId,
            media,
          });

          // Send a follow-up message with the keyboard buttons
          // (media groups don't support inline keyboards)
          if (mediaResult.ok && replyMarkup) {
            await this.sendMessage({
              chat_id: this.channelId,
              text: "👆 Interested in this property?",
              reply_markup: replyMarkup,
            });
          }

          if (mediaResult.ok && mediaResult.result && mediaResult.result.length > 0) {
            return {
              success: true,
              messageId: mediaResult.result[0].message_id,
            };
          } else {
            return {
              success: false,
              error: mediaResult.description || "Failed to send media group",
            };
          }
        }
      } else {
        // No valid photos, send text message only
        console.log("No valid photos found, sending text-only message");
        const result = await this.sendMessage({
          chat_id: this.channelId,
          text: message,
          parse_mode: "HTML",
          reply_markup: replyMarkup,
        });

        if (result.ok && result.result) {
          return {
            success: true,
            messageId: result.result.message_id,
          };
        } else {
          return {
            success: false,
            error: result.description || "Failed to send message",
          };
        }
      }
    } catch (error) {
      console.error("Error in sendListingToChannel:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Answer a callback query (from inline keyboard button)
   */
  async answerCallbackQuery(
    callbackQueryId: string,
    text?: string,
    showAlert = false
  ): Promise<TelegramApiResponse<boolean>> {
    const url = `${TELEGRAM_API_BASE}${this.botToken}/answerCallbackQuery`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text,
          show_alert: showAlert,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error("Error answering callback query:", error);
      return {
        ok: false,
        description: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Set webhook URL for receiving updates
   */
  async setWebhook(url: string): Promise<TelegramApiResponse<boolean>> {
    const apiUrl = `${TELEGRAM_API_BASE}${this.botToken}/setWebhook`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      return await response.json();
    } catch (error) {
      console.error("Error setting webhook:", error);
      return {
        ok: false,
        description: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Export a singleton instance
export const telegramService = new TelegramService();
