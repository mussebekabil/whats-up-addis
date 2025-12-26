import Anthropic from '@anthropic-ai/sdk';
import { ParsedEventData } from '../types/telegram.types.js';
import { z } from 'zod';

const EventDataSchema = z.object({
  title: z.string().max(255),
  description: z.string(),
  location: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  price: z.number().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  categoryId: z.string().optional().nullable(),
});

export class LLMParserService {
  private client: Anthropic;
  private model: string = 'claude-haiku-4-5-20251001';

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    this.client = new Anthropic({ apiKey });
  }

  async parseEventText(
    text: string,
    categories?: Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
    }>
  ): Promise<ParsedEventData> {
    try {
      const currentDate = new Date().toISOString();
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(text, currentDate, categories);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        temperature: 0.2,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from LLM');
      }

      const parsedData = this.extractJsonFromResponse(content.text);
      return this.validateParsedData(parsedData);
    } catch (error) {
      console.error('Failed to parse event text with LLM:', error);
      throw error;
    }
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
- If the text doesn't contain event information, return null for title`;
  }

  private buildUserPrompt(
    text: string,
    currentDate: string,
    categories?: Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
    }>
  ): string {
    let categorySection = '';
    if (categories && categories.length > 0) {
      categorySection = `\n\nAvailable categories:\n${categories
        .map(
          (cat) =>
            `- ID: ${cat.id}, Name: ${cat.name}, Slug: ${cat.slug}${cat.description ? `, Description: ${cat.description}` : ''}`
        )
        .join('\n')}

Based on the event content, select the most appropriate category ID from the list above.`;
    }

    return `Extract event information from this Telegram post:

"""
${text}
"""

Current date: ${currentDate}
Timezone: Africa/Addis_Ababa
${categorySection}

Return JSON with this exact structure:
{
  "title": "string (required, max 255 chars)",
  "description": "string (required)",
  "location": "string or null",
  "venue": "string or null",
  "startDate": "ISO 8601 string (required)",
  "endDate": "ISO 8601 string or null",
  "price": number or null,
  "tags": ["string"] or []${categories && categories.length > 0 ? ',\n  "categoryId": "string (category ID from the list above) or null"' : ''}
}

Important:
- If this is not an event post, return { "title": null, "description": "" }
- Ensure startDate is in ISO 8601 format with timezone
- Extract price as a number (remove currency symbols)${categories && categories.length > 0 ? '\n- Select the most appropriate categoryId based on the event type and content' : ''}`;
  }

  private extractJsonFromResponse(text: string): any {
    // Try to find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in LLM response');
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to parse JSON from LLM response:', text);
      throw new Error('Invalid JSON in LLM response');
    }
  }

  private validateParsedData(data: any): ParsedEventData {
    try {
      const validated = EventDataSchema.parse(data);

      // If title is null or empty, this is not an event
      if (!validated.title) {
        throw new Error('Not an event post');
      }

      // Validate that startDate is a valid date
      const startDate = new Date(validated.startDate);
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid start date');
      }

      // Validate endDate if present
      if (validated.endDate) {
        const endDate = new Date(validated.endDate);
        if (isNaN(endDate.getTime())) {
          throw new Error('Invalid end date');
        }
      }

      return {
        title: validated.title,
        description: validated.description,
        location: validated.location || undefined,
        venue: validated.venue || undefined,
        startDate: validated.startDate,
        endDate: validated.endDate || undefined,
        price: validated.price || undefined,
        tags: validated.tags || [],
        categoryId: validated.categoryId || undefined,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        throw new Error(
          `Invalid event data: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  }
}
