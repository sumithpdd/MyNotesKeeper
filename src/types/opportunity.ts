import { Product } from './product';
import { InternalContact } from './contacts';

// Opportunity Stage Types
export type OpportunityStage = 
  | 'Plan' 
  | 'Prospect' 
  | 'Qualify' 
  | 'Discover' 
  | 'Differentiate' 
  | 'Propose' 
  | 'Close' 
  | 'Delivery and Success'
  | 'Expand';

/**
 * Opportunity type. The first three mirror the CRM picklist (`License`,
 * `Renewal`, `Services`) so Salesforce records can be represented verbatim;
 * the rest are Hub-native motions retained for existing data.
 */
export type OpportunityType =
  | 'License'
  | 'Renewal'
  | 'Services'
  | 'New Business'
  | 'Upsell'
  | 'Cross-sell'
  | 'Migration';

/** CRM picklist subset — offered first in pickers and used by importers. */
export const CRM_OPPORTUNITY_TYPES: readonly OpportunityType[] = [
  'License',
  'Renewal',
  'Services',
] as const;

export const OPPORTUNITY_TYPES: readonly OpportunityType[] = [
  ...CRM_OPPORTUNITY_TYPES,
  'New Business',
  'Upsell',
  'Cross-sell',
  'Migration',
] as const;

// Stage History Entry
export interface StageHistoryEntry {
  id: string;
  fromStage: OpportunityStage | null; // null for initial stage
  toStage: OpportunityStage;
  changedBy: string; // User who changed the stage
  changedAt: Date;
  notes?: string; // Optional notes about why stage changed
  duration?: number; // Time spent in previous stage (in days)
}

// Opportunity (multiple opportunities per customer/account)
export interface Opportunity {
  id: string;
  customerId: string; // Reference to Customer
  opportunityName: string; // e.g., "XM Cloud Migration 2026", "CDP Implementation"
  description?: string;
  currentStage: OpportunityStage;
  stageHistory: StageHistoryEntry[]; // Complete history of stage changes
  
  // Financial
  estimatedValue?: number;
  currency?: string; // USD, EUR, GBP, etc.
  probability?: number; // 0-100%
  
  // Timeline
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  
  // Related Information
  products: Product[]; // Products involved in this opportunity
  owner?: InternalContact; // Opportunity owner (could be different from account executive)
  
  // Additional Details
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  type?: OpportunityType;
  competitorInfo?: string;
  nextSteps?: string;
  /** CRM record URL (e.g. Salesforce Lightning opportunity). */
  crmOpportunityUrl?: string;

  // Metadata
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create Opportunity Data
export interface CreateOpportunityData {
  customerId: string;
  opportunityName: string;
  description?: string;
  currentStage: OpportunityStage;
  estimatedValue?: number;
  currency?: string;
  probability?: number;
  expectedCloseDate?: Date;
  products: Product[];
  owner?: InternalContact;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  type?: OpportunityType;
  competitorInfo?: string;
  nextSteps?: string;
  crmOpportunityUrl?: string;
  createdBy: string;
  updatedBy: string;
}

// Update Opportunity Data
export interface UpdateOpportunityData extends Partial<CreateOpportunityData> {
  id: string;
}

// Stage Change Data
export interface StageChangeData {
  opportunityId: string;
  newStage: OpportunityStage;
  notes?: string;
  changedBy: string;
}
