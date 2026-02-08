import { GoogleGenerativeAI } from '@google/generative-ai';
import { SE_PERSONA_PROMPT, PromptTemplate } from './chatbotPrompts';

let genAI: GoogleGenerativeAI | null = null;

export interface ParsedChatbotInput {
  intent: string; // What the user wants to do
  confidence: number; // 0-1 confidence in the parse
  extractedData: Record<string, any>; // The structured data
  suggestedPrompt?: PromptTemplate; // Which prompt template was matched
  errors?: string[]; // Any parsing errors or warnings
}

export class ChatbotAIService {
  private getGenAI() {
    if (!genAI) {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('Gemini API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file.');
      }
      
      if (!apiKey.startsWith('AIza')) {
        throw new Error('Invalid API key format. The key should start with "AIza..."');
      }
      
      genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
  }

  private getModel() {
    return this.getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  /**
   * Parse natural language input and extract structured data
   */
  async parseInput(
    userInput: string,
    promptTemplate?: PromptTemplate,
    existingCustomers?: string[]
  ): Promise<ParsedChatbotInput> {
    try {
      const systemPrompt = promptTemplate?.systemPrompt || SE_PERSONA_PROMPT;
      
      const fullPrompt = `${systemPrompt}

${existingCustomers && existingCustomers.length > 0 ? `
Known customers in the system:
${existingCustomers.slice(0, 20).join(', ')}
` : ''}

User input: "${userInput}"

Parse this input and extract structured data as a JSON object. 
${promptTemplate ? `Focus on these fields: ${promptTemplate.fields.join(', ')}` : ''}

Return ONLY a valid JSON object with the following structure:
{
  "intent": "brief description of what the user wants to do",
  "confidence": 0.95,
  "extractedData": {
    // All extracted fields here
  },
  "warnings": [] // Any ambiguities or missing information
}

Important:
- For dates, use ISO format (YYYY-MM-DD)
- For seConfidence, use exactly "Green", "Yellow", or "Red"
- For booleans, use true/false
- Match customer names to existing customers if possible
- If a field is not mentioned, omit it or set to null
- Be smart about interpreting informal language`;

      console.log('🤖 Parsing input with AI:', userInput);
      const result = await this.getModel().generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response (might be wrapped in markdown code blocks)
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from AI response');
      }
      
      const jsonText = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonText);
      
      console.log('✅ Successfully parsed:', parsed);
      
      return {
        intent: parsed.intent || 'Unknown intent',
        confidence: parsed.confidence || 0.5,
        extractedData: parsed.extractedData || {},
        suggestedPrompt: promptTemplate,
        errors: parsed.warnings || []
      };
    } catch (error: any) {
      console.error('❌ Error parsing chatbot input:', error);
      throw new Error(`Failed to parse input: ${error.message}`);
    }
  }

  /**
   * Determine which prompt template best matches the user input
   */
  async detectIntent(userInput: string, availablePrompts: PromptTemplate[]): Promise<PromptTemplate | null> {
    try {
      const promptsList = availablePrompts.map(p => `- ${p.id}: ${p.title} - ${p.description}`).join('\n');
      
      const detectionPrompt = `${SE_PERSONA_PROMPT}

Available prompt templates:
${promptsList}

User input: "${userInput}"

Determine which prompt template best matches this input. Return ONLY a JSON object:
{
  "promptId": "the-best-matching-prompt-id",
  "confidence": 0.95,
  "reasoning": "why this template was chosen"
}

If no template matches well, return:
{
  "promptId": null,
  "confidence": 0.0,
  "reasoning": "explanation"
}`;

      console.log('🎯 Detecting intent for:', userInput);
      const result = await this.getModel().generateContent(detectionPrompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }
      
      const jsonText = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonText);
      
      if (!parsed.promptId) {
        return null;
      }
      
      const matchedPrompt = availablePrompts.find(p => p.id === parsed.promptId);
      console.log('✅ Detected intent:', matchedPrompt?.title);
      
      return matchedPrompt || null;
    } catch (error: any) {
      console.error('❌ Error detecting intent:', error);
      return null;
    }
  }

  /**
   * Generate a natural language confirmation message
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

      const result = await this.getModel().generateContent(confirmPrompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('❌ Error generating confirmation:', error);
      // Fallback to a simple confirmation
      return `I understood: ${parsedData.intent}. Please review the details below and confirm.`;
    }
  }

  /**
   * Suggest next actions based on the current context
   */
  async suggestNextActions(
    customerName: string,
    recentNotes: string[],
    profileData?: any
  ): Promise<string[]> {
    try {
      const suggestionPrompt = `${SE_PERSONA_PROMPT}

Customer: ${customerName}
Recent notes:
${recentNotes.slice(0, 3).join('\n')}

${profileData ? `Profile data: ${JSON.stringify(profileData)}` : ''}

Based on this context, suggest 3-5 next actions or follow-ups that would be valuable for a Sales Solution Engineer.

Return ONLY a JSON array of strings:
["action 1", "action 2", "action 3"]`;

      const result = await this.getModel().generateContent(suggestionPrompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return [];
      }
      
      const suggestions = JSON.parse(jsonMatch[0]);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (error: any) {
      console.error('❌ Error suggesting next actions:', error);
      return [];
    }
  }

  /**
   * Enhance or expand user input with AI assistance
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

      const result = await this.getModel().generateContent(enhancePrompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('❌ Error enhancing input:', error);
      return userInput;
    }
  }
}

export const chatbotAI = new ChatbotAIService();

