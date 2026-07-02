import { GoogleGenerativeAI } from '@google/generative-ai';
import { ParsedEventData } from '../types/telegram.types.js';
import { z } from 'zod';

const EventDataSchema = z.object({
  title: z.string().max(255).nullable(),
  description: z.string(),
  location: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  price: z.number().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  categoryId: z.string().optional().nullable(),
});

interface BatchMessage {
  messageId: number;
  text: string;
}

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export class LLMParserService {
  private genAI: GoogleGenerativeAI;
  private modelName = 'gemini-2.0-flash-lite';
  private BATCH_SIZE = 8;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async parseEventsBatch(
    messages: BatchMessage[],
    categories?: Category[]
  ): Promise<Map<number, ParsedEventData | null>> {
    const results = new Map<number, ParsedEventData | null>();

    for (let i = 0; i < messages.length; i += this.BATCH_SIZE) {
      const chunk = messages.slice(i, i + this.BATCH_SIZE);
      console.log(
        `Parsing batch ${Math.floor(i / this.BATCH_SIZE) + 1} (${chunk.length} messages)`
      );

      try {
        const chunkResults = await this.parseChunk(chunk, categories);
        for (const [id, data] of chunkResults) {
          results.set(id, data);
        }
      } catch (error) {
        console.error(`Batch parse failed for chunk starting at ${i}:`, error);
        // Mark all messages in failed chunk as null so caller can skip them
        for (const msg of chunk) {
          results.set(msg.messageId, null);
        }
      }
    }

    return results;
  }

  // Convenience wrapper for single-message use (listen mode)
  async parseEventText(
    text: string,
    categories?: Category[]
  ): Promise<ParsedEventData> {
    const syntheticId = 0;
    const results = await this.parseEventsBatch(
      [{ messageId: syntheticId, text }],
      categories
    );
    const result = results.get(syntheticId);
    if (!result) {
      throw new Error('Not an event post');
    }
    return result;
  }

  private async parseChunk(
    messages: BatchMessage[],
    categories?: Category[]
  ): Promise<Map<number, ParsedEventData | null>> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction: this.buildSystemPrompt(),
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    });

    const prompt = this.buildBatchPrompt(messages, categories);
    const result = await model.generateContent(prompt);

    const finishReason = result.response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
      console.warn(
        `Gemini response for chunk did not finish cleanly (reason: ${finishReason}), output may be truncated`
      );
    }

    const text = result.response.text();
    const parsedResults = this.parseBatchResponse(text, messages);

    const nullCount = [...parsedResults.values()].filter(
      (v) => v === null
    ).length;
    if (nullCount === messages.length && messages.length > 1) {
      console.warn(
        `All ${messages.length} messages in this chunk were parsed as non-events; raw response: ${text.slice(0, 500)}`
      );
    }

    return parsedResults;
  }

  private buildSystemPrompt(): string {
    return `You are an expert at extracting structured event information from text posts.
Extract event details from Telegram messages that may be in English, Amharic, or mixed languages.
Handle both Gregorian and Ethiopian calendar dates.

Rules:
- Title must be concise (max 255 characters)
- Description should include all relevant details
- Parse dates carefully, considering timezone (Africa/Addis_Ababa)
- Price should be a number (extract from "ETB 500", "500 birr", etc.)
- If date is relative ("tomorrow", "next week"), calculate actual date based on current date
- Return null for missing optional fields
- Always return valid JSON
- Extract relevant tags/keywords from the event description
- If the text doesn't contain event information, set "event" to null for that message`;
  }

  private buildBatchPrompt(
    messages: BatchMessage[],
    categories?: Category[]
  ): string {
    const currentDate = new Date().toISOString();

    let categorySection = '';
    if (categories && categories.length > 0) {
      categorySection = `\n\nAvailable categories:\n${categories
        .map(
          (cat) =>
            `- ID: ${cat.id}, Name: ${cat.name}, Slug: ${cat.slug}${cat.description ? `, Description: ${cat.description}` : ''}`
        )
        .join(
          '\n'
        )}\n\nSelect the most appropriate categoryId from the list above for each event.`;
    }

    const messagesJson = JSON.stringify(
      messages.map((m) => ({ messageId: m.messageId, text: m.text }))
    );

    return `Current date: ${currentDate}
Timezone: Africa/Addis_Ababa
${categorySection}

Parse each of the following Telegram messages and extract event information.

Messages:
${messagesJson}

Return a JSON array with exactly one entry per message, in the same order. Use this structure:
[
  {
    "messageId": <number>,
    "event": {
      "title": "string (required, max 255 chars)",
      "description": "string (required)",
      "location": "string or null",
      "venue": "string or null",
      "startDate": "ISO 8601 string (required)",
      "endDate": "ISO 8601 string or null",
      "price": number or null,
      "tags": ["string"] or []${categories && categories.length > 0 ? ',\n      "categoryId": "string (category ID) or null"' : ''}
    }
  }
]

If a message is not an event post, set "event" to null for that entry.
Return ONLY the JSON array, no other text.`;
  }

  private parseBatchResponse(
    responseText: string,
    messages: BatchMessage[]
  ): Map<number, ParsedEventData | null> {
    const results = new Map<number, ParsedEventData | null>();

    const arrayMatch = responseText.match(/\[[\s\S]*\]/);
    if (!arrayMatch) {
      console.error('No JSON array found in Gemini response:', responseText);
      for (const msg of messages) results.set(msg.messageId, null);
      return results;
    }

    let parsed: Array<{ messageId: number; event: unknown }>;
    try {
      parsed = JSON.parse(arrayMatch[0]);
    } catch {
      console.error('Failed to parse JSON array from Gemini response');
      for (const msg of messages) results.set(msg.messageId, null);
      return results;
    }

    for (const entry of parsed) {
      if (!entry || typeof entry.messageId !== 'number') continue;

      if (!entry.event) {
        results.set(entry.messageId, null);
        continue;
      }

      try {
        const validated = EventDataSchema.parse(entry.event);
        if (!validated.title || !validated.startDate) {
          results.set(entry.messageId, null);
          continue;
        }

        const startDate = new Date(validated.startDate);
        if (isNaN(startDate.getTime())) {
          console.warn(
            `Invalid startDate for message ${entry.messageId}, skipping`
          );
          results.set(entry.messageId, null);
          continue;
        }

        if (validated.endDate) {
          const endDate = new Date(validated.endDate);
          if (isNaN(endDate.getTime())) {
            validated.endDate = null;
          }
        }

        results.set(entry.messageId, {
          title: validated.title,
          description: validated.description,
          location: validated.location || undefined,
          venue: validated.venue || undefined,
          startDate: validated.startDate,
          endDate: validated.endDate || undefined,
          price: validated.price || undefined,
          tags: validated.tags || [],
          categoryId: validated.categoryId || undefined,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.warn(
            `Validation failed for message ${entry.messageId}:`,
            error.errors
          );
        }
        results.set(entry.messageId, null);
      }
    }

    // Ensure every input message has an entry (default null for any missing)
    for (const msg of messages) {
      if (!results.has(msg.messageId)) {
        results.set(msg.messageId, null);
      }
    }

    return results;
  }
}
