# Architecture Overview

## Project Structure

```
MyNotesKeeper/
├── src/
│   ├── app/
│   │   ├── api/               # API Routes (REST endpoints)
│   │   │   ├── customers/     # Customer CRUD
│   │   │   ├── notes/         # Note CRUD
│   │   │   ├── opportunities/ # Opportunity CRUD + stage changes
│   │   │   ├── contacts/      # Contact management
│   │   │   ├── entities/      # Products & Partners
│   │   │   └── ai-command/    # AI command execution
│   │   ├── page.tsx           # Main page (280 lines)
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── ai-chat/           # AI chat sub-components
│   │   ├── customers/         # Customer UI components
│   │   └── *.tsx              # Other components
│   ├── hooks/                 # Custom React hooks
│   │   ├── useFirebaseData.ts
│   │   ├── useCustomerOperations.ts
│   │   ├── useNoteOperations.ts
│   │   └── useOpportunityOperations.ts
│   ├── lib/                   # Services & utilities
│   │   ├── customerService.ts
│   │   ├── customerNotes.ts
│   │   ├── opportunityService.ts
│   │   └── firebase.ts
│   ├── types/                 # TypeScript types (modular)
│   │   ├── customer.ts
│   │   ├── contacts.ts
│   │   ├── opportunity.ts
│   │   └── index.ts
│   └── utils/                 # Utility functions
│       └── aiMessageParser.ts
├── docs/                      # Documentation
│   ├── README.md              # Documentation hub
│   ├── QUICKSTART.md          # 5-minute setup
│   ├── SETUP.md               # Complete setup
│   ├── API_GUIDE.md           # API documentation
│   ├── USER_GUIDE.md          # Feature usage
│   ├── DEVELOPER_GUIDE.md     # Development guide
│   └── JUNIOR_DEVELOPER_GUIDE.md  # React/Next.js/TypeScript concepts
├── docs/CHANGELOG.md          # Version history
└── README.md                  # Project README (50 lines)
```

## Layers

### 1. **API Layer** (REST endpoints)
- Next.js API routes in `src/app/api/`
- RESTful conventions (GET, POST, PUT, DELETE)
- JSON request/response
- Defensive error handling
- Authentication (via Firebase)

### 2. **Hooks Layer** (Business logic)
- Custom React hooks in `src/hooks/`
- State management
- CRUD operations
- Error handling
- Reusable across components

### 3. **Service Layer** (Firebase)
- Firebase operations in `src/lib/`
- Firestore database queries
- Authentication
- Data validation

### 4. **Component Layer** (UI)
- React components in `src/components/`
- UI rendering only
- Delegates logic to hooks
- Modular & reusable

### 5. **Type Layer** (TypeScript)
- Type definitions in `src/types/`
- Domain-specific files
- Type safety throughout
- Interfaces for all entities

## Data Flow

```
User Action
    ↓
Component (UI)
    ↓
Hook (Business Logic)
    ↓
API Route (REST)
    ↓
Service (Firebase)
    ↓
Firestore Database
```

## Key Principles

- **Separation of Concerns**: UI, logic, and data layers are separate
- **Single Responsibility**: Each file has one clear purpose
- **Defensive Programming**: Automatic fallbacks, error handling
- **Type Safety**: TypeScript throughout, no `any` types
- **Reusability**: Hooks and components can be reused
- **Testability**: Pure functions, isolated logic

## Technologies

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Firebase Functions
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Google Sign-in)
- **AI**: Google Gemini API
- **State Management**: React hooks (no Redux needed)

## Best Practices

✅ Custom hooks for business logic  
✅ API routes for backend operations  
✅ Modular TypeScript types  
✅ Defensive error handling  
✅ Consistent naming conventions  
✅ Single file responsibility  
✅ Documentation for all APIs  

---

**For API details:** See `docs/API_GUIDE.md`  
**For development:** See `docs/DEVELOPER_GUIDE.md`
