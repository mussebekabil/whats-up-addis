export interface TelegramMessage {
  messageId: number;
  text?: string;
  photo?: TelegramPhoto[];
  video?: TelegramVideo;
  date: number;
  chatId: string | number;
}

export interface TelegramPhoto {
  fileId: string;
  fileUniqueId: string;
  width: number;
  height: number;
  fileSize?: number;
}

export interface TelegramVideo {
  fileId: string;
  fileUniqueId: string;
  width: number;
  height: number;
  duration: number;
  fileSize?: number;
  mimeType?: string;
}

export interface ParsedEventData {
  title: string;
  description: string;
  location?: string;
  venue?: string;
  startDate: string;
  endDate?: string;
  price?: number;
  tags?: string[];
  categoryId?: string;
}

export interface CrawlerStats {
  timestamp: Date;
  source: string;
  messagesProcessed: number;
  eventsCreated: number;
  errors: Array<{ type: string; message: string }>;
}
