'use client';

import { useState, useRef, useEffect } from 'react';
import { X, MessageSquare, BookOpen, Plus, Send, Bot, User, Loader2, CheckCircle, XCircle, Sparkles, Copy, Check, Search, Tag, Trash2, Edit2, Save } from 'lucide-react';
import { Customer, CustomerNote, CustomerProfile, CustomerContact, InternalContact, Product, Partner } from '@/types';
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
  notes?: CustomerNote[];
  customerProfiles?: CustomerProfile[];
  customerContacts: CustomerContact[];
  internalContacts: InternalContact[];
  products: Product[];
  partners: Partner[];
  onSaveNote?: (note: CustomerNote) => Promise<void>;
  onSaveCustomer?: (customer: Customer) => Promise<void>;
  onUpdateCustomer?: (customer: Customer) => Promise<void>;
  onUpdateProfile?: (profile: Partial<CustomerProfile> & { customerId: string }) => Promise<void>;
  onAddCustomerContact?: (contact: CustomerContact) => Promise<CustomerContact>;
  onAddInternalContact?: (contact: InternalContact) => Promise<InternalContact>;
  onAddProduct?: (product: Omit<Product, 'id'>) => Promise<Product | void>;
  onAddPartner?: (partner: Omit<Partner, 'id'>) => Promise<Partner | void>;
  currentUser: { id: string; name: string };
  getFirebaseIdToken: () => Promise<string | null>;
  reloadWorkspace?: () => Promise<void>;
}

export function AIChatPanel({
  isOpen,
  onClose,
  customers,
  notes = [],
  customerProfiles = [],
  customerContacts,
  internalContacts,
  products,
  partners,
  onSaveNote,
  onSaveCustomer,
  onUpdateCustomer,
  onUpdateProfile,
  onAddCustomerContact,
  onAddInternalContact,
  onAddProduct,
  onAddPartner,
  currentUser,
  getFirebaseIdToken,
  reloadWorkspace,
}: AIChatPanelProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'prompts'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hello! I'm your AI assistant. I can help you with:\n\n✓ Customer lookup & summaries\n✓ Internal contacts (e.g. "Do I have internal contact [name]? If not create, they are Account Executive")\n✓ Customer contacts, products, partners\n✓ Notes and profiles\n✓ Create entities if not found\n\nTry a prompt from the library or type naturally!`,
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

  // Parse customer input with intelligent detection
  const parseCustomerInput = (input: string, existingCustomers: Customer[]) => {
    const lowerInput = input.toLowerCase().trim();
    
    // Detect LOOKUP intent first (do I have, tell me about, show me, summary of, etc.)
    const isLookupQuery = 
      /do\s+(?:i|we)\s+have\s+(?:a\s+)?customer\s+/i.test(input) ||
      /do\s+(?:i|we)\s+have\s+[\"']?([A-Za-z\s&]+)[\"']?\s*\??$/i.test(input) ||
      /(?:tell\s+me\s+about|show\s+me|info\s+about|information\s+about|summary\s+of|details\s+on)\s+([A-Za-z\s&]+)/i.test(input) ||
      /(?:is\s+there\s+(?:a\s+)?customer\s+(?:named?\s+)?|customer\s+[\"']?)([A-Za-z\s&]+)/i.test(input);
    
    let intent = '';
    let customerName = '';
    
    if (isLookupQuery) {
      intent = 'lookup_customer';
      // Extract customer name from lookup patterns
      const lookupPatterns = [
        /do\s+(?:i|we)\s+have\s+(?:a\s+)?customer\s+[\"']?([A-Za-z\s&]+?)[\"']?\s*\??$/i,
        /do\s+(?:i|we)\s+have\s+[\"']?([A-Za-z\s&]+?)[\"']?\s*\??$/i,
        /(?:tell\s+me\s+about|show\s+me|info\s+about|information\s+about|summary\s+of|details\s+on)\s+[\"']?([A-Za-z\s&]+?)[\"']?\s*\??$/i,
        /(?:is\s+there\s+(?:a\s+)?customer\s+(?:named?\s+)?|customer\s+)[\"']?([A-Za-z\s&]+?)[\"']?\s*\??$/i,
        /[\"']([A-Za-z\s&]+)[\"']/  // Quoted name
      ];
      for (const pattern of lookupPatterns) {
        const match = input.match(pattern);
        if (match && match[1]) {
          customerName = match[1].trim();
          if (customerName.length > 2) break;
        }
      }
      // Fallback: take the last substantial phrase (often the customer name)
      if (!customerName && input.length > 10) {
        const words = input.replace(/\?+$/, '').trim().split(/\s+/);
        const skipWords = ['do', 'i', 'we', 'have', 'a', 'customer', 'the', 'tell', 'me', 'about', 'show', 'info', 'information', 'summary', 'of', 'details', 'on', 'is', 'there', 'named'];
        const nameWords = words.filter(w => !skipWords.includes(w.toLowerCase()) && w.length > 1);
        if (nameWords.length > 0) {
          customerName = nameWords.join(' ');
        }
      }
    } else if (lowerInput.includes('create') || lowerInput.includes('add')) {
      intent = 'create_customer';
    } else if (lowerInput.includes('update')) {
      intent = 'update_customer';
    } else if (lowerInput.includes('note')) {
      intent = 'create_note';
    }
    
    // Extract customer name for non-lookup intents
    if (!customerName && intent !== 'lookup_customer') {
      const namePatterns = [
        /(?:customer|record|account)\s+(?:for|named?)\s+([A-Z][A-Za-z\s&]+?)(?:\s+-|\s+with|\s+Stake|$)/i,
        /(?:create|add|update)\s+([A-Z][A-Za-z\s&]+?)(?:\s+-|\s+with|\s+Stake|$)/i,
        /^([A-Z][A-Za-z\s&]+?)(?:\s+-|\s+Stake)/i
      ];
      for (const pattern of namePatterns) {
        const match = input.match(pattern);
        if (match && match[1]) {
          customerName = match[1].trim();
          break;
        }
      }
    }
    
    // Check if customer exists
    const existingCustomer = existingCustomers.find(c => 
      c.customerName.toLowerCase() === customerName.toLowerCase()
    );
    
    // Extract contacts from the input
    const contacts: any[] = [];
    const lines = input.split('\n');
    let isContactSection = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().includes('stake holder') || trimmed.toLowerCase().includes('stakeholder')) {
        isContactSection = true;
        continue;
      }
      
      if (isContactSection && trimmed) {
        // Parse contact line: "Name    Role"
        const parts = trimmed.split('\t').filter(p => p.trim());
        if (parts.length >= 2) {
          contacts.push({
            id: `contact-${Date.now()}-${Math.random()}`,
            name: parts[0].trim(),
            email: '', // Not provided
            phone: '', // Not provided
            role: parts[1].trim()
          });
        }
      }
    }
    
    // Build the data object
    let data: any;
    
    // If customer exists, merge with existing data
    if (existingCustomer) {
      intent = 'update_customer';
      data = {
        ...existingCustomer, // Keep all existing fields including the correct ID
        customerContacts: [...(existingCustomer.customerContacts || []), ...contacts], // Add new contacts
        additionalInfo: (existingCustomer.additionalInfo || '') + '\n\n' + input,
        updatedAt: new Date()
      };
    } else {
      // Create new customer
      intent = 'create_customer';
      data = {
        id: '', // Empty ID for new customer - will be generated by Firebase
        customerName: customerName,
        customerContacts: contacts,
        products: [],
        internalContacts: [],
        partners: [],
        website: '',
        sharePointUrl: '',
        salesforceLink: '',
        additionalLink: '',
        additionalInfo: input,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    // Generate detailed message
    let message = '';
    if (!customerName) {
      throw new Error("I couldn't find a customer name in your request. Please specify the customer name clearly.");
    }
    
    if (existingCustomer) {
      message = `🔍 **Found existing customer:** "${customerName}"\n\n`;
      message += `📋 **Current information:**\n`;
      message += `• Products: ${existingCustomer.products?.length || 0}\n`;
      message += `• Contacts: ${existingCustomer.customerContacts?.length || 0}\n`;
      message += `• Partners: ${existingCustomer.partners?.length || 0}\n\n`;
      message += `➕ **Adding new information:**\n`;
      message += `• ${contacts.length} new contact(s):\n`;
      contacts.forEach(c => message += `  - ${c.name} (${c.role})\n`);
      message += `\n✅ **Action:** Update existing customer record\n`;
      message += `\nWould you like me to proceed with updating "${customerName}"?`;
    } else {
      message = `✨ **Creating new customer:** "${customerName}"\n\n`;
      message += `📋 **Extracted information:**\n`;
      message += `• Customer Name: ${customerName}\n`;
      message += `• Contacts: ${contacts.length}\n`;
      contacts.forEach(c => message += `  - ${c.name} (${c.role})\n`);
      message += `\n✅ **Action:** Create new customer record\n`;
      message += `\nWould you like me to proceed with creating "${customerName}"?`;
    }
    
    return {
      intent,
      data,
      customerData: data,
      customerContacts: data.customerContacts || [],
      internalContacts: data.internalContacts || [],
      message,
      existingCustomer: existingCustomer || null
    };
  };

  const generateExtractedInfo = (parsedData: any) => {
    // This function can be used to format extracted data for display
    return parsedData;
  };

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

  // Hub assistant: LLM + tools execute only on `/api/ai-chat` with the signed-in user Bearer token (no client Gemini keys).
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
    const userInput = input;
    setInput('');
    setIsProcessing(true);

    try {
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Sign in required');

      const apiRes = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await apiRes.json();

      if (!apiRes.ok || data?.success !== true) {
        const err =
          typeof data?.error === 'string'
            ? data.error
            : apiRes.statusText || 'Assistant request failed';
        throw new Error(err);
      }

      if (data.text) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.text as string,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        await reloadWorkspace?.();
        return;
      }

      // Fallback: rule-based parser for create/update (client-side draft; confirmations still use Hub APIs via callbacks)
      const parsedData = parseCustomerInput(userInput, customers);
      
      if (!parsedData.intent) {
        throw new Error("I couldn't understand what you want to do. Please try rephrasing or use a prompt from the library.");
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: parsedData.message,
        timestamp: new Date(),
        status: 'pending',
        parsedData: parsedData
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: unknown) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: `❌ ${error instanceof Error ? error.message : 'Something went wrong'}\n\nTip: Try using a prompt from the Prompt Library tab for better results.`,
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
      // Find the pending message with parsed data
      const pendingMessage = messages.find(msg => msg.status === 'pending' && msg.parsedData);
      
      if (!pendingMessage || !pendingMessage.parsedData) {
        throw new Error('No pending action found');
      }

      const { intent, customerData, customerContacts: newCustomerContacts, internalContacts: newInternalContacts } = pendingMessage.parsedData;
      
      // Handle multi-entity operations
      if (intent === 'create_customer' || intent === 'update_customer' || intent === 'multi_entity') {
        const addedCustomerContacts: CustomerContact[] = [];
        const addedInternalContacts: InternalContact[] = [];
        
        // Step 1: Add customer contacts to Firebase collection and collect IDs
        const customerContactIds: string[] = [];
        if (newCustomerContacts && newCustomerContacts.length > 0) {
          for (const contact of newCustomerContacts) {
            const exists = customerContacts.find(c => 
              c.name.toLowerCase() === contact.name.toLowerCase()
            );
            
            if (!exists && onAddCustomerContact) {
              try {
                const savedContact = await onAddCustomerContact(contact);
                // savedContact now has the Firebase-generated ID
                if (savedContact && savedContact.id) {
                  customerContactIds.push(savedContact.id);
                  addedCustomerContacts.push(savedContact);
                  console.log('✅ Added customer contact to Firebase:', contact.name, 'ID:', savedContact.id);
                }
              } catch (error) {
                console.error('Failed to add customer contact:', error);
              }
            } else if (exists) {
              // Use existing contact ID
              customerContactIds.push(exists.id);
              console.log('⏭️ Using existing customer contact ID:', exists.name, 'ID:', exists.id);
            }
          }
        }
        
        // Step 2: Add internal contacts to Firebase collection and collect IDs
        const internalContactIds: string[] = [];
        if (newInternalContacts && newInternalContacts.length > 0) {
          for (const contact of newInternalContacts) {
            const exists = internalContacts.find(c => 
              (c.email && contact.email && c.email.toLowerCase() === contact.email.toLowerCase()) ||
              c.name.toLowerCase() === contact.name.toLowerCase()
            );
            
            if (!exists && onAddInternalContact) {
              try {
                const savedContact = await onAddInternalContact(contact);
                // savedContact now has the Firebase-generated ID
                if (savedContact && savedContact.id) {
                  internalContactIds.push(savedContact.id);
                  addedInternalContacts.push(savedContact);
                  console.log('✅ Added internal contact to Firebase:', contact.name, 'ID:', savedContact.id);
                }
              } catch (error) {
                console.error('Failed to add internal contact:', error);
              }
            } else if (exists) {
              // Use existing contact ID
              internalContactIds.push(exists.id);
              console.log('⏭️ Using existing internal contact ID:', exists.name, 'ID:', exists.id);
            }
          }
        }
        
        // Step 3: Update customer data with contact IDs (references only)
        if (customerData) {
          // Get existing contact IDs from customer
          const existingCustomerContactIds = customerData.customerContactIds || [];
          const existingInternalContactIds = customerData.internalContactIds || [];
          
          // Merge with new IDs (avoiding duplicates)
          customerData.customerContactIds = [...new Set([...existingCustomerContactIds, ...customerContactIds])];
          customerData.internalContactIds = [...new Set([...existingInternalContactIds, ...internalContactIds])];
          
          // Remove full contact objects (we only store IDs)
          delete customerData.customerContacts;
          delete customerData.internalContacts;
          
          console.log('📋 Customer will have contact references:', {
            customerContactIds: customerData.customerContactIds,
            internalContactIds: customerData.internalContactIds
          });
        }
        
        // Step 4: Save/update customer with contact IDs
        let customerAction = '';
        if (customerData && onSaveCustomer) {
          try {
            await onSaveCustomer(customerData as Customer);
            const isUpdate = customerData.id && customers.some(c => c.id === customerData.id);
            customerAction = isUpdate ? 'Updated' : 'Created';
          } catch (updateError: any) {
            // Defensive: if update fails, create new
            console.warn('Update failed, creating new customer:', updateError);
            const newData = {
              ...customerData,
              id: '',
              createdAt: new Date(),
              updatedAt: new Date()
            };
            await onSaveCustomer(newData as Customer);
            customerAction = 'Created';
          }
        }
        
        // Step 4: Generate success message with detailed feedback
        let successContent = '✅ Success! All entities processed:\n\n';
        
        if (customerAction) {
          successContent += `📋 CUSTOMER: ${customerAction} "${customerData?.customerName}"\n`;
        }
        
        if (addedCustomerContacts.length > 0) {
          successContent += `\n👥 CUSTOMER CONTACTS: Added ${addedCustomerContacts.length} to CustomerContacts collection\n`;
          addedCustomerContacts.forEach(c => {
            successContent += `   • ${c.name} (${c.role})\n`;
          });
        }
        
        if (addedInternalContacts.length > 0) {
          successContent += `\n🏢 INTERNAL CONTACTS: Added ${addedInternalContacts.length} to InternalContacts collection\n`;
          addedInternalContacts.forEach(c => {
            successContent += `   • ${c.name} - ${c.role}\n`;
            if (c.email) successContent += `     ${c.email}\n`;
          });
        }
        
        successContent += `\n✨ All records saved successfully!`;
        
        const successMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'system',
          content: successContent,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
      } else if (intent === 'create_note') {
        if (onSaveNote && customerData) {
          await onSaveNote(customerData as CustomerNote);
          
          const successMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'system',
            content: `✅ Success! Added note to customer.\n\nThe note has been saved.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, successMessage]);
        }
      } else {
        throw new Error('Unsupported action type');
      }
      
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
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
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
                    <span>Powered by AI • {customers.length} customers loaded • Press Enter to send, Shift+Enter for new line</span>
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
                              {isCustom ? (
                                <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full flex-shrink-0">
                                  Custom
                                </span>
                              ) : null}
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
                            {'isCustom' in selectedPrompt && selectedPrompt.isCustom ? (
                              <button
                                onClick={() => handleDeletePrompt(selectedPrompt.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete custom prompt"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : null}
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
