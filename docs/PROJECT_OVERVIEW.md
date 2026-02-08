# Customer Engagement Hub - Project Overview

## 📋 Table of Contents
- [Project Brief](#project-brief)
- [Quick Start](#quick-start)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Documentation Guide](#documentation-guide)
- [Common Commands](#common-commands)

---

## Project Brief

### What is this project?

**Customer Engagement Hub** is a comprehensive Next.js application designed for Sales Solution Engineers to manage customer relationships, track engagement progress, and maintain detailed customer notes. It's a modern, AI-powered CRM tool specifically tailored for Solution Engineering workflows.

### Core Purpose
- **Customer Management** - Complete CRUD operations for customers with detailed information
- **Profile Tracking** - Static business context for each customer (objectives, use cases, business problems)
- **Dynamic Notes** - Interaction-specific notes with SE confidence tracking
- **AI Assistance** - Natural language interface for data entry and text enhancement
- **Migration Tracking** - Monitor customer migration opportunities

### Target Users
- **Solution Engineers** - Primary users who engage with customers
- **Sales Teams** - Track customer engagement and progress
- **Account Managers** - Monitor customer relationships

### Key Differentiators
✅ **Two-Tier Data Model** - Separates static profile info from dynamic notes  
✅ **AI Chatbot** - Natural language interface with 8 prompt templates  
✅ **SE-Specific** - Built for Solution Engineering workflows  
✅ **Real-Time Updates** - Firebase backend with live data sync  
✅ **Modern Stack** - Next.js 15, React 19, TypeScript, Tailwind CSS  

---

## Quick Start

### Prerequisites
```bash
# Required versions
Node.js: 18.0.0 or higher
npm: 8.0.0 or higher
```

### Installation Steps

**1. Clone and Install**
```bash
git clone <repository-url>
cd MyNotesKeeper
npm install
```

**2. Set Up Environment Variables**
```bash
# Copy the example file
copy .env.example .env.local

# Edit .env.local with your credentials:
# - Firebase configuration (get from Firebase Console)
# - Gemini AI API key (get from Google AI Studio)
```

**3. Start Development Server**
```bash
npm run dev
```

**4. Open Browser**
```
http://localhost:3000
```

### 🎉 You're Ready!
The application will load with demo data. Sign in with Google to use Firebase features.

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 15.5.5 | React framework with App Router |
| **React** | 19.1.0 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Styling framework |

### Backend & Services
| Service | Purpose |
|---------|---------|
| **Firebase Firestore** | NoSQL database |
| **Firebase Auth** | Google OAuth authentication |
| **Google Gemini AI** | Natural language processing & text enhancement |

### Development Tools
| Tool | Purpose |
|------|---------|
| **React Hook Form** | Form state management |
| **Zod** | Schema validation |
| **Lucide React** | Icon library |
| **ESLint** | Code linting |
| **Jest** | Testing framework |

---

## Project Structure

```
MyNotesKeeper/
│
├── 📁 src/                           # Source code
│   ├── 📁 app/                       # Next.js App Router
│   │   ├── page.tsx                  # Main application page
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles
│   │
│   ├── 📁 components/                # React components
│   │   ├── 📁 ui/                    # Reusable UI components
│   │   │   ├── MultiSelect.tsx       # Multi-select dropdown
│   │   │   ├── CopyableField.tsx     # Copy-to-clipboard fields
│   │   │   └── AIButton.tsx          # AI generation buttons
│   │   │
│   │   ├── CustomerManagement.tsx    # Main customer interface
│   │   ├── CustomerForm.tsx          # Customer CRUD form
│   │   ├── CustomerList.tsx          # Customer directory
│   │   ├── CustomerProfileForm.tsx   # Profile management
│   │   ├── NoteForm.tsx              # Dynamic notes form
│   │   ├── ChatbotInterface.tsx      # AI chatbot UI
│   │   └── PromptLibrary.tsx         # Prompt templates
│   │
│   ├── 📁 lib/                       # Services and utilities
│   │   ├── firebase.ts               # Firebase configuration
│   │   ├── auth.tsx                  # Authentication context
│   │   ├── ai.ts                     # Gemini AI service
│   │   ├── chatbotAI.ts              # Chatbot AI logic
│   │   ├── chatbotPrompts.ts         # Prompt templates
│   │   ├── customerService.ts        # Customer CRUD
│   │   ├── customerNotesService.ts   # Notes management
│   │   └── utils.ts                  # Helper functions
│   │
│   └── 📁 types/                     # TypeScript definitions
│       └── index.ts                  # All type interfaces
│
├── 📁 data/                          # Data files
│   ├── dummyData.ts                  # Demo data
│   └── dxpPools.ts                   # Predefined options
│
├── 📁 docs/                          # Documentation
│   ├── README.md                     # Docs navigation
│   ├── 📁 features/                  # Feature guides
│   ├── 📁 architecture/              # System design
│   ├── 📁 developer-guide/           # Dev guides
│   ├── 📁 setup/                     # Configuration
│   └── 📁 user-guides/               # User manuals
│
├── 📁 scripts/                       # Utility scripts
│   ├── seedDatabase.ts               # Database seeding
│   └── checkFirebaseConfig.js        # Config validation
│
├── 📁 public/                        # Static assets
│   ├── manifest.json                 # PWA manifest
│   └── *.svg, *.png                  # Icons and images
│
├── .env.example                      # Environment template
├── .env.local                        # Your local config (gitignored)
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── tailwind.config.js                # Tailwind config
└── next.config.ts                    # Next.js config
```

---

## Key Features

### 1. Customer Management (CRUD)
- ✅ Create customers with comprehensive information
- ✅ View customer details, contacts, and engagement history
- ✅ Update customer info, products, contacts, and partnerships
- ✅ Delete customers with confirmation dialogs
- ✅ Search, filter, and sort customer directory

### 2. Customer Profile (Static Data)
- **Business Context** - Problem, why Us, why now
- **Discovery Info** - Discovery status, demos, technical deep dives
- **SE Assessments** - Product fit, involvement, notes
- **Success Planning** - Customer objectives and use cases
- **One-Time Setup** - Created once, referenced by all notes

### 3. Customer Notes (Dynamic Data)
- **Interaction Notes** - Meeting notes and observations
- **SE Confidence** - Green/Yellow/Red per interaction
- **Date Tracking** - When interaction occurred
- **Creator Tracking** - Who created/updated the note
- **Additional Fields** - Flexible JSON storage

### 4. AI Chatbot 🤖
- **Natural Language Interface** - Plain English commands
- **8 Prompt Templates** - Pre-configured for SE tasks
- **Smart Parsing** - Extract structured data from text
- **Confirmation Workflow** - Review before saving
- **Example Commands**:
  - "Add a note to ABC Corp, demo yesterday, green SE confidence"
  - "Update XYZ customer profile with new business problem"
  - "Change SE confidence to yellow for last note"

### 5. AI Text Enhancement
- **Generate Content** - Auto-generate SE notes, objectives, use cases
- **Improve Text** - Enhance existing text with AI
- **Templates** - Use predefined templates for consistency

### 6. Migration Opportunities
- **Track Migrations** - Monitor customer migration opportunities
- **CSV Import** - Bulk import migration data
- **Status Tracking** - Track migration progress

---

## Documentation Guide

### 📚 Where to Find What

#### **New to the Project?**
Start here:
1. [Getting Started Guide](developer-guide/GETTING_STARTED.md) - Setup and first steps
2. [React Concepts](developer-guide/REACT_CONCEPTS.md) - React patterns used
3. [Architecture Overview](architecture/OVERVIEW.md) - How it works

#### **Want to Use a Feature?**
Feature guides:
- [AI Chatbot](features/CHATBOT.md) - Using the chatbot
- [AI Features](features/AI_FEATURES.md) - Text enhancement
- [SE Notes](features/SE_NOTES.md) - SE note templates
- [Migration Opportunities](features/MIGRATION_OPPORTUNITIES.md) - Migration tracking
- [Customer Management](user-guides/CUSTOMER_MANAGEMENT.md) - User manual

#### **Need to Set Up?**
Setup guides:
- [Environment Setup](setup/ENVIRONMENT.md) - API keys and env vars
- [Firebase Setup](setup/FIREBASE_SETUP.md) - Firebase configuration

#### **Understanding the Code?**
Architecture docs:
- [System Architecture](architecture/OVERVIEW.md) - High-level design
- [Data Models](architecture/DATA_MODELS.md) - Database schema
- [Chatbot Architecture](architecture/CHATBOT_ARCHITECTURE.md) - AI implementation

#### **Full Documentation Index**
See [README.md](README.md) for complete navigation

---

## Common Commands

### Development
```bash
# Start dev server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check
```

### Code Quality
```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Testing
```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Utilities
```bash
# Clean build artifacts
npm run clean

# Analyze bundle size
npm run analyze
```

### Firebase Scripts
```bash
# Check Firebase configuration
node scripts/checkFirebaseConfig.js

# Seed database with dummy data
node scripts/seedDatabase.js

# Upload migration opportunities
node scripts/uploadMigrationOpportunities.js
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  (React Components + TypeScript + Tailwind CSS)         │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                          │
│  - customerService      - Customer CRUD                  │
│  - customerNotesService - Notes management               │
│  - chatbotAI           - Natural language parsing        │
│  - ai                  - Text enhancement                │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────┬──────────────────────────────────────┐
│   Firebase       │   Google Gemini AI                   │
│   - Auth         │   - Natural Language Processing      │
│   - Firestore    │   - Text Generation                  │
└──────────────────┴──────────────────────────────────────┘
```

### Data Model Hierarchy

```
Customer (1:1) → CustomerProfile (Static)
    │
    ├─ Business Details
    ├─ Discovery Info
    ├─ SE Assessments
    └─ Success Planning

Customer (1:Many) → CustomerNotes (Dynamic)
    │
    ├─ Note 1 (with SE Confidence)
    ├─ Note 2 (with SE Confidence)
    └─ Note 3 (with SE Confidence)
```

---

## Environment Variables

Required environment variables in `.env.local`:

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

# Application Configuration (Optional)
NEXT_PUBLIC_APP_NAME=Customer Engagement Hub
NEXT_PUBLIC_APP_VERSION=1.2.0
```

**How to get credentials:**
- **Firebase**: [Firebase Console](https://console.firebase.google.com) → Project Settings
- **Gemini API**: [Google AI Studio](https://makersuite.google.com/app/apikey)

---

## Version History

### v1.2.0 (Current) - AI Chatbot Release
- 🤖 AI Chatbot interface with natural language processing
- 📚 Prompt library with 8 pre-configured templates
- 🎯 Smart parsing and structured data extraction
- ✅ Confirmation workflow for AI actions

### v1.1.0 - Data Model Refactoring
- 🏗️ Separated static profiles from dynamic notes
- 📊 Enhanced data consistency and organization
- 🎨 Unified customer management interface

### v1.0.0 - Initial Release
- ✨ Customer CRUD operations
- 📝 Notes management
- 🤝 Contact and partner management
- 🔍 Search and filter capabilities

---

## Support & Resources

### Getting Help
1. Check the [documentation](README.md)
2. Review [troubleshooting guides](developer-guide/GETTING_STARTED.md#common-issues)
3. Check the browser console for errors
4. Review Firebase console for data issues

### Useful Links
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Gemini AI Documentation](https://ai.google.dev/docs)

### Common Issues
- **Server won't start** → Check Node.js version (18+)
- **Firebase errors** → Verify `.env.local` configuration
- **AI not working** → Check Gemini API key and quotas
- **Build errors** → Run `npm run type-check` for TypeScript errors

---

## License

MIT License - See [LICENSE](LICENSE) file for details

---

## Contributing

We welcome contributions! To contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Last Updated**: February 2026  
**Version**: 1.2.0  
**Framework**: Next.js 15.5.5  
**License**: MIT

Built with ❤️ by the Customer Engagement Hub Team
