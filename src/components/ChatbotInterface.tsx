'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, CheckCircle, XCircle, AlertCircle, Loader2, Bot, User, MessageSquare } from 'lucide-react';
import { Customer, CustomerNote, CustomerProfile } from '@/types';
import { chatbotAI, ParsedChatbotInput } from '@/lib/chatbotAI';
import { chatbotPrompts, getPromptById } from '@/lib/chatbotPrompts';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  parsedData?: ParsedChatbotInput;
  status?: 'pending' | 'confirmed' | 'rejected';
}

interface ChatbotInterfaceProps {
  customers: Customer[];
  onSaveNote: (note: CustomerNote) => Promise<void>;
  onSaveCustomer: (customer: Customer) => Promise<void>;
  onUpdateCustomer: (customer: Customer) => Promise<void>;
  onUpdateProfile: (profile: Partial<CustomerProfile> & { customerId: string }) => Promise<void>;
  currentUser: { id: string; name: string };
}

export function ChatbotInterface({
  customers,
  onSaveNote,
  onSaveCustomer,
  onUpdateCustomer,
  onUpdateProfile,
  currentUser
}: ChatbotInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hello! I'm your Sales Solution Engineer assistant. I can help you add notes, update customer information, and manage profiles using natural language.\n\nTry saying something like:\n- "Add a note to ABC Corp about our demo yesterday"\n- "Update TechCo's SE confidence to green"\n- "Schedule follow-up with XYZ next week"`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingAction, setPendingAction] = useState<ParsedChatbotInput | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      // Detect intent first
      const detectedPrompt = await chatbotAI.detectIntent(input, chatbotPrompts);
      
      // Parse the input
      const customerNames = customers.map(c => c.customerName);
      const parsed = await chatbotAI.parseInput(input, detectedPrompt || undefined, customerNames);
      
      // Generate confirmation message
      const confirmationText = await chatbotAI.generateConfirmation(parsed);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: confirmationText,
        timestamp: new Date(),
        parsedData: parsed,
        status: 'pending'
      };

      setMessages(prev => [...prev, assistantMessage]);
      setPendingAction(parsed);
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: `Sorry, I had trouble understanding that. ${error.message}. Could you try rephrasing?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!pendingAction) return;

    setIsProcessing(true);
    
    try {
      const { extractedData, suggestedPrompt } = pendingAction;
      
      // Execute the action based on the prompt type
      if (suggestedPrompt?.id === 'add-customer-note') {
        await executeAddNote(extractedData);
      } else if (suggestedPrompt?.id === 'add-customer') {
        await executeAddCustomer(extractedData);
      } else if (suggestedPrompt?.id === 'update-customer-profile' || suggestedPrompt?.id === 'quick-discovery') {
        await executeUpdateProfile(extractedData);
      } else if (suggestedPrompt?.id === 'update-se-confidence') {
        await executeUpdateConfidence(extractedData);
      } else if (suggestedPrompt?.id === 'schedule-followup') {
        await executeScheduleFollowup(extractedData);
      } else {
        // Generic action
        await executeGenericAction(extractedData);
      }

      const successMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: '✅ Successfully updated! Is there anything else you need?',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, successMessage]);
      setPendingAction(null);
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

  const handleReject = () => {
    const rejectMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: 'No problem! Feel free to rephrase or try again.',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, rejectMessage]);
    setPendingAction(null);
  };

  // Execution functions
  const executeAddNote = async (data: any) => {
    const customer = findCustomer(data.customerName);
    if (!customer) {
      throw new Error(`Customer "${data.customerName}" not found`);
    }

    const note: CustomerNote = {
      id: '',
      customerId: customer.id,
      notes: data.noteContent || data.notes || '',
      noteDate: data.noteDate ? new Date(data.noteDate) : new Date(),
      createdBy: currentUser.name,
      updatedBy: currentUser.name,
      seConfidence: data.seConfidence || '',
      otherFields: {
        nextSteps: data.nextSteps,
        additionalNotes: data.additionalNotes,
        ...data
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await onSaveNote(note);
  };

  const executeAddCustomer = async (data: any) => {
    const customer: Customer = {
      id: '',
      customerName: data.customerName,
      website: data.website || '',
      products: data.products || [],
      customerContacts: data.customerContacts || [],
      internalContacts: data.internalContacts || [],
      partners: data.partners || [],
      sharePointUrl: data.sharePointUrl || '',
      salesforceLink: data.salesforceLink || '',
      additionalLink: data.additionalLink || '',
      additionalInfo: data.additionalInfo || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await onSaveCustomer(customer);
  };

  const executeUpdateProfile = async (data: any) => {
    const customer = findCustomer(data.customerName);
    if (!customer) {
      throw new Error(`Customer "${data.customerName}" not found`);
    }

    const profileUpdate: Partial<CustomerProfile> & { customerId: string } = {
      customerId: customer.id,
      ...(data.businessProblem && { businessProblem: data.businessProblem }),
      ...(data.whyUs && { whyUs: data.whyUs }),
      ...(data.whyNow && { whyNow: data.whyNow }),
      ...(data.customerObjective1 && { customerObjective1: data.customerObjective1 }),
      ...(data.customerObjective2 && { customerObjective2: data.customerObjective2 }),
      ...(data.customerObjective3 && { customerObjective3: data.customerObjective3 }),
      ...(data.customerUseCase1 && { customerUseCase1: data.customerUseCase1 }),
      ...(data.customerUseCase2 && { customerUseCase2: data.customerUseCase2 }),
      ...(data.customerUseCase3 && { customerUseCase3: data.customerUseCase3 }),
      ...(data.techDeepDive && { techDeepDive: data.techDeepDive }),
      ...(data.seNotes && { seNotes: data.seNotes }),
      ...(data.discovery && { discovery: data.discovery }),
      ...(data.knownTechnicalRisks && { knownTechnicalRisks: data.knownTechnicalRisks }),
      ...(data.mitigationPlan && { mitigationPlan: data.mitigationPlan }),
      updatedAt: new Date()
    };

    await onUpdateProfile(profileUpdate);
  };

  const executeUpdateConfidence = async (data: any) => {
    const customer = findCustomer(data.customerName);
    if (!customer) {
      throw new Error(`Customer "${data.customerName}" not found`);
    }

    // Add a note with the confidence update
    const note: CustomerNote = {
      id: '',
      customerId: customer.id,
      notes: `SE Confidence updated to ${data.seConfidence}. Reason: ${data.reason || 'No reason provided'}`,
      noteDate: new Date(),
      createdBy: currentUser.name,
      updatedBy: currentUser.name,
      seConfidence: data.seConfidence,
      otherFields: {
        confidenceReason: data.reason,
        additionalContext: data.additionalContext
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await onSaveNote(note);
  };

  const executeScheduleFollowup = async (data: any) => {
    const customer = findCustomer(data.customerName);
    if (!customer) {
      throw new Error(`Customer "${data.customerName}" not found`);
    }

    const note: CustomerNote = {
      id: '',
      customerId: customer.id,
      notes: `Follow-up scheduled for ${data.followUpDate || 'TBD'}: ${data.followUpAction || 'No action specified'}`,
      noteDate: new Date(),
      createdBy: currentUser.name,
      updatedBy: currentUser.name,
      seConfidence: '',
      otherFields: {
        followUpDate: data.followUpDate,
        followUpAction: data.followUpAction,
        seInvolvement: data.seInvolvement,
        assignedTo: data.assignedTo,
        priority: data.priority
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await onSaveNote(note);
  };

  const executeGenericAction = async (data: any) => {
    // Try to determine what to do based on the data
    if (data.customerName && data.noteContent) {
      await executeAddNote(data);
    } else if (data.customerName && !findCustomer(data.customerName)) {
      await executeAddCustomer(data);
    } else {
      throw new Error('Could not determine action to take');
    }
  };

  const findCustomer = (name: string): Customer | undefined => {
    if (!name) return undefined;
    const lowerName = name.toLowerCase().trim();
    return customers.find(c => 
      c.customerName.toLowerCase().includes(lowerName) ||
      lowerName.includes(c.customerName.toLowerCase())
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[700px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bot className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">SE Assistant Chatbot</h2>
            <p className="text-sm text-gray-600">Natural language customer management</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type !== 'user' && (
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'assistant' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {message.type === 'assistant' ? (
                  <Bot className="h-4 w-4 text-blue-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-600" />
                )}
              </div>
            )}

            <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
              <div
                className={`inline-block px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.type === 'system'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>

              {/* Show parsed data for assistant messages */}
              {message.parsedData && message.status === 'pending' && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
                  <p className="text-xs font-semibold text-blue-900 mb-2">Extracted Information:</p>
                  <div className="space-y-1 text-xs text-gray-700">
                    {Object.entries(message.parsedData.extractedData).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="font-medium">{key}:</span>
                        <span className="text-gray-600">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Confirmation buttons */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleConfirm}
                      disabled={isProcessing}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Confirm & Apply
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={isProcessing}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>

            {message.type === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
            </div>
            <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg">
              <p className="text-gray-600 text-sm">Processing...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your request in natural language..."
            disabled={isProcessing}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
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

        <div className="flex items-center gap-2 mt-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <p className="text-xs text-gray-600">
            Powered by AI • {customers.length} customers loaded
          </p>
        </div>
      </form>
    </div>
  );
}

