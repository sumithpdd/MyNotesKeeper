/**
 * Domain types for the natural-language chatbot. Lives outside `src/lib/chatbotAI.ts`
 * so that client components can import these types without dragging the server-only
 * Gemini implementation (which lives in `lib/chatbotAI`) into the browser bundle.
 */

import type { PromptTemplate } from '@/lib/chatbotPrompts';

export interface ParsedChatbotInput {
  /** What the user wants to do (free-form intent string from the model). */
  intent: string;
  /** 0–1 model confidence in the parse. */
  confidence: number;
  /** Structured fields extracted from the natural language input. */
  extractedData: Record<string, unknown>;
  /** Which prompt template was matched, if any. */
  suggestedPrompt?: PromptTemplate;
  /** Any parsing errors or warnings surfaced by the model. */
  errors?: string[];
}
