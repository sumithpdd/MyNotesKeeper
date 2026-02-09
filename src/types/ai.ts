export interface AIGenerationRequest {
  customerName: string;
  context: string;
  type: 'notes' | 'summary' | 'suggestions';
}

export interface AIGenerationResponse {
  content: string;
  suggestions?: string[];
}
