# User Guide

Complete guide to using the Customer Engagement Hub for managing customers, notes, and opportunities.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Customer Management](#customer-management)
3. [Customer Profiles](#customer-profiles)
4. [Notes Management](#notes-management)
5. [Opportunity Tracking](#opportunity-tracking)
6. [AI Chatbot](#ai-chatbot)
7. [Entity Management](#entity-management)
8. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### First Login

1. Open the app at `http://localhost:3000`
2. Click **"Sign in with Google"**
3. Authorize with your Google account
4. You'll see the main dashboard

### Interface Overview

The app has 3 main tabs:

| Tab | Purpose |
|-----|---------|
| **👥 Customer Management** | Manage customers, notes, and profiles |
| **⚙️ Entity Management** | Manage contacts, products, partners |
| **🎯 Migration Opportunities** | Track migration opportunities |

**Plus a floating AI Assistant button** in the bottom-right corner for quick access to AI features!

---

## Customer Management

### Viewing Customers

**Grid View** (default):
- Cards showing customer name, website, products
- Account executive, contact count, partner count
- Quick links to SharePoint and Salesforce
- Click any card to view details

**List View**:
- Table with all customer information
- Sortable columns
- Better for large lists

**Switch views:** Click the grid (⊞) or list (☰) icons in the header

### Adding a New Customer

1. Click **"Add Customer"** button
2. Fill out the form:

**Required:**
- **Customer Name** - Company name

**Optional but recommended:**
- **Website** - Company website URL
- **Products** - Select from dropdown (XM Cloud, CDP, etc.)
- **Customer Contacts** - Select existing or add new
  - Name, Email, Phone, Role
- **Internal Contacts** - Your team members involved
  - Name, Email, Role
- **Account Executive** - Select from Internal Contacts
- **Partners** - Implementation partners
  - Name, Type (SI, ISV, Agency), Website
- **SharePoint URL** - Link to SharePoint site
- **Salesforce Link** - Link to Salesforce opportunity
- **Additional Link** - Any other relevant link
- **Additional Info** - Free-form notes

3. Click **"Save Customer"**
4. Customer appears in directory

### Editing a Customer

1. Select customer from directory
2. Click **"Edit Customer"** button in detail panel
3. Update information
4. Click **"Save Changes"**

### Deleting a Customer

1. Select customer from directory
2. Click **"Delete Customer"** button
3. Confirm deletion
4. Customer and all related data are removed

**⚠️ Warning:** This action cannot be undone!

### Search & Filter

**Search Bar:**
- Type to search by customer name, website, products, contacts, or partners
- Real-time filtering

**Filters:**
- **Year** - Filter by created/updated year
- **Date Range** - Custom date range for created or updated date
- **Products** - Show only customers using specific products
- **Partners** - Filter by partner involvement
- **Account Executive** - Filter by AE

**Sorting:**
- Name (A-Z)
- Created Date (newest first)
- Updated Date (newest first)
- Product Count (most first)

---

## Customer Profiles

Customer profiles store **static business information** that doesn't change often.

### Creating a Profile

1. Select a customer
2. In the customer detail panel, find **"Customer Profile"** section
3. Click **"Create Profile"**
4. Fill out the form:

**Business Details:**
- **Business Problem** - What challenge are they solving?
- **Why Us** - Why did they choose us?
- **Why Now** - Why is timing important?
- **Tech Select** - Have they selected the technology?

**Quick Hit Details:**
- **Pre-Discovery** - Have we done pre-discovery?
- **Discovery** - Discovery status and notes
- **Discovery Notes Attached** - Are notes attached?
- **Total Demos** - Number of demos given
- **Latest Demo Dry Run** - Did we do a dry run?
- **Latest Demo Date** - When was the last demo?
- **Tech Deep Dive** - Technical deep dive notes
- **InfoSec Completed** - Security review done?
- **Known Technical Risks** - Any technical risks?
- **Mitigation Plan** - How are we mitigating risks?

**Solution Engineering:**
- **SE Notes** - Solution Engineer notes
- **SE Involvement** - Is SE involved?
- **SE Notes Last Updated** - When were notes updated?
- **Product Fit Assessment** - Green/Yellow/Red
- **Product Not Green Reason** - If not green, why?
- **Confidence Not Green Reason** - If confidence is not green, why?

**Success Planning:**
- **Customer Objectives** (1, 2, 3) - What does the customer want to achieve?
- **Customer Use Cases** (1, 2, 3) - Specific use cases
- **Objectives Details** - Additional context

**💡 Tip:** Use the AI generation buttons to auto-fill objectives and use cases!

5. Click **"Save Profile"**

### Editing a Profile

1. Select customer
2. In customer detail panel, click **"Edit Profile"**
3. Update information
4. Click **"Save Changes"**

### Viewing a Profile

- Profile information displays in the customer detail panel
- When viewing notes, profile context is shown in the slide-out panel

---

## Notes Management

Notes are **dynamic interaction records** - created after each customer engagement.

### Adding a Note

1. Select a customer
2. In the right panel (Notes section), click **"Add Note"**
3. Fill out the form:

**Required:**
- **Notes** - Detailed notes about the interaction
- **Note Date** - When did this interaction occur?
- **Created By** - Your name
- **Updated By** - Your name

**Recommended:**
- **SE Confidence** - Green/Yellow/Red
  - Green: High confidence, on track
  - Yellow: Some concerns, needs attention
  - Red: Significant issues, at risk

**Optional:**
- **Other Fields** - JSON object for custom data

4. Click **"Save Note"**

### Viewing Note Details

1. Select a customer
2. In the Notes list, find the note
3. Click **"View"** button
4. Slide-out panel opens with:
   - All customer profile information (context)
   - Note details
   - SE confidence
   - Timestamps

**💡 Tip:** Use the copy buttons (📋) to copy field values for pasting into other documents!

### Editing a Note

1. In Notes list, click **"Edit"** on the note
2. Update information
3. Click **"Save Changes"**

### Deleting a Note

1. In Notes list, click **"Delete"** on the note
2. Confirm deletion
3. Note is removed

---

## Opportunity Tracking

Track sales opportunities through their lifecycle with stage management and history.

### Opportunity Stages

Opportunities progress through 9 stages:

1. **Plan** - Initial planning
2. **Prospect** - Prospecting and qualification
3. **Qualify** - Qualification
4. **Discover** - Discovery phase
5. **Differentiate** - Differentiation
6. **Propose** - Proposal stage
7. **Close** - Closing stage
8. **Delivery and Success** - Post-sale delivery
9. **Expand** - Expansion opportunities

### Adding an Opportunity

1. Select a customer
2. In the **"Opportunities"** section, click **"Add Opportunity"**
3. Fill out the form:

**Required:**
- **Opportunity Name** - Descriptive name
- **Stage** - Current stage
- **Value** - Estimated deal value
- **Currency** - USD, EUR, GBP, etc.
- **Probability** - Win probability (0-100%)
- **Owner** - Opportunity owner from internal contacts

**Optional:**
- **Description** - Details about the opportunity
- **Expected Close Date** - When do you expect to close?
- **Products** - Products involved
- **Type** - New Business, Upsell, Cross-sell, Renewal, Migration
- **Priority** - High, Medium, Low, Critical
- **Competitors** - Competing vendors
- **Next Steps** - What's next?

4. Click **"Save Opportunity"**

### Updating Opportunity Stage

1. Select customer
2. Find opportunity in list
3. Click **"View"** or **"Edit"**
4. Change the **Stage**
5. Add optional notes about the stage change
6. Click **"Update Stage"** or **"Save"**

**✅ Stage changes are automatically tracked with:**
- Previous stage
- New stage
- Timestamp
- Who made the change
- Optional notes
- Duration in previous stage (in days)

### Viewing Opportunity History

1. Click **"View"** on an opportunity
2. Scroll to **"Stage History"** section
3. See complete timeline of stage changes

**History shows:**
- All stage transitions
- Dates and times
- Who changed the stage
- Notes about why the stage changed
- How long it stayed in each stage

### Filtering Opportunities

**Filters available:**
- **Stage** - Show opportunities in specific stages
- **Owner** - Filter by opportunity owner
- **Type** - Filter by opportunity type
- **Priority** - High, Medium, Low, Critical

---

## AI Assistant

Use natural language to add notes, update customers, and manage data - all from a convenient slide-out panel!

### Opening the AI Assistant

**Method 1: Floating Button (Recommended)**
- Look for the blue sparkle ✨ button in the **bottom-right corner**
- Click it to open the AI Assistant panel
- The panel slides in from the right side
- Click the X or the button again to close

**Features:**
- Always accessible from any screen
- Doesn't interrupt your workflow
- Quick access to AI chat and prompt library

### Using the Chat Interface

1. Click the floating AI button (bottom-right)
2. Select the **"Chat"** tab (should be default)
3. Type your request naturally or select a prompt from the library
4. Review the AI's interpretation
5. Click **"Confirm"** to apply or **"Cancel"** to reject

### Example Commands

**Adding Notes:**
```
Add a note to ABC Corp, had a great demo yesterday, SE confidence is green
```

**Updating Customer Info:**
```
Update XYZ Company, add product CDP, add contact John Smith with email john@xyz.com
```

**Creating Customers:**
```
Create a new customer named Global Tech, website globaltech.com, products XM Cloud and Search
```

**Creating Opportunities:**
```
Create opportunity for ABC Corp: Platform Upgrade 2026, stage Discover, value $500k, probability 60%
```

**Updating Profiles:**
```
Update the profile for ABC Corp, business problem is slow website, why now is holiday season coming
```

### Using the Prompt Library

1. Click the **"📚 Prompt Library"** button in the chatbot
2. Or go to the **"Prompt Library"** tab
3. Browse 28+ pre-made prompts organized by category:
   - Customer CRUD
   - Note Management
   - Profile Updates
   - Opportunity Management

4. Click **"Use in Chatbot"** to copy a prompt
5. Customize it for your needs
6. Submit to the chatbot

### How It Works

1. **Type your command** in natural language
2. **AI parses** your input to extract structured data
3. **Review** the parsed information
4. **Confirm** to apply changes or **Cancel** to discard
5. **Changes saved** automatically

**💡 Tips for Better Results:**
- Be specific (include customer name, exact values)
- Use clear intent words (add, update, create, delete)
- Provide context (dates, names, products)
- Review parsed data before confirming

---

## Entity Management

Manage master data that's shared across all customers.

### Managing Products

1. Go to **"Entity Management"** tab
2. Select **"Products"** section
3. Click **"Add Product"**
4. Fill out:
   - Product Name
   - Version (optional)
   - Description (optional)
   - Status (Active, Inactive, Planned, Deprecated)
5. Click **"Save"**

**Available Products:**
- XM Cloud
- XP (Experience Platform)
- CDP (Customer Data Platform)
- Personalize
- Search
- OrderCloud
- Content Hub
- And more...

### Managing Contacts

**Customer Contacts:**
- External contacts at customer companies
- Name, Email, Phone, Role

**Internal Contacts:**
- Your team members
- Name, Email, Role
- Used for Account Executives and Opportunity Owners

**To add:**
1. Go to Entity Management
2. Select contact type
3. Click **"Add Contact"**
4. Fill out form
5. Save

### Managing Partners

Partners are implementation partners, system integrators, ISVs, and agencies.

**To add:**
1. Go to Entity Management
2. Select **"Partners"**
3. Click **"Add Partner"**
4. Fill out:
   - Partner Name
   - Type (SI, ISV, Agency, Other)
   - Website (optional)
5. Save

**Partner Types:**
- **SI** - System Integrator
- **ISV** - Independent Software Vendor
- **Agency** - Digital Agency
- **Other** - Other types

---

## Tips & Best Practices

### Data Entry

✅ **Do:**
- Be consistent with naming (e.g., "ABC Corp" not "ABC Corporation" sometimes)
- Add account executives to help with filtering
- Use SE confidence consistently (Green/Yellow/Red)
- Add notes after every customer interaction
- Keep profiles updated when business context changes

❌ **Don't:**
- Don't duplicate customers
- Don't leave critical fields empty
- Don't forget to set opportunity stages
- Don't skip adding products to customers

### Organization

**Customer Profiles:**
- Create profiles early in the sales cycle
- Update when business context changes (not often)
- Use AI generation for objectives and use cases

**Notes:**
- Add after every customer interaction
- Include SE confidence level
- Be detailed but concise
- Use the "Other Fields" for structured custom data

**Opportunities:**
- Create opportunities as soon as you identify them
- Update stages promptly
- Add notes when changing stages (why did it change?)
- Keep values and probabilities realistic

### Using Filters Effectively

**For Account Executives:**
- Filter by your name in "Account Executive"
- Sort by "Updated Date" to see recent activity
- Use "SE Confidence" filter to find at-risk customers

**For Pipeline Review:**
- Go to Opportunities
- Filter by stage (e.g., "Propose" or "Close")
- Sort by "Expected Close Date"
- Review and update stages

**For Product Managers:**
- Filter customers by specific product
- Review notes for product feedback
- Track opportunity value by product

### Keyboard Shortcuts & Quick Actions

- **Quick search:** Start typing in search bar (no click needed)
- **Clear filters:** Click "Clear All" when filters are active
- **Quick links:** Click SharePoint/Salesforce icons in cards
- **Copy fields:** Use 📋 copy buttons in slide-out panels
- **Switch views:** Grid (⊞) and List (☰) toggle in header

---

## Need Help?

- **Setup issues?** See [SETUP.md](SETUP.md#troubleshooting)
- **Feature details?** See [FEATURES.md](FEATURES.md)
- **Technical questions?** See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- **Back to start?** See [README.md](README.md)
