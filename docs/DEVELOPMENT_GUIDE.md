# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ (recommended: use nvm for version management)
- npm or yarn package manager
- Git for version control
- VS Code (recommended) with extensions:
  - ES7+ React/Redux/React-Native snippets
  - TypeScript Importer
  - Tailwind CSS IntelliSense
  - Prettier - Code formatter
  - ESLint

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd customer-engagement-hub

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

## Project Structure Deep Dive

```
customer-engagement-hub/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx               # Root layout with providers
│   │   ├── page.tsx                 # Main application page
│   │   ├── globals.css              # Global styles and Tailwind
│   │   └── loading.tsx              # Loading UI component
│   ├── components/                  # React components
│   │   ├── ui/                      # Reusable UI components
│   │   │   ├── MultiSelect.tsx      # Multi-select dropdown component
│   │   │   └── CopyableField.tsx    # Copy-to-clipboard component
│   │   ├── CustomerForm.tsx         # Customer creation/editing form
│   │   ├── CustomerList.tsx         # Customer directory component
│   │   ├── CustomerNotes.tsx        # Notes management component
│   │   ├── CustomerManagement.tsx   # CRUD interface for customers
│   │   ├── NoteForm.tsx             # Note creation/editing form
│   │   └── SlideOutPanel.tsx        # Note details slide-out panel
│   ├── lib/                         # Utility libraries
│   │   ├── utils.ts                 # General utility functions
│   │   ├── firebase.ts              # Firebase configuration and helpers
│   │   ├── ai.ts                    # Gemini AI integration
│   │   ├── customerNotes.ts         # Customer notes utilities
│   │   └── seTemplate.ts            # SE note templates and generation
│   └── types/                       # TypeScript type definitions
│       └── index.ts                 # All type definitions
├── data/                            # Data and configuration
│   ├── dummyData.ts                 # Dummy data generation
│   ├── dxpPools.ts                  # DXP objectives and use cases
│   └── Customer Engagement*.csv     # Real customer data files
├── docs/                            # Documentation
│   ├── ARCHITECTURE.md              # System architecture documentation
│   ├── NEXTJS_REACT_CONCEPTS.md     # Next.js and React concepts
│   ├── API_DOCUMENTATION.md         # API documentation
│   └── DEVELOPMENT_GUIDE.md         # This file
├── public/                          # Static assets
├── .env.example                     # Environment variables template
├── .env.local                       # Local environment variables
├── .gitignore                       # Git ignore rules
├── .eslintrc.json                   # ESLint configuration
├── .prettierrc                      # Prettier configuration
├── next.config.js                   # Next.js configuration
├── package.json                     # Dependencies and scripts
├── tailwind.config.js               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # Project README
```

## Development Workflow

### 1. Feature Development
```bash
# Create a new feature branch
git checkout -b feature/customer-search-enhancement

# Make your changes
# ... edit files ...

# Test your changes
npm run dev
npm run lint
npm run type-check

# Commit your changes
git add .
git commit -m "feat: enhance customer search functionality"

# Push to remote
git push origin feature/customer-search-enhancement
```

### 2. Code Quality Checks
```bash
# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Type checking
npm run type-check

# Build test
npm run build
```

### 3. Testing
```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Component Development

### Creating a New Component

#### 1. Component Structure
```typescript
// src/components/NewComponent.tsx
'use client';

import { useState, useEffect } from 'react';
import { SomeIcon } from 'lucide-react';

interface NewComponentProps {
  // Define props interface
  title: string;
  onAction: (data: any) => void;
  optional?: boolean;
}

export function NewComponent({ 
  title, 
  onAction, 
  optional = false 
}: NewComponentProps) {
  // Component state
  const [isLoading, setIsLoading] = useState(false);
  
  // Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // Event handlers
  const handleClick = () => {
    setIsLoading(true);
    onAction({ data: 'example' });
    setIsLoading(false);
  };
  
  // Render
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {title}
      </h2>
      
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Loading...' : 'Action'}
      </button>
    </div>
  );
}
```

#### 2. Type Definitions
```typescript
// src/types/index.ts
export interface NewComponentData {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewComponentFormData {
  name: string;
  description: string;
}
```

#### 3. Utility Functions
```typescript
// src/lib/newComponentUtils.ts
import { NewComponentData } from '@/types';

export const validateNewComponent = (data: Partial<NewComponentData>): boolean => {
  return !!(data.name && data.name.length > 0);
};

export const formatNewComponent = (data: NewComponentData): string => {
  return `${data.name} - ${data.description || 'No description'}`;
};
```

### Component Testing
```typescript
// src/components/__tests__/NewComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { NewComponent } from '../NewComponent';

describe('NewComponent', () => {
  it('renders with title', () => {
    render(<NewComponent title="Test Title" onAction={jest.fn()} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onAction when button is clicked', () => {
    const mockOnAction = jest.fn();
    render(<NewComponent title="Test" onAction={mockOnAction} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnAction).toHaveBeenCalledWith({ data: 'example' });
  });
});
```

## State Management Patterns

### Local State with useState
```typescript
// Simple state
const [count, setCount] = useState(0);

// Complex state
const [customer, setCustomer] = useState<Customer | null>(null);

// State updates
setCount(prev => prev + 1);
setCustomer(prev => ({ ...prev, name: 'Updated' }));
```

### Derived State with useMemo
```typescript
// Expensive calculations
const filteredCustomers = useMemo(() => {
  return customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [customers, searchTerm]);

// Complex transformations
const customerStats = useMemo(() => {
  return {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    inactive: customers.filter(c => c.status === 'inactive').length,
  };
}, [customers]);
```

### Function Memoization with useCallback
```typescript
// Memoized functions
const handleSaveCustomer = useCallback((customer: Customer) => {
  setCustomers(prev => [...prev, customer]);
}, []);

const handleDeleteCustomer = useCallback((id: string) => {
  setCustomers(prev => prev.filter(c => c.id !== id));
}, []);
```

## Form Handling

### React Hook Form Setup
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema definition
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18 or older'),
});

type FormData = z.infer<typeof formSchema>;

// Form component
export function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      age: 18,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await saveData(data);
      toast.success('Data saved successfully');
    } catch (error) {
      toast.error('Failed to save data');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input
          {...register('name')}
          placeholder="Name"
          className="w-full p-2 border rounded"
        />
        {errors.name && (
          <span className="text-red-500">{errors.name.message}</span>
        )}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

## API Integration

### Firebase Integration
```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### API Client
```typescript
// src/lib/api.ts
class APIClient {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
}

export const apiClient = new APIClient('/api');
```

## Styling Guidelines

### Tailwind CSS Patterns
```typescript
// Component styling patterns
const styles = {
  // Cards
  card: 'bg-white rounded-xl shadow-sm border border-gray-100 p-6',
  
  // Buttons
  primaryButton: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors',
  secondaryButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors',
  
  // Inputs
  input: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  
  // Layout
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  grid: 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6',
  
  // Typography
  heading: 'text-2xl font-bold text-gray-900',
  subheading: 'text-lg font-semibold text-gray-800',
  body: 'text-gray-700',
  caption: 'text-sm text-gray-500',
};
```

### Responsive Design
```typescript
// Responsive patterns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
</div>

<div className="flex flex-col lg:flex-row gap-4">
  {/* Mobile: vertical stack, Desktop: horizontal */}
</div>

<div className="hidden md:block">
  {/* Hidden on mobile, visible on tablet and up */}
</div>
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy loading components
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Image Optimization
```typescript
import Image from 'next/image';

// Optimized image loading
<Image
  src="/customer-logo.png"
  alt="Customer Logo"
  width={200}
  height={100}
  priority // For above-the-fold images
/>
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npm run analyze

# Check for unused dependencies
npx depcheck
```

## Debugging

### Development Tools
```typescript
// Debug logging
const debug = process.env.NODE_ENV === 'development';

if (debug) {
  console.log('Customer data:', customer);
  console.log('Form state:', formState);
}

// React DevTools
// Install React Developer Tools browser extension

// Next.js debugging
// Add to next.config.js
module.exports = {
  experimental: {
    logging: {
      level: 'verbose',
    },
  },
};
```

### Error Handling
```typescript
// Error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

## Deployment

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
NEXT_PUBLIC_FIREBASE_API_KEY=prod_key
NEXT_PUBLIC_GEMINI_API_KEY=prod_key
```

### Build Process
```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to Vercel
vercel --prod
```

### Performance Monitoring
```typescript
// Add performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Best Practices

### Code Organization
1. **Single Responsibility** - Each component should have one purpose
2. **Composition over Inheritance** - Use component composition
3. **Props Interface** - Always define TypeScript interfaces for props
4. **Custom Hooks** - Extract reusable logic into custom hooks
5. **Constants** - Extract magic numbers and strings to constants

### Performance
1. **Memoization** - Use React.memo, useMemo, useCallback appropriately
2. **Lazy Loading** - Load components and data when needed
3. **Image Optimization** - Use Next.js Image component
4. **Bundle Size** - Monitor and optimize bundle size

### Security
1. **Input Validation** - Validate all user inputs
2. **Environment Variables** - Keep secrets in environment variables
3. **HTTPS** - Use HTTPS in production
4. **Content Security Policy** - Implement CSP headers

### Accessibility
1. **Semantic HTML** - Use proper HTML elements
2. **ARIA Labels** - Add appropriate ARIA attributes
3. **Keyboard Navigation** - Ensure keyboard accessibility
4. **Screen Reader Support** - Test with screen readers

## Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

#### Runtime Errors
```bash
# Check browser console for errors
# Use React DevTools for component debugging
# Check Network tab for API errors
```

#### Performance Issues
```bash
# Analyze bundle size
npm run analyze

# Check for memory leaks
# Use React Profiler
# Monitor network requests
```

### Getting Help
1. Check the documentation
2. Review error messages carefully
3. Search GitHub issues
4. Ask for help in team channels
5. Create detailed bug reports
