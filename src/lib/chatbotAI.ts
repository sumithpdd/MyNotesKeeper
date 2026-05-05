import 'server-only';
import { generateText, generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { SE_PERSONA_PROMPT, PromptTemplate } from './chatbotPrompts';
import type { ParsedChatbotInput } from '@/types/chatbotAI';

export type { ParsedChatbotInput } from '@/types/chatbotAI';

/**
 * Server-only chatbot service using the Vercel AI SDK with Google Gemini.
 * Mirrors the previous ChatbotAIService surface so callers can stay unchanged.
 *
 * Env: `GEMINI_API_KEY` (server-only).
 */

const MODEL_ID = 'gemini-2.0-flash';

let providerSingleton: ReturnType<typeof createGoogleGenerativeAI> | null = null;

function getModel() {
  if (!providerSingleton) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Gemini API key is not configured. Please add GEMINI_API_KEY (server-only) to your .env.local file.',
      );
    }
    if (!apiKey.startsWith('AIza')) {
      throw new Error(
        'Invalid API key format. Please check your key from https://aistudio.google.com/app/apikey',
      );
    }
    providerSingleton = createGoogleGenerativeAI({ apiKey });
  }
  return providerSingleton(MODEL_ID);
}

const parseInputSchema = z.object({
  intent: z.string(),
  confidence: z.number().min(0).max(1),
  extractedData: z.record(z.string(), z.any()),
  warnings: z.array(z.string()).optional(),
});

const detectIntentSchema = z.object({
  promptId: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().optional(),
});

const suggestActionsSchema = z.object({
  actions: z.array(z.string()),
});

export class ChatbotAIService {
  /**
   * Parse natural language input and extract structured data.
   */
  async parseInput(
    userInput: string,
    promptTemplate?: PromptTemplate,
    existingCustomers?: string[],
  ): Promise<ParsedChatbotInput> {
    try {
      const systemPrompt = promptTemplate?.systemPrompt || SE_PERSONA_PROMPT;
      const knownCustomersBlock =
        existingCustomers && existingCustomers.length > 0
          ? `\nKnown customers in the system:\n${existingCustomers.slice(0, 20).join(', ')}\n`
          : '';
      const fieldsHint = promptTemplate
        ? `Focus on these fields: ${promptTemplate.fields.join(', ')}`
        : '';

      const fullPrompt = `${systemPrompt}
${knownCustomersBlock}

User input: "${userInput}"

Parse this input and extract structured data.
${fieldsHint}

Important:
- For dates, use ISO format (YYYY-MM-DD)
- For seConfidence, use exactly "Green", "Yellow", or "Red"
- For booleans, use true/false
- Match customer names to existing customers if possible
- If a field is not mentioned, omit it or set to null
- Be smart about interpreting informal language
- "warnings" should list any ambiguities or missing information.`;

      const { object } = await generateObject({
        model: getModel(),
        schema: parseInputSchema,
        prompt: fullPrompt,
      });

      return {
        intent: object.intent || 'Unknown intent',
        confidence: typeof object.confidence === 'number' ? object.confidence : 0.5,
        extractedData: object.extractedData ?? {},
        suggestedPrompt: promptTemplate,
        errors: object.warnings ?? [],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error parsing chatbot input:', error);
      throw new Error(`Failed to parse input: ${message}`);
    }
  }

  /**
   * Determine which prompt template best matches the user input.
   */
  async detectIntent(
    userInput: string,
    availablePrompts: PromptTemplate[],
  ): Promise<PromptTemplate | null> {
    try {
      const promptsList = availablePrompts
        .map((p) => `- ${p.id}: ${p.title} - ${p.description}`)
        .join('\n');

      const detectionPrompt = `${SE_PERSONA_PROMPT}

Available prompt templates:
${promptsList}

User input: "${userInput}"

Determine which prompt template best matches this input. If no template matches well, return promptId = null.`;

      const { object } = await generateObject({
        model: getModel(),
        schema: detectIntentSchema,
        prompt: detectionPrompt,
      });

      if (!object.promptId) return null;
      return availablePrompts.find((p) => p.id === object.promptId) || null;
    } catch (error) {
      console.error('Error detecting intent:', error);
      return null;
    }
  }

  /**
   * Generate a natural language confirmation message.
   */
  async generateConfirmation(parsedData: ParsedChatbotInput): Promise<string> {
    try {
      const confirmPrompt = `${SE_PERSONA_PROMPT}

I parsed the following data from user input:
Intent: ${parsedData.intent}
Extracted Data: ${JSON.stringify(parsedData.extractedData, null, 2)}

Generate a natural language confirmation message that:
1. Summarizes what was understood
2. Highlights the key information extracted
3. Asks for confirmation in a friendly, professional tone
4. Points out any missing or ambiguous information

Keep it concise (2-3 sentences max). Be friendly and professional.

Return ONLY the confirmation text, no JSON.`;

      const { text } = await generateText({ model: getModel(), prompt: confirmPrompt });
      return text;
    } catch (error) {
      console.error('Error generating confirmation:', error);
      return `I understood: ${parsedData.intent}. Please review the details below and confirm.`;
    }
  }

  /**
   * Suggest next actions based on the current context.
   */
  async suggestNextActions(
    customerName: string,
    recentNotes: string[],
    profileData?: unknown,
  ): Promise<string[]> {
    try {
      const suggestionPrompt = `${SE_PERSONA_PROMPT}

Customer: ${customerName}
Recent notes:
${recentNotes.slice(0, 3).join('\n')}

${profileData ? `Profile data: ${JSON.stringify(profileData)}` : ''}

Based on this context, suggest 3-5 next actions or follow-ups that would be valuable for a Sales Solution Engineer. Return them under the "actions" field.`;

      const { object } = await generateObject({
        model: getModel(),
        schema: suggestActionsSchema,
        prompt: suggestionPrompt,
      });
      return Array.isArray(object.actions) ? object.actions : [];
    } catch (error) {
      console.error('Error suggesting next actions:', error);
      return [];
    }
  }

  /**
   * Enhance or expand user input with AI assistance.
   */
  async enhanceInput(userInput: string, context: string): Promise<string> {
    try {
      const enhancePrompt = `${SE_PERSONA_PROMPT}

Context: ${context}
User input: "${userInput}"

Enhance this input by:
1. Adding relevant details based on context
2. Structuring it more clearly
3. Making it more professional

Return the enhanced input text only (no JSON).`;

      const { text } = await generateText({ model: getModel(), prompt: enhancePrompt });
      return text;
    } catch (error) {
      console.error('Error enhancing input:', error);
      return userInput;
    }
  }
}

export const chatbotAI = new ChatbotAIService();
