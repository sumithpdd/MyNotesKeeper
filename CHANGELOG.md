# Changelog

All notable changes and fixes to this project.

## [2.1.0] - February 2026 - AI Chat Panel Redesign

### Major UI Redesign
- **🎨 New Slide-Out AI Panel** - Modern slide-out design replacing tab-based interface
  - Slides in from right side (similar to Sitecore AI assistant UX)
  - Always accessible via floating action button
  - Doesn't interrupt current workflow
  - Clean, modern animation and transitions
  
- **✨ Floating Action Button** - Bottom-right corner for quick AI access
  - Sparkle icon with "AI" badge
  - Animated pulse effect
  - Hover tooltip
  - Toggle open/close with smooth transition
  
- **📚 Integrated Prompt Library** - Two-tab interface in panel
  - **Chat Tab:** Natural language conversation interface
  - **Prompt Library Tab:** Browse and manage 28+ prompts
  - Seamless switching between tabs
  - Context preserved when switching

### Custom Prompt Management
- **➕ Create Custom Prompts** - Team-specific prompt templates
  - Modal form for easy creation
  - All standard fields (title, description, entity, operation, examples)
  - Purple "Custom" badge for identification
  
- **💾 Local Storage Persistence** - Custom prompts saved in browser
  - Automatic save on creation
  - Automatic load on app start
  - Survives page refreshes and sessions
  
- **🗑️ Delete Custom Prompts** - Remove unwanted custom prompts
  - Trash icon button on custom prompts
  - Confirmation dialog for safety
  - Cannot delete built-in prompts

### Enhanced Prompt Library
- **🎨 Visual Redesign** - Modern card-based layout
  - Left sidebar with prompt cards
  - Right panel with detailed view
  - Color-coded entity badges (blue=customer, green=note, purple=profile, etc.)
  - Operation icons (➕ create, ✏️ update, 🗑️ delete, etc.)
  
- **🔍 Advanced Search** - Find prompts instantly
  - Real-time search as you type
  - Searches title, description, and examples
  - Filter by entity type dropdown
  - Shows result count
  
- **📋 Better Example Handling** - Multiple ways to use examples
  - Copy button (📋) to clipboard
  - Send to chat button (▶️) for immediate use
  - "Use This Prompt" button loads first example
  - Visual confirmation (✅) when copied

### Improved Chat Interface
- **👤 Better Message Display** - Clear sender identification
  - Bot avatar with blue background
  - User avatar with gray background
  - System messages for status updates
  - Timestamps on all messages
  
- **✅ Enhanced Confirmations** - Better review workflow
  - Extracted data shown in blue card
  - Green "Confirm" and red "Cancel" buttons
  - Field-by-field display of parsed data
  - Clear status indicators

### Navigation Simplification
- **Removed Chatbot/Prompts tabs** from main navigation
- **Streamlined to 3 main tabs:** Customer Management, Entity Management, Migration Opportunities
- **AI features now accessible anywhere** via floating button
- **Better UX flow** - less tab switching

### Technical Improvements
- New component: `AIChatPanel.tsx` (520+ lines) - Main panel container
- New component: `FloatingAIButton.tsx` (60+ lines) - Floating action button
- New component: `CustomPromptModal.tsx` (embedded) - Prompt creation form
- Enhanced state management for panel open/close
- LocalStorage integration for custom prompts
- Improved TypeScript types for custom prompts

### Documentation Updates
- Updated `USER_GUIDE.md` - New AI Assistant section
- Updated `FEATURES.md` - Redesigned AI features documentation
- Updated `CHANGELOG.md` - This entry
- All references to tab-based chatbot replaced with slide-out panel

## [2.0.0] - February 2026 - Documentation & Code Simplification

### Documentation Reorganization
- **Reduced from 42+ files to 8 organized guides** (81% reduction)
- Created clear documentation structure:
  - `docs/README.md` - Documentation hub
  - `docs/QUICKSTART.md` - 5-minute setup
  - `docs/SETUP.md` - Complete setup guide
  - `docs/USER_GUIDE.md` - Feature usage guide
  - `docs/DEVELOPER_GUIDE.md` - Development guide
  - `docs/JUNIOR_DEVELOPER_GUIDE.md` - React/Next.js/TypeScript concepts
  - `docs/ARCHITECTURE.md` - Technical architecture
  - `docs/FEATURES.md` - Feature documentation
- Simplified root `README.md` from 540 lines to 50 lines
- Moved all old documentation to `docs/archive/` for reference

### Code Refactoring
- **Split types into modular files** (328 lines → 6 domain-specific files)
  - `types/customer.ts` - Customer, Profile, Note types
  - `types/contacts.ts` - Contact types
  - `types/product.ts` - Product types
  - `types/opportunity.ts` - Opportunity types
  - `types/user.ts` - User/Auth types
  - `types/ai.ts` - AI types
- **Refactored CustomerList component** (667 lines → 110 lines orchestrator + 7 focused components)
  - Created reusable sub-components
  - Extracted 3 custom hooks for business logic
  - Improved maintainability and testability

### Bug Fixes
- **Fixed Firebase authentication** - Invalid API key error resolved
- **Fixed Firestore permissions** - Updated security rules for development
- **Fixed Turbopack warning** - Set explicit workspace root
- **Fixed metadata warnings** - Moved to new Next.js 15 viewport export
- **Fixed sign-in redirect** - Improved error handling in auth flow
- **Security audit** - Ensured no API keys hardcoded in code

## [1.2.0] - 2026 - AI Chatbot Release

### Features
- **AI Chatbot Interface** - Natural language command interface
- **Prompt Library** - 28+ pre-configured prompt templates
- **Smart Parsing** - AI-powered extraction of structured data
- **Confirmation Workflow** - Review parsed data before applying
- **SE Persona** - Understands Solution Engineer terminology

## [1.1.0] - 2025 - Customer Management Enhancements

### Features
- **Grid and List Views** - Toggle between card and table layouts
- **Advanced Filtering** - Filter by year, products, partners, account executive
- **Date Range Filters** - Custom date ranges for created/updated dates
- **Account Executive Field** - Assign AE from internal contacts
- **Opportunity Tracking** - Full opportunity pipeline management
  - 9 sales stages (Plan → Expand)
  - Complete stage history
  - Multiple opportunities per customer
  - Financial tracking (value, probability, weighted value)
- **Customer Profiles** - Static business context per customer
- **Dynamic Notes** - Interaction-specific notes with SE confidence

### Database Schema
- Separated static customer profiles from dynamic notes
- Improved data consistency and organization

## [1.0.0] - 2025 - Initial Release

### Features
- **Customer CRUD** - Create, read, update, delete customers
- **Notes Management** - Add and manage customer interaction notes
- **Firebase Integration** - Authentication and Firestore database
- **AI Integration** - Google Gemini API for content generation
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real Customer Data** - Integration with CSV import

### Technology Stack
- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS
- Firebase Firestore
- Google Gemini AI

---

## Issue Resolutions

### Firebase Authentication Issues
**Problem:** `Firebase: Error (auth/invalid-api-key)`
**Resolution:**
- Verified environment variables in `.env.local`
- Enabled Firebase Authentication in console
- Added Google Sign-in provider
- Added `localhost` to authorized domains

### Firestore Permissions
**Problem:** `Missing or insufficient permissions`
**Resolution:**
- Updated Firestore security rules to allow authenticated reads/writes
- Development rules: `allow read, write: if request.auth != null;`

### Sign-in Redirect
**Problem:** After Google sign-in, no redirect to home page
**Resolution:**
- Improved error handling in `AuthProvider`
- Set user state even if Firestore document creation fails
- Added comprehensive console logging for debugging

### Build Warnings
**Problem:** Turbopack workspace root warning
**Resolution:**
- Added `turbopack.root: __dirname` to `next.config.ts`

**Problem:** Metadata and viewport warnings
**Resolution:**
- Moved `themeColor` and `viewport` to new `viewport` export in Next.js 15

---

## Security Improvements

### API Key Management
- ✅ All API keys stored in `.env.local`
- ✅ No hardcoded keys in codebase
- ✅ `.env.local` in `.gitignore`
- ✅ Environment variable validation

### Best Practices
- Firestore security rules implemented
- User authentication required for all operations
- Input validation with Zod schemas
- TypeScript type safety throughout

---

## Performance Optimizations

- Memoization with `useMemo` for expensive computations
- Custom hooks for reusable logic
- Component code splitting
- Efficient Firebase queries
- Modular architecture for better bundle size

---

**For detailed feature documentation, see [docs/FEATURES.md](docs/FEATURES.md)**
**For setup instructions, see [docs/SETUP.md](docs/SETUP.md)**
