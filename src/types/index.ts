// Customer Information (static data per customer)
export interface Customer {
  id: string;
  customerName: string;
  website?: string;
  products: Product[];
  customerContacts: CustomerContact[];
  internalContacts: InternalContact[];
  partners: Partner[];
  sharePointUrl: string;
  salesforceLink: string;
  additionalLink?: string;
  additionalInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Customer Profile (static information that doesn't change often)
export interface CustomerProfile {
  id: string;
  customerId: string; // Reference to Customer
  // Business Details (static)
  businessProblem: string;
  whyUs: string;
  whyNow: string;
  techSelect: boolean;
  // Quick Hit Details (static)
  preDiscovery: boolean;
  discovery: string;
  discoveryNotesAttached: boolean;
  totalDemos: number;
  latestDemoDryRun: boolean;
  latestDemoDate: Date;
  techDeepDive: string;
  infoSecCompleted: boolean;
  knownTechnicalRisks: string;
  mitigationPlan: string;
  // Solution Engineering (static)
  seNotes: string;
  seInvolvement: boolean;
  seNotesLastUpdated: Date;
  seProductFitAssessment: 'Green' | 'Yellow' | 'Red' | '';
  // Success Planning (static)
  customerObjective1: string;
  customerObjective2: string;
  customerObjective3: string;
  customerObjectivesDetails: string;
  customerUseCase1: string;
  customerUseCase2: string;
  customerUseCase3: string;
  createdAt: Date;
  updatedAt: Date;
}

// Customer Note (dynamic information that changes per interaction)
export interface CustomerNote {
  id: string;
  customerId: string; // Reference to Customer
  notes: string;
  noteDate: Date;
  createdBy: string;
  updatedBy: string;
  // Dynamic fields that can change per note
  seConfidence: 'Green' | 'Yellow' | 'Red' | '';
  otherFields: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface InternalContact {
  id: string;
  name: string;
  role?: string;
  email?: string;
}

export interface Contract {
  id: string;
  name: string;
  description?: string;
}

export interface CustomerContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface Partner {
  id: string;
  name: string;
  type?: string;
  website?: string;
}

export interface Product {
  id: string;
  name: string;
  version?: string;
  description?: string;
  status?: 'Active' | 'Inactive' | 'Planned' | 'Deprecated';
}

export interface CreateCustomerData {
  customerName: string;
  website?: string;
  products: Product[];
  customerContacts: CustomerContact[];
  internalContacts: InternalContact[];
  partners: Partner[];
  sharePointUrl: string;
  salesforceLink: string;
  additionalLink?: string;
  additionalInfo?: string;
}

export interface CreateCustomerProfileData {
  customerId: string;
  // Business Details (static)
  businessProblem: string;
  whyUs: string;
  whyNow: string;
  techSelect: boolean;
  // Quick Hit Details (static)
  preDiscovery: boolean;
  discovery: string;
  discoveryNotesAttached: boolean;
  totalDemos: number;
  latestDemoDryRun: boolean;
  latestDemoDate: Date;
  techDeepDive: string;
  infoSecCompleted: boolean;
  knownTechnicalRisks: string;
  mitigationPlan: string;
  // Solution Engineering (static)
  seNotes: string;
  seInvolvement: boolean;
  seNotesLastUpdated: Date;
  seProductFitAssessment: 'Green' | 'Yellow' | 'Red' | '';
  // Success Planning (static)
  customerObjective1: string;
  customerObjective2: string;
  customerObjective3: string;
  customerObjectivesDetails: string;
  customerUseCase1: string;
  customerUseCase2: string;
  customerUseCase3: string;
}

export interface UpdateCustomerProfileData extends Partial<CreateCustomerProfileData> {
  id?: string;
}

export interface CreateCustomerNoteData {
  customerId: string;
  notes: string;
  noteDate: Date;
  createdBy: string;
  updatedBy: string;
  // Dynamic fields that can change per note
  seConfidence: 'Green' | 'Yellow' | 'Red' | '';
  otherFields: Record<string, unknown>;
}

export interface UpdateCustomerNoteData extends Partial<CreateCustomerNoteData> {
  id: string;
}

export interface AIGenerationRequest {
  customerName: string;
  context: string;
  type: 'notes' | 'summary' | 'suggestions';
}

export interface AIGenerationResponse {
  content: string;
  suggestions?: string[];
}
