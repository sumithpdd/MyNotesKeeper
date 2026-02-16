'use client';

import { Send, Loader2, Sparkles } from 'lucide-react';
import { FormEvent } from 'react';

interface ChatInputProps {
  input: string;
  isProcessing: boolean;
  customerCount: number;
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onBrowsePrompts: () => void;
}

/**
 * Chat input component with textarea for multi-line input
 * Supports Enter to send, Shift+Enter for new line
 */
export function ChatInput({
  input,
  isProcessing,
  customerCount,
  onInputChange,
  onSubmit,
  onBrowsePrompts
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as any);
    }
  };

  return (
    <form onSubmit={onSubmit} className="p-6 border-t border-gray-200 bg-gray-50">
      <div className="flex gap-3">
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your request or select a prompt from the library... (Shift+Enter for new line)"
          disabled={isProcessing}
          rows={3}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-400 resize-none"
        />
        <button
          type="submit"
          disabled={isProcessing || !input.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors self-end"
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Send className="h-5 w-5" />
              Send
            </>
          )}
        </button>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span>Powered by AI • {customerCount} customers loaded • Press Enter to send, Shift+Enter for new line</span>
        </div>
        <button
          type="button"
          onClick={onBrowsePrompts}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Browse prompts →
        </button>
      </div>
    </form>
  );
}
