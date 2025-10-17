# Customer Engagement Hub

A comprehensive Next.js application for managing customer relationships, tracking engagement progress, and maintaining detailed customer notes. Built with React, TypeScript, and modern web technologies.

## 🚀 Features

### Customer Management (CRUD)
- **Create** - Add new customers with comprehensive information
- **Read** - View customer details, contacts, and engagement history
- **Update** - Edit customer information, contacts, and partnerships
- **Delete** - Remove customers with confirmation dialogs

### Customer Information
- **Customer Details** - Name, website, creation/update dates
- **Products** - Products (XM, XP, XM Cloud, OrderCloud, CDP, Personalize, Search)
- **Contacts** - Customer contacts and internal team members
- **Partners** - Implementation partners with websites and types
- **URLs** - SharePoint and Salesforce integration links
- **Stakeholders** - Complete stakeholder information management

### Customer Profiles & Notes Management
- **Customer Profiles** - Static business information (business problem, why Us, why now, objectives, use cases)
- **Dynamic Notes** - Interaction-specific notes with SE confidence tracking
- **SE Templates** - Solution Engineering note templates with auto-generation
- **Business Details** - Comprehensive business context per customer
- **Quick Hit Details** - Discovery status, demos, technical deep dives
- **Success Planning** - Customer objectives and use cases with predefined pools
- **AI Integration** - Gemini AI for content generation and template filling

### Advanced Features
- **Search & Filter** - Advanced search across customers, contacts, and partners
- **Sorting** - Sort by name, date, products, or engagement level
- **Pagination** - Efficient handling of large customer lists
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Updates** - Live data updates and state management

## 🎯 Customer Journey & Workflow

### 1. **Customer Onboarding**
```
1. Navigate to Customer Management tab
2. Click "Add Customer" button
3. Fill out customer form:
   - Customer Name (required)
   - Website URL
   - Products (multi-select from predefined list)
   - Customer Contacts (multi-select or add new)
   - Internal Contacts (multi-select or add new)
   - Partners (multi-select or add new)
   - SharePoint URL
   - Salesforce Link
   - Additional Link (for Loop docs, etc.)
4. Save customer
5. Customer appears in customer directory grid
```

### 2. **Customer Profile Setup**
```
1. Select customer from directory grid
2. View customer details in left panel
3. Click "Create Profile" in Customer Profile section
4. Fill out Customer Profile form:
   - Business Details (problem, why Us, why now, tech select)
   - Quick Hit Details (discovery, demos, tech deep dive)
   - Solution Engineering (SE involvement, notes, assessments)
   - Success Planning (objectives 1-3, use cases 1-3)
5. Use AI generation for objectives/use cases if needed
6. Save profile
```

### 3. **Adding Customer Notes**
```
1. With customer selected, view right panel
2. Click "Add Note" button
3. Fill out Note form:
   - Notes (detailed interaction notes)
   - Note Date
   - Created By
   - Updated By
   - SE Confidence (Green/Yellow/Red)
   - Other Fields (JSON for additional data)
4. Save note
5. Note appears in notes list on right panel
```

### 4. **Viewing Customer Information**
```
1. Customer Directory Grid View:
   - See all customers with key info
   - Website links, product badges
   - Contact/partner counts
   - Quick links to SharePoint/Salesforce

2. Customer Detail View (after selection):
   - Left Panel: Customer information + profile
   - Right Panel: Notes management
   - Quick links to external systems
   - Back button to return to grid
```

### 5. **Entity Management**
```
1. Navigate to Entity Management tab
2. Manage master data:
   - Customer Contacts (add/edit/delete)
   - Internal Contacts (add/edit/delete)
   - Products (add/edit/delete)
   - Partners (add/edit/delete)
3. Changes reflect across all customers
```

### 6. **Note Viewing & Management**
```
1. Click "View" button on any note
2. SlideOutPanel opens with:
   - Business Details (from customer profile)
   - Quick Hit Details (from customer profile)
   - Solution Engineering (from customer profile)
   - Success Planning (from customer profile)
   - Current Note Details
   - SE Confidence (from note)
3. Copy fields using copy buttons
4. Close panel to return to main view
```

### 7. **Data Flow Architecture**
```
Customer (Static) → Customer Profile (Static) → Customer Notes (Dynamic)
     ↓                        ↓                           ↓
- Basic Info              - Business Details           - Interaction Notes
- Contacts                - Discovery Info             - SE Confidence
- Products                - SE Assessments             - Note-specific Data
- Partners                - Objectives/Use Cases      - Timestamps
- URLs                    - Technical Details
```

## 🏗️ Architecture

### Database Architecture

#### Schema Design Philosophy
The application uses a **two-tier data model** that separates static customer information from dynamic interaction data:

#### **Customer Profile (Static Data)**
- **Purpose**: Stores business context that rarely changes
- **Contains**: Business problem, why Us, why now, objectives, use cases, SE assessments
- **Benefits**: Reduces data duplication, ensures consistency across interactions
- **Management**: One-time setup per customer, updated when business context changes

#### **Customer Notes (Dynamic Data)**
- **Purpose**: Stores interaction-specific information that changes frequently
- **Contains**: Meeting notes, SE confidence (per interaction), additional observations
- **Benefits**: Focused on what matters for each interaction, easier to maintain
- **Management**: Created for each customer interaction, tracks engagement over time

#### Data Relationships
```
Customer (1) ←→ (1) CustomerProfile
Customer (1) ←→ (Many) CustomerNotes
```

This design ensures:
- **Data Consistency** - Business context maintained in one place
- **Efficient Storage** - No duplication of static information
- **Better UX** - Clear separation between profile management and note taking
- **Scalability** - Easy to add new fields without affecting existing data

### Technology Stack
- **Framework**: Next.js 15.5.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **State Management**: React useState and useMemo
- **Data Storage**: Firebase Firestore (configured)
- **AI Integration**: Google Gemini API (configured)

### Project Structure
```
customer-engagement-hub/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Main application page
│   │   ├── layout.tsx               # Root layout
│   │   └── globals.css              # Global styles
│   ├── components/
│   │   ├── ui/
│   │   │   ├── MultiSelect.tsx      # Reusable multi-select component
│   │   │   └── CopyableField.tsx    # Copy-to-clipboard component
│   │   ├── CustomerForm.tsx         # Customer creation/editing form
│   │   ├── CustomerList.tsx         # Customer directory component
│   │   ├── CustomerNotes.tsx       # Notes management component
│   │   ├── CustomerManagement.tsx  # Unified CRUD interface for customers and notes
│   │   ├── CustomerProfileForm.tsx # Customer profile creation/editing form
│   │   ├── NoteForm.tsx            # Dynamic note creation/editing form
│   │   └── SlideOutPanel.tsx       # Note details panel
│   ├── lib/
│   │   ├── utils.ts                # Utility functions
│   │   ├── firebase.ts             # Firebase configuration
│   │   ├── ai.ts                   # Gemini AI integration
│   │   ├── customerNotes.ts        # Customer notes utilities
│   │   └── seTemplate.ts           # SE note templates
│   └── types/
│       └── index.ts                # TypeScript type definitions
├── data/
│   ├── dummyData.ts                # Dummy data generation
│   ├── dxpPools.ts                 # DXP objectives and use cases
│   └── Customer Engagement*.csv   # Real customer data
├── .env.example                    # Environment variables template
├── .env.local                      # Local environment variables
├── package.json                    # Dependencies and scripts
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
└── next.config.js                  # Next.js configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project (for production)
- Google Gemini API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd customer-engagement-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Google Gemini AI Configuration
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   
   # Application Configuration
   NEXT_PUBLIC_APP_NAME=Customer Engagement Hub
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Data Models

### Customer Interface
```typescript
interface Customer {
  id: string;
  customerName: string;
  website?: string;
  products: Product[];
  customerContacts: CustomerContact[];
  internalContacts: InternalContact[];
  partners: Partner[];
  sharePointUrl: string;
  salesforceLink: string;
  additionalInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Customer Profile Interface (Static Data)
```typescript
interface CustomerProfile {
  id: string;
  customerId: string; // Reference to Customer
  // Business Details (static)
  businessProblem: string;
  whyUs: string;
  whyNow: string;
  techSelect: boolean;
  // Quick Hit Details (static)
  preDiscovery: boolean;
  discovery: string;
  discoveryNotesAttached: boolean;
  totalDemos: number;
  latestDemoDryRun: boolean;
  latestDemoDate: Date;
  techDeepDive: string;
  infoSecCompleted: boolean;
  knownTechnicalRisks: string;
  mitigationPlan: string;
  // Solution Engineering (static)
  seNotes: string;
  seInvolvement: boolean;
  seNotesLastUpdated: Date;
  seProductFitAssessment: 'Green' | 'Yellow' | 'Red' | '';
  // Success Planning (static)
  customerObjective1: string;
  customerObjective2: string;
  customerObjective3: string;
  customerObjectivesDetails: string;
  customerUseCase1: string;
  customerUseCase2: string;
  customerUseCase3: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Customer Note Interface (Dynamic Data)
```typescript
interface CustomerNote {
  id: string;
  customerId: string; // Reference to Customer
  notes: string;
  noteDate: Date;
  createdBy: string;
  updatedBy: string;
  // Dynamic fields that can change per note
  seConfidence: 'Green' | 'Yellow' | 'Red' | '';
  otherFields: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Get your configuration from Project Settings
4. Add the configuration to your `.env.local` file

### Gemini AI Setup
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add the API key to your `.env.local` file
3. AI features will be available for content generation

## 🎯 Usage

### Customer Management
1. **Switch to Customer Management Tab**
2. **Add New Customer** - Click "Add Customer" button
3. **Fill Customer Information**:
   - Customer name (required)
   - Website URL
   - Products (XM, XP, XM Cloud, etc.)
   - Customer contacts
   - Internal contacts
   - Partners
   - SharePoint URL
   - Salesforce link
   - Additional information

### Customer Profile Management
1. **Select Customer** - Choose from customer directory
2. **Create Profile** - Click "Create Profile" button (if no profile exists)
3. **Fill Profile Details**:
   - Business problem
   - Why Us / Why Now
   - Technical details (discovery, demos, deep dives)
   - SE assessments and involvement
   - Customer objectives (1, 2, 3)
   - Customer use cases (1, 2, 3)
   - Auto-generate SE Notes from fields

### Dynamic Notes Management
1. **Select Customer** - Choose from customer directory
2. **Add Note** - Click "Add Note" button
3. **Fill Note Details**:
   - Note content (meeting/interaction details)
   - Note date and created by
   - SE confidence level (can change per interaction)
   - Additional fields (next steps, observations)

### Search and Filter
- **Search Bar** - Search by customer name, contacts, or partners
- **Sort Options** - Sort by name, date, or product count
- **Filter** - Filter by various criteria

## 🧪 Development

### Available Scripts
```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npm run type-check
```

### Code Quality
- **TypeScript** - Full type safety
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- **Netlify** - Static site deployment
- **Railway** - Full-stack deployment
- **AWS** - EC2 or Lambda deployment

## 📈 Performance

### Optimizations
- **Next.js App Router** - Latest routing system
- **Turbopack** - Fast development builds
- **Image Optimization** - Automatic image optimization
- **Code Splitting** - Automatic code splitting
- **Static Generation** - Pre-rendered pages

### Bundle Analysis
```bash
npm run build
npm run analyze
```

## 🔒 Security

### Best Practices
- **Environment Variables** - Sensitive data in `.env.local`
- **Input Validation** - Zod schema validation
- **Type Safety** - TypeScript for type checking
- **HTTPS** - Secure connections in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues
- **Build Errors** - Check TypeScript types and imports
- **Firebase Issues** - Verify configuration and permissions
- **AI Features** - Check Gemini API key and quotas

### Getting Help
- Check the documentation
- Review the code examples
- Open an issue on GitHub

## 🔄 Version History

### v1.1.0 (Latest)
- **Database Schema Refactoring** - Separated static customer profiles from dynamic notes
- **Customer Profile Management** - Comprehensive business information per customer
- **Simplified Note Taking** - Focus on interaction-specific information
- **Enhanced UI** - Unified customer management interface
- **Improved Data Consistency** - Reduced duplication and better organization
- **Generic Product Naming** - Removed Sitecore-specific references

### v1.0.0
- Initial release
- Customer CRUD operations
- Notes management
- AI integration
- Responsive design
- Real customer data integration

---

Built with ❤️ using Next.js, React, and TypeScript