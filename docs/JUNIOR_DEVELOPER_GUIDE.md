# Junior Developer Guide

Welcome! This guide explains the key concepts, technologies, and patterns used in this project - perfect for junior developers learning React, Next.js, and TypeScript.

## 📋 Table of Contents

1. [Technologies Overview](#technologies-overview)
2. [React Concepts](#react-concepts)
3. [Next.js Features](#nextjs-features)
4. [TypeScript Essentials](#typescript-essentials)
5. [Project Patterns](#project-patterns)
6. [Learning Resources](#learning-resources)
7. [Practice Exercises](#practice-exercises)

---

## Technologies Overview

### What We Use

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19 | UI library for building components |
| **Next.js** | 15.5.5 | React framework with routing and optimization |
| **TypeScript** | Latest | Type-safe JavaScript |
| **Tailwind CSS** | Latest | Utility-first CSS framework |
| **Firebase** | Latest | Authentication and database |
| **Lucide React** | Latest | Icon library |

### Why These Technologies?

- **React** → Component-based, reusable UI
- **Next.js** → Fast, optimized, great developer experience
- **TypeScript** → Catch errors before runtime
- **Tailwind** → Fast styling without writing CSS
- **Firebase** → Easy cloud backend

---

## React Concepts

### 1. Components

**What:** Reusable pieces of UI

**We use:**
```typescript
// Functional components (modern React)
export function CustomerCard({ customer, onClick }) {
  return (
    <div onClick={onClick}>
      <h3>{customer.name}</h3>
    </div>
  );
}
```

**In our project:**
- `CustomerList.tsx` - Main list component
- `CustomerGridCard.tsx` - Individual card
- `CustomerSearchBar.tsx` - Search input

📚 **Learn more:**
- [React Components Basics](https://react.dev/learn/your-first-component)
- [Thinking in React](https://react.dev/learn/thinking-in-react)

---

### 2. Props

**What:** Data passed from parent to child components

**We use:**
```typescript
interface CustomerCardProps {
  customer: Customer;
  isSelected: boolean;
  onClick: () => void;
}

export function CustomerCard({ customer, isSelected, onClick }: CustomerCardProps) {
  // Use the props
  return <div>{customer.name}</div>;
}
```

**In our project:**
- All components receive props
- TypeScript ensures correct props
- Props flow down (one-way data flow)

📚 **Learn more:**
- [Passing Props](https://react.dev/learn/passing-props-to-a-component)
- [TypeScript Props](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/basic_type_example/)

---

### 3. State (useState)

**What:** Data that changes over time

**We use:**
```typescript
const [searchTerm, setSearchTerm] = useState('');
const [customers, setCustomers] = useState<Customer[]>([]);
const [isOpen, setIsOpen] = useState(false);
```

**In our project:**
- `useState` for component-local state
- State updates trigger re-renders
- TypeScript types for state

**Example from our code:**
```typescript
// CustomerList.tsx
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
const [showFilters, setShowFilters] = useState(false);
```

📚 **Learn more:**
- [State: A Component's Memory](https://react.dev/learn/state-a-components-memory)
- [useState Hook](https://react.dev/reference/react/useState)

---

### 4. Effects (useEffect)

**What:** Run code when component mounts or when dependencies change

**We use:**
```typescript
useEffect(() => {
  // Fetch data when component mounts
  loadCustomers();
}, []); // Empty array = run once on mount

useEffect(() => {
  // Run when searchTerm changes
  filterCustomers(searchTerm);
}, [searchTerm]); // Re-run when searchTerm changes
```

**In our project:**
- Load data from Firebase
- Listen to authentication state
- Set up event listeners

**Example from our code:**
```typescript
// page.tsx
useEffect(() => {
  if (user) {
    loadFirebaseData();
  }
}, [user]);
```

📚 **Learn more:**
- [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [useEffect Hook](https://react.dev/reference/react/useEffect)

---

### 5. Memoization (useMemo)

**What:** Cache expensive computations to avoid re-calculating

**We use:**
```typescript
const filteredCustomers = useMemo(() => {
  return customers.filter(c => c.name.includes(searchTerm));
}, [customers, searchTerm]); // Only re-run if these change
```

**In our project:**
- Filter customers
- Sort lists
- Calculate derived data

**Example from our code:**
```typescript
// CustomerList.tsx
const filteredAndSortedCustomers = useMemo(() => {
  let result = searchFilteredCustomers;
  result = filters.applyFilters(result);
  result = sortCustomers(result);
  return result;
}, [searchFilteredCustomers, filters, sortCustomers]);
```

📚 **Learn more:**
- [useMemo Hook](https://react.dev/reference/react/useMemo)
- [Performance Optimization](https://react.dev/learn/render-and-commit)

---

### 6. Custom Hooks

**What:** Extract reusable logic into functions that use hooks

**We use:**
```typescript
// Custom hook
export function useCustomerSearch(customers: Customer[]) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => c.name.includes(searchTerm));
  }, [customers, searchTerm]);
  
  return { searchTerm, setSearchTerm, filteredCustomers };
}

// Usage in component
const { searchTerm, setSearchTerm, filteredCustomers } = useCustomerSearch(customers);
```

**Our custom hooks:**
- `useCustomerFilters` - Filtering logic
- `useCustomerSearch` - Search functionality
- `useCustomerSort` - Sorting logic
- `useAuth` - Authentication state

📚 **Learn more:**
- [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Custom Hooks Examples](https://usehooks.com/)

---

### 7. Context

**What:** Share data across many components without prop drilling

**We use:**
```typescript
// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  
  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Consumer (custom hook)
export const useAuth = () => useContext(AuthContext);

// Usage
const { user, signIn, signOut } = useAuth();
```

**In our project:**
- `AuthContext` - User authentication state
- Available everywhere in the app
- No prop drilling needed

📚 **Learn more:**
- [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)
- [useContext Hook](https://react.dev/reference/react/useContext)

---

### 8. Event Handling

**What:** Respond to user interactions

**We use:**
```typescript
<button onClick={() => handleClick(customer.id)}>
  Click me
</button>

<input 
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>

<form onSubmit={(e) => {
  e.preventDefault();
  handleSubmit(formData);
}}>
```

**In our project:**
- Button clicks
- Form submissions
- Input changes
- Keyboard events

📚 **Learn more:**
- [Responding to Events](https://react.dev/learn/responding-to-events)

---

### 9. Conditional Rendering

**What:** Show different UI based on conditions

**We use:**
```typescript
// If/else
{isLoading ? (
  <LoadingSpinner />
) : (
  <CustomerList customers={customers} />
)}

// && operator
{customers.length > 0 && (
  <div>Found {customers.length} customers</div>
)}

// Ternary in className
<div className={isSelected ? 'bg-blue-50' : 'bg-white'}>
```

**In our project:**
- Show/hide components
- Loading states
- Empty states
- Conditional styling

📚 **Learn more:**
- [Conditional Rendering](https://react.dev/learn/conditional-rendering)

---

### 10. Lists and Keys

**What:** Render arrays of data

**We use:**
```typescript
{customers.map((customer) => (
  <CustomerCard
    key={customer.id}  // ⚠️ Key is required!
    customer={customer}
    onClick={() => handleClick(customer.id)}
  />
))}
```

**Important:**
- Always use unique `key` prop
- Use IDs, not array indexes
- Keys help React track items

📚 **Learn more:**
- [Rendering Lists](https://react.dev/learn/rendering-lists)
- [Why Keys Matter](https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key)

---

## Next.js Features

### 1. App Router

**What:** File-based routing system

**Our structure:**
```
app/
├── page.tsx           → / (home page)
├── layout.tsx         → Root layout (wraps all pages)
├── globals.css        → Global styles
└── api/
    └── ai-command/
        └── route.ts   → /api/ai-command (API endpoint)
```

**How it works:**
- `page.tsx` = route
- `layout.tsx` = shared UI
- Nested folders = nested routes

📚 **Learn more:**
- [Next.js App Router](https://nextjs.org/docs/app)
- [Routing Fundamentals](https://nextjs.org/docs/app/building-your-application/routing)

---

### 2. Server vs Client Components

**What:** Next.js components can run on server or client

**In our project:**
```typescript
// Client component (needs interactivity)
'use client';  // ← This directive!

import { useState } from 'react';

export function CustomerList() {
  const [selected, setSelected] = useState(null);
  // ... interactive component
}
```

**Rules:**
- Use `'use client'` for interactive components
- Use `'use client'` for hooks (useState, useEffect, etc.)
- Server components by default (but we use client components)

📚 **Learn more:**
- [Server vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)

---

### 3. API Routes

**What:** Backend endpoints in your Next.js app

**We use:**
```typescript
// app/api/ai-command/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  
  // Process request
  const result = await processCommand(body);
  
  // Return JSON
  return NextResponse.json({ success: true, data: result });
}
```

**In our project:**
- `/api/ai-command` - AI chatbot endpoint
- Handles POST requests
- Returns JSON responses

📚 **Learn more:**
- [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [API Routes Guide](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)

---

### 4. Environment Variables

**What:** Configuration values stored outside code

**We use:**
```typescript
// .env.local (not committed to git)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here

// Usage in code
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
```

**Rules:**
- `NEXT_PUBLIC_*` = available in browser
- No prefix = server-only
- Store in `.env.local`
- Never commit `.env.local`

📚 **Learn more:**
- [Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

### 5. Metadata

**What:** SEO and page information

**We use:**
```typescript
// layout.tsx
export const metadata: Metadata = {
  title: "Customer Engagement Hub",
  description: "Manage customer relationships...",
  icons: {
    icon: '/favicon.svg',
  },
};
```

📚 **Learn more:**
- [Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)

---

## TypeScript Essentials

### 1. Basic Types

**What:** Specify what type a variable is

**We use:**
```typescript
// Primitive types
const name: string = "John";
const age: number = 25;
const isActive: boolean = true;

// Arrays
const names: string[] = ["John", "Jane"];
const numbers: number[] = [1, 2, 3];

// Objects (use interfaces)
interface User {
  id: string;
  name: string;
  age: number;
}

const user: User = {
  id: "123",
  name: "John",
  age: 25
};
```

📚 **Learn more:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

---

### 2. Interfaces

**What:** Define the shape of objects

**We use:**
```typescript
// Define structure
export interface Customer {
  id: string;
  customerName: string;
  website?: string;  // ? = optional
  products: Product[];
  createdAt: Date;
}

// Use it
const customer: Customer = {
  id: "1",
  customerName: "ABC Corp",
  products: [],
  createdAt: new Date(),
};
```

**In our project:**
- All data structures have interfaces
- Located in `src/types/`
- Organized by domain

📚 **Learn more:**
- [Interfaces](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [TypeScript Interfaces vs Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces)

---

### 3. Function Types

**What:** Specify function parameters and return types

**We use:**
```typescript
// Function with typed params and return
function addNumbers(a: number, b: number): number {
  return a + b;
}

// Arrow function
const multiply = (a: number, b: number): number => a * b;

// Function with no return (void)
function logMessage(msg: string): void {
  console.log(msg);
}

// Function type in interface
interface CustomerListProps {
  customers: Customer[];
  onSelect: (customerId: string) => void;
  onDelete: (customerId: string) => Promise<void>;
}
```

📚 **Learn more:**
- [Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)

---

### 4. Generics

**What:** Create reusable components with type variables

**We use:**
```typescript
// Generic type
interface Response<T> {
  data: T;
  error?: string;
}

const customerResponse: Response<Customer> = {
  data: { id: "1", name: "ABC" }
};

const noteResponse: Response<CustomerNote> = {
  data: { id: "1", notes: "Great meeting" }
};

// Generic function
function getFirst<T>(items: T[]): T | undefined {
  return items[0];
}

const firstCustomer = getFirst<Customer>(customers);
```

📚 **Learn more:**
- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)

---

### 5. Union Types

**What:** A value can be one of several types

**We use:**
```typescript
// Union type
type ViewMode = 'grid' | 'list';
type Status = 'Active' | 'Inactive' | 'Planned' | 'Deprecated';

const view: ViewMode = 'grid';  // ✅ OK
const view: ViewMode = 'table'; // ❌ Error!

// Union with different types
type ID = string | number;
const id1: ID = "abc123";  // ✅
const id2: ID = 12345;     // ✅
```

**In our project:**
- `ViewMode`: 'grid' | 'list'
- `SortBy`: 'name' | 'created' | 'updated' | 'products'
- SE confidence: 'Green' | 'Yellow' | 'Red'

📚 **Learn more:**
- [Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)

---

### 6. Type Guards

**What:** Check types at runtime

**We use:**
```typescript
// Type guard function
function isCustomer(obj: any): obj is Customer {
  return 'customerName' in obj && 'products' in obj;
}

// Usage
if (isCustomer(data)) {
  // TypeScript knows data is Customer here
  console.log(data.customerName);
}

// Null checks
if (customer !== null) {
  // customer is not null here
  console.log(customer.name);
}
```

📚 **Learn more:**
- [Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

---

## Project Patterns

### 1. Component Organization

```
components/
├── CustomerList.tsx              # Orchestrator (coordinates)
└── customers/                    # Domain folder
    ├── index.ts                  # Exports
    ├── CustomerListHeader.tsx    # Presentational
    ├── CustomerSearchBar.tsx     # Presentational
    ├── CustomerFilterPanel.tsx   # Presentational
    ├── CustomerGridCard.tsx      # Presentational
    ├── CustomerGridView.tsx      # Container
    └── CustomerTableView.tsx     # Container
```

**Pattern:**
- Orchestrator coordinates child components
- Small, focused components
- Group related components in folders

---

### 2. Custom Hooks Pattern

```typescript
// hooks/useCustomerFilters.ts
export function useCustomerFilters(customers) {
  // 1. State
  const [filters, setFilters] = useState({...});
  
  // 2. Computed values
  const filterOptions = useMemo(() => {...}, [customers]);
  
  // 3. Functions
  const applyFilters = (list) => {...};
  
  // 4. Return interface
  return {
    filters,
    setFilters,
    filterOptions,
    applyFilters,
  };
}
```

**Benefits:**
- Reusable logic
- Testable
- Clean components

---

### 3. Service Layer Pattern

```typescript
// lib/customerService.ts
export const customerService = {
  async getAllCustomers(): Promise<Customer[]> {
    // Firebase query
  },
  
  async createCustomer(data: CreateCustomerData): Promise<Customer> {
    // Firebase write
  },
  
  async updateCustomer(id: string, data: Partial<Customer>): Promise<void> {
    // Firebase update
  },
};
```

**Benefits:**
- Separates data logic from UI
- Easy to test
- Can switch backends

---

## Learning Resources

### React
📘 **Official Docs (BEST!):**
- [React.dev Learn](https://react.dev/learn) - Start here!
- [React Hooks Reference](https://react.dev/reference/react)

📺 **Videos:**
- [React Tutorial for Beginners](https://www.youtube.com/watch?v=SqcY0GlETPk) - Programming with Mosh
- [React Course](https://www.youtube.com/watch?v=bMknfKXIFA8) - freeCodeCamp

📖 **Practice:**
- [React Exercises](https://react-exercises.com/)
- [React Challenges](https://www.reactchallenge.dev/)

---

### Next.js
📘 **Official Docs:**
- [Next.js Learn](https://nextjs.org/learn) - Interactive tutorial
- [Next.js Docs](https://nextjs.org/docs) - Complete reference

📺 **Videos:**
- [Next.js 15 Crash Course](https://www.youtube.com/watch?v=wm5gMKuwSYk) - Traversy Media
- [Next.js Full Course](https://www.youtube.com/watch?v=mTz0GXj8NN0) - JavaScript Mastery

---

### TypeScript
📘 **Official Docs:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript for React](https://react-typescript-cheatsheet.netlify.app/)

📺 **Videos:**
- [TypeScript Crash Course](https://www.youtube.com/watch?v=BCg4U1FzODs) - Traversy Media
- [TypeScript Course](https://www.youtube.com/watch?v=30LWjhZzg50) - freeCodeCamp

📖 **Practice:**
- [TypeScript Exercises](https://typescript-exercises.github.io/)

---

### Firebase
📘 **Official Docs:**
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)

📺 **Videos:**
- [Firebase Crash Course](https://www.youtube.com/watch?v=fgdpvwEWJ9M) - Fireship
- [Firebase + React](https://www.youtube.com/watch?v=PKwu15ldZ7k) - The Net Ninja

---

### Tailwind CSS
📘 **Official Docs:**
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Utility Classes](https://tailwindcss.com/docs/utility-first)

📺 **Videos:**
- [Tailwind Crash Course](https://www.youtube.com/watch?v=UBOj6rqRUME) - Traversy Media

🎮 **Practice:**
- [Tailwind Play](https://play.tailwindcss.com/) - Try it online

---

## Practice Exercises

### Beginner

**1. Create a simple component**
- Make a `ProductCard` component
- Display product name, price, and image
- Add a "Buy" button

**2. Add state**
- Add a counter with increment/decrement buttons
- Show/hide a modal on button click

**3. Handle forms**
- Create a form with name and email inputs
- Display form data on submit
- Add validation

### Intermediate

**1. Build a todo list**
- Add, edit, delete todos
- Mark as complete
- Filter: all, active, completed

**2. Fetch data**
- Fetch from an API
- Show loading state
- Handle errors

**3. Custom hook**
- Create `useLocalStorage` hook
- Save/load from localStorage
- Use it in a component

### Advanced

**1. Build a mini version of our features**
- Customer list with search
- Add/edit/delete customers
- Filter by category

**2. Integrate Firebase**
- Set up Firebase project
- CRUD operations
- Real-time updates

---

## Common Mistakes to Avoid

### React
❌ **Don't mutate state directly**
```typescript
// ❌ Wrong
customers.push(newCustomer);
setCustomers(customers);

// ✅ Right
setCustomers([...customers, newCustomer]);
```

❌ **Don't forget keys in lists**
```typescript
// ❌ Wrong
{items.map((item) => <div>{item.name}</div>)}

// ✅ Right
{items.map((item) => <div key={item.id}>{item.name}</div>)}
```

❌ **Don't use index as key**
```typescript
// ❌ Wrong (if list can change)
{items.map((item, index) => <div key={index}>{item.name}</div>)}

// ✅ Right
{items.map((item) => <div key={item.id}>{item.name}</div>)}
```

### TypeScript
❌ **Don't use `any`**
```typescript
// ❌ Wrong
const data: any = getData();

// ✅ Right
const data: Customer = getData();
```

❌ **Don't skip type annotations**
```typescript
// ❌ Less clear
function process(data) { }

// ✅ Clear
function process(data: Customer): void { }
```

---

## Next Steps

1. ✅ Read this guide
2. 📖 Work through React.dev tutorial
3. 💻 Try the practice exercises
4. 🔍 Read our codebase with new knowledge
5. 🛠️ Make a small feature
6. 📚 Keep learning!

**Remember:** Everyone was a beginner once. Ask questions, experiment, and have fun! 🚀

---

**Need help?**
- Ask in team chat
- Check [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for project-specific info
- Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system
