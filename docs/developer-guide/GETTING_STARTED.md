# Getting Started - Developer Guide

## Overview

This guide will help you understand the Customer Engagement Hub project structure, setup, and development workflow.

## Prerequisites

### Required Knowledge
- JavaScript/TypeScript fundamentals
- React basics (components, props, state, hooks)
- Basic understanding of Next.js
- Familiarity with Git

### Tools Needed
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Code Editor** (VS Code recommended)

### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features
- Prettier - Code formatter
- ESLint

## Project Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd customer-engagement-hub
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- Next.js framework
- React and React DOM
- TypeScript
- Tailwind CSS
- Firebase SDK
- Gemini AI SDK
- Form libraries (React Hook Form, Zod)
- UI components (Lucide icons)

### 3. Environment Configuration

Create `.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Gemini AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

**Note**: See [Environment Setup Guide](../setup/ENVIRONMENT.md) for detailed configuration.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
customer-engagement-hub/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Main application page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   │
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── MultiSelect.tsx
│   │   │   ├── CopyableField.tsx
│   │   │   └── AIButton.tsx
│   │   ├── CustomerForm.tsx
│   │   ├── CustomerList.tsx
│   │   ├── CustomerManagement.tsx
│   │   ├── ChatbotInterface.tsx
│   │   └── PromptLibrary.tsx
│   │
│   ├── lib/                   # Utility functions and services
│   │   ├── firebase.ts       # Firebase configuration
│   │   ├── auth.tsx          # Authentication context
│   │   ├── ai.ts             # AI service
│   │   ├── chatbotAI.ts      # Chatbot AI service
│   │   ├── customerService.ts # Customer CRUD
│   │   └── utils.ts          # Helper functions
│   │
│   └── types/                 # TypeScript type definitions
│       └── index.ts
│
├── data/                      # Data files
│   ├── dummyData.ts          # Development data
│   └── dxpPools.ts           # Predefined options
│
├── docs/                      # Documentation
│   ├── features/
│   ├── architecture/
│   └── developer-guide/
│
├── public/                    # Static assets
├── scripts/                   # Utility scripts
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── tailwind.config.js        # Tailwind config
└── next.config.ts            # Next.js config
```

## Key Technologies

### Next.js 15 (App Router)
- **File-based routing** - `app/page.tsx` creates routes
- **Server Components** - Default server-side rendering
- **Client Components** - Use `'use client'` directive
- **API Routes** - Not used (using Firebase directly)

### React 18+
- **Hooks** - useState, useEffect, useMemo, useContext
- **Components** - Functional components only
- **Props** - TypeScript interfaces for type safety
- **State Management** - React Context + local state

### TypeScript
- **Type Safety** - All code is typed
- **Interfaces** - Defined in `src/types/index.ts`
- **Type Inference** - TypeScript infers types where possible
- **Strict Mode** - Enabled for maximum safety

### Tailwind CSS
- **Utility-First** - Compose designs with utility classes
- **Responsive** - Mobile-first responsive design
- **Customization** - Extended in `tailwind.config.js`
- **No Custom CSS** - Everything done with Tailwind

### Firebase
- **Authentication** - Google OAuth
- **Firestore** - NoSQL database
- **Real-time** - Live data updates
- **Security Rules** - Server-side validation

## Development Workflow

### 1. Understanding a Feature

When you want to understand a feature:

1. **Start with the UI** - Find the component
2. **Trace data flow** - Follow props and state
3. **Check types** - Look at TypeScript interfaces
4. **Review services** - Check lib/ for business logic

**Example**: Understanding Customer Notes

```
1. UI: src/components/NoteForm.tsx
2. Types: src/types/index.ts (CustomerNote interface)
3. Service: src/lib/customerNotes.ts
4. Storage: Firebase customerNotes collection
```

### 2. Adding a New Feature

Steps to add a feature:

1. **Define Types**
   - Add interfaces to `src/types/index.ts`

2. **Create Service** (if needed)
   - Add to `src/lib/yourService.ts`
   - CRUD operations
   - Firebase integration

3. **Create Component**
   - Add to `src/components/YourComponent.tsx`
   - Use TypeScript for props
   - Follow existing patterns

4. **Integrate**
   - Import in parent component
   - Pass props
   - Handle callbacks

5. **Style**
   - Use Tailwind classes
   - Follow existing design patterns

6. **Test**
   - Manual testing in browser
   - Check console for errors
   - Test edge cases

### 3. Common Tasks

#### Add a New Field to Customer

1. **Update Type** (`src/types/index.ts`):
```typescript
export interface Customer {
  // existing fields...
  newField: string;
}
```

2. **Update Form** (`src/components/CustomerForm.tsx`):
```tsx
<input
  type="text"
  value={customer.newField}
  onChange={(e) => setCustomer({...customer, newField: e.target.value})}
  className="..."
/>
```

3. **Update Service** (`src/lib/customerService.ts`):
```typescript
// Ensure newField is included in create/update operations
```

#### Add a New Component

1. **Create File** (`src/components/MyComponent.tsx`):
```tsx
'use client';

import { useState } from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div className="p-4 bg-white rounded-lg">
      <h2 className="text-lg font-bold">{title}</h2>
      <button onClick={onAction}>Click Me</button>
    </div>
  );
}
```

2. **Import and Use**:
```tsx
import { MyComponent } from '@/components/MyComponent';

// In parent component:
<MyComponent title="Hello" onAction={() => console.log('clicked')} />
```

## Debugging Tips

### Browser Console (F12)
- Check for errors
- View console.logs
- Inspect Network tab for API calls

### React DevTools
- Install React DevTools extension
- Inspect component tree
- View props and state

### TypeScript Errors
- Read error messages carefully
- Check type definitions
- Ensure all props are passed

### Firebase Errors
- Check Firebase console
- Verify authentication
- Review security rules

## Best Practices

### Code Style
- Use TypeScript for everything
- Follow existing patterns
- Keep components small and focused
- Use meaningful variable names

### Component Structure
```tsx
'use client'; // If using hooks/state

// Imports
import { useState } from 'react';
import { SomeType } from '@/types';

// Interface for props
interface ComponentProps {
  data: SomeType;
  onAction: (id: string) => void;
}

// Component
export function Component({ data, onAction }: ComponentProps) {
  // State
  const [loading, setLoading] = useState(false);

  // Handlers
  const handleClick = () => {
    // logic
  };

  // Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

### State Management
- Use `useState` for local state
- Use `useContext` for shared state
- Lift state up when needed
- Keep state as close to usage as possible

### TypeScript
- Always define interfaces for props
- Use existing types from `src/types/index.ts`
- Avoid `any` type
- Let TypeScript infer when possible

## Next Steps

After getting set up:

1. **Explore Features** - Try all application features
2. **Read Components** - Study existing components
3. **Review Architecture** - Check [Architecture docs](../architecture/OVERVIEW.md)
4. **Learn Patterns** - See [React Concepts](REACT_CONCEPTS.md)
5. **Make Changes** - Start with small modifications

## Common Issues

### Server Won't Start
- Check Node.js version (18+)
- Delete `node_modules` and run `npm install` again
- Check for port conflicts (3000)

### Firebase Errors
- Verify `.env.local` configuration
- Check Firebase console for issues
- Ensure authentication is set up

### TypeScript Errors
- Run `npm run type-check`
- Check for missing imports
- Verify interface definitions

### Styling Issues
- Check Tailwind classes are correct
- Verify `tailwind.config.js`
- Clear browser cache

## Getting Help

1. Check documentation in `docs/`
2. Review existing similar code
3. Check browser console for errors
4. Review Firebase console
5. Read error messages carefully

## Related Documentation

- [React Concepts](REACT_CONCEPTS.md) - React patterns used
- [Architecture Overview](../architecture/OVERVIEW.md) - System design
- [Setup Guide](../setup/FIREBASE_SETUP.md) - Configuration details

---

**Last Updated**: November 2025

