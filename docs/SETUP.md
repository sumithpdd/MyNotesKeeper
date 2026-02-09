# Complete Setup Guide

This guide covers everything you need to get the Customer Engagement Hub fully configured and running.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Firebase Setup](#firebase-setup)
4. [AI Setup](#ai-setup)
5. [Environment Variables](#environment-variables)
6. [Database Initialization](#database-initialization)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

**Required:**
- Node.js 18+ ([Download](https://nodejs.org/))
- npm 8+ (comes with Node.js)
- Modern web browser (Chrome, Firefox, Edge, Safari)

**For Full Features:**
- Firebase account ([Create free](https://console.firebase.google.com))
- Google AI Studio account ([Get API key](https://makersuite.google.com/app/apikey))

---

## Installation

### 1. Clone or Download the Project

```bash
cd MyNotesKeeper
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages (~2-3 minutes).

---

## Firebase Setup

Firebase provides authentication and cloud database storage.

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter project name (e.g., "customer-engagement-hub")
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** in left menu
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose a location (closest to you)
5. Click **"Enable"**

### Step 3: Enable Authentication

1. Click **"Authentication"** in left menu
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Google"** provider
5. Set support email
6. Click **"Save"**

### Step 4: Add Authorized Domain

1. Still in Authentication → Sign-in method
2. Scroll to **"Authorized domains"**
3. Add **`localhost`** (should already be there)
4. For production, add your deployment domain later

### Step 5: Get Firebase Config

1. Click **⚙️ (Settings)** → **"Project settings"**
2. Scroll to **"Your apps"** section
3. Click **web icon** (</>) to create web app
4. Register app with a nickname
5. **Copy the config object** - you'll need these values:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123",
     measurementId: "G-XXXXXXXXXX"
   };
   ```

### Step 6: Update Security Rules (Important!)

1. Go to **Firestore Database** → **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users only
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

> **Note:** These are development rules. For production, implement more restrictive rules.

---

## AI Setup

Google Gemini AI powers the chatbot and content generation features.

### Step 1: Get API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **"Get API key"**
3. Click **"Create API key in new project"** or select existing project
4. **Copy the API key** (starts with `AIza...`)

### Step 2: Test API Key (Optional)

```bash
# Quick test via curl
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY"
```

If you see a JSON response with models, it works!

---

## Environment Variables

### Step 1: Create `.env.local`

In the project root, create a file named `.env.local`:

```bash
# On Windows
copy .env.example .env.local

# On Mac/Linux
cp .env.example .env.local
```

### Step 2: Add Your Configuration

Edit `.env.local` with your actual values:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD...your_actual_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Gemini AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyC...your_actual_key
```

**Important:**
- Never commit `.env.local` to git
- All values must be from YOUR Firebase project
- No quotes around values
- No spaces around `=`

---

## Database Initialization

### Option 1: Use Dummy Data (Automatic)

The app automatically loads dummy data on first run. No action needed!

### Option 2: Seed Real Data (Optional)

If you have existing customer data:

```bash
# Seed the database with sample data
npm run seed
```

This creates sample customers, notes, and profiles in Firestore.

---

## Verification

### 1. Start the Development Server

```bash
npm run dev
```

Expected output:
```
  ▲ Next.js 15.5.5 (Turbopack)
  - Local:        http://localhost:3000
  - Ready in 1234ms
```

### 2. Open in Browser

Navigate to **http://localhost:3000**

### 3. Test Firebase Authentication

1. You should see a **"Sign in with Google"** button
2. Click it and sign in with your Google account
3. After signing in, you should see the main app interface

**✅ Success indicators:**
- No console errors about Firebase
- Google sign-in works
- You can see customer directory

### 4. Test Firestore Database

1. Go to **Customer Management** tab
2. Click **"Add Customer"**
3. Fill out the form and click **"Save"**
4. Customer should appear in the directory

**✅ Verify in Firebase Console:**
1. Go to Firestore Database
2. You should see a `customers` collection with your new customer

### 5. Test AI Features

1. Go to **AI Chatbot** tab
2. Type: "Add a note to test customer, successful setup"
3. AI should parse and respond

**✅ Success indicators:**
- AI responds with parsed information
- No API key errors
- Chatbot is interactive

---

## Troubleshooting

### Firebase Errors

#### "Firebase: Error (auth/invalid-api-key)"

**Cause:** Firebase API key is incorrect or missing

**Fix:**
1. Double-check your `.env.local` file
2. Verify the API key matches Firebase Console
3. Ensure no extra spaces or quotes
4. Restart the dev server: `npm run dev`

#### "Missing or insufficient permissions"

**Cause:** Firestore security rules are too restrictive

**Fix:**
1. Go to Firebase Console → Firestore Database → Rules
2. Use the development rules from [Step 6](#step-6-update-security-rules-important)
3. Click "Publish"
4. Try again

#### "Firebase: Error (auth/unauthorized-domain)"

**Cause:** `localhost` not in authorized domains

**Fix:**
1. Firebase Console → Authentication → Settings
2. Scroll to "Authorized domains"
3. Add `localhost`
4. Try signing in again

### AI Errors

#### "Invalid API key" or "API key not valid"

**Cause:** Gemini API key is incorrect

**Fix:**
1. Get a new API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Update `NEXT_PUBLIC_GEMINI_API_KEY` in `.env.local`
3. Restart dev server

#### "Quota exceeded"

**Cause:** Free tier API limit reached

**Fix:**
1. Wait for quota to reset (daily)
2. Or upgrade to paid tier in Google AI Studio

### Build Errors

#### "Module not found" errors

**Fix:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Port 3000 already in use

**Fix:**
```bash
# Use a different port
npm run dev -- -p 3001
```

Or find and kill the process using port 3000.

### General Issues

#### Changes not showing up

**Fix:**
1. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Restart dev server

#### "Cannot find module" after adding new code

**Fix:**
```bash
# Restart the dev server
# Press Ctrl+C to stop, then:
npm run dev
```

---

## Next Steps

✅ **Setup complete!** You're ready to use the app.

**What's next:**
- 📖 Read [USER_GUIDE.md](USER_GUIDE.md) to learn how to use features
- 🎯 Read [FEATURES.md](FEATURES.md) for detailed feature documentation
- 👨‍💻 Read [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) if you're developing

**Need more help?**
- Check the main [README.md](README.md)
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
