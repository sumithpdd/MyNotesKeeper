# Solution Engineer Notes & Templates

## Overview

The SE Notes feature provides structured templates for Solution Engineers to document customer interactions, technical assessments, and engagement progress.

## Key Features

### 📋 Complete Template Coverage
All fields from SFDC SE Notes Template:
- Business Details
- Quick Hit Details
- Solution Engineering
- Success Planning

### 🤖 Auto-Generation
- Generate SE Notes from profile fields
- Professional formatting
- Activity tracking with initials/dates
- Prompt library integration

### 📚 Prompt Library
- Pre-configured prompts for common scenarios
- Discovery questions
- Demo preparation
- Technical deep dives
- Competitive positioning

### 📊 Two-Tier Data Model
- **Customer Profile** - Static business information
- **Customer Notes** - Dynamic interaction notes

## Data Structure

### Customer Profile (Static)

**Business Details:**
- What business problem are we solving?
- Why Us?
- Why now?
- Tech select (yes/no)

**Quick Hit Details:**
- Pre-discovery status
- Discovery status and notes
- Total demos conducted
- Latest demo information
- Technical deep dive details
- InfoSec completion status
- Known technical risks
- Mitigation plan

**Solution Engineering:**
- SE Involvement
- SE Notes Last Updated
- SE Product Fit Assessment (Green/Yellow/Red)
- Reason for SE Product not Green
- Reason for SE Confidence not Green
- Comprehensive SE Notes

**Success Planning:**
- Customer Objectives (1, 2, 3)
- Customer Objectives Details
- Customer Use Cases (1, 2, 3)

### Customer Notes (Dynamic)

**Per-Interaction Data:**
- Note content
- Note date
- Created by / Updated by
- SE Confidence level (can change per note)
- Additional fields (flexible)

## Using Customer Profiles

### Creating a Profile

1. **Navigate to Customer**
   - Open Customer Management tab
   - Select customer from list

2. **Open Profile Form**
   - Click "Create Profile" button
   - Or "Edit Profile" if exists

3. **Fill Sections**
   - **Business Details** - Problem, why us, why now
   - **Quick Hit Details** - Discovery, demos, risks
   - **Solution Engineering** - Assessment, notes
   - **Success Planning** - Objectives, use cases

4. **Save Profile**
   - Click "Save" button
   - Profile stored in Firebase

### Editing a Profile

1. Select customer
2. Click "Customer Profile" or "Edit Profile"
3. Modify any section
4. Save changes

## Using SE Notes Generation

### Auto-Generate from Fields

1. **Fill Profile Sections**
   - Complete Business Details
   - Complete Quick Hit Details
   - Add discovery information

2. **Click Generate Button**
   - Find the blue "Generate from fields" button
   - Located in SE Notes section
   - Has sparkles (✨) icon

3. **Review Generated Notes**
   - SE Notes field auto-fills
   - Formatted professionally
   - Includes all relevant data

4. **Edit as Needed**
   - Modify generated text
   - Add specific details
   - Save when complete

### SE Notes Format

Generated notes include:
```
BUSINESS DETAILS
- Problem: [business problem]
- Why Us: [why us]
- Why Now: [why now]

DISCOVERY & DEMOS
- Discovery: [status]
- Demos: [count]
- Latest Demo: [date]

TECHNICAL ASSESSMENT
- Product Fit: [assessment]
- SE Confidence: [level]
- Known Risks: [risks]
- Mitigation: [plan]

SUCCESS CRITERIA
- Objectives: [obj1, obj2, obj3]
- Use Cases: [uc1, uc2, uc3]

Activity: [Initials] - [Date]
```

## Using the Prompt Library

### Accessing Library

1. **Open Customer Profile Form**
2. **Navigate to SE Notes Section**
3. **Click "Prompt Library" Button**
   - Purple button with book (📚) icon
   - Opens prompt browser

### Available Prompts

**Discovery Questions:**
- Business context questions
- Technical requirements
- Use case specifics
- Decision criteria

**Product Demo Preparation:**
- Pre-demo checklist
- During demo approach
- Post-demo follow-up

**Technical Deep Dive:**
- Architecture topics
- Security questions
- Integration patterns
- Performance considerations

**Competitive Positioning:**
- Key differentiators
- Talking points
- Objection handling

### Using Prompts

1. **Browse Prompts**
   - Left sidebar shows categories
   - Click to view details

2. **Select Prompt**
   - Review content
   - Check if appropriate

3. **Insert or Copy**
   - Click "Use in Notes" - Auto-inserts
   - Click "Copy" - Copies to clipboard

4. **Customize**
   - Modify for specific customer
   - Add relevant details

## Conditional Fields

### SE Product Not Green

**When Visible:**
- SE Product Fit Assessment is Yellow or Red

**Purpose:**
- Document why assessment is not Green
- Track product concerns
- Guide improvement plans

### SE Confidence Not Green

**When Visible:**
- Always visible

**Purpose:**
- Track confidence concerns
- Document risks
- Plan mitigation

## Best Practices

### Profile Management

1. **Create Early** - Set up profile during discovery
2. **Update Regularly** - Keep information current
3. **Be Thorough** - Complete all relevant sections
4. **Use Auto-Gen** - Save time with generation
5. **Review Generated** - Always check AI output

### Note Taking

1. **Per-Interaction** - Create note after each interaction
2. **Update Confidence** - Track SE confidence changes
3. **Document Risks** - Note any technical concerns
4. **Track Progress** - Show engagement advancement

### Template Usage

1. **Start with Template** - Use auto-generation
2. **Customize** - Tailor to specific situation
3. **Add Details** - Enhance with specifics
4. **Keep Concise** - Focus on key information
5. **Update Dates** - Keep activity tracking current

## Data Flow

```
User Input (Profile Form)
   ↓
Business Details Section
   ↓
Quick Hit Details Section
   ↓
SE Notes Generation
   ↓
Formatted Template
   ↓
Review & Edit
   ↓
Save to Customer Profile
   ↓
Firebase (customerProfiles collection)
```

## Technical Details

### Components

**CustomerProfileForm.tsx:**
- Main profile editing form
- All sections
- Generation buttons
- Prompt library integration

**PromptLibrary.tsx:**
- Prompt browser
- Category navigation
- Copy/insert functionality

**SlideOutPanel.tsx:**
- View-only display
- All profile sections
- Copy fields

### Services

**customerProfileService.ts:**
- CRUD operations
- Profile management
- Firebase integration

**seTemplate.ts:**
- Template generation
- Field extraction
- Formatting

### Schema

**Location:** `src/types/index.ts`

```typescript
interface CustomerProfile {
  id: string;
  customerId: string;
  // Business Details
  businessProblem: string;
  whyUs: string;
  whyNow: string;
  techSelect: boolean;
  // Quick Hit Details
  preDiscovery: boolean;
  discovery: string;
  totalDemos: number;
  latestDemoDate: Date;
  techDeepDive: string;
  infoSecCompleted: boolean;
  knownTechnicalRisks: string;
  mitigationPlan: string;
  // Solution Engineering
  seNotes: string;
  seInvolvement: boolean;
  seProductFitAssessment: 'Green' | 'Yellow' | 'Red' | '';
  seProductNotGreenReason: string;
  seConfidenceNotGreenReason: string;
  // Success Planning
  customerObjective1: string;
  customerObjective2: string;
  customerObjective3: string;
  customerUseCase1: string;
  customerUseCase2: string;
  customerUseCase3: string;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

## Common Workflows

### New Customer Setup

1. Add customer
2. Create customer profile
3. Fill business details
4. Add discovery information
5. Generate SE notes
6. Save profile
7. Add first customer note

### After Demo

1. Open customer
2. Add new note (dynamic)
3. Update SE confidence in note
4. Update profile if needed:
   - Increment demo count
   - Update latest demo date
   - Regenerate SE notes

### Before Deal Review

1. Open customer profile
2. Review all sections
3. Update SE notes
4. Export/copy relevant sections
5. Use for presentation

## Troubleshooting

### Profile Not Showing

- **Check Selection** - Customer must be selected
- **Look for Button** - "Create Profile" or "Edit Profile"
- **Refresh Page** - Reload if needed

### Generation Not Working

- **Fill Required Fields** - Add business details first
- **Click Correct Button** - Blue "Generate from fields"
- **Check Console** - Look for errors (F12)

### Prompt Library Issues

- **Location** - Must be in Profile form
- **Button** - Purple book icon
- **Scroll** - May need to scroll to SE Notes section

## Related Documentation

- [AI Features](AI_FEATURES.md) - Text enhancement
- [Chatbot](CHATBOT.md) - Natural language entry
- [Architecture](../architecture/OVERVIEW.md) - System design
- [Data Models](../architecture/DATA_MODELS.md) - Schema details

---

**Feature Version**: 1.1.0  
**Last Updated**: November 2025

