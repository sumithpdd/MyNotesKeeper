# Features Documentation

Complete documentation of all features in the Customer Engagement Hub.

## 📋 Table of Contents

1. [Customer Management](#customer-management)
2. [Customer Profiles](#customer-profiles)
3. [Notes Management](#notes-management)
4. [Opportunity Tracking](#opportunity-tracking)
5. [AI Chatbot](#ai-chatbot)
6. [Prompt Library](#prompt-library)
7. [Entity Management](#entity-management)
8. [Search & Filter](#search--filter)

---

## Customer Management

Comprehensive CRUD (Create, Read, Update, Delete) operations for managing customers.

### Key Features
- ✅ Grid and list view display
- ✅ Rich customer profiles with products, contacts, partners
- ✅ Quick links to SharePoint and Salesforce
- ✅ Account executive assignment
- ✅ Real-time updates via Firebase

### Customer Fields
- **Basic Info:** Name, website, dates
- **Products:** Multi-select from catalog (XM Cloud, CDP, etc.)
- **Contacts:** Customer and internal team contacts
- **Account Executive:** Assigned from internal contacts
- **Partners:** Implementation partners (SI, ISV, Agency)
- **Links:** SharePoint, Salesforce, additional URLs
- **Notes:** Additional information

### Views

**Grid View:**
- Card-based layout
- Visual product badges
- Quick stats (contacts, partners)
- Status indicators
- Responsive (1-4 columns based on screen size)

**List View:**
- Tabular layout
- Sortable columns
- Better for scanning large lists
- All info visible at once

---

## Customer Profiles

Static business context that doesn't change often.

### Purpose
Store business information that stays constant across interactions:
- Why are they buying?
- What problem are they solving?
- What's their timeline?
- Business objectives and use cases

### Profile Sections

#### 1. Business Details
- **Business Problem** - Challenge they're solving
- **Why Us** - Why they chose us
- **Why Now** - Timing reasons
- **Tech Select** - Technology selected?

#### 2. Quick Hit Details
- **Pre-Discovery** - Completed?
- **Discovery** - Status and notes
- **Total Demos** - Number given
- **Latest Demo** - Date and dry run status
- **Tech Deep Dive** - Technical details
- **InfoSec** - Security review status
- **Technical Risks** - Known risks
- **Mitigation Plan** - Risk mitigation

#### 3. Solution Engineering
- **SE Notes** - Detailed SE notes
- **SE Involvement** - Is SE involved?
- **Product Fit Assessment** - Green/Yellow/Red
- **Confidence Assessment** - Green/Yellow/Red
- **Reasons** - If not green, why?

#### 4. Success Planning
- **Objectives (1-3)** - Customer goals
- **Use Cases (1-3)** - Specific use cases
- **Details** - Additional context

### AI Generation
- **Auto-generate objectives** from templates
- **Auto-generate use cases** from DXP pool
- **Context-aware** based on customer industry/products

---

## Notes Management

Dynamic, per-interaction notes with SE confidence tracking.

### Purpose
Record details from each customer interaction:
- Meeting notes
- Call summaries
- Email exchanges
- SE confidence levels

### Note Fields
- **Notes** - Detailed interaction notes
- **Note Date** - When did it happen?
- **Created By** - Your name
- **SE Confidence** - Green/Yellow/Red
  - Green: On track, high confidence
  - Yellow: Some concerns
  - Red: At risk, significant issues
- **Other Fields** - JSON for custom data

### Features
- **View in Context** - See customer profile with note
- **Copy Fields** - Quick copy-paste functionality
- **Edit/Delete** - Full CRUD operations
- **Chronological List** - Sorted by date
- **Search** - Find specific notes

---

## Opportunity Tracking

Track sales opportunities through their lifecycle with complete stage history.

### Opportunity Stages

9 stages from planning to expansion:

1. **Plan** - Initial planning phase
2. **Prospect** - Identifying prospects
3. **Qualify** - Qualification phase
4. **Discover** - Discovery and scoping
5. **Differentiate** - Competitive differentiation
6. **Propose** - Proposal stage
7. **Close** - Closing the deal
8. **Delivery and Success** - Implementation
9. **Expand** - Expansion opportunities

### Opportunity Fields
- **Name** - Descriptive name
- **Stage** - Current stage
- **Value** - Estimated deal value
- **Probability** - Win probability (0-100%)
- **Weighted Value** - Auto-calculated (value × probability)
- **Expected Close Date** - Target close
- **Owner** - Opportunity owner
- **Products** - Products involved
- **Type** - New Business, Upsell, Cross-sell, Renewal, Migration
- **Priority** - High, Medium, Low, Critical
- **Competitors** - Competing vendors
- **Next Steps** - Action items

### Stage History

**Automatically tracked:**
- Previous stage
- New stage
- Date/time of change
- Who changed it
- Optional notes about why
- Duration in previous stage (days)

**Use cases:**
- Pipeline velocity analysis
- Stage duration tracking
- Audit trail
- Deal review

### Features
- **Multiple opportunities per customer**
- **Complete stage history**
- **Financial tracking** (value, probability, weighted value)
- **Filtering** by stage, owner, type, priority
- **Timeline view** of stage progression

---

## AI Chatbot

Natural language interface for data entry and updates.

### Purpose
Use conversational commands instead of forms:
- "Add a note to ABC Corp, demo yesterday, green confidence"
- "Update XYZ Company, add product CDP"
- "Create customer Global Tech, website globaltech.com"

### How It Works

1. **Type command** in natural language
2. **AI parses** to extract structured data
3. **Preview** shows what will be created/updated
4. **Confirm** to apply or **Cancel** to discard
5. **Changes saved** automatically to Firebase

### Capabilities

**Customer Operations:**
- Create new customers
- Update customer information
- Add/remove products, contacts, partners

**Note Operations:**
- Add notes to customers
- Update SE confidence
- Add interaction details

**Profile Operations:**
- Update business details
- Change SE assessments
- Update objectives and use cases

**Opportunity Operations:**
- Create opportunities
- Update stages
- Change values and probabilities

### AI Features
- **Intent detection** - Understands what you want
- **Entity extraction** - Pulls out names, dates, values
- **Context awareness** - Knows about your customers
- **Error handling** - Asks for clarification if needed

### Tips for Better Results
- **Be specific** - Include customer names and exact values
- **Use clear intent** - "Add", "Update", "Create", "Delete"
- **Provide context** - Dates, confidence levels, products
- **Review before confirming** - Always check parsed data

---

## Prompt Library Tab

Comprehensive library of 28+ pre-built prompts with custom prompt creation.

### Overview

**Layout:**
- **Left sidebar:** List of all prompts (built-in + custom)
- **Right panel:** Detailed view of selected prompt
- **Top bar:** Search and filter controls + "Add Custom" button

### Built-in Prompts (28+)

Organized by **Entity** and **Operation**:

**Entities:**
- 👥 Customer (4 prompts)
- 📝 Note (3 prompts)
- 📋 Profile (2 prompts)
- 🎯 Opportunity (4 prompts)
- 📦 Product (1 prompt)
- 🤝 Partner (1 prompt)
- 👤 Contact (1 prompt)
- 📊 Report/Special (2 prompts)

**Operations:**
- ➕ Create - Add new records
- 👁️ Read - View/get information
- ✏️ Update - Modify existing records
- 🗑️ Delete - Remove records
- 📋 List - Show multiple records
- 🔍 Search - Find records by criteria
- ⭐ Special - Advanced operations (stage changes, reports)

### Features

**Search & Filter:**
- 🔍 **Search bar** - Find prompts by keyword (searches title, description, examples)
- 📂 **Entity filter** - Show only prompts for specific entities
- 🏷️ **Category badges** - Visual entity type indicators with colors

**Prompt Details:**
- **Title & description** - What the prompt does
- **Entity & operation badges** - Clear categorization
- **Fields extracted** - Which data fields will be captured
- **3+ example commands** - Real-world usage examples
- **System prompt** - Advanced: See the actual AI prompt (expandable)

**Actions:**
- ✨ **"Use This Prompt"** button - Loads first example into chat
- 📋 **Copy button** - Copy individual examples to clipboard
- ▶️ **Send to chat** - Click send icon on examples to use immediately
- ✅ **Copy confirmation** - Green checkmark shows when copied

### Custom Prompts

**Creating Custom Prompts:**

1. Click **"Add Custom"** button (top-right)
2. Fill out the modal form:
   - **Title*** - Name your prompt (e.g., "Create Customer with SLA")
   - **Description*** - What does it do?
   - **Entity*** - Select entity type (Customer, Note, etc.)
   - **Operation*** - Select operation (Create, Update, etc.)
   - **Example Commands** - Add examples (one per line)
3. Click **"Save Prompt"**
4. Custom prompt appears with purple "Custom" badge

**Managing Custom Prompts:**
- **View:** Custom prompts show purple "Custom" badge in list
- **Use:** Work exactly like built-in prompts
- **Delete:** Click trash icon (🗑️) when viewing a custom prompt (confirmation required)
- **Storage:** Saved in browser's localStorage (persists across sessions)
- **Not synced:** Custom prompts are local to your browser only

**Custom Prompt Benefits:**
- 🎯 Team-specific workflows
- 🔄 Frequently used commands
- 📝 Complex multi-field operations
- 🏢 Company-specific terminology
- ♻️ Reusable templates

### Tips

**💡 Start with Search:** Type what you want to do in the search bar

**💡 Browse by Entity:** Use the filter dropdown to see all prompts for a specific entity

**💡 Learn from Examples:** Read examples to understand natural language patterns

**💡 Copy and Modify:** Copy an example, then customize it with your data

**💡 Create Shortcuts:** Save your most-used commands as custom prompts

---

## Entity Management

Master data management for shared entities.

### Entities

#### Products
- **Catalog** of available products
- Name, version, description, status
- Used across all customers
- Examples: XM Cloud, CDP, Personalize, Search

#### Customer Contacts
- **External contacts** at customer companies
- Name, email, phone, role
- Reusable across customers

#### Internal Contacts
- **Your team members**
- Name, email, role
- Used for Account Executives and Opportunity Owners

#### Partners
- **Implementation partners**
- Name, type (SI, ISV, Agency), website
- System integrators, ISVs, agencies

### Features
- **CRUD operations** for all entities
- **Search** within entity lists
- **Reusability** across customers
- **Consistency** in data entry

---

## Search & Filter

Powerful search and filtering across all data.

### Search Capabilities

**Search across:**
- Customer names
- Websites
- Product names
- Contact names (customer and internal)
- Partner names

**Features:**
- Real-time search (as you type)
- Case-insensitive
- Partial matching
- Searches all fields simultaneously

### Filtering

**Customer Filters:**
- **Year** - Created or updated year
- **Date Range** - Custom date range
  - Created date
  - Updated date
- **Products** - Multi-select product filter
- **Partners** - Multi-select partner filter
- **Account Executive** - Filter by AE

**Opportunity Filters:**
- **Stage** - Filter by current stage
- **Owner** - Filter by opportunity owner
- **Type** - New Business, Upsell, etc.
- **Priority** - High, Medium, Low, Critical

**Note Filters:**
- **SE Confidence** - Green, Yellow, Red
- **Date Range** - When note was created
- **Created By** - Filter by author

### Sorting

**Available Sorts:**
- **Name** (A-Z, Z-A)
- **Created Date** (Newest, Oldest)
- **Updated Date** (Newest, Oldest)
- **Product Count** (Most, Least)
- **Opportunity Value** (Highest, Lowest)

### Active Filter Count
- Badge shows number of active filters
- "Clear All" button to reset
- Filters persist during session

---

## Integration Features

### External Links
- **SharePoint** - Quick link from customer cards
- **Salesforce** - Direct opportunity links
- **Additional URLs** - Custom links per customer

### Copy Functionality
- **Copy buttons** (📋) on all fields in slide-out panels
- Quick copy-paste to other documents
- No manual selection needed

### Real-time Sync
- **Firebase Firestore** for cloud storage
- Changes sync across devices
- No manual refresh needed
- Automatic conflict resolution

---

## Keyboard Shortcuts

*Coming soon - planned for future release*

---

## Need Help?

- **How to use?** See [USER_GUIDE.md](USER_GUIDE.md)
- **Setup?** See [SETUP.md](SETUP.md)
- **Development?** See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
