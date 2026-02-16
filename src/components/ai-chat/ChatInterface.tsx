'use client';

import { Bot, User, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'pending' | 'confirmed' | 'rejected';
  parsedData?: any;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isProcessing: boolean;
  onConfirm: () => void;
  onReject: () => void;
}

/**
 * Chat interface component
 * Displays chat messages with user, assistant, and system message types
 * Shows confirm/cancel buttons for pending actions
 */
export function ChatInterface({ 
  messages, 
  isProcessing, 
  onConfirm, 
  onReject 
}: ChatInterfaceProps) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Bot className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI Assistant Ready
          </h3>
          <p className="text-sm text-gray-600 max-w-sm">
            Ask me to create or update customer records, add notes, manage opportunities, and more.
            Or select a prompt from the library to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {message.type !== 'user' && (
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
          )}

          <div className={`flex-1 max-w-[75%] ${message.type === 'user' ? 'text-right' : ''}`}>
            <div
              className={`inline-block px-4 py-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.type === 'system'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
            </div>

            {message.status === 'pending' && (
              <div className="mt-3 flex gap-2">
                <button 
                  onClick={onConfirm}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="h-4 w-4" />
                  Confirm
                </button>
                <button 
                  onClick={onReject}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>

          {message.type === 'user' && (
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
