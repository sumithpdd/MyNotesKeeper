import { Product } from './product';
import { MartechTool } from './martechTool';
import { CustomerContact, InternalContact, Partner } from './contacts';

/** Per-pillar free-text fields on an account planning record. */
export interface AccountPlanningPillarFields {
  approach?: string;
  status?: string;
  nextActions?: string;
}

/** SC account planning — whitespace, multi-threading, migration, research. */
export interface AccountPlanningPlan {
  /** Align with AE after Vee whitespace work. */
  aeAlignment?: string;
  whitespace?: AccountPlanningPillarFields;
  multiThreading?: AccountPlanningPillarFields & { targetStakeholders?: string };
  migration?: AccountPlanningPillarFields & {
    eligible?: boolean;
    headlessPath?: string;
    saiPath?: string;
    partnerStrategy?: '' | 'partner' | 'direct' | 'both';
  };
  research?: AccountPlanningPillarFields & { vertical?: string; topics?: string };
}

// Customer Information (static data per customer)
export interface Customer {
  id: string;
  customerName: string;
  website?: string;
  /** Multiple public site URLs for one account (first URL also mirrored on `website` when saved from Hub). */
  websiteUrls?: string[];
  productIds: string[]; // References to products collection
  products?: Product[]; // Resolved for display only (not stored in DB)
  customerContactIds: string[]; // References to customerContacts collection
  customerContacts?: CustomerContact[]; // Resolved for display only (not stored in DB)
  internalContactIds: string[]; // References to internalContacts collection
  internalContacts?: InternalContact[]; // Resolved for display only (not stored in DB)
  accountExecutiveId?: string; // Primary AE (backward compat)
  accountExecutive?: InternalContact; // Primary AE (backward compat)
  accountExecutiveIds?: string[]; // Multiple Account Executives
  accountExecutives?: InternalContact[]; // Resolved for display (not stored in DB)
  partnerIds: string[]; // References to partners collection
  partners?: Partner[]; // Resolved for display only (not stored in DB)
  martechToolIds?: string[]; // References to martechTools collection
  martechTools?: MartechTool[]; // Resolved for display only (not stored in DB)
  sharePointUrl: string;
  salesforceLink: string;
  additionalLink?: string;
  additionalInfo?: string;
  // Migration Opportunity Fields
  existingMigrationOpp?: string; // Flag: 'yes', 'no', 'YES', 'n', 'N' - determines if this is a migration opp
  perpetualOrSubscription?: 'Perpetual' | 'Subscription' | 'Churn';
  hostingLocation?: string;
  frontEndTech?: string;
  exmUser?: 'yes' | 'no' | 'Yes' | 'No' | boolean;
  marketingAutomationUser?: 'yes' | 'no' | 'Yes' | 'No' | boolean;
  integrations?: string;
  heavilyCustomisedCE?: 'yes' | 'no' | 'Yes' | 'No' | boolean;
  migrationComplexity?: string;
  customerAwareOfXMC?: 'yes' | 'no' | 'Y' | 'N' | 'YES' | boolean;
  compellingEvent?: string;
  managedCloud?: 'yes' | 'no' | 'Yes' | 'No' | boolean;
  dateAnalysed?: string;
  mergedNotes?: string; // Merged notes field
  migrationNotes?: string; // Migration-specific notes
  /** AE/SC account planning pillars (whitespace, multi-threading, migration, research). */
  accountPlanning?: AccountPlanningPlan;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerData {
  customerName: string;
  website?: string;
  websiteUrls?: string[];
  productIds: string[]; // References only
  products?: Product[]; // For backward compatibility
  customerContactIds: string[]; // References only
  customerContacts?: CustomerContact[]; // For backward compatibility
  internalContactIds: string[]; // References only
  internalContacts?: InternalContact[]; // For backward compatibility
  accountExecutiveId?: string; // Primary AE (backward compat)
  accountExecutive?: InternalContact; // For backward compatibility
  accountExecutiveIds?: string[]; // Multiple Account Executives
  accountExecutives?: InternalContact[]; // For backward compatibility
  partnerIds: string[]; // References only
  partners?: Partner[]; // For backward compatibility
  martechToolIds?: string[]; // References only
  martechTools?: MartechTool[]; // For backward compatibility
  sharePointUrl: string;
  salesforceLink: string;
  additionalLink?: string;
  additionalInfo?: string;
  // Migration Opportunity Fields
  existingMigrationOpp?: string;
  perpetualOrSubscription?: 'Perpetual' | 'Subscription' | 'Churn';
  hostingLocation?: string;
  frontEndTech?: string;
  exmUser?: 'yes' | 'no' | 'Yes' | 'No' | boolean;
  marketingAutomationUser?: 'yes' | 'no' | 'Yes' | 'No' | boolean;
  integrations?: string;
  heavilyCustomisedCE?: 'yes' | 'no' | 'Yes' | 'No' | boolean;
  migrationComplexity?: string;
  customerAwareOfXMC?: 'yes' | 'no' | 'Y' | 'N' | 'YES' | boolean;
  compellingEvent?: string;
  managedCloud?: 'yes' | 'no' | 'Yes' | 'No' | boolean;
  dateAnalysed?: string;
  mergedNotes?: string;
  migrationNotes?: string;
  accountPlanning?: AccountPlanningPlan;
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
  seProductNotGreenReason: string;
  seConfidenceNotGreenReason: string;
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
  seProductNotGreenReason: string;
  seConfidenceNotGreenReason: string;
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
