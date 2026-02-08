'use client';

import { useState } from 'react';
import { BookOpen, Copy, Check, Search, Tag, Sparkles } from 'lucide-react';
import { chatbotPrompts, PromptTemplate, getPromptsByCategory, searchPrompts } from '@/lib/chatbotPrompts';

interface PromptLibraryProps {
  onSelectPrompt?: (content: string) => void;
  onUsePromptInChatbot?: (promptTemplate: PromptTemplate) => void;
}

export function PromptLibrary({ onSelectPrompt, onUsePromptInChatbot }: PromptLibraryProps) {
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [copiedPrompt, setCopiedPrompt] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Get filtered prompts
  const getFilteredPrompts = (): PromptTemplate[] => {
    let prompts = chatbotPrompts;
    
    if (searchQuery.trim()) {
      prompts = searchPrompts(searchQuery);
    } else if (filterCategory !== 'all') {
      prompts = getPromptsByCategory(filterCategory as PromptTemplate['category']);
    }
    
    return prompts;
  };

  const filteredPrompts = getFilteredPrompts();
  const currentPrompt = chatbotPrompts.find(p => p.id === selectedPromptId);

  const handleCopy = (example: string) => {
    navigator.clipboard.writeText(example);
    setCopiedPrompt(example);
    setTimeout(() => setCopiedPrompt(''), 2000);
  };

  const handleUseInChatbot = (prompt: PromptTemplate) => {
    if (onUsePromptInChatbot) {
      onUsePromptInChatbot(prompt);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'note': return 'bg-blue-100 text-blue-700';
      case 'customer': return 'bg-green-100 text-green-700';
      case 'profile': return 'bg-purple-100 text-purple-700';
      case 'update': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'note': return '📝';
      case 'customer': return '👥';
      case 'profile': return '📋';
      case 'update': return '🔄';
      default: return '📄';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Chatbot Prompt Library</h3>
              <p className="text-sm text-gray-600">Sales Solution Engineer - Natural Language Commands</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-blue-200">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">{filteredPrompts.length} prompts</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setSearchQuery('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="note">Notes</option>
            <option value="customer">Customers</option>
            <option value="profile">Profiles</option>
            <option value="update">Updates</option>
          </select>
        </div>
      </div>

      <div className="flex" style={{ height: '600px' }}>
        {/* Left Sidebar - Prompt List */}
        <div className="w-80 border-r border-gray-200 overflow-y-auto bg-gray-50">
          <div className="p-3 space-y-2">
            {filteredPrompts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">No prompts found</p>
              </div>
            ) : (
              filteredPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => setSelectedPromptId(prompt.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedPromptId === prompt.id
                      ? 'bg-blue-100 border-2 border-blue-500 shadow-sm'
                      : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getCategoryIcon(prompt.category)}</span>
                        <h4 className={`text-sm font-semibold truncate ${
                          selectedPromptId === prompt.id ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {prompt.title}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {prompt.description}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(prompt.category)}`}>
                          {prompt.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Content - Prompt Details */}
        <div className="flex-1 bg-white overflow-y-auto">
          {currentPrompt ? (
            <div className="p-6">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getCategoryIcon(currentPrompt.category)}</span>
                      <h4 className="text-2xl font-bold text-gray-900">{currentPrompt.title}</h4>
                    </div>
                    <p className="text-gray-600">{currentPrompt.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(currentPrompt.category)}`}>
                    {currentPrompt.category}
                  </span>
                </div>

                {onUsePromptInChatbot && (
                  <button
                    onClick={() => handleUseInChatbot(currentPrompt)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 font-medium shadow-md"
                  >
                    <Sparkles className="h-5 w-5" />
                    Use This Prompt in Chatbot
                  </button>
                )}
              </div>

              {/* Fields */}
              <div className="mb-6">
                <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Fields Extracted:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {currentPrompt.fields.map((field) => (
                    <span key={field} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-mono">
                      {field}
                    </span>
                  ))}
                </div>
              </div>

              {/* Examples */}
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-3">Example Commands:</h5>
                <div className="space-y-3">
                  {currentPrompt.examples.map((example, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="flex-1 text-sm text-gray-700 font-mono leading-relaxed">
                          "{example}"
                        </p>
                        <button
                          onClick={() => handleCopy(example)}
                          className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-md transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedPrompt === example ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Prompt (Advanced) */}
              <details className="mt-6">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
                  Advanced: System Prompt
                </summary>
                <div className="mt-3 p-4 bg-gray-900 rounded-lg">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                    {currentPrompt.systemPrompt}
                  </pre>
                </div>
              </details>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <BookOpen className="h-16 w-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Select a prompt to view details</p>
              <p className="text-sm">Choose from {filteredPrompts.length} available prompts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

