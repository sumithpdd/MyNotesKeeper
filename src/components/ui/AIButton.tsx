'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { aiService } from '@/lib/ai';

interface AIButtonProps {
  currentText: string;
  onGenerated: (text: string) => void;
  context?: string;
  className?: string;
}

export function AIButton({ currentText, onGenerated, context, className }: AIButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAIAction = async (action: 'expand' | 'refine' | 'elaborate') => {
    setIsLoading(true);
    console.log('🚀 Starting AI enhancement...', { action, hasText: !!currentText });
    try {
      const refined = await aiService.refineText(currentText, action, context);
      console.log('✅ AI enhancement successful!');
      onGenerated(refined);
    } catch (error: any) {
      console.error('❌ Error generating text:', error);
      console.error('Full error details:', {
        message: error?.message,
        status: error?.status,
        code: error?.code,
        stack: error?.stack
      });
      
      // Use the error message from the AI service which includes helpful details
      alert(error?.message || 'Failed to generate text. Please check your API key at https://aistudio.google.com/app/apikey');
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`inline-flex items-center px-2 py-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors ${className || ''}`}
        title="AI Enhance"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </button>

      {isOpen && !isLoading && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <button
            type="button"
            onClick={() => handleAIAction('expand')}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
          >
            ✨ Expand
          </button>
          <button
            type="button"
            onClick={() => handleAIAction('refine')}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            ✨ Refine
          </button>
          <button
            type="button"
            onClick={() => handleAIAction('elaborate')}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
          >
            ✨ Elaborate
          </button>
        </div>
      )}
    </div>
  );
}

