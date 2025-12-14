// Telegram API Types

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramChat {
  id: number;
  type: string;
  title?: string;
  username?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
}

export interface TelegramInlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
  web_app?: {
    url: string;
  };
}

export interface TelegramInlineKeyboardMarkup {
  inline_keyboard: TelegramInlineKeyboardButton[][];
}

export interface TelegramSendMessageParams {
  chat_id: string | number;
  text: string;
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
  reply_markup?: TelegramInlineKeyboardMarkup;
  disable_web_page_preview?: boolean;
}

export interface TelegramSendPhotoParams {
  chat_id: string | number;
  photo: string;
  caption?: string;
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
  reply_markup?: TelegramInlineKeyboardMarkup;
}

export interface TelegramSendMediaGroupParams {
  chat_id: string | number;
  media: TelegramInputMedia[];
}

export interface TelegramInputMedia {
  type: "photo" | "video";
  media: string;
  caption?: string;
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

export interface TelegramWebhookUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export interface TelegramApiResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

// Mini App Types
export interface TelegramWebAppInitData {
  query_id?: string;
  user?: TelegramUser;
  receiver?: TelegramUser;
  chat?: TelegramChat;
  chat_type?: string;
  chat_instance?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date: number;
  hash: string;
}

export interface TelegramWebAppThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}
