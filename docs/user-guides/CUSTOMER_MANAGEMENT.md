# Customer Management User Guide

## Overview

This guide explains how to manage customers, profiles, and notes in the Customer Engagement Hub.

## Customer Management Workflow

### 1. Adding a New Customer

**Steps**:
1. Navigate to "Customer Management" tab
2. Click "Add Customer" button
3. Fill in customer information:
   - Customer Name (required)
   - Website URL
   - Products (multi-select)
   - Customer Contacts
   - Internal Contacts
   - Partners
   - SharePoint URL
   - Salesforce Link
   - Additional information
4. Click "Save Customer"

**Tips**:
- Customer Name is the only required field
- You can add contacts inline or select existing ones
- Multiple products can be selected
- URLs should include https://

### 2. Viewing Customer Details

**Steps**:
1. Go to Customer Management tab
2. Click on a customer in the list
3. View details in the left panel:
   - Basic information
   - Products and contacts
   - Links to external systems
   - Customer profile (if exists)

**Quick Actions**:
- Edit customer information
- Create/edit customer profile
- Add notes
- View all notes

### 3. Creating a Customer Profile

**Steps**:
1. Select a customer
2. Click "Create Profile" button
3. Fill in all sections:
   
   **Business Details**:
   - What business problem are we solving?
   - Why Us?
   - Why now?
   - Tech select (yes/no)
   
   **Quick Hit Details**:
   - Pre-discovery status
   - Discovery details
   - Demo information
   - Technical deep dive
   - InfoSec completion
   - Known risks and mitigation
   
   **Solution Engineering**:
   - SE Involvement
   - Product Fit Assessment
   - SE Notes (can auto-generate)
   - Reasons if not Green
   
   **Success Planning**:
   - Customer Objectives (1, 2, 3)
   - Customer Use Cases (1, 2, 3)

4. Click "Save Profile"

**Tips**:
- Use "Generate from fields" to auto-create SE Notes
- Use "Prompt Library" for template text
- Fill in what you know, leave rest blank
- Update profile as you learn more

### 4. Adding Customer Notes

**Steps**:
1. Select a customer
2. Click "Add Note" button (right panel)
3. Fill in note details:
   - Note content
   - Note date
   - Created by (auto-filled)
   - SE Confidence (Green/Yellow/Red)
   - Next steps or additional fields
4. Click "Save Note"

**Best Practices**:
- Add note after each customer interaction
- Update SE confidence to track progress
- Include next steps for follow-up
- Be specific and actionable

### 5. Editing Customers

**Steps**:
1. Select customer from list
2. Click "Edit" button
3. Modify any field
4. Click "Save"

**What Can Be Edited**:
- Customer name
- Website and URLs
- Products
- Contacts
- Partners
- Additional information

### 6. Deleting Customers

**Steps**:
1. Select customer
2. Click "Delete" button
3. Confirm deletion

**Warning**:
- This also deletes customer profile
- This also deletes all customer notes
- This action cannot be undone

## Customer List Features

### Searching Customers

**How to Search**:
1. Use search bar at top
2. Type customer name, contact, or partner
3. Results filter in real-time

**Search Includes**:
- Customer names
- Contact names
- Partner names
- Products

### Sorting Customers

**Available Sorts**:
- Name (A-Z)
- Date Created (newest first)
- Date Updated (most recent)
- Product Count

**How to Sort**:
- Click sort dropdown
- Select sort option
- List updates automatically

### Filtering Customers

**Filter Options**:
- By Product (XM Cloud, XP, etc.)
- By SE Confidence (Green/Yellow/Red)
- By Migration Opportunity status

## Notes Management

### Viewing Notes

**List View**:
- Right panel when customer selected
- Shows all notes for customer
- Sorted by date (newest first)

**Detail View**:
- Click "View" on any note
- Opens SlideOutPanel
- Shows:
  - Note content
  - Customer profile data
  - SE confidence
  - Dates and author

### Editing Notes

**Steps**:
1. Find note in list
2. Click "Edit" button
3. Modify content
4. Save changes

**Can Edit**:
- Note content
- Note date
- SE confidence
- Additional fields

### Deleting Notes

**Steps**:
1. Find note
2. Click "Delete" button
3. Confirm deletion

## Customer Profile Features

### Auto-Generate SE Notes

**Steps**:
1. Fill Business Details section
2. Fill Quick Hit Details section
3. Scroll to SE Notes field
4. Click "Generate from fields" button (✨)
5. Review generated notes
6. Edit as needed
7. Save profile

**What Gets Generated**:
- Business details summary
- Discovery status
- Demo information
- Technical assessment
- Success criteria
- Activity tracking

### Using Prompt Library

**Steps**:
1. In Customer Profile form
2. Find SE Notes section
3. Click "Prompt Library" button (📚)
4. Browse prompts:
   - Discovery Questions
   - Demo Preparation
   - Technical Deep Dive
   - Competitive Positioning
5. Click "Use in Notes" or "Copy"
6. Customize for your customer

### Conditional Fields

**SE Product Not Green**:
- Appears when Product Fit Assessment is Yellow or Red
- Document why assessment is not Green
- Track product concerns

**SE Confidence Not Green**:
- Always visible
- Document confidence concerns
- Plan mitigation

## External System Links

### SharePoint Integration

**Setup**:
1. Add SharePoint URL when creating customer
2. Click SharePoint icon in customer details
3. Opens in new tab

**Use Case**:
- Customer documents
- Proposals
- Contracts

### Salesforce Integration

**Setup**:
1. Add Salesforce Link when creating customer
2. Click Salesforce icon
3. Opens opportunity in Salesforce

**Use Case**:
- Link to opportunity
- Track deal progress
- Update deal status

## Best Practices

### Customer Data

1. **Complete Information**: Fill as many fields as possible
2. **Regular Updates**: Keep information current
3. **Accurate Contacts**: Maintain contact details
4. **Link External Systems**: Add SharePoint and Salesforce links

### Profiles

1. **Create Early**: Set up profile during discovery
2. **Update Regularly**: Refresh as you learn more
3. **Use Auto-Generation**: Save time with template generation
4. **Document Thoroughly**: Capture all relevant information

### Notes

1. **After Each Interaction**: Add note after calls/meetings
2. **Be Specific**: Include actionable details
3. **Track Confidence**: Update SE confidence regularly
4. **Next Steps**: Always include follow-up actions

### Organization

1. **Consistent Naming**: Use standard customer names
2. **Tag Products**: Always add relevant products
3. **Link Partners**: Include implementation partners
4. **Categorize**: Use SE confidence levels consistently

## Keyboard Shortcuts

- **Ctrl+F** - Focus search bar
- **Escape** - Close modals/panels
- **Tab** - Navigate form fields
- **Enter** - Submit forms (when in input)

## Common Workflows

### New Customer Onboarding

1. Add customer → Fill basic info → Save
2. Create profile → Add business details → Save
3. Add first note → Document initial contact → Save
4. Set up external links → Add SharePoint/Salesforce

### Post-Demo Update

1. Select customer
2. Add note → Document demo details
3. Update SE confidence
4. Update profile → Increment demo count
5. Add next steps

### Deal Review Preparation

1. Open customer profile
2. Review all sections
3. Export/copy SE notes
4. Review recent notes
5. Update confidence if needed

## Troubleshooting

### Customer Not Showing

- Check search/filter settings
- Refresh page
- Clear browser cache

### Can't Edit Profile

- Ensure you're logged in
- Check if profile exists
- Try refreshing page

### Notes Not Saving

- Check required fields filled
- Verify internet connection
- Check browser console for errors

## Related Documentation

- [AI Chatbot](../features/CHATBOT.md) - Natural language entry
- [SE Notes](../features/SE_NOTES.md) - Template usage
- [Getting Started](../developer-guide/GETTING_STARTED.md) - Setup

---

**Last Updated**: November 2025

