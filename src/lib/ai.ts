import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIGenerationRequest, AIGenerationResponse } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export class AIService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  async generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      const prompt = this.buildPrompt(request);
      const result = await this.model.generateContent(prompt);
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
}

export const aiService = new AIService();
