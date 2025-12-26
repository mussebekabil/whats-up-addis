import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { NewMessage, NewMessageEvent } from 'telegram/events/index.js';
import { Api } from 'telegram';
// @ts-ignore - no types available
import input from 'input';
import * as fs from 'fs';
import * as path from 'path';
import {
  TelegramMessage,
  TelegramPhoto,
  TelegramVideo,
} from '../types/telegram.types.js';

export class TelegramClientService {
  private client: TelegramClient;
  private isConnected: boolean = false;
  private sessionFile: string;

  constructor() {
    const apiId = parseInt(process.env.TELEGRAM_API_ID || '');
    const apiHash = process.env.TELEGRAM_API_HASH || '';

    if (!apiId || !apiHash) {
      throw new Error('TELEGRAM_API_ID and TELEGRAM_API_HASH are required');
    }

    // Load or create session
    this.sessionFile = path.join(process.cwd(), '.telegram-session');
    const sessionString = this.loadSession();
    const session = new StringSession(sessionString);

    this.client = new TelegramClient(session, apiId, apiHash, {
      connectionRetries: 5,
    });
  }

  async connect(): Promise<void> {
    try {
      console.log('Connecting to Telegram...');

      await this.client.start({
        phoneNumber: async () =>
          await input.text('Please enter your phone number: '),
        password: async () => await input.text('Please enter your password: '),
        phoneCode: async () =>
          await input.text('Please enter the code you received: '),
        onError: (err) => console.error('Error during authentication:', err),
      });

      // Save session for future use
      const sessionString = this.client.session.save() as unknown as string;
      this.saveSession(sessionString);

      this.isConnected = true;
      const me = await this.client.getMe();
      console.log(
        `Connected to Telegram as ${(me as Api.User).firstName || 'User'}`
      );
    } catch (error) {
      console.error('Failed to connect to Telegram:', error);
      throw error;
    }
  }

  async fetchMessages(
    chatId: string,
    lastMessageId?: number,
    limit: number = 100
  ): Promise<TelegramMessage[]> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const messages: TelegramMessage[] = [];

      // Resolve the chat entity (can be username, phone, or numeric ID)
      const entity = await this.client.getEntity(chatId);

      // Fetch messages from the chat
      const result = await this.client.getMessages(entity, {
        limit,
        minId: lastMessageId || 0,
      });

      for (const msg of result) {
        if (msg instanceof Api.Message) {
          const telegramMessage: TelegramMessage = {
            messageId: msg.id,
            text: msg.message || undefined,
            photo: msg.photo ? this.extractPhotoInfo(msg.photo) : undefined,
            video: msg.video ? this.extractVideoInfo(msg.video) : undefined,
            date: msg.date,
            chatId: this.getChatId(entity),
          };
          messages.push(telegramMessage);
        }
      }

      console.log(`Fetched ${messages.length} messages from ${chatId}`);
      return messages;
    } catch (error) {
      console.error(`Failed to fetch messages from ${chatId}:`, error);
      throw error;
    }
  }

  async downloadPhoto(photo: Api.Photo): Promise<Buffer> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      // @ts-ignore - API type mismatch
      const buffer = await this.client.downloadMedia(photo, {
        outputFile: undefined, // Return as buffer
      });

      if (buffer instanceof Buffer) {
        return buffer;
      }

      throw new Error('Failed to download photo as buffer');
    } catch (error) {
      console.error('Failed to download photo:', error);
      throw error;
    }
  }

  async downloadVideo(video: Api.Document): Promise<Buffer> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      // @ts-ignore - API type mismatch
      const buffer = await this.client.downloadMedia(video, {
        outputFile: undefined, // Return as buffer
      });

      if (buffer instanceof Buffer) {
        return buffer;
      }

      throw new Error('Failed to download video as buffer');
    } catch (error) {
      console.error('Failed to download video:', error);
      throw error;
    }
  }

  getMessageLink(chatId: string, messageId: number): string {
    // Remove @ if present and handle numeric IDs
    const cleanChatId = chatId.startsWith('@') ? chatId.slice(1) : chatId;

    // For numeric IDs (private groups), we use c/ prefix
    if (!isNaN(Number(cleanChatId))) {
      return `https://t.me/c/${cleanChatId}/${messageId}`;
    }

    return `https://t.me/${cleanChatId}/${messageId}`;
  }

  async startListening(
    chatIds: string[],
    onMessage: (message: TelegramMessage) => Promise<void>
  ): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      // Resolve all chat entities and get their IDs
      const chatEntities = [];
      for (const chatId of chatIds) {
        try {
          const entity = await this.client.getEntity(chatId);
          chatEntities.push(entity);
          console.log(`Added listener for: ${chatId}`);
        } catch (error) {
          console.error(`Failed to resolve chat ${chatId}:`, error);
        }
      }

      if (chatEntities.length === 0) {
        throw new Error('No valid chats to listen to');
      }

      // Add event handler for new messages
      // Pass chatIds directly instead of resolved entities
      this.client.addEventHandler(
        async (event: NewMessageEvent) => {
          try {
            const msg = event.message;
            console.log('New message received:', JSON.stringify(msg));
            const telegramMessage: TelegramMessage = {
              messageId: msg.id,
              text: msg.message || undefined,
              photo: msg.photo ? this.extractPhotoInfo(msg.photo) : undefined,
              video: msg.video ? this.extractVideoInfo(msg.video) : undefined,
              date: msg.date,
              chatId: this.getChatId(await event.message.getChat()),
            };

            await onMessage(telegramMessage);
          } catch (error) {
            console.error('Error handling message:', error);
          }
        },
        new NewMessage({ chats: chatIds })
      );

      console.log(
        `Bot is listening for messages in ${chatEntities.length} chats...`
      );
      console.log('Press Ctrl+C to stop');

      // Keep the process running
      await new Promise(() => {});
    } catch (error) {
      console.error('Error in listening mode:', error);
      throw error;
    }
  }

  private extractPhotoInfo(photo: any): TelegramPhoto[] {
    if (photo instanceof Api.Photo) {
      // Get the largest size
      const sizes = photo.sizes.filter(
        (size): size is Api.PhotoSize => size instanceof Api.PhotoSize
      );

      return sizes.map((size) => ({
        fileId: photo.id.toString(),
        fileUniqueId: photo.accessHash?.toString() || '',
        width: size.w || 0,
        height: size.h || 0,
        fileSize: size.size || 0,
      }));
    }
    return [];
  }

  private extractVideoInfo(video: any): TelegramVideo | undefined {
    if (video instanceof Api.Document) {
      // Extract video attributes
      const videoAttr = video.attributes.find(
        (attr: any) => attr instanceof Api.DocumentAttributeVideo
      );

      if (videoAttr) {
        return {
          fileId: video.id.toString(),
          fileUniqueId: video.accessHash?.toString() || '',
          width: videoAttr.w || 0,
          height: videoAttr.h || 0,
          duration: videoAttr.duration || 0,
          fileSize: video.size ? Number(video.size) : undefined,
          mimeType: video.mimeType || undefined,
        };
      }
    }
    return undefined;
  }

  private getChatId(entity: any): string | number {
    if (entity instanceof Api.User) {
      return entity.id.toString();
    } else if (entity instanceof Api.Chat) {
      return entity.id.toString();
    } else if (entity instanceof Api.Channel) {
      return entity.id.toString();
    }
    return '';
  }

  private loadSession(): string {
    try {
      if (fs.existsSync(this.sessionFile)) {
        return fs.readFileSync(this.sessionFile, 'utf-8');
      }
    } catch (error) {
      console.log('No existing session found, will create new one');
    }
    return '';
  }

  private saveSession(sessionString: string): void {
    try {
      fs.writeFileSync(this.sessionFile, sessionString, 'utf-8');
      console.log('Session saved successfully');
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
      console.log('Disconnected from Telegram');
    }
  }

  // Helper method to get photo for download
  async getPhotoFromMessage(
    chatId: string,
    messageId: number
  ): Promise<Api.Photo | null> {
    try {
      const entity = await this.client.getEntity(chatId);
      const messages = await this.client.getMessages(entity, {
        ids: [messageId],
      });

      if (messages && messages[0] && messages[0].photo) {
        return messages[0].photo as Api.Photo;
      }

      return null;
    } catch (error) {
      console.error('Failed to get photo from message:', error);
      return null;
    }
  }

  // Helper method to get video for download
  async getVideoFromMessage(
    chatId: string,
    messageId: number
  ): Promise<Api.Document | null> {
    try {
      const entity = await this.client.getEntity(chatId);
      const messages = await this.client.getMessages(entity, {
        ids: [messageId],
      });

      if (messages && messages[0] && messages[0].video) {
        return messages[0].video as Api.Document;
      }

      return null;
    } catch (error) {
      console.error('Failed to get video from message:', error);
      return null;
    }
  }
}
