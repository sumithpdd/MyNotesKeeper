# System Architecture

Technical architecture and design decisions for the Customer Engagement Hub.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Data Model](#data-model)
4. [Component Architecture](#component-architecture)
5. [Firebase Integration](#firebase-integration)
6. [AI Integration](#ai-integration)
7. [State Management](#state-management)
8. [Routing](#routing)
9. [Security](#security)

---

## Overview

Customer Engagement Hub is a Next.js application built with React 19, TypeScript, and Firebase. It follows modern React patterns with a modular, component-based architecture.

**Key Architectural Decisions:**
- **Next.js App Router** for file-based routing
- **Client-side rendering** for interactive features
- **Firebase Firestore** for cloud database
- **Google Gemini AI** for natural language processing
- **Modular component design** for maintainability
- **TypeScript** for type safety

---

## Technology Stack

### Frontend
- **Next.js 15.5.5** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### Backend/Services
- **Firebase Authentication** - Google OAuth sign-in
- **Firebase Firestore** - NoSQL cloud database
- **Google Gemini AI** - Natural language processing
- **Next.js API Routes** - Backend endpoints

### Development
- **Turbopack** - Fast development bundler
- **ESLint** - Code linting
- **React Hook Form** - Form management
- **Zod** - Schema validation

---

## Data Model

### Core Entities

```
Customer (1) ←→ (1) CustomerProfile
Customer (1) ←→ (Many) CustomerNotes
Customer (1) ←→ (Many) Opportunities
```

### Customer
Static company information that rarely changes.

```typescript
interface Customer {
  id: string;
  customerName: string;
  website?: string;
  products: Product[];
  customerContacts: CustomerContact[];
  internalContacts: InternalContact[];
  accountExecutive?: InternalContact;
  partners: Partner[];
  sharePointUrl: string;
  salesforceLink: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### CustomerProfile
Static business context per customer.

```typescript
interface CustomerProfile {
  id: string;
  customerId: string;
  businessProblem: string;
  whyUs: string;
  whyNow: string;
  seProductFitAssessment: 'Green' | 'Yellow' | 'Red' | '';
  customerObjective1: string;
  customerObjective2: string;
  customerObjective3: string;
  // ... more fields
  createdAt: Date;
  updatedAt: Date;
}
```

### CustomerNote
Dynamic interaction records.

```typescript
interface CustomerNote {
  id: string;
  customerId: string;
  notes: string;
  noteDate: Date;
  createdBy: string;
  seConfidence: 'Green' | 'Yellow' | 'Red' | '';
  otherFields: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Opportunity
Sales pipeline tracking with stage history.

```typescript
interface Opportunity {
  id: string;
  customerId: string;
  opportunityName: string;
  currentStage: OpportunityStage;
  stageHistory: StageHistoryEntry[];
  estimatedValue?: number;
  probability?: number;
  expectedCloseDate?: Date;
  owner?: InternalContact;
  products: Product[];
  // ... more fields
}

type OpportunityStage = 
  | 'Plan' | 'Prospect' | 'Qualify' | 'Discover' 
  | 'Differentiate' | 'Propose' | 'Close' 
  | 'Delivery and Success' | 'Expand';
```

### Data Flow

```
User Action
    ↓
React Component
    ↓
Service Layer (customerService.ts, opportunityService.ts)
    ↓
Firebase Firestore
    ↓
Real-time Update
    ↓
React State Update
    ↓
UI Re-render
```

---

## Component Architecture

### Hierarchical Structure

```
App
├── AuthProvider (Context)
├── ProtectedRoute (Auth Guard)
└── HomePage (Main Page)
    ├── Tabs
    │   ├── Dashboard
    │   ├── CustomerManagement
    │   │   ├── CustomerList (Orchestrator)
    │   │   │   ├── CustomerListHeader
    │   │   │   ├── CustomerSearchBar
    │   │   │   ├── CustomerFilterPanel
    │   │   │   ├── CustomerGridView
    │   │   │   │   └── CustomerGridCard (repeated)
    │   │   │   └── CustomerTableView
    │   │   └── CustomerDetail
    │   │       ├── CustomerForm
    │   │       ├── CustomerProfile
    │   │       └── CustomerNotes
    │   ├── Opportunities
    │   │   ├── OpportunityList
    │   │   ├── OpportunityForm
    │   │   └── OpportunityDetail
    │   ├── AI Chatbot
    │   │   ├── ChatbotInterface
    │   │   └── PromptLibrary
    │   └── EntityManagement
```

### Component Patterns

#### 1. Orchestrator Pattern
Large features use an orchestrator component:

```typescript
// CustomerList.tsx
export function CustomerList(props) {
  // Hooks for logic
  const filters = useCustomerFilters(customers);
  const { searchTerm, filteredCustomers } = useCustomerSearch(customers);
  const { sortBy, sortCustomers } = useCustomerSort();
  
  // Compose child components
  return (
    <>
      <CustomerListHeader />
      <CustomerSearchBar />
      <CustomerFilterPanel />
      {viewMode === 'grid' ? <CustomerGridView /> : <CustomerTableView />}
    </>
  );
}
```

#### 2. Custom Hooks for Logic
Business logic extracted from components:

```typescript
// useCustomerFilters.ts
export function useCustomerFilters(customers) {
  const [filters, setFilters] = useState({...});
  const applyFilters = (list) => { /* logic */ };
  return { filters, applyFilters, ... };
}
```

#### 3. Service Layer
Firebase operations abstracted:

```typescript
// customerService.ts
export const customerService = {
  async getAllCustomers() { /* Firebase query */ },
  async createCustomer(data) { /* Firebase write */ },
  // ... more CRUD operations
};
```

---

## Firebase Integration

### Configuration

```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... more config
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### Firestore Collections

```
firestore/
├── customers/
│   └── {customerId}/
├── customerProfiles/
│   └── {profileId}/
├── customerNotes/
│   └── {noteId}/
├── opportunities/
│   └── {opportunityId}/
└── users/
    └── {userId}/
```

### CRUD Operations

```typescript
// Example: customerService.ts
export const customerService = {
  async getAllCustomers() {
    const snapshot = await getDocs(collection(db, 'customers'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  async createCustomer(data, userId, userName) {
    const newCustomer = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const docRef = await addDoc(collection(db, 'customers'), newCustomer);
    return { id: docRef.id, ...newCustomer };
  },
  
  // ... update, delete, etc.
};
```

---

## AI Integration

### Google Gemini API

```typescript
// lib/ai.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function generateContent(prompt: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

### Chatbot Architecture

```
User Input
    ↓
ChatbotInterface Component
    ↓
chatbotAI.detectIntent() → Determine what user wants
    ↓
chatbotAI.parseInput() → Extract structured data
    ↓
Confirmation UI → User reviews parsed data
    ↓
API Route (/api/ai-command) → Execute action
    ↓
Service Layer (customerService, etc.) → Update Firestore
    ↓
State Update → UI refresh
```

### Prompt Templates

```typescript
// lib/chatbotPrompts.ts
export const prompts: PromptTemplate[] = [
  {
    id: 'add-note',
    title: 'Add Customer Note',
    description: 'Add a note to a customer',
    examples: [
      'Add a note to ABC Corp, demo yesterday, green confidence',
      'Note for XYZ: Called today, discussed pricing, yellow'
    ],
    fields: ['customerName', 'notes', 'seConfidence', 'noteDate'],
    systemPrompt: '...',
  },
  // ... more prompts
];
```

---

## State Management

### Local State (useState)
For component-specific state:

```typescript
const [isOpen, setIsOpen] = useState(false);
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
```

### Lifted State
Shared state lifted to parent:

```typescript
// HomePage
const [customers, setCustomers] = useState<Customer[]>([]);
const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

// Pass down
<CustomerList 
  customers={customers}
  selectedCustomer={selectedCustomer}
  onSelectCustomer={setSelectedCustomer}
/>
```

### Context (React Context)
For auth state:

```typescript
// lib/auth.tsx
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Memoization
For expensive computations:

```typescript
const filteredCustomers = useMemo(() => {
  return customers
    .filter(c => c.name.includes(searchTerm))
    .sort((a, b) => a.name.localeCompare(b.name));
}, [customers, searchTerm]);
```

---

## Routing

### Next.js App Router

```
app/
├── page.tsx              → / (Home page)
├── layout.tsx            → Root layout
├── globals.css           → Global styles
└── api/
    └── ai-command/
        └── route.ts      → /api/ai-command (POST)
```

### Client-Side Navigation

All navigation is client-side using tabs (not routes):

```typescript
const [activeTab, setActiveTab] = useState<TabType>('customers');

// Render based on tab
{activeTab === 'customers' && <CustomerManagement />}
{activeTab === 'chatbot' && <ChatbotInterface />}
```

---

## Security

### Authentication
- **Google OAuth** via Firebase Authentication
- Protected routes wrapped in `<ProtectedRoute>`
- User state managed in `AuthContext`

### Environment Variables
- All sensitive keys in `.env.local`
- Never committed to git
- Loaded via `process.env`

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Production rules should be more restrictive:**
- User-specific data (only owner can access)
- Role-based permissions
- Field-level validation

### Input Validation
- **Zod schemas** for all forms
- Type checking via TypeScript
- Firebase validation rules

---

## Performance Considerations

### Optimization Strategies
- **Code splitting** - Next.js automatic
- **Memoization** - useMemo for expensive computations
- **Lazy loading** - Dynamic imports where appropriate
- **Image optimization** - next/image component

### Firestore Query Optimization
- Index commonly filtered fields
- Use pagination for large lists
- Cache frequently accessed data

### AI API Usage
- Debounce user input
- Cache responses when possible
- Use streaming for long responses

---

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables in Production
Set these in your hosting platform:
- `NEXT_PUBLIC_FIREBASE_*` - Firebase config
- `NEXT_PUBLIC_GEMINI_API_KEY` - Gemini API key

### Hosting Options
- **Vercel** - Recommended (built by Next.js team)
- **Firebase Hosting** - Works well with Firebase services
- **Netlify** - Alternative option
- **AWS/GCP/Azure** - Enterprise options

---

## Need Help?

- **Development guide?** See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- **Setup instructions?** See [SETUP.md](SETUP.md)
- **User features?** See [USER_GUIDE.md](USER_GUIDE.md)
