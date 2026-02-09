/**
 * Comprehensive Prompt Library for AI-Powered CRUD Operations
 * 
 * This file contains all available prompts for natural language data entry
 * across ALL entities in the system: Customers, Notes, Profiles, Opportunities,
 * Products, Partners, Contacts
 * 
 * @author AI Assistant
 * @date 2026-02-08
 * @version 2.0.0
 */

export type EntityType = 'customer' | 'note' | 'profile' | 'opportunity' | 'product' | 'partner' | 'contact';
export type OperationType = 'create' | 'read' | 'update' | 'delete' | 'list' | 'search' | 'special';

export interface ComprehensivePromptTemplate {
  id: string;
  title: string;
  description: string;
  entity: EntityType;
  operation: OperationType;
  category: string;
  examples: string[];
  fields: string[];
  requiredFields: string[];
  systemPrompt: string;
  intent: string;
  confidence: number;
}

/**
 * All available prompts organized by entity and operation
 */
export const comprehensivePrompts: ComprehensivePromptTemplate[] = [
  // ================== CUSTOMER PROMPTS ==================
  {
    id: 'create-customer',
    title: 'Create New Customer',
    description: 'Create a new customer record with comprehensive information',
    entity: 'customer',
    operation: 'create',
    category: 'customer',
    examples: [
      'Create a new customer named Acme Corporation with website acme.com, products XM Cloud and CDP',
      'Add customer TechStart Inc, contact John Doe (john@techstart.com), partner Accenture',
      'New customer: Global Industries, website global.com, using XM Cloud, internal contact Sarah Miller'
    ],
    fields: [
      'customerName', 'website', 'products', 'customerContacts', 'internalContacts',
      'accountExecutive', 'partners', 'sharePointUrl', 'salesforceLink', 'additionalLink', 'additionalInfo'
    ],
    requiredFields: ['customerName'],
    systemPrompt: `Extract customer creation data with fields: customerName (required), website, products (array), customerContacts (array with name, email, phone, role), internalContacts (array), accountExecutive (single contact), partners (array), sharePointUrl, salesforceLink, additionalLink, additionalInfo`,
    intent: 'create_customer',
    confidence: 0.95
  },
  {
    id: 'update-customer',
    title: 'Update Customer Information',
    description: 'Update existing customer details',
    entity: 'customer',
    operation: 'update',
    category: 'customer',
    examples: [
      'Update Acme Corp website to newacme.com',
      'Change TechStart account executive to Jane Smith',
      'Add partner Microsoft to Global Industries'
    ],
    fields: [
      'customerName', 'website', 'products', 'customerContacts', 'internalContacts',
      'accountExecutive', 'partners', 'sharePointUrl', 'salesforceLink'
    ],
    requiredFields: ['customerName'],
    systemPrompt: `Extract customer update data. Include customerName (to identify) and any fields to update. Only include fields that should change.`,
    intent: 'update_customer',
    confidence: 0.9
  },
  {
    id: 'delete-customer',
    title: 'Delete Customer',
    description: 'Delete a customer record',
    entity: 'customer',
    operation: 'delete',
    category: 'customer',
    examples: [
      'Delete customer Acme Corp',
      'Remove TechStart Inc from the system',
      'Delete the customer named Old Company'
    ],
    fields: ['customerName'],
    requiredFields: ['customerName'],
    systemPrompt: `Extract customer name to delete. This is a destructive operation.`,
    intent: 'delete_customer',
    confidence: 0.95
  },
  {
    id: 'search-customer',
    title: 'Search Customers',
    description: 'Find customers by various criteria',
    entity: 'customer',
    operation: 'search',
    category: 'customer',
    examples: [
      'Find all customers using XM Cloud',
      'Show me customers with partner Accenture',
      'List customers managed by John Doe'
    ],
    fields: ['searchTerm', 'product', 'partner', 'accountExecutive'],
    requiredFields: [],
    systemPrompt: `Extract search criteria: searchTerm (general search), product (specific product), partner (specific partner), accountExecutive (account manager name)`,
    intent: 'search_customer',
    confidence: 0.85
  },

  // ================== NOTE PROMPTS ==================
  {
    id: 'create-note',
    title: 'Add Customer Note',
    description: 'Create a new interaction note for a customer',
    entity: 'note',
    operation: 'create',
    category: 'note',
    examples: [
      'Add note to Acme Corp: Met with CTO yesterday, discussed XM Cloud migration, green confidence',
      'Note for TechStart: Demo completed on Feb 1, customer impressed, next steps: send proposal',
      'Create note for Global Industries about security review meeting on 2026-02-05'
    ],
    fields: [
      'customerName', 'notes', 'noteDate', 'createdBy', 'seConfidence', 'nextSteps'
    ],
    requiredFields: ['customerName', 'notes'],
    systemPrompt: `Extract note data: customerName (required), notes (content), noteDate (ISO format, default today), createdBy, seConfidence (Green/Yellow/Red), nextSteps`,
    intent: 'create_note',
    confidence: 0.95
  },
  {
    id: 'update-note',
    title: 'Update Customer Note',
    description: 'Modify an existing note',
    entity: 'note',
    operation: 'update',
    category: 'note',
    examples: [
      'Update the latest note for Acme Corp, change confidence to yellow',
      'Modify last note for TechStart, add next steps: schedule follow-up',
      'Update note from Feb 1 for Global Industries, mark as resolved'
    ],
    fields: ['customerName', 'noteDate', 'notes', 'seConfidence', 'nextSteps'],
    requiredFields: ['customerName'],
    systemPrompt: `Extract note update data: customerName (required), noteDate (to identify which note), fields to update`,
    intent: 'update_note',
    confidence: 0.85
  },
  {
    id: 'list-notes',
    title: 'List Customer Notes',
    description: 'View all notes for a customer',
    entity: 'note',
    operation: 'list',
    category: 'note',
    examples: [
      'Show me all notes for Acme Corp',
      'List notes for TechStart',
      'What are the recent notes for Global Industries?'
    ],
    fields: ['customerName', 'limit', 'sortBy'],
    requiredFields: ['customerName'],
    systemPrompt: `Extract list request: customerName (required), limit (number of notes), sortBy (date/confidence)`,
    intent: 'list_notes',
    confidence: 0.9
  },

  // ================== PROFILE PROMPTS ==================
  {
    id: 'create-profile',
    title: 'Create Customer Profile',
    description: 'Create a comprehensive customer profile with business details',
    entity: 'profile',
    operation: 'create',
    category: 'profile',
    examples: [
      'Create profile for Acme Corp: business problem is content sprawl, why us: enterprise scale, objective: unify content',
      'New profile for TechStart: problem is lack of personalization, they chose us for AI capabilities',
      'Add profile for Global: trying to solve multi-site management, need it now due to M&A activity'
    ],
    fields: [
      'customerName', 'businessProblem', 'whyUs', 'whyNow', 'techSelect',
      'customerObjective1', 'customerObjective2', 'customerObjective3',
      'customerUseCase1', 'customerUseCase2', 'customerUseCase3',
      'discovery', 'techDeepDive', 'seProductFitAssessment', 'seNotes'
    ],
    requiredFields: ['customerName'],
    systemPrompt: `Extract profile data: customerName (required), businessProblem, whyUs, whyNow (compelling event), techSelect (boolean), objectives (1-3), use cases (1-3), discovery details, techDeepDive, seProductFitAssessment (Green/Yellow/Red), seNotes`,
    intent: 'create_profile',
    confidence: 0.9
  },
  {
    id: 'update-profile',
    title: 'Update Customer Profile',
    description: 'Modify customer profile information',
    entity: 'profile',
    operation: 'update',
    category: 'profile',
    examples: [
      'Update Acme Corp profile: why now changed to contract renewal deadline',
      'Modify TechStart profile: add use case 3 - e-commerce personalization',
      'Change Global profile SE fit to green after successful POC'
    ],
    fields: [
      'customerName', 'businessProblem', 'whyUs', 'whyNow', 'techSelect',
      'customerObjective1', 'customerObjective2', 'customerObjective3',
      'customerUseCase1', 'customerUseCase2', 'customerUseCase3',
      'seProductFitAssessment', 'seNotes', 'discovery', 'techDeepDive'
    ],
    requiredFields: ['customerName'],
    systemPrompt: `Extract profile updates: customerName (to identify), any fields to update. Only include changed fields.`,
    intent: 'update_profile',
    confidence: 0.85
  },

  // ================== OPPORTUNITY PROMPTS ==================
  {
    id: 'create-opportunity',
    title: 'Create New Opportunity',
    description: 'Create a sales opportunity for a customer',
    entity: 'opportunity',
    operation: 'create',
    category: 'opportunity',
    examples: [
      'Create opportunity for Acme Corp: XM Cloud Migration 2026, stage Discover, value $500k, probability 60%',
      'New opportunity for TechStart: CDP Implementation, new business, stage Propose, expected close Q2 2026',
      'Add opportunity: Global Industries Platform Modernization, migration type, $800k, stage Qualify'
    ],
    fields: [
      'customerName', 'opportunityName', 'description', 'currentStage', 'type', 'priority',
      'estimatedValue', 'currency', 'probability', 'expectedCloseDate',
      'products', 'owner', 'competitorInfo', 'nextSteps'
    ],
    requiredFields: ['customerName', 'opportunityName', 'currentStage'],
    systemPrompt: `Extract opportunity data: customerName (required), opportunityName (required), description, currentStage (Plan/Prospect/Qualify/Discover/Differentiate/Propose/Close/Delivery and Success/Expand), type (New Business/Upsell/Cross-sell/Renewal/Migration), priority (Low/Medium/High/Critical), estimatedValue (number), currency (USD/EUR/GBP), probability (0-100), expectedCloseDate (ISO), products (array), owner (name), competitorInfo, nextSteps`,
    intent: 'create_opportunity',
    confidence: 0.9
  },
  {
    id: 'update-opportunity',
    title: 'Update Opportunity',
    description: 'Modify opportunity details',
    entity: 'opportunity',
    operation: 'update',
    category: 'opportunity',
    examples: [
      'Update Acme XM Cloud opportunity, increase probability to 75%',
      'Change TechStart CDP opportunity stage to Close',
      'Modify Global opportunity: add competitor information about Adobe'
    ],
    fields: [
      'customerName', 'opportunityName', 'description', 'currentStage',
      'estimatedValue', 'probability', 'expectedCloseDate', 'nextSteps'
    ],
    requiredFields: ['customerName', 'opportunityName'],
    systemPrompt: `Extract opportunity updates: customerName and opportunityName (to identify), fields to update. Only include changed fields.`,
    intent: 'update_opportunity',
    confidence: 0.85
  },
  {
    id: 'change-opportunity-stage',
    title: 'Change Opportunity Stage',
    description: 'Move opportunity to a different sales stage',
    entity: 'opportunity',
    operation: 'special',
    category: 'opportunity',
    examples: [
      'Move Acme XM Cloud opportunity to Propose stage, note: proposal sent to CFO',
      'Change TechStart CDP to Close stage, they signed the contract',
      'Update Global opportunity stage to Differentiate, completed competitive analysis'
    ],
    fields: ['customerName', 'opportunityName', 'newStage', 'notes'],
    requiredFields: ['customerName', 'opportunityName', 'newStage'],
    systemPrompt: `Extract stage change: customerName, opportunityName (to identify), newStage (Plan/Prospect/Qualify/Discover/Differentiate/Propose/Close/Delivery and Success/Expand), notes (reason for change)`,
    intent: 'change_opportunity_stage',
    confidence: 0.95
  },
  {
    id: 'list-opportunities',
    title: 'List Opportunities',
    description: 'View opportunities by customer or stage',
    entity: 'opportunity',
    operation: 'list',
    category: 'opportunity',
    examples: [
      'Show all opportunities for Acme Corp',
      'List opportunities in Propose stage',
      'What opportunities are closing this quarter?'
    ],
    fields: ['customerName', 'stage', 'timeframe'],
    requiredFields: [],
    systemPrompt: `Extract list criteria: customerName (specific customer), stage (filter by stage), timeframe (this week/month/quarter)`,
    intent: 'list_opportunities',
    confidence: 0.85
  },

  // ================== PRODUCT PROMPTS ==================
  {
    id: 'add-product',
    title: 'Add Product',
    description: 'Add a new product to the system',
    entity: 'product',
    operation: 'create',
    category: 'product',
    examples: [
      'Add product Content Hub version 2.5',
      'Create new product Sitecore Search',
      'Add OrderCloud as a product'
    ],
    fields: ['name', 'version', 'description', 'status'],
    requiredFields: ['name'],
    systemPrompt: `Extract product data: name (required), version, description, status (Active/Inactive/Planned/Deprecated)`,
    intent: 'add_product',
    confidence: 0.9
  },

  // ================== PARTNER PROMPTS ==================
  {
    id: 'add-partner',
    title: 'Add Partner',
    description: 'Add a new implementation partner',
    entity: 'partner',
    operation: 'create',
    category: 'partner',
    examples: [
      'Add partner Accenture, type SI, website accenture.com',
      'Create partner Horizontal Digital',
      'Add implementation partner Perficient'
    ],
    fields: ['name', 'type', 'website'],
    requiredFields: ['name'],
    systemPrompt: `Extract partner data: name (required), type (SI/ISV/Agency), website`,
    intent: 'add_partner',
    confidence: 0.9
  },

  // ================== CONTACT PROMPTS ==================
  {
    id: 'add-contact',
    title: 'Add Contact',
    description: 'Add a customer or internal contact',
    entity: 'contact',
    operation: 'create',
    category: 'contact',
    examples: [
      'Add customer contact John Doe, email john@acme.com, role CTO',
      'Create internal contact Sarah Miller, sales manager',
      'Add contact Mike Johnson, phone 555-1234, role developer'
    ],
    fields: ['name', 'email', 'phone', 'role', 'type'],
    requiredFields: ['name', 'type'],
    systemPrompt: `Extract contact data: name (required), email, phone, role, type (customer/internal)`,
    intent: 'add_contact',
    confidence: 0.9
  },

  // ================== GENERAL/QUERY PROMPTS ==================
  {
    id: 'show-pipeline',
    title: 'Show Pipeline Summary',
    description: 'Display sales pipeline overview',
    entity: 'opportunity',
    operation: 'special',
    category: 'report',
    examples: [
      'Show me the pipeline',
      'What\'s our total pipeline value?',
      'Give me a pipeline summary'
    ],
    fields: ['scope'],
    requiredFields: [],
    systemPrompt: `Extract report request: scope (all/by-stage/by-owner)`,
    intent: 'show_pipeline',
    confidence: 0.95
  },
  {
    id: 'customer-summary',
    title: 'Customer Summary',
    description: 'Get comprehensive customer information',
    entity: 'customer',
    operation: 'read',
    category: 'report',
    examples: [
      'Tell me about Acme Corp',
      'Show me everything for TechStart',
      'Give me a summary of Global Industries'
    ],
    fields: ['customerName'],
    requiredFields: ['customerName'],
    systemPrompt: `Extract request: customerName (required). This will fetch complete customer info including notes, profile, and opportunities.`,
    intent: 'customer_summary',
    confidence: 0.95
  }
];

/**
 * Get prompts by entity type
 */
export function getPromptsByEntity(entity: EntityType): ComprehensivePromptTemplate[] {
  return comprehensivePrompts.filter(p => p.entity === entity);
}

/**
 * Get prompts by operation type
 */
export function getPromptsByOperation(operation: OperationType): ComprehensivePromptTemplate[] {
  return comprehensivePrompts.filter(p => p.operation === operation);
}

/**
 * Get prompt by ID
 */
export function getPromptById(id: string): ComprehensivePromptTemplate | undefined {
  return comprehensivePrompts.find(p => p.id === id);
}

/**
 * Search prompts by keyword
 */
export function searchPrompts(keyword: string): ComprehensivePromptTemplate[] {
  const lowerKeyword = keyword.toLowerCase();
  return comprehensivePrompts.filter(p =>
    p.title.toLowerCase().includes(lowerKeyword) ||
    p.description.toLowerCase().includes(lowerKeyword) ||
    p.examples.some(e => e.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * Get all CRUD prompts for a specific entity
 */
export function getCRUDPromptsForEntity(entity: EntityType): {
  create?: ComprehensivePromptTemplate;
  read?: ComprehensivePromptTemplate;
  update?: ComprehensivePromptTemplate;
  delete?: ComprehensivePromptTemplate;
  list?: ComprehensivePromptTemplate;
  special: ComprehensivePromptTemplate[];
} {
  const entityPrompts = getPromptsByEntity(entity);
  return {
    create: entityPrompts.find(p => p.operation === 'create'),
    read: entityPrompts.find(p => p.operation === 'read'),
    update: entityPrompts.find(p => p.operation === 'update'),
    delete: entityPrompts.find(p => p.operation === 'delete'),
    list: entityPrompts.find(p => p.operation === 'list'),
    special: entityPrompts.filter(p => p.operation === 'special')
  };
}

/**
 * Detect intent from user input (simple keyword matching as fallback)
 */
export function detectIntentFromKeywords(input: string): ComprehensivePromptTemplate | null {
  const lowerInput = input.toLowerCase();
  
  // Priority order for intent detection
  const intentKeywords: Array<{ keywords: string[], promptId: string }> = [
    { keywords: ['delete', 'remove'], promptId: 'delete-customer' },
    { keywords: ['create customer', 'add customer', 'new customer'], promptId: 'create-customer' },
    { keywords: ['create opportunity', 'add opportunity', 'new opportunity'], promptId: 'create-opportunity' },
    { keywords: ['create note', 'add note'], promptId: 'create-note' },
    { keywords: ['create profile', 'add profile'], promptId: 'create-profile' },
    { keywords: ['update customer'], promptId: 'update-customer' },
    { keywords: ['update opportunity'], promptId: 'update-opportunity' },
    { keywords: ['update note'], promptId: 'update-note' },
    { keywords: ['update profile'], promptId: 'update-profile' },
    { keywords: ['change stage', 'move to stage', 'update stage'], promptId: 'change-opportunity-stage' },
    { keywords: ['show pipeline', 'pipeline summary'], promptId: 'show-pipeline' },
    { keywords: ['tell me about', 'show me everything', 'summary of'], promptId: 'customer-summary' },
    { keywords: ['list opportunities', 'show opportunities'], promptId: 'list-opportunities' },
    { keywords: ['list notes', 'show notes'], promptId: 'list-notes' },
    { keywords: ['search customer', 'find customer'], promptId: 'search-customer' },
  ];
  
  for (const { keywords, promptId } of intentKeywords) {
    if (keywords.some(kw => lowerInput.includes(kw))) {
      return getPromptById(promptId) || null;
    }
  }
  
  return null;
}

/**
 * Export count for UI display
 */
export const promptStats = {
  total: comprehensivePrompts.length,
  byEntity: {
    customer: getPromptsByEntity('customer').length,
    note: getPromptsByEntity('note').length,
    profile: getPromptsByEntity('profile').length,
    opportunity: getPromptsByEntity('opportunity').length,
    product: getPromptsByEntity('product').length,
    partner: getPromptsByEntity('partner').length,
    contact: getPromptsByEntity('contact').length
  },
  byOperation: {
    create: getPromptsByOperation('create').length,
    read: getPromptsByOperation('read').length,
    update: getPromptsByOperation('update').length,
    delete: getPromptsByOperation('delete').length,
    list: getPromptsByOperation('list').length,
    search: getPromptsByOperation('search').length,
    special: getPromptsByOperation('special').length
  }
};
