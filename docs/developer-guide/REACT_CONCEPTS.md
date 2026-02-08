# React Concepts & Patterns Used

## Overview

This guide explains the React concepts, patterns, and best practices used in the Customer Engagement Hub. It's designed to help junior developers understand how the application works.

## Core React Concepts

### 1. Functional Components

All components are functional (no class components).

**Example**:
```tsx
export function CustomerList({ customers, onSelect }: CustomerListProps) {
  return (
    <div>
      {customers.map(customer => (
        <div key={customer.id} onClick={() => onSelect(customer.id)}>
          {customer.customerName}
        </div>
      ))}
    </div>
  );
}
```

**Why Functional?**
- Simpler syntax
- Better with hooks
- Modern React standard
- Easier to understand

### 2. Props (Properties)

Components receive data through props.

**Example**:
```tsx
interface CustomerCardProps {
  customer: Customer;      // Data
  onEdit: (id: string) => void;  // Callback
  isSelected: boolean;     // State
}

export function CustomerCard({ customer, onEdit, isSelected }: CustomerCardProps) {
  return (
    <div className={isSelected ? 'selected' : ''}>
      <h3>{customer.customerName}</h3>
      <button onClick={() => onEdit(customer.id)}>Edit</button>
    </div>
  );
}
```

**Key Points**:
- Props are **read-only** (immutable)
- Use TypeScript interfaces for type safety
- Destructure props in function parameters
- Props flow **down** from parent to child

### 3. State (useState Hook)

State manages data that changes over time.

**Example**:
```tsx
export function CustomerForm() {
  const [customerName, setCustomerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await saveCustomer({ customerName });
      setCustomerName(''); // Reset form
    } catch (error) {
      setErrors(['Failed to save']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
      />
      <button disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

**Key Points**:
- State is **local** to the component
- Use `useState` to create state variables
- State updates trigger re-renders
- Never mutate state directly

### 4. Effects (useEffect Hook)

Effects run code in response to changes.

**Example**:
```tsx
export function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Run once on mount
  useEffect(() => {
    loadCustomers();
  }, []); // Empty array = run once

  // Run when user changes
  useEffect(() => {
    if (user) {
      loadFirebaseData();
    }
  }, [user]); // Run when user changes

  async function loadCustomers() {
    setLoading(true);
    const data = await customerService.getAllCustomers();
    setCustomers(data);
    setLoading(false);
  }

  return (
    <div>
      {loading ? <Spinner /> : <CustomerList customers={customers} />}
    </div>
  );
}
```

**Key Points**:
- Effects run **after** render
- Dependency array controls when effect runs
- Empty array `[]` = run once (on mount)
- Return cleanup function if needed

## Advanced Patterns

### 5. Lifting State Up

Share state between components by moving it to common parent.

**Example**:
```tsx
// Parent component (lifts state up)
export function CustomerManagement() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  return (
    <div>
      <CustomerList 
        customers={customers}
        onSelect={setSelectedCustomerId}  // Pass callback down
      />
      <CustomerDetails 
        customerId={selectedCustomerId}    // Pass state down
      />
    </div>
  );
}

// Child components receive state/callbacks
export function CustomerList({ customers, onSelect }) {
  return (
    <div>
      {customers.map(customer => (
        <div onClick={() => onSelect(customer.id)}>
          {customer.customerName}
        </div>
      ))}
    </div>
  );
}
```

**When to Lift State**:
- Two components need same data
- One component needs to update another
- Shared state management

### 6. Context (useContext Hook)

Share data across many components without prop drilling.

**Example**:
```tsx
// 1. Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Provide Context
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Use Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

// 4. In Components
export function UserHeader() {
  const { user } = useAuth(); // Access user anywhere
  return <div>Welcome, {user?.name}</div>;
}
```

**Used For**:
- Authentication state
- Theme preferences
- Global settings
- Avoid prop drilling

### 7. Custom Hooks

Reusable logic extracted into hooks.

**Example**:
```tsx
// Custom hook
function useCustomerData(customerId: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCustomer() {
      try {
        setLoading(true);
        const data = await customerService.getCustomer(customerId);
        setCustomer(data);
      } catch (err) {
        setError('Failed to load customer');
      } finally {
        setLoading(false);
      }
    }

    loadCustomer();
  }, [customerId]);

  return { customer, loading, error };
}

// Usage in component
export function CustomerDetails({ customerId }: { customerId: string }) {
  const { customer, loading, error } = useCustomerData(customerId);

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;
  return <div>{customer?.customerName}</div>;
}
```

**Benefits**:
- Reuse logic across components
- Keep components clean
- Easier testing

### 8. useMemo Hook

Optimize expensive calculations.

**Example**:
```tsx
export function CustomerList({ customers, searchTerm }: Props) {
  // Only recalculate when customers or searchTerm changes
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer =>
      customer.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  return (
    <div>
      {filteredCustomers.map(customer => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}
    </div>
  );
}
```

**When to Use**:
- Expensive calculations
- Filtering large lists
- Complex computations
- Avoid unnecessary re-calculations

## Component Patterns

### 9. Controlled Components

Form inputs controlled by React state.

**Example**:
```tsx
export function CustomerForm() {
  const [formData, setFormData] = useState({
    customerName: '',
    website: '',
    products: []
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form>
      <input
        value={formData.customerName}
        onChange={(e) => handleChange('customerName', e.target.value)}
      />
      <input
        value={formData.website}
        onChange={(e) => handleChange('website', e.target.value)}
      />
    </form>
  );
}
```

**Benefits**:
- React controls the value
- Easy validation
- Predictable behavior

### 10. Conditional Rendering

Show/hide elements based on conditions.

**Example**:
```tsx
export function CustomerDetails({ customer, loading, error }: Props) {
  // Early return for loading
  if (loading) {
    return <Spinner />;
  }

  // Early return for error
  if (error) {
    return <ErrorMessage message={error} />;
  }

  // Early return for no data
  if (!customer) {
    return <EmptyState message="No customer selected" />;
  }

  // Main render
  return (
    <div>
      <h2>{customer.customerName}</h2>
      {customer.website && (
        <a href={customer.website}>Visit Website</a>
      )}
      {customer.products.length > 0 ? (
        <ProductList products={customer.products} />
      ) : (
        <p>No products</p>
      )}
    </div>
  );
}
```

**Patterns**:
- `if` statements for early returns
- `&&` for conditional rendering
- Ternary `? :` for either/or
- Null checks for optional data

### 11. List Rendering

Render arrays of data.

**Example**:
```tsx
export function ProductList({ products }: { products: Product[] }) {
  return (
    <div>
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>
      ))}
    </div>
  );
}
```

**Key Points**:
- Always use `key` prop (unique ID)
- Keys help React identify changes
- Never use index as key (if list changes)
- Map returns new array of JSX elements

## Next.js Specific

### 12. 'use client' Directive

Mark components that use client-side features.

**Example**:
```tsx
'use client'; // Required for hooks, events, browser APIs

import { useState } from 'react';

export function InteractiveButton() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

**Use 'use client' When**:
- Using React hooks (useState, useEffect, etc.)
- Handling events (onClick, onChange, etc.)
- Using browser APIs (window, document, etc.)
- Accessing client-side storage

### 13. Server Components (Default)

Components that run on server (no 'use client').

**Example**:
```tsx
// No 'use client' directive = Server Component

export function StaticContent() {
  return (
    <div>
      <h1>Welcome to Customer Hub</h1>
      <p>This content is rendered on the server</p>
    </div>
  );
}
```

**Benefits**:
- Faster initial load
- Better SEO
- Smaller JavaScript bundle
- Direct database access

## Real Application Examples

### Example 1: Customer Management Component

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { customerService } from '@/lib/customerService';

export function CustomerManagement() {
  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Effect - Load data on mount
  useEffect(() => {
    loadCustomers();
  }, []);

  // Handler
  async function loadCustomers() {
    setLoading(true);
    const data = await customerService.getAllCustomers();
    setCustomers(data);
    setLoading(false);
  }

  // Conditional rendering
  if (loading) return <div>Loading...</div>;

  // Main render
  return (
    <div className="flex gap-4">
      <CustomerList 
        customers={customers}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <CustomerDetails 
        customerId={selectedId}
      />
    </div>
  );
}
```

### Example 2: Form with Validation

```tsx
'use client';

import { useState } from 'react';
import { Customer } from '@/types';

interface FormProps {
  initialData?: Customer;
  onSave: (data: Customer) => void;
  onCancel: () => void;
}

export function CustomerForm({ initialData, onSave, onCancel }: FormProps) {
  const [data, setData] = useState(initialData || { customerName: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.customerName) {
      newErrors.customerName = 'Name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          value={data.customerName}
          onChange={(e) => setData({...data, customerName: e.target.value})}
        />
        {errors.customerName && (
          <span className="error">{errors.customerName}</span>
        )}
      </div>
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}
```

## Common Mistakes to Avoid

### 1. Mutating State Directly

```tsx
// ❌ Wrong
const [items, setItems] = useState([]);
items.push(newItem); // Don't mutate!

// ✅ Correct
setItems([...items, newItem]); // Create new array
```

### 2. Missing Dependencies in useEffect

```tsx
// ❌ Wrong
useEffect(() => {
  loadData(customerId); // customerId not in deps!
}, []);

// ✅ Correct
useEffect(() => {
  loadData(customerId);
}, [customerId]); // Include all dependencies
```

### 3. Using Index as Key

```tsx
// ❌ Wrong (if list changes)
{items.map((item, index) => (
  <div key={index}>{item.name}</div>
))}

// ✅ Correct
{items.map((item) => (
  <div key={item.id}>{item.name}</div>
))}
```

### 4. Not Handling Async Properly

```tsx
// ❌ Wrong
useEffect(() => {
  async function load() {
    const data = await fetchData();
    setData(data); // Might set state after unmount!
  }
  load();
}, []);

// ✅ Correct
useEffect(() => {
  let mounted = true;
  async function load() {
    const data = await fetchData();
    if (mounted) setData(data); // Only if still mounted
  }
  load();
  return () => { mounted = false }; // Cleanup
}, []);
```

## Related Documentation

- [Getting Started](GETTING_STARTED.md) - Setup and basics
- [Architecture](../architecture/OVERVIEW.md) - Application design
- [Features](../features/) - Feature-specific guides

---

**Last Updated**: November 2025

