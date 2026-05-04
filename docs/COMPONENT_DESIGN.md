# Component Design Guide

This guide explains how we structure components for **reusability**, **maintainability**, and **consistency**. It's written for junior developers joining the team.

## 📋 Table of Contents

1. [Design Principles](#design-principles)
2. [Component Hierarchy](#component-hierarchy)
3. [Reusable UI Components](#reusable-ui-components)
4. [Custom Hooks](#custom-hooks)
5. [File Organization](#file-organization)
6. [Adding New Components](#adding-new-components)
7. [Common Patterns](#common-patterns)

---

## Design Principles

### 1. Single Responsibility

Each component should do **one thing** well.

```tsx
// ✅ Good: TypeBadge only displays a colored badge
<TypeBadge label="Customer" variant="purple" />

// ❌ Bad: Component that renders badge + handles click + fetches data
```

### 2. Composition Over Inheritance

Build complex UIs by combining small components.

```tsx
// ✅ Good: Compose smaller pieces
<DetailCard>
  <Avatar name={contact.name} />
  <DetailRow label="Email" value={contact.email} icon={Mail} />
</DetailCard>

// ❌ Bad: One giant component with everything inline
```

### 3. Separation of Concerns

- **UI components** → Presentational only (no business logic)
- **Custom hooks** → Business logic (state, API calls, filtering)
- **Orchestrator components** → Coordinate children, wire up hooks

### 4. Reusability

Before writing new UI, check if a reusable component exists:

| Need | Use |
|------|-----|
| Colored badge (Customer, Active, etc.) | `TypeBadge` |
| Key-value row with icon | `DetailRow` |
| Avatar with initials | `Avatar` |
| Role/title badge | `TitleBadge` |
| Copyable link | `LinkWithCopy` |

---

## Component Hierarchy

```
Page (page.tsx)
  └── Orchestrator (e.g., EntityManagement, CustomerList)
        ├── Custom Hook (useEntityManagement, useCustomerFilters)
        ├── Header / Tabs / Search
        ├── List/Table (presentational)
        └── Detail Panel (uses TypeBadge, DetailRow, Avatar)
```

### Dashboard shell (`components/home/`)

Widgets that only belong to the main engagement hub dashboard (not generic feature UI) live under **`src/components/home/`** — e.g. **`StatCard`** (optional **`hint`** under a metric), **`HomeTabButton`** (`role="tab"`, **`aria-selected`**, **`aria-controls`** linking to **`page.tsx`**’s **`role="tabpanel"`** workspace region). Import from `@/components/home` in `app/page.tsx`.

### Journey documentation

High-level UX flows (warm start, onboarding a logo, tab roles) live in **`docs/CUSTOMER_JOURNEY.md`** and should stay aligned when adding major tabs or workflows.

### Domain-backed behavior

Rules that are **not** about rendering (e.g. “which task IDs to delete when a customer is removed”) belong in **`src/domain/`** as pure functions; hooks and services call those functions instead of duplicating logic in pages.

### Orchestrator Pattern

Large features use an **orchestrator** that:

1. Uses a custom hook for logic
2. Renders child components
3. Passes props down (no business logic in children)

```tsx
// EntityManagement.tsx (Orchestrator)
export function EntityManagement(props) {
  const { activeTab, filteredAndSortedData, handleSelectItem, ... } = useEntityManagement(data, callbacks);

  return (
    <div>
      <Tabs activeTab={activeTab} onChange={handleTabChange} />
      <EntityListTable items={filteredAndSortedData} onSelect={handleSelectItem} />
      <EntityDetailCard item={selectedItem} />
    </div>
  );
}
```

---

## Reusable UI Components

Located in `src/components/ui/`. Import from `@/components/ui`.

### TypeBadge

Colored badge for type/status (Customer, Lead, Active, etc.).

```tsx
import { TypeBadge } from '@/components/ui';

<TypeBadge label="Customer" variant="purple" />
<TypeBadge label="Active" variant="green" />
<TypeBadge label="Partner" variant="orange" />
```

**Variants:** `purple` | `blue` | `green` | `red` | `amber` | `orange` | `teal` | `gray`

### DetailRow

Key-value row for detail panels. Optional icon.

```tsx
import { DetailRow } from '@/components/ui';
import { Mail } from 'lucide-react';

<DetailRow label="Email" value="user@example.com" icon={Mail} />
<DetailRow label="Status" value={<TypeBadge label="Active" variant="green" />} />
```

### Avatar

Avatar with initials or custom fallback (e.g., icon for products).

```tsx
import { Avatar } from '@/components/ui';

<Avatar name="John Doe" />           // Shows "JD"
<Avatar fallback={<PackageIcon />} /> // Shows icon
<Avatar name="Jane" size="sm" />     // Smaller
```

**Sizes:** `sm` | `md` | `lg`

### TitleBadge

Subtle badge for roles, versions, secondary metadata.

```tsx
import { TitleBadge } from '@/components/ui';

<TitleBadge>CEO</TitleBadge>
<TitleBadge>v2.0</TitleBadge>
```

### LinkWithCopy

Link with copy-to-clipboard button.

```tsx
import { LinkWithCopy } from '@/components/ui';

<LinkWithCopy url="https://example.com" label="Website" />
```

---

## Custom Hooks

Hooks hold **business logic** so components stay presentational.

### useEntityManagement

Handles Entity Management: tabs, search, sort, CRUD.

```tsx
// In EntityManagement.tsx
const {
  activeTab,
  filteredAndSortedData,
  selectedItem,
  handleSelectItem,
  handleDelete,
  handleTabChange,
  ...
} = useEntityManagement(data, callbacks);
```

**Returns:** State + handlers. Component only renders.

### useCustomerFilters / useCustomerSearch / useCustomerSort

Customer list filtering, search, and sorting. See `src/hooks/`.

### Creating a New Hook

```tsx
// src/hooks/useMyFeature.ts
export function useMyFeature(initialData: MyType[]) {
  const [items, setItems] = useState(initialData);
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => 
    items.filter(i => i.name.includes(filter)), 
    [items, filter]
  );

  return { items: filtered, setItems, filter, setFilter };
}
```

---

## File Organization

```
src/
├── components/
│   ├── ui/                 # Reusable, generic UI
│   │   ├── TypeBadge.tsx
│   │   ├── DetailRow.tsx
│   │   ├── Avatar.tsx
│   │   ├── TitleBadge.tsx
│   │   ├── LinkWithCopy.tsx
│   │   └── index.ts        # Barrel export
│   │
│   ├── customers/          # Customer domain
│   │   ├── CustomerGridCard.tsx
│   │   ├── CustomerTableView.tsx
│   │   └── index.ts
│   │
│   ├── forms/              # Form components
│   │   ├── CustomerContactForm.tsx
│   │   └── ProductForm.tsx
│   │
│   └── EntityManagement.tsx  # Orchestrator
│
├── hooks/
│   ├── useEntityManagement.ts
│   ├── useCustomerFilters.ts
│   └── index.ts
│
└── types/
    └── ...
```

### Rules

- **`ui/`** → Generic, no domain logic. Used everywhere.
- **`customers/`** → Customer-specific. Can use `ui/` components.
- **`forms/`** → Form components. Can use `ui/` components.
- **Hooks** → One hook per feature/domain. Export from `hooks/index.ts`.

---

## Adding New Components

### 1. Reusable UI Component

```bash
# Create file
touch src/components/ui/MyNewComponent.tsx
```

```tsx
// src/components/ui/MyNewComponent.tsx
'use client';

interface MyNewComponentProps {
  label: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function MyNewComponent({ label, variant = 'primary', className = '' }: MyNewComponentProps) {
  return (
    <div className={`... ${className}`}>
      {label}
    </div>
  );
}
```

Add to `src/components/ui/index.ts`:

```ts
export * from './MyNewComponent';
```

### 2. Domain Component

```bash
mkdir -p src/components/myfeature
touch src/components/myfeature/MyFeatureCard.tsx
touch src/components/myfeature/index.ts
```

Use `ui/` components inside. Export from `index.ts`.

### 3. Custom Hook

```bash
touch src/hooks/useMyFeature.ts
```

Add to `src/hooks/index.ts`:

```ts
export * from './useMyFeature';
```

---

## Common Patterns

### Split Layout (List + Detail)

Used in Entity Management. Left: table. Right: detail card when item selected.

```tsx
<div className="flex flex-col xl:flex-row gap-4">
  <div className="flex-1">
    <table>...</table>
  </div>
  <div className="xl:w-[55%]">
    {selectedItem ? <DetailCard item={selectedItem} /> : <EmptyState />}
  </div>
</div>
```

### Empty State

When no data, show helpful message + CTA.

```tsx
{items.length === 0 ? (
  <div className="p-12 text-center">
    <Icon />
    <h3>No items found</h3>
    <button onClick={onAdd}>Add First Item</button>
  </div>
) : (
  <ItemList items={items} />
)}
```

### Action Buttons (Edit, Delete)

Use `onClick={(e) => e.stopPropagation()}` on the button container so row click doesn't fire.

```tsx
<tr onClick={() => onSelect(item)}>
  <td>...</td>
  <td onClick={(e) => e.stopPropagation()}>
    <button onClick={() => onEdit(item)}>Edit</button>
    <button onClick={() => onDelete(item.id)}>Delete</button>
  </td>
</tr>
```

---

## Checklist for New Features

- [ ] Check if `ui/` component exists before creating new UI
- [ ] Extract logic to custom hook if > 50 lines
- [ ] Use TypeScript interfaces for all props
- [ ] Add JSDoc comments for reusable components
- [ ] Export from `index.ts` for clean imports
- [ ] Keep components under ~200 lines; split if larger

---

## Related Docs

- [JUNIOR_DEVELOPER_GUIDE.md](JUNIOR_DEVELOPER_GUIDE.md) – React/Next.js/TypeScript concepts
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) – Project structure, adding features
- [ARCHITECTURE.md](ARCHITECTURE.md) – System layers and data flow
