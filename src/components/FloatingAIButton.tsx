'use client';

import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

interface FloatingAIButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function FloatingAIButton({ onClick, isOpen }: FloatingAIButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-30">
      {/* Tooltip */}
      {isHovered && !isOpen && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap shadow-lg">
          Open AI Assistant
          <div className="absolute top-full right-4 -mt-1 w-2 h-2 bg-gray-900 transform rotate-45" />
        </div>
      )}

      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative w-16 h-16 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center overflow-hidden ${
          isOpen
            ? 'bg-gray-700 hover:bg-gray-800'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-110'
        }`}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
      >
        {/* Animated background pulse */}
        {!isOpen && (
          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20" />
        )}

        {/* Icon */}
        <div className={`relative z-10 transition-transform duration-300 ${
          isOpen ? '' : 'group-hover:rotate-12'
        }`}>
          {isOpen ? (
            <X className="h-7 w-7 text-white" />
          ) : (
            <Sparkles className="h-7 w-7 text-white" />
          )}
        </div>

        {/* Badge for notifications (optional) */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
        )}
      </button>
    </div>
  );
}
