'use client';

import { useState, useRef, useEffect } from 'react';
import { X, MessageSquare, BookOpen, Plus, Send, Bot, User, Loader2, CheckCircle, XCircle, Sparkles, Copy, Check, Search, Tag, Trash2, Edit2, Save } from 'lucide-react';
import { Customer, CustomerNote, CustomerProfile } from '@/types';
import { comprehensivePrompts, ComprehensivePromptTemplate, EntityType, OperationType, getPromptsByEntity, searchPrompts as searchComprehensivePrompts } from '@/lib/comprehensivePrompts';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'pending' | 'confirmed' | 'rejected';
  parsedData?: any;
}

interface CustomPrompt extends ComprehensivePromptTemplate {
  isCustom: true;
}

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onSaveNote?: (note: CustomerNote) => Promise<void>;
  onSaveCustomer?: (customer: Customer) => Promise<void>;
  onUpdateCustomer?: (customer: Customer) => Promise<void>;
  onUpdateProfile?: (profile: Partial<CustomerProfile> & { customerId: string }) => Promise<void>;
  currentUser: { id: string; name: string };
}

export function AIChatPanel({
  isOpen,
  onClose,
  customers,
  onSaveNote,
  onSaveCustomer,
  onUpdateCustomer,
  onUpdateProfile,
  currentUser
}: AIChatPanelProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'prompts'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hello! I'm your AI assistant. I can help you with:\n\n✓ Customer management\n✓ Notes and profiles\n✓ Opportunities tracking\n✓ Data entry and updates\n\nTry selecting a prompt from the Prompt Library or type your request naturally!`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Prompt library state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEntity, setFilterEntity] = useState<EntityType | 'all'>('all');
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [customPrompts, setCustomPrompts] = useState<CustomPrompt[]>([]);
  const [showAddPrompt, setShowAddPrompt] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<ComprehensivePromptTemplate | null>(null);
  const [copiedText, setCopiedText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load custom prompts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('customPrompts');
    if (saved) {
      try {
        setCustomPrompts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load custom prompts', e);
      }
    }
  }, []);

  // Save custom prompts to localStorage
  useEffect(() => {
    if (customPrompts.length > 0) {
      localStorage.setItem('customPrompts', JSON.stringify(customPrompts));
    }
  }, [customPrompts]);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isOpen, activeTab]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get all prompts (built-in + custom)
  const allPrompts = [...comprehensivePrompts, ...customPrompts];

  // Filter prompts
  const getFilteredPrompts = (): ComprehensivePromptTemplate[] => {
    let prompts = allPrompts;
    
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      prompts = prompts.filter(p =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.examples.some(e => e.toLowerCase().includes(lowerQuery))
      );
    } else if (filterEntity !== 'all') {
      prompts = prompts.filter(p => p.entity === filterEntity);
    }
    
    return prompts;
  };

  const filteredPrompts = getFilteredPrompts();
  const selectedPrompt = allPrompts.find(p => p.id === selectedPromptId);

  // Handle chat submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Simulate AI processing (replace with actual AI call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I understand you want to: "${input}"\n\nI've extracted the following information:\n• Customer: [Detected Customer]\n• Action: [Detected Action]\n\nWould you like me to proceed with this?`,
        timestamp: new Date(),
        status: 'pending'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: `Sorry, I had trouble processing that. Could you try rephrasing?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle confirm action
  const handleConfirm = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate action execution (replace with actual implementation)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const successMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: '✅ Successfully completed! Your changes have been saved.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, successMessage]);
      
      // Update the pending message status
      setMessages(prev => prev.map(msg => 
        msg.status === 'pending' ? { ...msg, status: 'confirmed' as const } : msg
      ));
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: `❌ Error: ${error.message}. Please try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle reject action
  const handleReject = () => {
    const rejectMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: 'Action cancelled. Feel free to try again with a different request.',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, rejectMessage]);
    
    // Update the pending message status
    setMessages(prev => prev.map(msg => 
      msg.status === 'pending' ? { ...msg, status: 'rejected' as const } : msg
    ));
  };

  // Use prompt in chat
  const handleUsePrompt = (prompt: ComprehensivePromptTemplate) => {
    if (prompt.examples.length > 0) {
      setInput(prompt.examples[0]);
      setActiveTab('chat');
    }
  };

  // Copy example
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  // Add custom prompt
  const handleAddPrompt = (newPrompt: Omit<CustomPrompt, 'isCustom'>) => {
    const customPrompt: CustomPrompt = {
      ...newPrompt,
      isCustom: true,
      id: `custom-${Date.now()}`
    };
    setCustomPrompts(prev => [...prev, customPrompt]);
    setShowAddPrompt(false);
  };

  // Delete custom prompt
  const handleDeletePrompt = (id: string) => {
    if (confirm('Are you sure you want to delete this custom prompt?')) {
      setCustomPrompts(prev => prev.filter(p => p.id !== id));
      if (selectedPromptId === id) {
        setSelectedPromptId('');
      }
    }
  };

  const getCategoryColor = (entity: EntityType) => {
    switch (entity) {
      case 'customer': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'note': return 'bg-green-100 text-green-700 border-green-200';
      case 'profile': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'opportunity': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'product': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'partner': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'contact': return 'bg-teal-100 text-teal-700 border-teal-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getOperationIcon = (operation: OperationType) => {
    switch (operation) {
      case 'create': return '➕';
      case 'read': return '👁️';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'list': return '📋';
      case 'search': return '🔍';
      case 'special': return '⭐';
      default: return '📄';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Slide-out Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
              <p className="text-sm text-gray-600">Natural language operations & prompt library</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
              activeTab === 'chat'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
              activeTab === 'prompts'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            Prompt Library
            <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {allPrompts.length}
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' ? (
            <div className="h-full flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type !== 'user' && (
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        message.type === 'assistant' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {message.type === 'assistant' ? (
                          <Bot className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Sparkles className="h-5 w-5 text-gray-600" />
                        )}
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
                            onClick={handleConfirm}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Confirm
                          </button>
                          <button 
                            onClick={handleReject}
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

                {isProcessing && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                    </div>
                    <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg shadow-sm">
                      <p className="text-gray-600 text-sm">Processing your request...</p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your request or select a prompt from the library..."
                    disabled={isProcessing}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || !input.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
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
                    <span>Powered by AI • {customers.length} customers loaded</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('prompts')}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Browse prompts →
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Search and Filter */}
              <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search prompts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    />
                  </div>
                  <select
                    value={filterEntity}
                    onChange={(e) => {
                      setFilterEntity(e.target.value as EntityType | 'all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Entities</option>
                    <option value="customer">Customer</option>
                    <option value="note">Note</option>
                    <option value="profile">Profile</option>
                    <option value="opportunity">Opportunity</option>
                    <option value="product">Product</option>
                    <option value="partner">Partner</option>
                    <option value="contact">Contact</option>
                  </select>
                  <button
                    onClick={() => setShowAddPrompt(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Add Custom
                  </button>
                </div>
              </div>

              {/* Prompt Library Content */}
              <div className="flex-1 flex overflow-hidden">
                {/* Prompt List */}
                <div className="w-96 border-r border-gray-200 overflow-y-auto bg-gray-50">
                  <div className="p-3 space-y-2">
                    {filteredPrompts.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-medium">No prompts found</p>
                        <p className="text-xs mt-1">Try a different search or filter</p>
                      </div>
                    ) : (
                      filteredPrompts.map((prompt) => {
                        const isCustom = 'isCustom' in prompt && prompt.isCustom;
                        return (
                          <div
                            key={prompt.id}
                            className={`p-3 rounded-lg transition-all cursor-pointer ${
                              selectedPromptId === prompt.id
                                ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                                : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm'
                            }`}
                            onClick={() => setSelectedPromptId(prompt.id)}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-lg flex-shrink-0">{getOperationIcon(prompt.operation)}</span>
                                <h4 className={`text-sm font-semibold truncate ${
                                  selectedPromptId === prompt.id ? 'text-blue-900' : 'text-gray-900'
                                }`}>
                                  {prompt.title}
                                </h4>
                              </div>
                              {isCustom && (
                                <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full flex-shrink-0">
                                  Custom
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {prompt.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryColor(prompt.entity)}`}>
                                {prompt.entity}
                              </span>
                              <span className="text-xs text-gray-500">
                                {prompt.operation}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Prompt Details */}
                <div className="flex-1 overflow-y-auto bg-white">
                  {selectedPrompt ? (
                    <div className="p-6">
                      <div className="mb-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-3xl">{getOperationIcon(selectedPrompt.operation)}</span>
                              <h3 className="text-2xl font-bold text-gray-900">{selectedPrompt.title}</h3>
                            </div>
                            <p className="text-gray-600">{selectedPrompt.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(selectedPrompt.entity)}`}>
                              {selectedPrompt.entity}
                            </span>
                            {'isCustom' in selectedPrompt && selectedPrompt.isCustom && (
                              <button
                                onClick={() => handleDeletePrompt(selectedPrompt.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete custom prompt"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleUsePrompt(selectedPrompt)}
                          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 font-medium shadow-md"
                        >
                          <Sparkles className="h-5 w-5" />
                          Use This Prompt
                        </button>
                      </div>

                      {selectedPrompt.fields && selectedPrompt.fields.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Fields Extracted:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedPrompt.fields.map((field) => (
                              <span key={field} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-mono">
                                {field}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedPrompt.examples && selectedPrompt.examples.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Example Commands:</h4>
                          <div className="space-y-3">
                            {selectedPrompt.examples.map((example, idx) => (
                              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <p className="flex-1 text-sm text-gray-700 leading-relaxed">
                                    "{example}"
                                  </p>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleCopy(example)}
                                      className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-md transition-colors"
                                      title="Copy"
                                    >
                                      {copiedText === example ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <Copy className="h-4 w-4 text-gray-500" />
                                      )}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setInput(example);
                                        setActiveTab('chat');
                                      }}
                                      className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-md transition-colors"
                                      title="Use in chat"
                                    >
                                      <Send className="h-4 w-4 text-blue-500" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedPrompt.systemPrompt && (
                        <details className="mt-6">
                          <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
                            Advanced: System Prompt
                          </summary>
                          <div className="mt-3 p-4 bg-gray-900 rounded-lg">
                            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                              {selectedPrompt.systemPrompt}
                            </pre>
                          </div>
                        </details>
                      )}
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
          )}
        </div>
      </div>

      {/* Add Custom Prompt Modal */}
      {showAddPrompt && (
        <CustomPromptModal
          onClose={() => setShowAddPrompt(false)}
          onSave={handleAddPrompt}
        />
      )}
    </>
  );
}

// Custom Prompt Modal Component
interface CustomPromptModalProps {
  onClose: () => void;
  onSave: (prompt: Omit<CustomPrompt, 'isCustom'>) => void;
}

function CustomPromptModal({ onClose, onSave }: CustomPromptModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    entity: 'customer' as EntityType,
    operation: 'create' as OperationType,
    category: 'customer',
    examples: [''],
    fields: [''],
    requiredFields: [''],
    systemPrompt: '',
    intent: '',
    confidence: 0.9
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: '', // Will be set by parent
      examples: formData.examples.filter(ex => ex.trim()),
      fields: formData.fields.filter(f => f.trim()),
      requiredFields: formData.requiredFields.filter(f => f.trim())
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Add Custom Prompt</h3>
          <p className="text-sm text-gray-600 mt-1">Create a custom prompt template for your team</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              placeholder="e.g., Create Customer with Full Details"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              rows={2}
              placeholder="Describe what this prompt does..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entity *</label>
              <select
                value={formData.entity}
                onChange={(e) => setFormData({ ...formData, entity: e.target.value as EntityType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="customer">Customer</option>
                <option value="note">Note</option>
                <option value="profile">Profile</option>
                <option value="opportunity">Opportunity</option>
                <option value="product">Product</option>
                <option value="partner">Partner</option>
                <option value="contact">Contact</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operation *</label>
              <select
                value={formData.operation}
                onChange={(e) => setFormData({ ...formData, operation: e.target.value as OperationType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="create">Create</option>
                <option value="read">Read</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="list">List</option>
                <option value="search">Search</option>
                <option value="special">Special</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Example Commands (one per line)</label>
            <textarea
              value={formData.examples.join('\n')}
              onChange={(e) => setFormData({ ...formData, examples: e.target.value.split('\n') })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm text-gray-900 placeholder-gray-400"
              rows={3}
              placeholder="Create customer Acme Corp with website acme.com&#10;Add new customer named TechStart..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Prompt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
