# Project Architecture & Flow Documentation

## Application Flow Diagram

```mermaid
graph TB
    A[User Access] --> B[Main Page]
    B --> C{Tab Selection}
    
    C -->|Customer Notes| D[Notes Tab]
    C -->|Customer Management| E[Management Tab]
    
    D --> F[Customer List]
    D --> G[Notes Display]
    F --> H[Select Customer]
    H --> G
    G --> I[Add/Edit Note]
    I --> J[Note Form]
    J --> K[Save Note]
    K --> G
    
    E --> L[Customer Directory]
    L --> M[Search & Filter]
    L --> N[Customer Cards]
    N --> O[Expand Details]
    N --> P[View Customer]
    N --> Q[Edit Customer]
    N --> R[Delete Customer]
    
    Q --> S[Customer Form]
    S --> T[Save Customer]
    T --> L
    
    P --> U[Customer Details Modal]
    U --> V[Stakeholder Info]
    U --> W[Product Details]
    U --> X[Partner Info]
    
    Y[AI Integration] --> J
    Z[Firebase] --> K
    Z --> T
    AA[Real Data] --> L
    AA --> F
```

## Component Architecture

```mermaid
graph LR
    A[App Page] --> B[CustomerManagement]
    A --> C[CustomerList]
    A --> D[CustomerNotes]
    A --> E[SlideOutPanel]
    
    B --> F[CustomerForm]
    D --> G[NoteForm]
    
    F --> H[MultiSelect]
    G --> H
    G --> I[CopyableField]
    
    J[Data Layer] --> K[dummyData.ts]
    J --> L[firebase.ts]
    J --> M[ai.ts]
    
    K --> A
    L --> A
    M --> G
```

## Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as UI Components
    participant S as State Management
    participant D as Data Layer
    participant F as Firebase
    participant AI as Gemini AI
    
    U->>UI: Select Customer
    UI->>S: Update Selected Customer
    S->>UI: Re-render Notes
    
    U->>UI: Add Note
    UI->>D: Generate Note Data
    D->>AI: Generate SE Notes
    AI-->>D: Return Generated Content
    D->>S: Save Note
    S->>F: Persist to Database
    F-->>S: Confirm Save
    S->>UI: Update UI
    
    U->>UI: Edit Customer
    UI->>S: Update Customer Data
    S->>F: Save Customer
    F-->>S: Confirm Save
    S->>UI: Refresh Customer List
```

## State Management Flow

```mermaid
stateDiagram-v2
    [*] --> InitialLoad
    InitialLoad --> DataLoaded
    
    DataLoaded --> CustomerSelected
    DataLoaded --> CustomerManagement
    
    CustomerSelected --> NotesDisplay
    NotesDisplay --> AddNote
    NotesDisplay --> EditNote
    NotesDisplay --> ViewNote
    
    AddNote --> NoteForm
    EditNote --> NoteForm
    NoteForm --> SaveNote
    SaveNote --> NotesDisplay
    
    CustomerManagement --> AddCustomer
    CustomerManagement --> EditCustomer
    CustomerManagement --> DeleteCustomer
    CustomerManagement --> ViewCustomer
    
    AddCustomer --> CustomerForm
    EditCustomer --> CustomerForm
    CustomerForm --> SaveCustomer
    SaveCustomer --> CustomerManagement
    
    ViewCustomer --> CustomerModal
    ViewNote --> SlideOutPanel
```

## Next.js App Router Structure

```
app/
├── layout.tsx          # Root layout with providers
├── page.tsx            # Main application page
├── globals.css         # Global styles
└── loading.tsx         # Loading UI (optional)
```

## React Component Hierarchy

```
App (page.tsx)
├── Header
│   ├── Title
│   ├── Stats Cards
│   └── Add Customer Button
├── Search & Filters
│   ├── Search Input
│   ├── Sort Dropdown
│   └── Sort Direction
├── Tab Navigation
│   ├── Customer Notes Tab
│   └── Customer Management Tab
├── Tab Content
│   ├── Customer Notes View
│   │   ├── CustomerList
│   │   └── CustomerNotes
│   └── Customer Management View
│       └── CustomerManagement
├── Modals
│   ├── CustomerForm
│   ├── NoteForm
│   └── Customer Details Modal
└── SlideOutPanel
```

## Data Models & Relationships

```mermaid
erDiagram
    CUSTOMER ||--o{ CUSTOMER_NOTE : has
    CUSTOMER ||--o{ CUSTOMER_CONTACT : has
    CUSTOMER ||--o{ INTERNAL_CONTACT : has
    CUSTOMER ||--o{ PARTNER : has
    CUSTOMER ||--o{ PRODUCT : uses
    
    CUSTOMER {
        string id PK
        string customerName
        string website
        string sharePointUrl
        string salesforceLink
        string additionalInfo
        datetime createdAt
        datetime updatedAt
    }
    
    CUSTOMER_NOTE {
        string id PK
        string customerId FK
        string notes
        datetime noteDate
        string createdBy
        string updatedBy
        string businessProblem
        string whyUs
        string whyNow
        boolean techSelect
        string seConfidence
        string seNotes
        datetime createdAt
        datetime updatedAt
    }
    
    CUSTOMER_CONTACT {
        string id PK
        string name
        string email
        string phone
        string role
    }
    
    INTERNAL_CONTACT {
        string id PK
        string name
        string role
        string email
    }
    
    PARTNER {
        string id PK
        string name
        string type
        string website
    }
    
    PRODUCT {
        string id PK
        string name
        string version
        string description
        string status
    }
```

## API Integration Points

```mermaid
graph LR
    A[Frontend] --> B[Firebase SDK]
    A --> C[Gemini API]
    
    B --> D[Firestore Database]
    B --> E[Authentication]
    B --> F[Storage]
    
    C --> G[AI Content Generation]
    C --> H[Text Analysis]
    
    I[Real Data] --> J[CSV Import]
    J --> K[Dummy Data Generator]
    K --> A
```

## Security & Environment

```mermaid
graph TB
    A[Environment Variables] --> B[.env.local]
    B --> C[Firebase Config]
    B --> D[Gemini API Key]
    B --> E[App Configuration]
    
    F[Security Measures] --> G[Input Validation]
    F --> H[Type Safety]
    F --> I[Environment Isolation]
    F --> J[HTTPS Only]
    
    K[Data Protection] --> L[Client-side Validation]
    K --> M[Server-side Validation]
    K --> N[Secure API Keys]
```

## Performance Optimizations

```mermaid
graph LR
    A[Performance] --> B[Next.js Optimizations]
    A --> C[React Optimizations]
    A --> D[Bundle Optimizations]
    
    B --> E[App Router]
    B --> F[Static Generation]
    B --> G[Image Optimization]
    
    C --> H[useMemo]
    C --> I[useCallback]
    C --> J[Component Memoization]
    
    D --> K[Code Splitting]
    D --> L[Tree Shaking]
    D --> M[Bundle Analysis]
```

## Development Workflow

```mermaid
graph LR
    A[Development] --> B[Local Development]
    A --> C[Testing]
    A --> D[Deployment]
    
    B --> E[npm run dev]
    B --> F[Hot Reload]
    B --> G[TypeScript Check]
    
    C --> H[Linting]
    C --> I[Type Checking]
    C --> J[Build Test]
    
    D --> K[Build Production]
    D --> L[Deploy to Vercel]
    D --> M[Environment Setup]
```

## Error Handling & Monitoring

```mermaid
graph TB
    A[Error Handling] --> B[Client-side Errors]
    A --> C[Server-side Errors]
    A --> D[API Errors]
    
    B --> E[React Error Boundaries]
    B --> F[Try-Catch Blocks]
    B --> G[User Feedback]
    
    C --> H[Next.js Error Pages]
    C --> I[API Error Responses]
    
    D --> J[Firebase Error Handling]
    D --> K[Gemini API Errors]
    
    L[Monitoring] --> M[Console Logging]
    L --> N[Error Tracking]
    L --> O[Performance Monitoring]
```
