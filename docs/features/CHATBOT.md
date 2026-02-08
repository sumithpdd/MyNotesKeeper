# AI Chatbot Feature

## Overview

The AI Chatbot provides a natural language interface for Sales Solution Engineers to manage customer data. Instead of filling out forms, you can type commands in plain English.

## Key Features

### 🤖 Natural Language Processing
- Type commands in conversational English
- AI understands context and intent
- Smart customer name matching
- Automatic date recognition

### 📝 8 Prompt Templates
1. **Add Customer Note** - Quick interaction notes
2. **Update Customer Profile** - Business information
3. **Add New Customer** - Create customer records
4. **Update SE Confidence** - Change confidence levels
5. **Quick Discovery** - Discovery phase information
6. **Update Products** - Modify product lists
7. **Schedule Follow-up** - Add follow-up actions
8. **Update Stakeholders** - Add/update contacts

### ✅ Safety Features
- Confirmation before applying changes
- Review extracted data
- Cancel/modify if incorrect
- Clear error messages

## How to Use

### Basic Workflow

1. **Open AI Chatbot Tab**
   - Navigate to the AI Chatbot tab in the main navigation

2. **Type Your Command**
   ```
   Example: "Add a note to ABC Corp about our demo yesterday,
   green SE confidence, next steps: send POC document"
   ```

3. **Review Parsed Data**
   - AI shows extracted information
   - Check that all details are correct

4. **Confirm or Cancel**
   - Click "Confirm & Apply" to save
   - Click "Cancel" to reject

5. **Success Confirmation**
   - You'll see a success message
   - Ready for next command

### Example Commands

#### Adding a Customer Note
```
Add a note to TechCo, demo completed Jan 15, 
green SE confidence, next steps: schedule technical deep dive
```

**AI Extracts:**
- Customer: TechCo
- Note Content: demo completed Jan 15
- SE Confidence: Green
- Next Steps: schedule technical deep dive

#### Updating Customer Profile
```
Update Global Industries profile: business problem is 
content sprawl, why us: enterprise scalability
```

**AI Extracts:**
- Customer: Global Industries
- Business Problem: content sprawl
- Why Us: enterprise scalability

#### Scheduling Follow-up
```
Schedule follow-up with ABC Corp on Jan 25 to discuss POC results
```

**AI Extracts:**
- Customer: ABC Corp
- Follow-up Date: 2025-01-25
- Action: discuss POC results

## Prompt Library

### Accessing Templates

1. Click on the "Prompt Library" tab
2. Browse available prompts (8 templates)
3. Search or filter by category
4. View examples for each template

### Categories
- 📝 **Notes** - Customer interaction notes
- 👥 **Customers** - Customer management
- 📋 **Profiles** - Profile updates
- 🔄 **Updates** - Various updates

### Using Templates

1. **Browse** - Look at example commands
2. **Copy** - Click copy button on examples
3. **Modify** - Change details for your needs
4. **Use** - Type or paste into chatbot

## Sales Engineer Terminology

The AI understands SE-specific terms:

### Common Terms
- **Discovery** - Initial research phase
- **POC** (Proof of Concept) - Testing phase
- **Demo** - Product demonstration
- **Technical Deep Dive** - Detailed technical discussion
- **InfoSec** - Information security review
- **Dry Run** - Practice session
- **Compelling Event** - Business urgency driver

### Confidence Levels
- **Green** - High confidence, deal progressing
- **Yellow** - Medium confidence, some concerns
- **Red** - Low confidence, significant risks

### Supported Products
- XM Cloud
- XP (Experience Platform)
- XM (Experience Manager)
- Personalize
- CDP (Customer Data Platform)
- OrderCloud
- Search

## Tips for Best Results

### 1. Be Specific
✅ **Good**: "Add note to ABC Corp about demo on Jan 15 with green confidence"  
❌ **Vague**: "Add a note"

### 2. Use Customer Names
- Works with partial names
- Case-insensitive matching
- Finds closest match

### 3. Include Dates
- Any format works: "Jan 15", "2024-01-15", "yesterday"
- AI converts to standard format

### 4. Mention Confidence
- Use: Green, Yellow, or Red
- Case doesn't matter

### 5. Always Review
- Check extracted fields
- Cancel if something's wrong
- Rephrase and try again

## Technical Details

### AI Model
- **Provider**: Google Gemini
- **Model**: gemini-2.0-flash
- **Capability**: Natural language understanding

### Data Flow
```
User Input → Chatbot Interface → AI Service → 
Parse & Extract → Confirmation → Execute → 
Firebase Update → UI Refresh
```

### Architecture
- **Location**: `src/components/ChatbotInterface.tsx`
- **AI Service**: `src/lib/chatbotAI.ts`
- **Prompts**: `src/lib/chatbotPrompts.ts`
- **Library**: `src/components/PromptLibrary.tsx`

## Common Use Cases

### Quick Note After Meeting
```
"Just finished discovery call with Acme Corp, 
discussed XM Cloud migration, high interest, 
green confidence, next: send proposal"
```

### Update Confidence Level
```
"Change TechCo confidence to yellow because 
budget approval is pending"
```

### Schedule Next Action
```
"Follow up with Global Industries next week 
to review POC results, SE involvement needed"
```

### Add Discovery Info
```
"Discovery for Acme Corp: 3 demos completed,
latest was Jan 20, tech deep dive scheduled"
```

## Troubleshooting

### Customer Not Found
- Check spelling
- Try partial name
- Use exact customer name from list

### Parsing Error
- Simplify language
- Be more specific
- Check Prompt Library for examples

### Confirmation Issues
- Review all extracted fields
- Cancel and rephrase if needed
- Report if AI consistently fails

## Benefits

### For Solution Engineers
- **Faster Data Entry** - Type naturally
- **Less Context Switching** - Stay in flow
- **Reduced Errors** - AI validates data
- **Better Adoption** - More intuitive
- **On-the-Go** - Quick updates

### For Teams
- **Consistent Data** - Structured extraction
- **Audit Trail** - All actions logged
- **Easy Training** - Examples available
- **Flexible** - Easy to add prompts

## Related Documentation

- [Architecture Details](../architecture/CHATBOT_ARCHITECTURE.md)
- [React Concepts](../developer-guide/REACT_CONCEPTS.md)
- [Setup Guide](../setup/ENVIRONMENT.md)

---

**Feature Version**: 1.2.0  
**Last Updated**: November 2025

