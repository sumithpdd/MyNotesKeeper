# AI Chat Panel Guide

Complete guide to using the new slide-out AI Assistant panel with chat interface and prompt library.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Opening the Panel](#opening-the-panel)
3. [Chat Tab](#chat-tab)
4. [Prompt Library Tab](#prompt-library-tab)
5. [Custom Prompts](#custom-prompts)
6. [Tips & Best Practices](#tips--best-practices)

---

## Overview

The AI Chat Panel is a modern slide-out interface that provides:
- 🤖 **Natural language chatbot** for data entry
- 📚 **Comprehensive prompt library** (28+ built-in prompts)
- ➕ **Custom prompt creation** and management
- 💾 **Local storage** for custom prompts
- ✨ **Always accessible** from any screen

### Key Features

**Design:**
- Slides in from the right side (max-width: 4xl / ~896px)
- Modern gradient header with sparkle icon
- Two tabs: Chat and Prompt Library
- Close button (X) or click backdrop to dismiss

**Accessibility:**
- Floating action button always visible (bottom-right)
- Keyboard accessible
- Responsive design
- Clean, intuitive interface

---

## Opening the Panel

### Floating Action Button

Located in the **bottom-right corner** of every screen:

**Visual Design:**
- 🔵 Blue-to-indigo gradient circle
- ✨ Sparkle icon
- 🔴 "AI" badge (top-right)
- Animated pulse effect
- Hover tooltip: "Open AI Assistant"

**Interaction:**
- **Click** to open panel
- **Click again** (or X button) to close
- **Hover** to see tooltip
- Button changes to gray X when panel is open

**Always Available:**
- Visible on all main tabs
- Doesn't scroll away
- Fixed position
- Z-index: 30 (above content, below panel)

---

## Chat Tab

Natural language interface for CRUD operations.

### Interface Layout

**Header:**
- Sparkle icon and "AI Assistant" title
- "Natural language operations & prompt library" subtitle
- X close button

**Messages Area:**
- Scrollable chat history
- Bot messages (left, white background)
- User messages (right, blue background)
- System messages (left, gray background)
- Timestamps on all messages
- Auto-scroll to latest message

**Input Area:**
- Text input field with placeholder
- Send button (▶️ arrow icon)
- Shows loading spinner when processing
- AI stats footer: "Powered by AI • X customers loaded"
- Link to "Browse prompts →"

### Using the Chat

**Step 1: Type Your Request**

Examples:
```
Create customer Acme Corp with website acme.com
```
```
Add note to TechStart: demo completed, confidence green
```
```
Update Global Industries opportunity to Propose stage
```

**Step 2: AI Processing**

- Your message appears on the right (blue)
- "Processing..." indicator appears
- AI analyzes your intent

**Step 3: Review Parsed Data**

AI response shows:
- Interpretation of your request
- **Extracted Information** in blue card
- Field-by-field breakdown
- "Confirm & Apply" (green) button
- "Cancel" (red) button

**Step 4: Confirm or Cancel**

- **Confirm:** Changes applied to database, success message shown
- **Cancel:** Request discarded, no changes made
- You can always reject and try again

### Supported Operations

| Operation | Entities | Examples |
|-----------|----------|----------|
| **Create** | Customer, Note, Profile, Opportunity, Product, Partner, Contact | "Create customer..." |
| **Update** | Customer, Profile, Opportunity | "Update XYZ Corp..." |
| **Delete** | Customer, Opportunity | "Delete customer..." |
| **Search** | Customer, Opportunity | "Find all customers using XM Cloud" |
| **List** | Notes, Opportunities | "Show all opportunities in Propose stage" |
| **Special** | Stage changes, Reports | "Move opportunity to Close stage" |

### Chat Tips

**✅ DO:**
- Be specific with customer names
- Include all relevant details
- Use clear action verbs (create, update, add, delete)
- Provide dates in standard formats
- Include SE confidence (green/yellow/red)

**❌ DON'T:**
- Use abbreviations without context
- Omit required fields (customer name, etc.)
- Assume AI knows unstated information
- Skip confirmation review

---

## Prompt Library Tab

Browse, search, and manage 28+ prompt templates.

### Interface Layout

**Header:**
- Search bar with 🔍 icon
- Entity type filter dropdown
- "Add Custom" button (blue)

**Content Area:**
- **Left Sidebar (w-96):** List of prompts
- **Right Panel:** Selected prompt details

### Prompt List (Left Sidebar)

**Card Display:**
- Operation icon (➕ ✏️ 🗑️ etc.)
- Prompt title (bold)
- Short description (2 lines max)
- Entity badge (colored: customer=blue, note=green, etc.)
- Operation text (small gray)
- Purple "Custom" badge (for custom prompts)

**Interaction:**
- Click card to view details
- Selected card: blue background + border
- Unselected: white background
- Hover: shadow effect

**Empty State:**
- BookOpen icon (gray)
- "No prompts found" message
- Suggestion to change search/filter

### Prompt Details (Right Panel)

When you select a prompt:

**Header Section:**
- Large operation icon
- Prompt title (2xl, bold)
- Description
- Entity badge
- Delete button (🗑️) - custom prompts only

**Use Button:**
- "Use This Prompt" - gradient blue-to-indigo
- Sparkle icon
- Loads first example into chat
- Switches to Chat tab

**Fields Extracted:**
- 🏷️ Tag icon header
- List of all fields as gray code badges
- Shows what data will be captured

**Example Commands:**
- 3+ examples per prompt
- Each in a light gray box
- Copy button (📋) - copies to clipboard
- Send button (▶️) - uses in chat
- Visual feedback when copied (✅)

**Advanced Section:**
- Expandable `<details>` tag
- "Advanced: System Prompt" label
- Shows actual AI prompt in dark code block
- For understanding how parsing works

### Searching & Filtering

**Search Bar:**
- Type to search in real-time
- Searches: title, description, examples
- Case-insensitive
- Clears when you select a filter

**Entity Filter:**
- Dropdown with all entity types
- "All Entities" (default)
- Clears search when changed
- Updates result count badge

**Result Count:**
- Blue badge next to "Prompt Library" tab
- Shows: "28" (or filtered count)
- Updates dynamically

### Built-in Prompts

**28 prompts organized by:**

**Customer (4):**
- Create new customer
- Update customer information
- Delete customer
- Search customers

**Note (3):**
- Add customer note
- Update customer note
- List customer notes

**Profile (2):**
- Create customer profile
- Update customer profile

**Opportunity (5):**
- Create new opportunity
- Update opportunity
- Change opportunity stage
- Delete opportunity
- List opportunities

**Product, Partner, Contact (3):**
- Add product
- Add partner
- Add contact

**Reports/Special (2):**
- Show pipeline summary
- Customer summary

---

## Custom Prompts

Create and manage your own prompt templates.

### Creating a Custom Prompt

**Step 1: Open Modal**
- Click **"Add Custom"** button (top-right in Prompt Library)
- Modal appears with form

**Step 2: Fill Form**

**Required Fields:**
- **Title** - Name your prompt (e.g., "Create Enterprise Customer")
- **Description** - What does it do? (e.g., "Create customer with enterprise details")
- **Entity** - Select from dropdown (Customer, Note, Profile, etc.)
- **Operation** - Select from dropdown (Create, Update, Delete, etc.)

**Optional Fields:**
- **Example Commands** - Add examples (one per line)
  ```
  Create enterprise customer Acme Corp with website acme.com
  Add customer TechStart as enterprise with contact Jane Doe
  ```

**Step 3: Save**
- Click "Save Prompt" (blue button with 💾 icon)
- Or "Cancel" to discard

**Step 4: Verify**
- Custom prompt appears in list with purple "Custom" badge
- Saved to localStorage automatically
- Available immediately

### Managing Custom Prompts

**Viewing:**
- Custom prompts show purple "Custom" badge in list
- Appear alongside built-in prompts
- Searchable and filterable like built-in prompts

**Using:**
- Click to view details
- "Use This Prompt" button works
- Examples are copyable and usable
- Exactly like built-in prompts

**Deleting:**
1. Click custom prompt to view details
2. Click trash icon (🗑️) in top-right
3. Confirm deletion in browser alert
4. Prompt removed from list and localStorage

**Storage:**
- Saved in browser's localStorage
- Key: `'customPrompts'`
- Persists across sessions
- Not synced to cloud/server
- Specific to your browser

### Custom Prompt Use Cases

**Team-Specific Workflows:**
```
Title: "Create Customer for Partner Deal"
Description: "Create customer with partner info"
Entity: Customer
Operation: Create
```

**Frequently Used Commands:**
```
Title: "Add Demo Follow-up Note"
Description: "Quick note after demo"
Entity: Note
Operation: Create
```

**Complex Multi-Field Operations:**
```
Title: "Create Enterprise Opportunity"
Description: "Full opportunity with all fields"
Entity: Opportunity
Operation: Create
```

**Company-Specific Terminology:**
```
Title: "Add MEDDICC Note"
Description: "Note following MEDDICC framework"
Entity: Note
Operation: Create
```

---

## Tips & Best Practices

### General Usage

**🎯 Access Patterns:**
- Use floating button for quick AI access from anywhere
- Keep panel open while working if doing multiple AI operations
- Close panel when done to see full screen

**💬 Chat vs Prompts:**
- **Chat:** For immediate one-off operations
- **Prompts:** For browsing capabilities and learning syntax
- **Custom Prompts:** For repeated team workflows

**🔄 Workflow:**
1. Browse prompts to learn capabilities
2. Create custom prompts for common tasks
3. Use chat for daily operations
4. Close panel when done

### Chat Best Practices

**Be Specific:**
- ✅ "Create customer Acme Corporation with website acme.com"
- ❌ "Add acme"

**Include Context:**
- ✅ "Add note to TechStart: demo completed yesterday, confidence green, next step send proposal"
- ❌ "demo done"

**Use Clear Actions:**
- ✅ "Update", "Create", "Add", "Delete", "Change"
- ❌ "Fix", "Do", "Make"

**Review Before Confirming:**
- Always check extracted fields
- Verify customer names match exactly
- Confirm dates and values are correct

### Prompt Library Best Practices

**Learning:**
- Read examples to understand patterns
- Check "Fields Extracted" to know what's captured
- Use "Use This Prompt" to see it in action

**Searching:**
- Search by action: "create", "update", "delete"
- Search by entity: "customer", "opportunity"
- Search by use case: "demo", "confidence"

**Custom Prompts:**
- Name clearly and specifically
- Add 2-3 real examples
- Include all entity/operation metadata
- Test after creating

### Keyboard Shortcuts

**Chat:**
- `Enter` - Send message (when input focused)
- `Esc` - Close panel (if desired, can be added)

**General:**
- Click backdrop to close panel
- Click X button to close
- Click floating button to toggle

### Troubleshooting

**Panel Won't Open:**
- Check console for errors
- Ensure floating button is visible
- Try refreshing page

**Custom Prompt Not Saving:**
- Check browser localStorage is enabled
- Verify form has all required fields
- Try again after page refresh

**AI Not Understanding:**
- Be more specific with customer names
- Include more context in request
- Try using an example from prompt library
- Check if customer exists in system

**Custom Prompt Disappeared:**
- Check if localStorage was cleared
- Verify browser is the same (not synced)
- Custom prompts are local only

---

## Feature Comparison

### Old Design (Tab-Based)

- ❌ Separate tabs in main navigation
- ❌ Required navigation away from current work
- ❌ Chat and Prompts were separate screens
- ❌ No custom prompt creation
- ❌ Less modern UI

### New Design (Slide-Out Panel)

- ✅ Always accessible floating button
- ✅ Slides over current work (no navigation)
- ✅ Chat and Prompts in one panel (tabbed)
- ✅ Custom prompt creation and management
- ✅ Modern, clean UI with animations
- ✅ LocalStorage persistence
- ✅ Better UX patterns (similar to Sitecore AI)

---

## Technical Details

### Components

**AIChatPanel.tsx:**
- Main panel container (520+ lines)
- Two-tab interface (Chat, Prompt Library)
- Custom prompt modal embedded
- LocalStorage integration
- State management for messages, prompts, filters

**FloatingAIButton.tsx:**
- Floating action button (60+ lines)
- Animated effects (pulse, hover, rotation)
- Tooltip on hover
- Toggle open/close state

**CustomPromptModal.tsx:**
- Embedded in AIChatPanel
- Form for creating custom prompts
- Validation for required fields
- Save/Cancel actions

### State Management

**Panel State:**
- `showAIChat` - Boolean for panel open/close
- `activeTab` - 'chat' | 'prompts'
- Managed in `page.tsx`

**Chat State:**
- `messages` - Array of chat messages
- `input` - Current input text
- `isProcessing` - Loading state

**Prompt Library State:**
- `searchQuery` - Search text
- `filterEntity` - Entity filter
- `selectedPromptId` - Currently selected prompt
- `customPrompts` - User's custom prompts
- `copiedText` - Clipboard feedback

### LocalStorage Schema

**Key:** `'customPrompts'`

**Value:** JSON array of CustomPrompt objects
```typescript
interface CustomPrompt {
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
  isCustom: true;
}
```

---

## Conclusion

The new AI Chat Panel provides a modern, always-accessible interface for:
- Natural language data entry
- Comprehensive prompt browsing
- Custom prompt creation
- Seamless workflow integration

**Get Started:**
1. Click the sparkle button (bottom-right)
2. Browse the Prompt Library
3. Try a few chat commands
4. Create custom prompts for your team

**Happy chatting! 🤖✨**
