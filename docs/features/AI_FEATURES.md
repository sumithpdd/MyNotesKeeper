# AI-Powered Features

## Overview

The Customer Engagement Hub includes AI-powered features using Google's Gemini API to enhance productivity and data quality.

## Features

### 1. Text Enhancement (AI Button ✨)

Enhance any text field with AI assistance using three actions:

#### Expand
- Adds more detail and depth
- Maintains original meaning
- Provides context

#### Refine
- Improves professionalism
- Enhances clarity
- Polishes language

#### Elaborate
- Adds context and examples
- Provides specific details
- Enriches content

### Available in These Fields

**Customer Form:**
- Compelling Event field
- Migration Notes field

**Note Form:**
- Main Notes field
- Additional Notes field
- Next Steps field

### How to Use

1. Type some text in a field with a ✨ icon
2. Click the sparkle icon
3. Select action (Expand, Refine, or Elaborate)
4. Wait for AI generation
5. Review and edit as needed

## 2. Customer Summary Generator 🎯

Generate comprehensive customer summaries with AI.

### What It Includes
- Current status and products
- Migration opportunity analysis
- Key compelling events
- Recommended next steps
- Sales strategy suggestions

### How to Use

1. Open customer detail view
2. Click "AI Summary" button (purple)
3. Wait for generation
4. Review the summary
5. Use for planning

### Location
- Customer Management tab
- Customer detail view header
- After selecting a customer

## 3. SE Notes Auto-Generation

Automatically generate Solution Engineering notes from customer profile data.

### Features
- Uses business details
- Includes discovery information
- Formats professionally
- Adds activity tracking

### How to Use

1. Open Customer Profile form
2. Fill in Business Details
3. Fill in Quick Hit Details
4. Click "Generate from fields" (blue button)
5. SE Notes field auto-fills

## Setup Requirements

### API Key Configuration

1. **Get Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with Google account
   - Click "Get API Key"
   - Copy the generated key

2. **Add to Environment**
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
   ```

3. **Restart Server**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

### Verification

1. Open browser to http://localhost:3000
2. Try any AI feature
3. Check for success (not error messages)

## Technical Details

### AI Model
- **Provider**: Google Gemini
- **Model**: gemini-2.0-flash (chatbot)
- **Model**: gemini-1.5-flash (text enhancement)
- **Integration**: Client-side API calls

### Service Location
- **Main Service**: `src/lib/ai.ts`
- **Chatbot Service**: `src/lib/chatbotAI.ts`
- **Components**: Various with ✨ icon

### API Calls
- All calls made client-side from browser
- API key stored in environment variables
- Graceful error handling

## Benefits

### For Sales Consultants
- **Faster Documentation** - Quick text enhancement
- **Professional Language** - AI improves quality
- **Better Context** - AI adds relevant details
- **Comprehensive Insights** - Smart summaries

### For Customer Management
- **Consistent Quality** - Professional language
- **Time Savings** - Auto-generation
- **Actionable Insights** - AI highlights key info
- **Better Decisions** - Quick intelligence access

## Best Practices

### Text Enhancement
1. **Provide Context** - Add meaningful text first
2. **Review Always** - Check AI-generated content
3. **Use Elaborate** - For specific examples
4. **Use Refine** - For professional communications
5. **Use Expand** - For more detail

### Customer Summaries
1. **Complete Data** - Fill customer info first
2. **Review Carefully** - AI suggestions may need edits
3. **Use for Planning** - Strategy development
4. **Update Regularly** - As customer status changes

## Error Handling

### Common Errors

**"API key not configured"**
- Solution: Add key to `.env.local` and restart

**"Failed to generate"**
- Check internet connection
- Verify API key is valid
- Check API quota/limits

**"Rate limit exceeded"**
- Wait a moment
- Try again
- Check usage in Google AI Studio

## Cost Considerations

- Gemini API has generous free tier
- Pay-as-you-go beyond free tier
- Monitor usage in [Google AI Studio](https://aistudio.google.com/)
- Competitive pricing

## Security

- API keys stored in environment variables
- Never committed to version control
- Client-side calls to Google API
- Only customer info sent (no sensitive data)
- All content should be reviewed

## Future Enhancements

Potential improvements:
1. Custom prompts per field type
2. Template-based generation
3. Multi-language support
4. Voice input for notes
5. AI-powered insights dashboard
6. Predictive recommendations
7. Bulk operations

## Usage Examples

### Example 1: Enhance Compelling Event
**Original**: "Contract ending soon"

**After Expand**: "The customer's current CMS contract is ending in Q2 2025, creating a compelling event for migration. They need to make a decision within the next 2 months to avoid service disruption."

### Example 2: Refine Migration Notes
**Original**: "Customer wants to move to cloud"

**After Refine**: "Customer has expressed strong interest in migrating to a cloud-based solution to reduce infrastructure costs and improve scalability for their growing digital presence."

### Example 3: Customer Summary
**Input**: Customer with XM Cloud, migration opp, Q2 compelling event

**Output**: "TechCo is an active migration opportunity currently using XP 10.3. With their contract ending in Q2 2025, there's a compelling event to migrate to XM Cloud. The technical team has shown high interest in the composable architecture. Recommended next steps: Schedule technical deep dive, prepare POC proposal, and address budget approval timeline."

## Component Architecture

### AIButton Component
```typescript
Location: src/components/ui/AIButton.tsx
Purpose: Reusable AI enhancement button
Features:
- Dropdown menu
- Three actions (Expand, Refine, Elaborate)
- Loading states
- Error handling
```

### Integration Points
- CustomerForm.tsx - Migration fields
- NoteForm.tsx - Note fields  
- CustomerManagement.tsx - Summary button
- CustomerProfileForm.tsx - SE Notes generation

## Related Documentation

- [Chatbot Feature](CHATBOT.md)
- [Setup Guide](../setup/ENVIRONMENT.md)
- [React Concepts](../developer-guide/REACT_CONCEPTS.md)

---

**Feature Version**: 1.2.0  
**Last Updated**: November 2025

