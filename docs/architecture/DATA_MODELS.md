# Data Models & Schema

## Overview

The Customer Engagement Hub uses a two-tier data model that separates static customer information from dynamic interaction data.

## Database Schema

### Collections Structure

```
Firebase Firestore
├── users/
├── customers/
├── customerProfiles/
├── customerNotes/
└── migrationOpportunities/
```

## User Model

**Collection**: `users`

```typescript
interface User {
  id: string;                    // Firebase UID
  email: string;                 // Google email
  name: string;                  // Display name
  initials: string;              // Generated from name
  photoURL?: string;             // Profile photo
  createdAt: Date;
  updatedAt: Date;
}
```

**Purpose**: Store user account information

**Key Points**:
- Created on first sign-in
- Updated on each login
- Used for tracking who created/updated records

## Customer Model

**Collection**: `customers`

```typescript
interface Customer {
  id: string;
  customerName: string;          // Required
  website?: string;
  products: Product[];           // Array of products
  customerContacts: CustomerContact[];
  internalContacts: InternalContact[];
  partners: Partner[];
  sharePointUrl: string;
  salesforceLink: string;
  additionalLink?: string;
  additionalInfo?: string;
  
  // Migration Opportunity Fields
  existingMigrationOpp?: string; // 'yes' | 'no'
  perpetualOrSubscription?: 'Perpetual' | 'Subscription' | 'Churn';
  hostingLocation?: string;
  frontEndTech?: string;
  exmUser?: boolean;
  marketingAutomationUser?: boolean;
  integrations?: string;
  heavilyCustomisedCE?: boolean;
  migrationComplexity?: string;
  customerAwareOfXMC?: boolean;
  compellingEvent?: string;
  managedCloud?: boolean;
  dateAnalysed?: string;
  mergedNotes?: string;
  migrationNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Purpose**: Store customer company information

**Relationship**: 
- One customer → One customer profile
- One customer → Many customer notes

## Customer Profile Model (Static Data)

**Collection**: `customerProfiles`

```typescript
interface CustomerProfile {
  id: string;
  customerId: string;            // Reference to Customer
  
  // Business Details
  businessProblem: string;
  whyUs: string;
  whyNow: string;
  techSelect: boolean;
  
  // Quick Hit Details
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
  
  // Solution Engineering
  seNotes: string;
  seInvolvement: boolean;
  seNotesLastUpdated: Date;
  seProductFitAssessment: 'Green' | 'Yellow' | 'Red' | '';
  seProductNotGreenReason: string;
  seConfidenceNotGreenReason: string;
  
  // Success Planning
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
```

**Purpose**: Store static business information that rarely changes

**Benefits**:
- Reduces data duplication
- Ensures consistency
- Clear separation from dynamic notes
- Easier to maintain

## Customer Note Model (Dynamic Data)

**Collection**: `customerNotes`

```typescript
interface CustomerNote {
  id: string;
  customerId: string;            // Reference to Customer
  notes: string;                 // Main note content
  noteDate: Date;
  createdBy: string;             // User ID
  updatedBy: string;             // User ID
  seConfidence: 'Green' | 'Yellow' | 'Red' | '';
  otherFields: Record<string, unknown>; // Flexible additional data
  createdAt: Date;
  updatedAt: Date;
}
```

**Purpose**: Store interaction-specific information

**Benefits**:
- Focused on each interaction
- SE confidence can change per note
- Flexible additional fields
- Easy to track changes over time

## Supporting Models

### Product

```typescript
interface Product {
  id: string;
  name: string;                  // XM Cloud, XP, CDP, etc.
  version?: string;
  description?: string;
  status?: 'Active' | 'Inactive' | 'Planned' | 'Deprecated';
}
```

### Customer Contact

```typescript
interface CustomerContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;                 // Job title
}
```

### Internal Contact

```typescript
interface InternalContact {
  id: string;
  name: string;
  role?: string;
  email?: string;
}
```

### Partner

```typescript
interface Partner {
  id: string;
  name: string;
  type?: string;                 // Implementation partner, etc.
  website?: string;
}
```

## Data Relationships

```
User
  └── Creates/Updates → Customer
                         ├── Has One → Customer Profile
                         └── Has Many → Customer Notes

Customer
  ├── References Many → Products
  ├── References Many → Customer Contacts
  ├── References Many → Internal Contacts
  └── References Many → Partners
```

## Two-Tier Data Model

### Static Data (Customer Profile)

**When to Use**:
- Information that rarely changes
- Business context
- Discovery findings
- SE assessments
- Objectives and use cases

**Updated**:
- Once per customer
- When business context changes
- After major milestones

**Example Data**:
- Business problem: "Content sprawl across 15 websites"
- Why Us: "Enterprise scalability"
- Objectives: "Unify digital experience"

### Dynamic Data (Customer Notes)

**When to Use**:
- Meeting notes
- Interaction-specific information
- Per-call SE confidence
- Follow-up actions

**Updated**:
- After each interaction
- Multiple times per customer
- Frequent updates

**Example Data**:
- "Demo completed, customer interested in CDP"
- SE Confidence: Green
- Next steps: "Send POC proposal"

## Query Patterns

### Get Customer with Profile

```typescript
// 1. Get customer
const customer = await customerService.getCustomer(customerId);

// 2. Get profile
const profile = await customerProfileService.getProfileByCustomerId(customerId);

// 3. Get notes
const notes = await customerNotesService.getNotesByCustomerId(customerId);
```

### Create Complete Customer

```typescript
// 1. Create customer
const customerId = await customerService.createCustomer(customerData, userId);

// 2. Create profile
await customerProfileService.createProfile({
  customerId,
  ...profileData
}, userId);

// 3. Add first note
await customerNotesService.createNote({
  customerId,
  notes: "Initial contact",
  ...noteData
}, userId);
```

## Field Guidelines

### Required vs Optional

**Always Required**:
- customerName (Customer)
- customerId (Profile & Notes)
- createdAt, updatedAt (All models)

**Commonly Optional**:
- Website, URLs
- Migration fields
- Contact details
- Partner information

### Field Types

**Strings**: Most text fields
**Booleans**: Yes/no questions
**Dates**: All timestamps, dates
**Arrays**: Products, contacts, partners
**Objects**: Flexible data (otherFields)

### Validation Rules

**Customer Name**:
- Required
- Min length: 1
- Max length: 200

**URLs**:
- Optional
- Must be valid URL format

**Dates**:
- Valid Date object
- Not in far future

**SE Confidence**:
- Enum: 'Green' | 'Yellow' | 'Red' | ''
- Empty string allowed

## Index Strategy

### Recommended Indexes

**customers collection**:
- customerName (for search)
- createdAt (for sorting)

**customerNotes collection**:
- customerId (for filtering by customer)
- createdAt (for chronological order)

**customerProfiles collection**:
- customerId (unique, for lookup)

## Data Migration

### From Legacy to New Schema

Old format (everything in notes):
```typescript
{
  id: "1",
  customerId: "c1",
  notes: "...",
  businessProblem: "...",  // ← Move to profile
  discovery: "...",        // ← Move to profile
  seConfidence: "Green"    // ← Keep in note
}
```

New format:
```typescript
// Customer Profile (static)
{
  id: "p1",
  customerId: "c1",
  businessProblem: "...",
  discovery: "..."
}

// Customer Note (dynamic)
{
  id: "1",
  customerId: "c1",
  notes: "...",
  seConfidence: "Green"
}
```

## Best Practices

### Data Consistency

1. **Use Services**: Always use service layer, never direct Firebase calls
2. **Validate**: Validate data before saving
3. **User Tracking**: Always pass userId to create/update
4. **Timestamps**: Let services handle timestamps
5. **Referential Integrity**: Check relationships exist

### Performance

1. **Limit Queries**: Only fetch needed data
2. **Use Indexes**: Index frequently queried fields
3. **Batch Operations**: Group related operations
4. **Cache**: Cache frequently accessed data
5. **Pagination**: Limit large result sets

### Security

1. **Authentication**: Require auth for all operations
2. **Validation**: Validate on client and server
3. **Sanitization**: Clean user input
4. **Access Control**: Use Firebase security rules
5. **Audit Trail**: Track who created/updated

## Related Documentation

- [Architecture Overview](OVERVIEW.md) - System design
- [Firebase Setup](../setup/FIREBASE_SETUP.md) - Configuration
- [Getting Started](../developer-guide/GETTING_STARTED.md) - Development guide

---

**Last Updated**: November 2025  
**Version**: 1.2.0

