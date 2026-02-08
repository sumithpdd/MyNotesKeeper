# Chatbot Architecture

## Overview

The AI Chatbot feature uses natural language processing to convert conversational input into structured database operations.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│  User Input (Natural Language)                          │
│  "Add a note to ABC Corp about demo yesterday"          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  ChatbotInterface Component                              │
│  - Captures user input                                   │
│  - Displays messages                                     │
│  - Shows confirmation UI                                 │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  ChatbotAIService                                        │
│  - detectIntent() - Match to prompt template            │
│  - parseInput() - Extract structured data               │
│  - generateConfirmation() - Create confirmation message │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Google Gemini API                                       │
│  Model: gemini-2.0-flash                                 │
│  - Natural language understanding                        │
│  - JSON structure extraction                             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Parsed Data (JSON)                                      │
│  {                                                       │
│    customerName: "ABC Corp",                            │
│    noteContent: "demo yesterday",                       │
│    seConfidence: "Green"                                │
│  }                                                       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  User Confirmation                                       │
│  - Review extracted data                                 │
│  - Confirm or Cancel                                     │
└─────────────────────────────────────────────────────────┘
                          │
                    Confirm │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Execution Functions                                     │
│  - executeAddNote()                                      │
│  - executeUpdateProfile()                                │
│  - executeAddCustomer()                                  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Firebase Services                                       │
│  - customerNotesService                                  │
│  - customerProfileService                                │
│  - customerService                                       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Firestore Database                                      │
│  - Data persisted                                        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Success Confirmation                                    │
│  "✅ Successfully added note to ABC Corp"               │
└─────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Prompt Templates (`chatbotPrompts.ts`)

**Location**: `src/lib/chatbotPrompts.ts`

**Purpose**: Define available commands and their structure

**Structure**:
```typescript
interface PromptTemplate {
  id: string;                    // Unique identifier
  title: string;                 // Human-readable name
  description: string;           // What it does
  category: 'note' | 'customer' | 'profile' | 'update';
  examples: string[];            // Example commands
  fields: string[];              // Fields to extract
  systemPrompt: string;          // AI instructions
}
```

**8 Templates**:
1. add-customer-note
2. update-customer-profile
3. add-customer
4. update-se-confidence
5. quick-discovery
6. update-products
7. schedule-followup
8. update-stakeholders

### 2. ChatbotAI Service (`chatbotAI.ts`)

**Location**: `src/lib/chatbotAI.ts`

**Key Methods**:

#### `parseInput(userInput, promptTemplate?, existingCustomers?)`
- Sends input to Gemini API
- Extracts structured JSON
- Returns parsed data with confidence score

#### `detectIntent(userInput, availablePrompts)`
- Analyzes user input
- Matches to best prompt template
- Returns PromptTemplate or null

#### `generateConfirmation(parsedData)`
- Creates natural language summary
- Shows what was understood
- Asks for user confirmation

### 3. ChatbotInterface Component

**Location**: `src/components/ChatbotInterface.tsx`

**Responsibilities**:
- Render chat UI
- Capture user input
- Display messages
- Show parsed data
- Handle confirmation/rejection
- Execute actions

**State Management**:
```typescript
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [input, setInput] = useState('');
const [isProcessing, setIsProcessing] = useState(false);
const [pendingAction, setPendingAction] = useState<ParsedChatbotInput | null>(null);
```

### 4. PromptLibrary Component

**Location**: `src/components/PromptLibrary.tsx`

**Purpose**: Browse and explore available prompts

**Features**:
- Search prompts
- Filter by category
- View examples
- Copy commands
- Link to chatbot

## Data Flow Detailed

### Step 1: User Input
```
User types: "Add note to ABC Corp, demo yesterday, green confidence"
                          ↓
ChatbotInterface captures input
                          ↓
Triggers handleSubmit()
```

### Step 2: Intent Detection
```
chatbotAI.detectIntent(input, chatbotPrompts)
                          ↓
Gemini API analyzes input
                          ↓
Returns: PromptTemplate('add-customer-note')
```

### Step 3: Parsing
```
chatbotAI.parseInput(input, promptTemplate, customerNames)
                          ↓
Gemini API with system prompt
                          ↓
JSON extraction:
{
  intent: "Add customer note",
  confidence: 0.95,
  extractedData: {
    customerName: "ABC Corp",
    noteContent: "demo yesterday",
    seConfidence: "Green"
  }
}
```

### Step 4: Confirmation
```
generateConfirmation(parsed)
                          ↓
"I understood you want to add a note to ABC Corp about 
the demo yesterday with green SE confidence. Is this correct?"
                          ↓
Show in UI with extracted data
```

### Step 5: Execution
```
User clicks "Confirm & Apply"
                          ↓
executeAddNote(extractedData)
                          ↓
Find customer by name
                          ↓
Create CustomerNote object
                          ↓
customerNotesService.createNote()
                          ↓
Firebase Firestore write
                          ↓
Success message
```

## AI Integration

### Gemini API Configuration

**Model**: gemini-2.0-flash

**Reasons**:
- Fast response time
- Cost-effective
- Good accuracy
- Supports JSON output

**API Call Structure**:
```typescript
const result = await model.generateContent({
  prompt: systemPrompt + userInput,
  generationConfig: {
    temperature: 0.7,    // Balanced creativity
    maxOutputTokens: 1000
  }
});
```

### System Prompts

**Structure**:
```
You are a Sales Solution Engineer assistant.

Context:
- Known customers: [list]
- Prompt template fields: [fields]

User input: "[user's text]"

Extract structured data as JSON:
{
  "intent": "what user wants to do",
  "confidence": 0-1 score,
  "extractedData": { fields },
  "warnings": [any issues]
}
```

**Key Instructions**:
- Use ISO date format
- Match customer names fuzzily
- Recognize product names
- Extract confidence levels (Green/Yellow/Red)
- Handle informal language

### JSON Extraction

The AI response might be wrapped in markdown:
```
```json
{
  "intent": "...",
  "extractedData": {...}
}
```
```

**Extraction Logic**:
```typescript
const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) 
                  || text.match(/\{[\s\S]*\}/);
const parsed = JSON.parse(jsonMatch[0]);
```

## Execution Functions

### executeAddNote(data)
1. Find customer by name
2. Create CustomerNote object
3. Call customerNotesService.createNote()
4. Update UI state

### executeAddCustomer(data)
1. Create Customer object
2. Call customerService.createCustomer()
3. Update UI state

### executeUpdateProfile(data)
1. Find customer
2. Get existing profile
3. Merge updates
4. Call customerProfileService.updateProfile()
5. Update UI state

### executeUpdateConfidence(data)
1. Find customer
2. Create note with confidence update
3. Call customerNotesService.createNote()
4. Update UI state

## Error Handling

### Parsing Errors
- AI couldn't extract JSON
- Malformed input
- **Solution**: Ask user to rephrase

### Customer Not Found
- Name doesn't match any customer
- **Solution**: Show error, suggest similar names

### Validation Errors
- Missing required fields
- Invalid data format
- **Solution**: Show specific error, ask for correction

### API Errors
- Gemini API failure
- Network issues
- **Solution**: Show error, retry option

## Performance Optimizations

### 1. Intent Detection Cache
- Cache common phrases
- Reduce API calls
- Faster response

### 2. Customer Name Fuzzy Matching
```typescript
const lowerName = name.toLowerCase().trim();
return customers.find(c => 
  c.customerName.toLowerCase().includes(lowerName) ||
  lowerName.includes(c.customerName.toLowerCase())
);
```

### 3. Debounced Input
- Don't process every keystroke
- Wait for pause in typing
- Reduce unnecessary API calls

## Security Considerations

### API Key Security
- Stored in environment variables
- Never exposed in code
- Rotated regularly

### Data Privacy
- Only send necessary context
- No sensitive credentials to AI
- User confirms before saving

### Input Validation
- Sanitize user input
- Validate extracted data
- Check permissions before write

## Testing Strategy

### Unit Tests
- Test prompt template matching
- Test JSON extraction
- Test customer matching

### Integration Tests
- Test full flow end-to-end
- Test with various inputs
- Test error handling

### Manual Testing
- Try each prompt template
- Test edge cases
- Test with typos and variations

## Future Enhancements

### 1. Streaming Responses
- Show AI thinking in real-time
- Partial results
- Better UX

### 2. Context Memory
- Remember previous commands
- Reference earlier in conversation
- Multi-turn interactions

### 3. Voice Input
- Speech-to-text
- Hands-free operation
- Mobile friendly

### 4. Bulk Operations
- Process multiple commands
- Batch updates
- Import from text

### 5. Learning
- Track successful patterns
- Improve prompts over time
- Personalized suggestions

## Related Documentation

- [Chatbot Feature Guide](../features/CHATBOT.md) - User guide
- [AI Features](../features/AI_FEATURES.md) - Other AI capabilities
- [React Concepts](../developer-guide/REACT_CONCEPTS.md) - Patterns used

---

**Last Updated**: November 2025  
**Version**: 1.2.0

