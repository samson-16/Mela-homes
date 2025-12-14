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
      if (photos && photos.length > 0) {
        // If there are photos, send as media group with caption on first photo
        if (photos.length === 1) {
          // Single photo
          const result = await this.sendPhoto({
            chat_id: this.channelId,
            photo: photos[0],
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
          const media: TelegramInputMedia[] = photos.slice(0, 10).map((photo, index) => ({
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
        // No photos, send text message only
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
