import { Customer, CustomerContact, InternalContact } from '@/types';

export interface ParsedAIData {
  intent: 'create_customer' | 'update_customer' | 'multi_entity' | 'unknown';
  message: string;
  customerData?: any;
  customerContacts?: CustomerContact[];
  internalContacts?: InternalContact[];
  hasMultipleEntities?: boolean;
}

/**
 * Parses natural language input to extract multiple entity types
 * Detects: customers, customer contacts (stakeholders), internal contacts
 * Returns structured data for all detected entities
 */
export function parseCustomerInput(input: string, existingCustomers: Customer[]): ParsedAIData {
  const lowerInput = input.toLowerCase();
  
  // Detect entity types first
  const hasInternalContact = lowerInput.includes('internal contact') || 
                             lowerInput.includes('account manager') ||
                             lowerInput.includes('@') && lowerInput.includes('.com');
  const hasStakeholder = lowerInput.includes('stake holder') || lowerInput.includes('stakeholder');
  const hasCustomerKeyword = lowerInput.includes('customer') || 
                             lowerInput.includes('for ') || 
                             input.trim().split('\n')[0].length > 5; // First line is likely customer name
  
  // Determine intent - default to multi_entity if we have internal contacts
  let intent: 'create_customer' | 'update_customer' | 'multi_entity' | 'unknown' = 'unknown';
  
  if (hasInternalContact || (hasStakeholder && hasCustomerKeyword)) {
    intent = 'multi_entity'; // Always use multi_entity when we have internal contacts
  } else if (lowerInput.includes('create') || lowerInput.includes('add')) {
    intent = 'create_customer';
  } else if (lowerInput.includes('update') || lowerInput.includes('modify')) {
    intent = 'update_customer';
  } else if (hasCustomerKeyword) {
    intent = 'create_customer'; // Default to create if we have a customer name
  }
  
  // Extract customer name
  let customerName = '';
  const forMatch = input.match(/for\s+([^\n,]+?)(?:\s+customer|,|\n|$)/i);
  if (forMatch) {
    customerName = forMatch[1].trim();
  } else {
    const lines = input.split('\n');
    const firstLine = lines[0].replace(/create|add|update|customer record/gi, '').trim();
    if (firstLine && !firstLine.toLowerCase().includes('stake')) {
      customerName = firstLine;
    }
  }
  
  // Check if customer already exists
  const existingCustomer = existingCustomers.find(c => 
    c.customerName.toLowerCase() === customerName.toLowerCase()
  );
  
  // Extract customer contacts (stakeholders)
  const customerContacts: CustomerContact[] = [];
  const internalContacts: InternalContact[] = [];
  const lines = input.split('\n');
  let isStakeholderSection = false;
  let isInternalContactSection = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detect stakeholder section
    if (trimmed.toLowerCase().includes('stake holder') || trimmed.toLowerCase().includes('stakeholder')) {
      isStakeholderSection = true;
      isInternalContactSection = false;
      continue;
    }
    
    // Detect internal contact section
    if (trimmed.toLowerCase().includes('internal contact')) {
      isInternalContactSection = true;
      isStakeholderSection = false;
      continue;
    }
    
    // Skip header rows
    if (trimmed.toLowerCase().includes('role') && trimmed.length < 30) {
      continue;
    }
    
    // Parse stakeholder contacts
    if (isStakeholderSection && trimmed && trimmed.length > 5) {
      const parts = trimmed.split('\t').map(p => p.trim()).filter(p => p);
      if (parts.length >= 2) {
        customerContacts.push({
          id: `contact-${Date.now()}-${Math.random()}`,
          name: parts[0],
          email: '',
          phone: '',
          role: parts[1]
        });
      }
    }
    
    // Parse internal contacts
    if (isInternalContactSection && trimmed && trimmed.length > 5) {
      // Format: "Name, Role, Department, Email" or "Name	Role	Department	Email"
      const parts = trimmed.split(/[,\t]/).map(p => p.trim()).filter(p => p);
      if (parts.length >= 2) {
        internalContacts.push({
          id: `internal-${Date.now()}-${Math.random()}`,
          name: parts[0],
          email: parts[3] || '',
          role: [parts[1], parts[2]].filter(Boolean).join(' — ') || undefined,
        });
      }
    }
  }
  
  // Build customer data
  let customerData: any;
  
  if (existingCustomer) {
    // Update existing customer - keep multi_entity if we have internal contacts
    if (intent !== 'multi_entity' && !hasInternalContact) {
      intent = 'update_customer';
    } else if (hasInternalContact) {
      intent = 'multi_entity'; // Force multi_entity if we have internal contacts
    }
    customerData = {
      ...existingCustomer,
      customerContacts: [...(existingCustomer.customerContacts || []), ...customerContacts],
      additionalInfo: (existingCustomer.additionalInfo || '') + '\n\n' + input,
      updatedAt: new Date()
    };
  } else {
    // Create new customer - keep multi_entity if we have internal contacts
    if (intent !== 'multi_entity' && !hasInternalContact) {
      intent = 'create_customer';
    } else if (hasInternalContact) {
      intent = 'multi_entity'; // Force multi_entity if we have internal contacts
    }
    customerData = {
      id: '',
      customerName: customerName,
      customerContacts: customerContacts,
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
  
  // Generate detailed response message
  const message = generateMultiEntityResponseMessage(
    intent,
    customerName,
    existingCustomer,
    customerContacts,
    internalContacts
  );
  
  return {
    intent,
    message,
    customerData,
    customerContacts,
    internalContacts,
    hasMultipleEntities: intent === 'multi_entity'
  };
}

/**
 * Generates a detailed response message for multi-entity operations
 */
function generateMultiEntityResponseMessage(
  intent: string,
  customerName: string,
  existingCustomer: Customer | undefined,
  customerContacts: CustomerContact[],
  internalContacts: InternalContact[]
): string {
  const hasCustomer = customerName && customerName.length > 0;
  const hasCustomerContacts = customerContacts.length > 0;
  const hasInternalContacts = internalContacts.length > 0;
  
  let message = '🤖 AI Analysis Complete\n\n';
  
  // Customer section
  if (hasCustomer) {
    if (existingCustomer) {
      message += `✅ CUSTOMER: "${customerName}" (Found - will UPDATE)\n`;
      message += `   Current: ${existingCustomer.customerContacts?.length || 0} contacts, ${existingCustomer.products?.length || 0} products\n\n`;
    } else {
      message += `✨ CUSTOMER: "${customerName}" (Not found - will CREATE)\n\n`;
    }
  }
  
  // Customer contacts section
  if (hasCustomerContacts) {
    message += `👥 CUSTOMER CONTACTS (Stakeholders): ${customerContacts.length} detected\n`;
    customerContacts.forEach(c => {
      message += `   • ${c.name} - ${c.role}\n`;
    });
    message += `   ➜ Will add to CustomerContacts collection\n\n`;
  }
  
  // Internal contacts section
  if (hasInternalContacts) {
    message += `🏢 INTERNAL CONTACTS: ${internalContacts.length} detected\n`;
    internalContacts.forEach(c => {
      message += `   • ${c.name}${c.role ? ` — ${c.role}` : ''}\n`;
      if (c.email) message += `     Email: ${c.email}\n`;
    });
    message += `   ➜ Will add to InternalContacts collection\n\n`;
  }
  
  // Summary
  message += `📊 SUMMARY:\n`;
  if (hasCustomer) {
    message += `   • Customer: ${existingCustomer ? 'UPDATE' : 'CREATE'}\n`;
  }
  if (hasCustomerContacts) {
    message += `   • Add ${customerContacts.length} customer contact(s)\n`;
  }
  if (hasInternalContacts) {
    message += `   • Add ${internalContacts.length} internal contact(s)\n`;
  }
  
  message += `\n✅ Would you like me to proceed?`;
  
  return message;
}

/**
 * Extracts structured information from parsed data for display
 */
export function generateExtractedInfo(parsedData: ParsedAIData): string {
  const { customerData, customerContacts, internalContacts } = parsedData;
  
  return `
Customer: ${customerData?.customerName || 'N/A'}
Customer Contacts: ${customerContacts?.length || 0}
Internal Contacts: ${internalContacts?.length || 0}
Products: ${customerData?.products?.length || 0}
Partners: ${customerData?.partners?.length || 0}
  `.trim();
}
