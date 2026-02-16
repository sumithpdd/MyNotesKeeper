# Changelog

## [2.3.0] - 2026-02-10 - API Layer Refactoring
- ✅ Created REST API routes for all entities
  - `/api/customers` - Customer CRUD operations
  - `/api/notes` - Note CRUD operations
  - `/api/opportunities` - Opportunity CRUD + stage changes
  - `/api/contacts` - Contact management (Firebase integration pending)
  - `/api/entities` - Products & Partners management (Firebase integration pending)
- ✅ Defensive error handling (auto-create fallback on failed updates)
- ✅ Consistent JSON response format
- ✅ Proper HTTP status codes
- 📚 Created [API_GUIDE.md](API_GUIDE.md) for API documentation

## [2.2.0] - 2026-02-10 - Code Refactoring
- 📦 Custom hooks: `useFirebaseData`, `useNoteOperations`, `useCustomerOperations`, `useOpportunityOperations`
- 🎨 AI components: `ChatInterface`, `ChatInput`, `aiMessageParser` utility
- 📉 File size: `page.tsx` reduced 543 → 280 lines (48%)
- 🗄️ Entity management: Contacts saved to separate Firebase collections
- ✅ Defensive error handling throughout

## [2.1.1] - 2026-02 - AI Chat Fixes
- 🧠 Smart customer detection (checks if exists before creating)
- 📝 Verbose AI responses
- 👥 Intelligent contact parsing
- ✅ Fixed confirm/cancel buttons
- 🎨 Fixed invisible text in inputs

## [2.1.0] - 2026-02 - AI Chat Panel Redesign
- 🎨 Slide-out AI panel (replaces tabs)
- ✨ Floating action button
- 📚 Integrated prompt library (28+ prompts)
- ➕ Custom prompt creation
- 💾 LocalStorage persistence

## [2.0.0] - 2026-02 - Documentation & Code Simplification
- 📚 Documentation reduced 42+ files → 8 organized guides (81% reduction)
- 🔧 Split types into modular files
- 🔧 Refactored `CustomerList` component
- 🐛 Fixed Firebase auth, permissions, Turbopack warnings

## [1.2.0] - 2025 - AI Chatbot Release
- 🤖 AI chatbot interface
- 📚 Prompt library
- 🧠 Smart parsing
- ✅ Confirmation workflow

## [1.1.0] - 2025 - Customer Management Enhancements
- 📊 Grid & list views
- 🔍 Advanced filtering
- 👔 Account executive field
- 🎯 Opportunity tracking (9 sales stages)
- 📋 Customer profiles
- 📝 Dynamic notes

## [1.0.0] - 2025 - Initial Release
- ✅ Customer CRUD
- 📝 Notes management
- 🔥 Firebase integration
- 🤖 AI integration (Google Gemini)
- 📱 Responsive design

---

## Key Issue Resolutions

**Firebase Authentication** - Fixed invalid API key error  
**Firestore Permissions** - Updated security rules  
**Sign-in Redirect** - Improved error handling  
**Build Warnings** - Fixed Turbopack & metadata warnings  

**Security** - All API keys in `.env.local`, no hardcoded secrets  
**Performance** - Custom hooks, memoization, code splitting

---

For details see: [API_GUIDE.md](API_GUIDE.md), [USER_GUIDE.md](USER_GUIDE.md), [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
