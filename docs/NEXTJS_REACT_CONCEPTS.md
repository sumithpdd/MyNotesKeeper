# Next.js & React Concepts Documentation

## Next.js 15 Concepts

### App Router Architecture
The application uses Next.js 15's App Router, which provides a modern, file-based routing system with improved performance and developer experience.

#### Key Features:
- **Server Components** - Components that render on the server by default
- **Client Components** - Components that run in the browser (marked with 'use client')
- **Nested Routing** - File-based routing with nested layouts
- **Streaming** - Progressive page loading for better UX
- **Turbopack** - Fast development builds

#### File Structure:
```
src/app/
├── layout.tsx          # Root layout (Server Component)
├── page.tsx            # Home page (Client Component)
├── globals.css         # Global styles
└── loading.tsx         # Loading UI (optional)
```

### Server vs Client Components

#### Server Components (Default)
```typescript
// layout.tsx - Server Component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

#### Client Components
```typescript
// page.tsx - Client Component
'use client';

import { useState } from 'react';

export default function HomePage() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}
```

### Environment Variables
Next.js provides built-in support for environment variables with different prefixes:

#### Public Variables (Client-side)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

#### Server-only Variables
```env
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
```

### Static Generation & SSR
```typescript
// Static generation at build time
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
  ]
}

// Server-side rendering
export async function getServerSideProps() {
  const data = await fetchData();
  return { props: { data } };
}
```

## React Concepts

### Hooks Usage

#### useState Hook
```typescript
// Basic state management
const [customers, setCustomers] = useState<Customer[]>([]);
const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

// State updates
setCustomers(prev => [...prev, newCustomer]);
setSelectedCustomer(customerId);
```

#### useEffect Hook
```typescript
// Side effects and lifecycle
useEffect(() => {
  // Fetch data on component mount
  fetchCustomers();
}, []);

useEffect(() => {
  // Update when dependencies change
  if (selectedCustomer) {
    fetchCustomerNotes(selectedCustomer);
  }
}, [selectedCustomer]);
```

#### useMemo Hook
```typescript
// Expensive calculations memoization
const filteredCustomers = useMemo(() => {
  return customers.filter(customer =>
    customer.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [customers, searchTerm]);
```

#### useCallback Hook
```typescript
// Function memoization
const handleSaveCustomer = useCallback((customer: Customer) => {
  setCustomers(prev => [...prev, customer]);
}, []);
```

### Component Patterns

#### Props Interface
```typescript
interface CustomerFormProps {
  customer?: Customer;
  onSave: (customer: Customer) => void;
  onCancel: () => void;
}

export function CustomerForm({ customer, onSave, onCancel }: CustomerFormProps) {
  // Component implementation
}
```

#### Children Pattern
```typescript
interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="container">
      {children}
    </div>
  );
}
```

#### Render Props Pattern
```typescript
interface DataProviderProps {
  children: (data: any) => React.ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [data, setData] = useState(null);
  
  return <>{children(data)}</>;
}
```

### State Management Patterns

#### Lifting State Up
```typescript
// Parent component manages shared state
function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  return (
    <div>
      <CustomerList 
        customers={customers}
        onSelectCustomer={setSelectedCustomer}
      />
      <CustomerDetails 
        customer={selectedCustomer}
        onUpdateCustomer={setCustomers}
      />
    </div>
  );
}
```

#### Context API
```typescript
// Create context
const CustomerContext = createContext<{
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
}>({
  customers: [],
  setCustomers: () => {},
});

// Provider component
export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  return (
    <CustomerContext.Provider value={{ customers, setCustomers }}>
      {children}
    </CustomerContext.Provider>
  );
}

// Hook to use context
export function useCustomers() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomers must be used within CustomerProvider');
  }
  return context;
}
```

### Form Handling

#### React Hook Form Integration
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema definition
const customerSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  website: z.string().optional(),
  products: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
});

type CustomerFormData = z.infer<typeof customerSchema>;

// Form component
export function CustomerForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerName: '',
      website: '',
      products: [],
    }
  });

  const onSubmit = async (data: CustomerFormData) => {
    // Handle form submission
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('customerName')}
        placeholder="Customer Name"
      />
      {errors.customerName && (
        <span className="error">{errors.customerName.message}</span>
      )}
      
      <button type="submit" disabled={isSubmitting}>
        Save Customer
      </button>
    </form>
  );
}
```

### Error Handling

#### Error Boundaries
```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

#### Try-Catch in Async Functions
```typescript
const handleSaveCustomer = async (customer: Customer) => {
  try {
    setLoading(true);
    await saveCustomerToFirebase(customer);
    setCustomers(prev => [...prev, customer]);
    toast.success('Customer saved successfully');
  } catch (error) {
    console.error('Error saving customer:', error);
    toast.error('Failed to save customer');
  } finally {
    setLoading(false);
  }
};
```

### Performance Optimization

#### Component Memoization
```typescript
// Memoize expensive components
const CustomerCard = React.memo(({ customer }: { customer: Customer }) => {
  return (
    <div className="customer-card">
      <h3>{customer.customerName}</h3>
      <p>{customer.website}</p>
    </div>
  );
});

// Memoize with custom comparison
const CustomerList = React.memo(
  ({ customers }: { customers: Customer[] }) => {
    return (
      <div>
        {customers.map(customer => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.customers.length === nextProps.customers.length;
  }
);
```

#### Virtual Scrolling
```typescript
// For large lists
import { FixedSizeList as List } from 'react-window';

const VirtualizedCustomerList = ({ customers }: { customers: Customer[] }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <CustomerCard customer={customers[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={customers.length}
      itemSize={120}
    >
      {Row}
    </List>
  );
};
```

### TypeScript Integration

#### Generic Components
```typescript
interface SelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
  getValue: (option: T) => string;
}

function Select<T>({ options, value, onChange, getLabel, getValue }: SelectProps<T>) {
  return (
    <select
      value={value ? getValue(value) : ''}
      onChange={(e) => {
        const option = options.find(opt => getValue(opt) === e.target.value);
        if (option) onChange(option);
      }}
    >
      {options.map(option => (
        <option key={getValue(option)} value={getValue(option)}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  );
}
```

#### Utility Types
```typescript
// Partial for optional updates
type UpdateCustomerData = Partial<Customer>;

// Pick for specific fields
type CustomerSummary = Pick<Customer, 'id' | 'customerName' | 'website'>;

// Omit for excluding fields
type CreateCustomerData = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;

// Record for key-value pairs
type CustomerStatus = Record<string, 'active' | 'inactive' | 'pending'>;
```

### Testing Patterns

#### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomerForm } from './CustomerForm';

describe('CustomerForm', () => {
  it('should render form fields', () => {
    render(<CustomerForm onSave={jest.fn()} onCancel={jest.fn()} />);
    
    expect(screen.getByPlaceholderText('Customer Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Customer' })).toBeInTheDocument();
  });

  it('should call onSave when form is submitted', () => {
    const mockOnSave = jest.fn();
    render(<CustomerForm onSave={mockOnSave} onCancel={jest.fn()} />);
    
    fireEvent.change(screen.getByPlaceholderText('Customer Name'), {
      target: { value: 'Test Customer' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Customer' }));
    
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: 'Test Customer'
      })
    );
  });
});
```

#### Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCustomers } from './useCustomers';

describe('useCustomers', () => {
  it('should initialize with empty customers', () => {
    const { result } = renderHook(() => useCustomers());
    
    expect(result.current.customers).toEqual([]);
  });

  it('should add customer', () => {
    const { result } = renderHook(() => useCustomers());
    
    act(() => {
      result.current.addCustomer({
        id: '1',
        customerName: 'Test Customer',
        // ... other fields
      });
    });
    
    expect(result.current.customers).toHaveLength(1);
    expect(result.current.customers[0].customerName).toBe('Test Customer');
  });
});
```

## Best Practices

### Code Organization
1. **Component Co-location** - Keep related files together
2. **Custom Hooks** - Extract reusable logic
3. **Type Definitions** - Centralize types in dedicated files
4. **Constants** - Extract magic numbers and strings

### Performance
1. **Memoization** - Use React.memo, useMemo, useCallback appropriately
2. **Code Splitting** - Lazy load components when possible
3. **Bundle Analysis** - Regularly analyze bundle size
4. **Image Optimization** - Use Next.js Image component

### Accessibility
1. **Semantic HTML** - Use proper HTML elements
2. **ARIA Labels** - Add appropriate ARIA attributes
3. **Keyboard Navigation** - Ensure keyboard accessibility
4. **Screen Reader Support** - Test with screen readers

### Security
1. **Input Validation** - Validate all user inputs
2. **XSS Prevention** - Sanitize user-generated content
3. **Environment Variables** - Keep secrets in environment variables
4. **HTTPS** - Use HTTPS in production
