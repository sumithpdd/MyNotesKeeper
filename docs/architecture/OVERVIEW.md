# System Architecture Overview

## Overview

The Customer Engagement Hub is built using modern web technologies with a focus on scalability, maintainability, and developer experience.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
├─────────────────────────────────────────────────────────┤
│  Next.js App (React Components + TypeScript)            │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Components Layer                                 │  │
│  │  - CustomerManagement                             │  │
│  │  - ChatbotInterface                               │  │
│  │  - CustomerForm                                   │  │
│  │  - PromptLibrary                                  │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Service Layer                                    │  │
│  │  - customerService                                │  │
│  │  - chatbotAI                                      │  │
│  │  - ai (Gemini)                                    │  │
│  │  - auth                                           │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              External Services                           │
├───────────────────┬─────────────────────────────────────┤
│  Firebase         │  Google Gemini AI                   │
│  - Authentication │  - Natural Language Processing      │
│  - Firestore DB   │  - Text Enhancement                 │
│  - Security Rules │  - Content Generation               │
└───────────────────┴─────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18+** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend Services
- **Firebase Authentication** - Google OAuth
- **Firebase Firestore** - NoSQL database
- **Google Gemini API** - AI capabilities

### Development Tools
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **ESLint** - Code linting
- **TypeScript** - Type checking

## Application Layers

### 1. Presentation Layer (Components)

**Location**: `src/components/`

**Responsibility**: User interface and interaction

**Key Components**:
- `CustomerManagement.tsx` - Main customer interface
- `ChatbotInterface.tsx` - AI chatbot
- `CustomerForm.tsx` - Customer CRUD
- `NoteForm.tsx` - Note management
- `PromptLibrary.tsx` - Template browser

**Patterns**:
- Functional components
- TypeScript props interfaces
- Controlled inputs
- Event handlers passed as props

### 2. Service Layer (Business Logic)

**Location**: `src/lib/`

**Responsibility**: Business logic and data operations

**Key Services**:
- `customerService.ts` - Customer CRUD operations
- `customerNotesService.ts` - Notes management
- `customerProfileService.ts` - Profile management
- `chatbotAI.ts` - AI parsing and NLP
- `ai.ts` - Text enhancement
- `auth.tsx` - Authentication context

**Patterns**:
- Class-based services
- Async/await for Firebase calls
- Error handling
- Type-safe interfaces

### 3. Data Layer (Firebase)

**Location**: Firebase Firestore

**Responsibility**: Data persistence and authentication

**Collections**:
- `users` - User accounts
- `customers` - Customer records
- `customerProfiles` - Static business info
- `customerNotes` - Dynamic interaction notes
- `migrationOpportunities` - Migration tracking

## Data Flow

### Read Flow

```
Component Request
    ↓
Service Layer (customerService)
    ↓
Firebase SDK
    ↓
Firestore Database
    ↓
Data Returns
    ↓
Service Transforms/Validates
    ↓
Component Updates State
    ↓
UI Re-renders
```

### Write Flow

```
User Action (Form Submit)
    ↓
Component Handler
    ↓
Service Layer (validation)
    ↓
Firebase SDK (with user ID)
    ↓
Firestore Write
    ↓
Success/Error Response
    ↓
Component State Update
    ↓
UI Feedback (success/error message)
```

### AI Flow

```
User Input (Natural Language)
    ↓
ChatbotInterface Component
    ↓
chatbotAI Service
    ↓
Google Gemini API
    ↓
Structured JSON Response
    ↓
Confirmation UI
    ↓
User Confirms
    ↓
Execute Action (Firebase Write)
    ↓
Success Confirmation
```

## Key Design Decisions

### 1. Client-Side Rendering

**Decision**: Use Next.js App Router with client components

**Reasoning**:
- Rich interactivity required
- Firebase SDK works client-side
- Real-time updates needed
- Better developer experience

**Trade-offs**:
- Larger initial bundle
- JavaScript required
- SEO less important (internal tool)

### 2. Firebase for Backend

**Decision**: Use Firebase instead of custom backend

**Reasoning**:
- No server management needed
- Built-in authentication
- Real-time capabilities
- Scalable infrastructure

**Trade-offs**:
- Vendor lock-in
- Cost at scale
- Less control over backend

### 3. TypeScript Throughout

**Decision**: 100% TypeScript, no JavaScript

**Reasoning**:
- Type safety prevents bugs
- Better IDE support
- Self-documenting code
- Easier refactoring

**Trade-offs**:
- Steeper learning curve
- More initial setup
- Longer compile times

### 4. Two-Tier Data Model

**Decision**: Separate Customer Profile (static) from Customer Notes (dynamic)

**Reasoning**:
- Reduces data duplication
- Clearer separation of concerns
- Better data consistency
- Easier to maintain

**Benefits**:
- Profile created once, notes many times
- No need to copy static data
- Simpler queries
- Better performance

## Security Architecture

### Authentication Flow

```
User Clicks "Sign in with Google"
    ↓
Firebase Authentication (OAuth)
    ↓
Google OAuth Dialog
    ↓
User Approves
    ↓
Firebase Creates/Updates User
    ↓
JWT Token Generated
    ↓
Token Stored in Browser
    ↓
App Loads with User Context
```

### Data Access

**Firestore Security Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**API Keys**:
- Stored in `.env.local` (not committed)
- Prefixed with `NEXT_PUBLIC_` for client access
- Never exposed in code
- Rotated regularly

## Performance Considerations

### Optimization Strategies

1. **useMemo for Expensive Calculations**
   - Filter/sort operations
   - Data transformations
   - Complex computations

2. **Lazy Loading**
   - Components loaded on demand
   - Images loaded when visible
   - Data fetched when needed

3. **Firebase Query Optimization**
   - Index common queries
   - Limit data fetched
   - Use pagination
   - Cache when appropriate

4. **Bundle Optimization**
   - Tree shaking unused code
   - Code splitting by route
   - Minimize dependencies
   - Use production builds

## Scalability

### Current Scale
- Supports hundreds of customers
- Thousands of notes
- Multiple concurrent users
- Real-time updates

### Future Scale Considerations
- Implement pagination for large lists
- Add caching layer (Redis)
- Optimize Firebase queries
- Consider CDN for static assets

## Error Handling

### Strategy

1. **Try-Catch Blocks**
   ```typescript
   try {
     await customerService.create(data);
   } catch (error) {
     console.error('Failed to create customer:', error);
     setError('Could not save customer');
   }
   ```

2. **User Feedback**
   - Toast notifications
   - Inline error messages
   - Loading states
   - Success confirmations

3. **Graceful Degradation**
   - Fallback to dummy data if Firebase fails
   - Show cached data if network error
   - Disable features gracefully
   - Clear error messages

## Monitoring & Logging

### Client-Side
- Browser console for errors
- React DevTools for component inspection
- Network tab for API calls

### Server-Side (Firebase)
- Firebase console for database
- Authentication logs
- Usage metrics
- Error tracking

## Related Documentation

- [Data Models](DATA_MODELS.md) - Database schema
- [Chatbot Architecture](CHATBOT_ARCHITECTURE.md) - AI implementation
- [Getting Started](../developer-guide/GETTING_STARTED.md) - Setup guide
- [React Concepts](../developer-guide/REACT_CONCEPTS.md) - Patterns used

---

**Last Updated**: November 2025  
**Version**: 1.2.0

