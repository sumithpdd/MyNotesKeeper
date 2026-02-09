# Developer Guide

Complete guide for developers working on the Customer Engagement Hub codebase.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Component Architecture](#component-architecture)
4. [Type System](#type-system)
5. [State Management](#state-management)
6. [Adding Features](#adding-features)
7. [Best Practices](#best-practices)
8. [Testing](#testing)
9. [Debugging](#debugging)

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- TypeScript knowledge
- React 19 and Next.js 15 familiarity
- Firebase Firestore basics
- Git for version control

### First-Time Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Start development server
npm run dev
```

### Development Workflow

```bash
# Start dev server (with hot reload)
npm run dev

# Run type checking
npm run type-check

# Run linter
npm run lint

# Build for production
npm run build

# Start production build locally
npm start
```

---

## Project Structure

```
MyNotesKeeper/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Main page (home)
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   └── api/               # API routes
│   │
│   ├── components/            # React components
│   │   ├── customers/         # Customer-specific components
│   │   │   ├── CustomerListHeader.tsx
│   │   │   ├── CustomerSearchBar.tsx
│   │   │   ├── CustomerFilterPanel.tsx
│   │   │   ├── CustomerGridCard.tsx
│   │   │   ├── CustomerGridView.tsx
│   │   │   ├── CustomerTableView.tsx
│   │   │   └── CustomerEmptyState.tsx
│   │   ├── CustomerList.tsx   # Main customer list orchestrator
│   │   ├── CustomerManagement.tsx
│   │   ├── CustomerForm.tsx
│   │   ├── OpportunityList.tsx
│   │   ├── OpportunityForm.tsx
│   │   ├── ChatbotInterface.tsx
│   │   └── ui/                # Reusable UI components
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useCustomerFilters.ts
│   │   ├── useCustomerSearch.ts
│   │   └── useCustomerSort.ts
│   │
│   ├── lib/                   # Utilities and services
│   │   ├── firebase.ts        # Firebase config
│   │   ├── customerService.ts  # Customer CRUD
│   │   ├── opportunityService.ts
│   │   ├── customerNotes.ts
│   │   ├── ai.ts              # Gemini AI integration
│   │   └── chatbotAI.ts       # Chatbot AI service
│   │
│   └── types/                 # TypeScript types (modular)
│       ├── index.ts           # Central export
│       ├── customer.ts        # Customer types
│       ├── contacts.ts        # Contact types
│       ├── product.ts         # Product types
│       ├── opportunity.ts     # Opportunity types
│       ├── user.ts            # User/Auth types
│       └── ai.ts              # AI types
│
├── data/                      # Data and seeds
│   ├── dummyData.ts          # Dummy data generation
│   └── dxpPools.ts           # DXP objectives/use cases
│
├── public/                    # Static assets
├── docs/                      # Documentation
└── scripts/                   # Utility scripts
```

---

## Component Architecture

### Design Principles

We follow these principles for all components:

1. **Single Responsibility** - Each component has one clear purpose
2. **Composition** - Build complex UIs from simple components
3. **Reusability** - Components can be used in multiple places
4. **Type Safety** - All props and state are typed
5. **Performance** - Use memoization where appropriate

### Component Patterns

#### 1. Orchestrator Pattern

Large features use an orchestrator component that coordinates child components:

```typescript
// CustomerList.tsx (Orchestrator)
export function CustomerList({ customers, selectedCustomer, onSelectCustomer }) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { searchTerm, filteredCustomers } = useCustomerSearch(customers);
  const { sortBy, sortCustomers } = useCustomerSort();
  const filters = useCustomerFilters(customers);
  
  return (
    <div>
      <CustomerListHeader {...} />
      <CustomerSearchBar {...} />
      {showFilters && <CustomerFilterPanel {...} />}
      {viewMode === 'grid' ? <CustomerGridView {...} /> : <CustomerTableView {...} />}
    </div>
  );
}
```

#### 2. Custom Hooks for Logic

Extract business logic into custom hooks:

```typescript
// useCustomerFilters.ts
export function useCustomerFilters(customers: Customer[]) {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  const applyFilters = (customerList: Customer[]): Customer[] => {
    // Filtering logic here
  };
  
  return {
    selectedYear,
    setSelectedYear,
    applyFilters,
    // ... more
  };
}
```

#### 3. Presentational Components

UI-only components with no business logic:

```typescript
// CustomerGridCard.tsx
export function CustomerGridCard({ customer, isSelected, onClick }) {
  return (
    <button onClick={onClick} className={...}>
      {/* Render customer data */}
    </button>
  );
}
```

### File Organization

- **Keep components small** (< 200 lines ideal)
- **Group related components** in folders (e.g., `customers/`)
- **Export from index** files for clean imports
- **Co-locate styles** if component-specific (though we use Tailwind)

---

## Type System

### Modular Types

Types are organized by domain in `src/types/`:

```typescript
// types/customer.ts
export interface Customer {
  id: string;
  customerName: string;
  products: Product[];
  // ...
}

// types/opportunity.ts
export interface Opportunity {
  id: string;
  customerId: string;
  currentStage: OpportunityStage;
  // ...
}

// types/index.ts (central export)
export * from './customer';
export * from './opportunity';
// ...
```

### Importing Types

```typescript
// Import from central location
import { Customer, Opportunity, Product } from '@/types';
```

### Creating New Types

1. Determine the domain (customer, opportunity, etc.)
2. Add to appropriate file in `types/`
3. Export from `types/index.ts`
4. Use throughout the app

---

## State Management

### Local State

For component-specific state, use `useState`:

```typescript
const [isOpen, setIsOpen] = useState(false);
```

### Lifted State

For shared state, lift to the nearest common ancestor:

```typescript
// Parent component
const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

// Pass down
<CustomerList 
  selectedCustomer={selectedCustomer}
  onSelectCustomer={setSelectedCustomer}
/>
```

### Memoization

Use `useMemo` for expensive computations:

```typescript
const filteredCustomers = useMemo(() => {
  return customers.filter(c => c.name.includes(searchTerm));
}, [customers, searchTerm]);
```

### Firebase State

Firebase data is fetched in `page.tsx` and passed down:

```typescript
const loadFirebaseData = async () => {
  const customers = await customerService.getAllCustomers();
  setCustomers(customers);
};
```

---

## Adding Features

### 1. Adding a New Component

```bash
# Create component file
touch src/components/MyNewComponent.tsx
```

```typescript
// src/components/MyNewComponent.tsx
'use client';

import { SomeType } from '@/types';

interface MyNewComponentProps {
  data: SomeType;
  onAction: () => void;
}

export function MyNewComponent({ data, onAction }: MyNewComponentProps) {
  return (
    <div className="p-4 bg-white rounded-lg">
      {/* Your JSX */}
    </div>
  );
}
```

### 2. Adding a New Custom Hook

```typescript
// src/hooks/useMyFeature.ts
import { useState, useEffect } from 'react';

export function useMyFeature(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  
  // Logic here
  
  return { value, setValue };
}

// Export from hooks/index.ts
export * from './useMyFeature';
```

### 3. Adding a New Service

```typescript
// src/lib/myService.ts
import { db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { MyType } from '@/types';

export const myService = {
  async create(data: MyType): Promise<MyType> {
    const docRef = await addDoc(collection(db, 'my-collection'), data);
    return { id: docRef.id, ...data };
  },
  
  async getAll(): Promise<MyType[]> {
    const snapshot = await getDocs(collection(db, 'my-collection'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MyType));
  },
};
```

### 4. Adding a New Type

```typescript
// src/types/myNewType.ts
export interface MyNewType {
  id: string;
  name: string;
  createdAt: Date;
}

export interface CreateMyNewTypeData {
  name: string;
}

// Add to types/index.ts
export * from './myNewType';
```

### 5. Adding an API Route

```typescript
// src/app/api/my-endpoint/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Process request
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: 'Error message' }, { status: 500 });
  }
}
```

---

## Best Practices

### TypeScript

✅ **Do:**
- Use strict typing (no `any`)
- Define interfaces for all props
- Use type inference where clear
- Export types for reuse

❌ **Don't:**
- Use `any` type
- Skip type annotations on function params
- Use `@ts-ignore` (fix the issue instead)

### React Components

✅ **Do:**
- Use functional components
- Extract logic to custom hooks
- Memoize expensive computations
- Keep components focused and small
- Use meaningful prop names

❌ **Don't:**
- Mutate props or state
- Use index as key in lists (use unique IDs)
- Forget dependency arrays in hooks
- Create deeply nested components

### Styling

✅ **Do:**
- Use Tailwind utility classes
- Follow existing patterns
- Use responsive classes (`sm:`, `md:`, `lg:`)
- Keep consistent spacing (p-4, gap-4, etc.)

❌ **Don't:**
- Write custom CSS (use Tailwind)
- Use inline styles
- Mix spacing units

### Firebase

✅ **Do:**
- Use service files for all Firebase operations
- Handle errors gracefully
- Validate data before writing
- Use timestamps for dates

❌ **Don't:**
- Write Firebase code directly in components
- Store sensitive data in Firestore
- Skip error handling
- Use string dates (use Date objects)

---

## Testing

### Unit Testing (Recommended)

```typescript
// __tests__/hooks/useCustomerFilters.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCustomerFilters } from '@/hooks';

describe('useCustomerFilters', () => {
  it('should filter by year', () => {
    const { result } = renderHook(() => useCustomerFilters(mockCustomers));
    
    act(() => {
      result.current.setSelectedYear('2024');
    });
    
    const filtered = result.current.applyFilters(mockCustomers);
    expect(filtered).toHaveLength(5);
  });
});
```

### Component Testing

```typescript
// __tests__/components/CustomerGridCard.test.tsx
import { render, screen } from '@testing-library/react';
import { CustomerGridCard } from '@/components/customers';

describe('CustomerGridCard', () => {
  it('should display customer name', () => {
    render(
      <CustomerGridCard 
        customer={mockCustomer} 
        isSelected={false} 
        onClick={() => {}} 
      />
    );
    
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });
});
```

---

## Debugging

### Console Logging

```typescript
// Temporary debugging
console.log('Customer data:', customer);
console.error('Error occurred:', error);

// Remove before committing!
```

### React DevTools

1. Install React Developer Tools browser extension
2. Open DevTools → React tab
3. Inspect component tree
4. View props and state

### Firebase Debugging

```typescript
// Check Firebase connection
import { db } from '@/lib/firebase';
console.log('Firebase DB:', db);

// Log query results
const customers = await customerService.getAllCustomers();
console.log('Loaded customers:', customers.length);
```

### Type Errors

```bash
# Run type checker
npm run type-check

# Common fixes:
# - Add missing type imports
# - Fix prop types
# - Add null checks
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run dev
```

---

## Common Tasks

### Adding a New Field to Customer

1. Update type in `types/customer.ts`
2. Update `CustomerForm.tsx` to include field
3. Update display in `CustomerGridCard.tsx` / `CustomerTableView.tsx`
4. Update `customerService.ts` if needed
5. Test create/edit/display

### Modifying Firestore Schema

1. Update types in `types/`
2. Update service file (`customerService.ts`, etc.)
3. Write migration script if needed (in `scripts/`)
4. Test with existing data

### Adding a New Filter

1. Add state to `useCustomerFilters.ts`
2. Add filter logic to `applyFilters()`
3. Add UI in `CustomerFilterPanel.tsx`
4. Wire up handlers

---

## Need Help?

- **Architecture questions?** See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Setup issues?** See [SETUP.md](SETUP.md)
- **User features?** See [USER_GUIDE.md](USER_GUIDE.md)
- **API reference?** Check the type files in `src/types/`
