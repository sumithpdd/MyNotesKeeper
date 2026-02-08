# Quick Start Guide

Get the Customer Engagement Hub running in **5 minutes**! ⚡

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 8+ (comes with Node.js)
- A code editor (VS Code recommended)

## Step 1: Install Dependencies (2 minutes)

```bash
# Navigate to project directory
cd MyNotesKeeper

# Install all dependencies
npm install
```

Wait for the installation to complete. This will install Next.js, React, TypeScript, and all other dependencies.

## Step 2: Set Up Environment (2 minutes)

### Option A: Quick Start (No Firebase/AI)

```bash
# Create a basic .env.local file
copy .env.example .env.local
```

The app will work with dummy data without any configuration!

### Option B: Full Setup (With Firebase & AI)

1. **Get Firebase credentials** from [Firebase Console](https://console.firebase.google.com)
   - Create a new project or use existing
   - Go to Project Settings → General
   - Copy your config values

2. **Get Gemini API key** from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. **Edit `.env.local`**:

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

## Step 3: Start the Server (1 minute)

```bash
npm run dev
```

You should see:

```
  ▲ Next.js 15.5.5
  - Local:        http://localhost:3000
  - Ready in XXX ms
```

## Step 4: Open in Browser

Navigate to **http://localhost:3000**

🎉 **You're running!** The app loads with demo data.

## What You Can Do Now

### Without Firebase (Demo Mode)
✅ Browse customer directory  
✅ View customer details  
✅ See notes and profiles  
✅ Explore the UI  
❌ Can't save data  
❌ Can't use AI features  

### With Firebase & AI (Full Mode)
✅ All demo mode features  
✅ **Create** new customers  
✅ **Save** notes and profiles  
✅ **Use AI Chatbot** for natural language data entry  
✅ **Generate content** with AI  
✅ **Real-time sync** across devices  

## Next Steps

### Learn the Basics
1. **Explore the app** - Click around, try different tabs
2. **Read the docs** - [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for complete guide
3. **Try a feature** - [AI Chatbot Guide](features/CHATBOT.md)

### For Developers
1. **Understand the code** - [Getting Started Guide](developer-guide/GETTING_STARTED.md)
2. **Learn React patterns** - [React Concepts](developer-guide/REACT_CONCEPTS.md)
3. **Study architecture** - [Architecture Overview](architecture/OVERVIEW.md)

## Troubleshooting

### Port Already in Use
```bash
# Kill the process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

### Module Not Found
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Check for type errors
npm run type-check
```

### Firebase Not Working
- Check your `.env.local` file exists
- Verify all Firebase config values are correct
- Ensure Firebase project is active in console

### AI Features Not Working
- Verify Gemini API key is correct
- Check API quota in Google AI Studio
- Ensure key has proper permissions

## Common Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Check code quality
npm test             # Run tests
```

## File Structure (Quick Reference)

```
MyNotesKeeper/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   ├── lib/              # Services (Firebase, AI)
│   └── types/            # TypeScript types
├── docs/                 # Documentation
├── .env.local            # Your config (create this!)
└── package.json          # Dependencies
```

## Getting Help

1. **Check docs**: [README.md](README.md)
2. **Common issues**: [Getting Started](developer-guide/GETTING_STARTED.md#common-issues)
3. **Full guide**: [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)

---

**Ready to build?** Start with [Developer Guide](developer-guide/GETTING_STARTED.md) →

**Want to use it?** Check [User Guide](user-guides/CUSTOMER_MANAGEMENT.md) →

**Need features?** See [Features Documentation](features/) →
