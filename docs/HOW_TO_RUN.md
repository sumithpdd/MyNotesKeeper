# How to Run Customer Engagement Hub

Complete step-by-step guide to get the application running on your machine.

## 📋 Table of Contents
- [System Requirements](#system-requirements)
- [Installation Methods](#installation-methods)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## System Requirements

### Required Software
| Software | Minimum Version | Recommended | Download Link |
|----------|----------------|-------------|---------------|
| **Node.js** | 18.0.0 | 20.x LTS | [nodejs.org](https://nodejs.org/) |
| **npm** | 8.0.0 | 10.x | Included with Node.js |
| **Git** | Any | Latest | [git-scm.com](https://git-scm.com/) |

### System Resources
- **RAM**: 4 GB minimum, 8 GB recommended
- **Disk Space**: 500 MB for dependencies
- **OS**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 20.04+)

### Optional (For Full Features)
- **Firebase Account** - For data persistence ([firebase.google.com](https://firebase.google.com))
- **Google AI Studio Account** - For AI features ([makersuite.google.com](https://makersuite.google.com))

---

## Installation Methods

### Method 1: Quick Install (Recommended)

**Windows:**
```powershell
# Open PowerShell in project directory
npm install
copy .env.example .env.local
npm run dev
```

**macOS/Linux:**
```bash
# Open Terminal in project directory
npm install
cp .env.example .env.local
npm run dev
```

### Method 2: Step-by-Step Install

#### Step 1: Verify Node.js Installation

```bash
# Check Node.js version
node --version
# Should show v18.x.x or higher

# Check npm version
npm --version
# Should show 8.x.x or higher
```

If not installed, download from [nodejs.org](https://nodejs.org/)

#### Step 2: Navigate to Project

```bash
# Windows
cd C:\code\react\MyNotesKeeper

# macOS/Linux
cd /path/to/MyNotesKeeper
```

#### Step 3: Install Dependencies

```bash
npm install
```

This will:
- Download ~200 MB of dependencies
- Take 2-5 minutes depending on internet speed
- Create `node_modules` folder
- Generate `package-lock.json`

**Expected output:**
```
added 500+ packages in 2m
```

#### Step 4: Create Environment File

```bash
# Windows
copy .env.example .env.local

# macOS/Linux
cp .env.example .env.local
```

---

## Configuration

### Option A: Demo Mode (No Configuration Needed)

The app will work immediately with dummy data! Just skip to [Running the Application](#running-the-application).

**What works:**
- ✅ Browse customers
- ✅ View notes and profiles
- ✅ Explore UI
- ❌ Cannot save data
- ❌ AI features disabled

### Option B: Full Setup (Firebase + AI)

#### Get Firebase Credentials

1. **Go to [Firebase Console](https://console.firebase.google.com)**
2. **Create or select a project**
3. **Click "Project Settings" (gear icon)**
4. **Scroll to "Your apps"**
5. **Click "</>" (Web app)**
6. **Register app** (name it anything)
7. **Copy the config values**

#### Get Gemini API Key

1. **Go to [Google AI Studio](https://makersuite.google.com/app/apikey)**
2. **Sign in with Google**
3. **Click "Create API Key"**
4. **Copy the key**

#### Edit `.env.local`

Open `.env.local` in your code editor and fill in:

```env
# Firebase Configuration (from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Google Gemini AI Configuration (from AI Studio)
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Optional: Application Configuration
NEXT_PUBLIC_APP_NAME=Customer Engagement Hub
NEXT_PUBLIC_APP_VERSION=1.2.0
```

**⚠️ Important:**
- Never commit `.env.local` to Git (it's in `.gitignore`)
- Keep your API keys secret
- Rotate keys if accidentally exposed

---

## Running the Application

### Start Development Server

```bash
npm run dev
```

**Expected output:**
```
  ▲ Next.js 15.5.5
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000
  
  ✓ Ready in 3.2s
```

### Access the Application

**In your browser, navigate to:**
```
http://localhost:3000
```

### First Time Setup (With Firebase)

1. **Click "Sign in with Google"** (top right)
2. **Authorize the application**
3. **You're logged in!**

---

## Verification

### Check If It's Working

#### ✅ Server Started Successfully
```
- Local:        http://localhost:3000
✓ Ready in X.Xs
```

#### ✅ Page Loads
- Browser shows the application
- No errors in browser console (F12)

#### ✅ Demo Data Visible
- Customer list appears
- Can click and view details

#### ✅ Firebase Connected (If Configured)
- "Sign in with Google" button visible
- Can sign in successfully
- Can create and save customers

#### ✅ AI Working (If Configured)
- AI Chatbot tab appears
- Can send messages
- Receives responses

### Common Success Indicators

**✅ Everything Working:**
```
Console Output:
  ▲ Next.js 15.5.5
  - Local:        http://localhost:3000
  ✓ Ready in 3.2s
  ○ Compiling / ...
  ✓ Compiled / in 1234ms

Browser Console: (No errors)
```

---

## Troubleshooting

### Problem: `npm install` Fails

**Error:** `EACCES: permission denied`

**Solution:**
```bash
# Windows: Run as Administrator
# macOS/Linux: Use sudo
sudo npm install
```

**Error:** `ERESOLVE unable to resolve dependency tree`

**Solution:**
```bash
npm install --legacy-peer-deps
```

---

### Problem: Server Won't Start

**Error:** `Port 3000 is already in use`

**Solution Option 1: Kill the process**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

**Solution Option 2: Use different port**
```bash
npm run dev -- -p 3001
# Then access: http://localhost:3001
```

---

### Problem: Blank White Page

**Check browser console (F12):**

**If you see:** `Module not found`
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**If you see:** `Firebase is not defined`
- Your `.env.local` might have errors
- Check Firebase config values
- Restart the dev server

---

### Problem: Firebase Errors

**Error:** `Firebase: Error (auth/invalid-api-key)`

**Solution:**
- Check your Firebase API key in `.env.local`
- Ensure no extra spaces or quotes
- Verify key is correct in Firebase Console

**Error:** `Firebase: Error (auth/unauthorized-domain)`

**Solution:**
1. Go to Firebase Console
2. Authentication → Settings → Authorized domains
3. Add `localhost` to the list

---

### Problem: AI Features Not Working

**Error:** `API key not valid`

**Solution:**
- Check Gemini API key in `.env.local`
- Verify key is active in AI Studio
- Check API quota hasn't been exceeded

**Error:** `AI features disabled`

**Solution:**
- Ensure `NEXT_PUBLIC_GEMINI_API_KEY` is set
- Restart dev server after adding key
- Check browser console for specific errors

---

### Problem: TypeScript Errors

**Error:** `Type 'X' is not assignable to type 'Y'`

**Solution:**
```bash
# Check all type errors
npm run type-check

# Often fixed by clearing cache
rm -rf .next
npm run dev
```

---

### Problem: Hot Reload Not Working

**Solution:**
```bash
# Restart the dev server
# Press Ctrl+C to stop
npm run dev
```

---

### Problem: Slow Performance

**Solutions:**
1. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Update dependencies:**
   ```bash
   npm update
   ```

3. **Check system resources:**
   - Close other apps
   - Ensure 4GB+ RAM available

---

## Advanced Running Options

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Different Port

```bash
# Run on port 3001
npm run dev -- -p 3001
```

### With Environment Variables

```bash
# Windows
set NEXT_PUBLIC_CUSTOM_VAR=value && npm run dev

# macOS/Linux
NEXT_PUBLIC_CUSTOM_VAR=value npm run dev
```

### Debug Mode

```bash
# Enable debug logging
NODE_OPTIONS='--inspect' npm run dev
```

---

## Stopping the Application

### Stop Development Server

**In the terminal where server is running:**
```
Press Ctrl + C
```

**Or force close:**
```bash
# Windows
taskkill /F /IM node.exe

# macOS/Linux
pkill -f node
```

---

## Next Steps After Running

### For Users
1. Read [User Guide](user-guides/CUSTOMER_MANAGEMENT.md)
2. Try [AI Chatbot](features/CHATBOT.md)
3. Explore [SE Notes](features/SE_NOTES.md)

### For Developers
1. Read [Developer Guide](developer-guide/GETTING_STARTED.md)
2. Study [Architecture](architecture/OVERVIEW.md)
3. Learn [React Patterns](developer-guide/REACT_CONCEPTS.md)

### For Admins
1. Set up [Firebase](setup/FIREBASE_SETUP.md) properly
2. Configure [Environment](setup/ENVIRONMENT.md)
3. Review [Security](PROJECT_OVERVIEW.md#security)

---

## Quick Reference

| Task | Command |
|------|---------|
| **Install** | `npm install` |
| **Run (dev)** | `npm run dev` |
| **Run (prod)** | `npm run build && npm start` |
| **Stop** | `Ctrl + C` |
| **Test** | `npm test` |
| **Lint** | `npm run lint` |
| **Type check** | `npm run type-check` |

---

## Getting More Help

- **Documentation**: [README.md](README.md)
- **Project Overview**: [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- **Quick Start**: [QUICKSTART.md](QUICKSTART.md)
- **Troubleshooting**: [developer-guide/GETTING_STARTED.md#common-issues](developer-guide/GETTING_STARTED.md#common-issues)

---

**Last Updated**: February 2026  
**Tested On**: Windows 11, macOS 14, Ubuntu 22.04  
**Node Versions**: 18.x, 20.x, 22.x
