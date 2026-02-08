import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIGenerationRequest, AIGenerationResponse } from '@/types';

let genAI: GoogleGenerativeAI | null = null;

export class AIService {
  private getGenAI() {
    if (!genAI) {
      // Get API key from environment variable only
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('Gemini API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file and restart the server. Get your key from: https://aistudio.google.com/app/apikey');
      }
      
      if (!apiKey.startsWith('AIza')) {
        throw new Error('Invalid API key format. The key should start with "AIza...". Please check your key from https://aistudio.google.com/app/apikey and update your .env.local file.');
      }
      
      console.log('Using Gemini API key:', apiKey.substring(0, 15) + '...');
      genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
  }

  private getModel() {
    // Use gemini-2.0-flash - it's fast and available
    return this.getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      const prompt = this.buildPrompt(request);
      const result = await this.getModel().generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        content: text,
        suggestions: this.extractSuggestions(text)
      };
    } catch (error) {
      console.error('Error generating AI content:', error);
      throw new Error('Failed to generate AI content');
    }
  }

  private buildPrompt(request: AIGenerationRequest): string {
    const { customerName, context, type } = request;

    switch (type) {
      case 'notes':
        return `Generate professional meeting notes for customer: ${customerName}. 
        Context: ${context}
        Please provide structured notes including key points, action items, and next steps.`;
      
      case 'summary':
        return `Create a concise summary for customer: ${customerName}.
        Context: ${context}
        Focus on main outcomes, decisions made, and important details.`;
      
      case 'suggestions':
        return `Provide strategic suggestions for customer: ${customerName}.
        Context: ${context}
        Include recommendations for Products, Partners, and next steps.`;
      
      default:
        return `Generate helpful content for customer: ${customerName}.
        Context: ${context}`;
    }
  }

  private extractSuggestions(text: string): string[] {
    // Simple extraction of bullet points or numbered items
    const suggestions = text
      .split('\n')
      .filter(line => line.trim().match(/^[-•*]\s|^\d+\.\s/))
      .map(line => line.replace(/^[-•*\d.]\s*/, '').trim())
      .filter(suggestion => suggestion.length > 0);

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  async generateMeetingNotes(customerName: string, context: string): Promise<string> {
    const result = await this.generateContent({
      customerName,
      context,
      type: 'notes'
    });
    return result.content;
  }

  async generateSummary(customerName: string, context: string): Promise<string> {
    const result = await this.generateContent({
      customerName,
      context,
      type: 'summary'
    });
    return result.content;
  }

  async generateSuggestions(customerName: string, context: string): Promise<string[]> {
    const result = await this.generateContent({
      customerName,
      context,
      type: 'suggestions'
    });
    return result.suggestions || [];
  }

  async refineText(currentText: string, action: 'expand' | 'refine' | 'elaborate', context?: string): Promise<string> {
    try {
      const actionPrompts = {
        expand: `Expand the following text with more details and depth. Keep it professional and sales-focused.\n\nText: ${currentText}`,
        refine: `Refine and improve the following text to make it more professional and compelling. Keep the main message intact.\n\nText: ${currentText}`,
        elaborate: `Elaborate on the following text with additional context and examples. Keep it relevant and professional.\n\nText: ${currentText}${context ? `\n\nAdditional context: ${context}` : ''}`
      };

      const prompt = actionPrompts[action];
      const result = await this.getModel().generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('❌ Error refining text:', error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.status,
        statusText: error?.statusText,
        code: error?.code,
        cause: error?.cause
      });
      
      // Check for API key issues first
      if (error?.message?.includes('API key') || error?.message?.includes('not configured')) {
        throw error;
      }
      
      // Check for 403 (invalid/unauthorized)
      if (error?.message?.includes('403') || error?.code === 403) {
        throw new Error('Your Gemini API key is invalid or restricted. Please get a new key from https://aistudio.google.com/app/apikey and update your .env.local file.');
      }
      
      // Network errors
      if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        throw new Error('Network error connecting to Gemini API. Please check your internet connection and try again.');
      }
      
      // Rate limiting
      if (error?.message?.includes('429') || error?.code === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      
      // Generic error with more details
      const errorMsg = error?.message || 'Unknown error';
      throw new Error(`Failed to refine text. ${errorMsg}. Please check your API key from https://aistudio.google.com/app/apikey`);
    }
  }

  async generateCustomerSummary(customer: {
    customerName?: string;
    products?: Array<{ name: string; version?: string }>;
    migrationComplexity?: string;
    perpetualOrSubscription?: string;
    hostingLocation?: string;
    compellingEvent?: string;
    existingMigrationOpp?: string;
    migrationNotes?: string;
    mergedNotes?: string;
  }): Promise<string> {
    try {
      console.log('🚀 Starting customer summary generation...');
      console.log('Customer data:', JSON.stringify(customer, null, 2));
      
      const prompt = `Generate a comprehensive customer summary for ${customer.customerName || 'this customer'}.

Customer Information:
- Products: ${customer.products?.map(p => `${p.name}${p.version ? ` v${p.version}` : ''}`).join(', ') || 'N/A'}
- Migration Complexity: ${customer.migrationComplexity || 'Not specified'}
- License Type: ${customer.perpetualOrSubscription || 'Not specified'}
- Hosting: ${customer.hostingLocation || 'Not specified'}
- Compelling Event: ${customer.compellingEvent || 'None specified'}
- Migration Opportunity: ${customer.existingMigrationOpp || 'No'}
${customer.migrationNotes ? `- Migration Notes: ${customer.migrationNotes}` : ''}
${customer.compellingEvent ? `- Compelling Event: ${customer.compellingEvent}` : ''}
${customer.mergedNotes ? `- Additional Notes: ${customer.mergedNotes}` : ''}

Please provide a concise, professional summary focusing on:
1. Current status and products
2. Migration opportunity and complexity
3. Key compelling events
4. Recommended next steps for the sales consultant

Be specific and actionable.`;

      console.log('📝 Calling Gemini API with prompt...');
      const result = await this.getModel().generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('✅ Successfully generated summary');
      return text;
    } catch (error: any) {
      console.error('❌ Error generating customer summary:', error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.status,
        statusText: error?.statusText,
        code: error?.code,
        cause: error?.cause,
        stack: error?.stack,
        toString: error?.toString()
      });
      
      // Check for API key issues first
      if (error?.message?.includes('API key') || error?.message?.includes('not configured')) {
        throw error;
      }
      
      // Check for 403 (invalid/unauthorized) or 404
      if (error?.message?.includes('403') || error?.code === 403) {
        throw new Error('Your Gemini API key is invalid or restricted. Please get a new key from https://aistudio.google.com/app/apikey and update your .env.local file.');
      }
      
      if (error?.message?.includes('404') || error?.code === 404) {
        throw new Error('The Gemini API endpoint was not found. Please check your API key from https://aistudio.google.com/app/apikey');
      }
      
      // Network errors
      if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        throw new Error('Network error connecting to Gemini API. Please check your internet connection and try again.');
      }
      
      // Rate limiting
      if (error?.message?.includes('429') || error?.code === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      
      // Generic error with more details
      const errorMsg = error?.message || 'Unknown error';
      throw new Error(`Failed to generate customer summary. ${errorMsg}. Please check your API key configuration at https://aistudio.google.com/app/apikey`);
    }
  }
}

export const aiService = new AIService();
