# Environment Setup Guide

## Overview

This guide explains how to configure environment variables and API keys for the Customer Engagement Hub.

## Environment Variables

### Required Variables

Create a `.env.local` file in the project root:

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

### Getting API Keys

#### Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create new)
3. Click gear icon → Project Settings
4. Scroll to "Your apps" section
5. Add web app if needed
6. Copy configuration values

#### Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google account
3. Click "Get API Key" or "Create API Key"
4. Select project or create new
5. Copy the generated key (starts with `AIza...`)

## Setup Steps

### 1. Create Environment File

```bash
# Create .env.local file
touch .env.local
```

Or create manually in project root.

### 2. Add Configuration

Paste configuration into `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=myproject.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=myproject
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=myproject.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

NEXT_PUBLIC_GEMINI_API_KEY=AIza...
```

### 3. Restart Development Server

**Important**: Environment variables are only loaded at server startup.

```bash
# Stop server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### 4. Verify Configuration

Open browser console (F12) and check for:
- No authentication errors
- Firebase connection successful
- AI features working

## Variable Naming

### NEXT_PUBLIC_ Prefix

Variables with `NEXT_PUBLIC_` prefix are:
- Accessible in browser
- Included in client bundle
- Safe for client-side use
- Loaded at build/start time

**Why needed**:
- Firebase SDK runs client-side
- Gemini API called from browser
- Next.js requires prefix for client access

### Security

These are **PUBLIC** variables:
- Safe to expose to browser
- Not secret credentials
- Protected by Firebase security rules
- Rate-limited by Google APIs

## Common Issues

### Variables Not Loading

**Problem**: API keys show as undefined

**Solution**:
1. Check `.env.local` exists in project root
2. Verify variable names have `NEXT_PUBLIC_` prefix
3. Restart development server
4. Clear browser cache

### Firebase Connection Errors

**Problem**: "Firebase not configured" error

**Solution**:
1. Verify all Firebase variables are set
2. Check values match Firebase console
3. Ensure no extra spaces in `.env.local`
4. Restart server

### Gemini API Errors

**Problem**: AI features not working

**Solution**:
1. Verify API key starts with "AIza"
2. Check key is valid in Google AI Studio
3. Ensure key has no restrictions
4. Restart server after adding key

## Best Practices

### Development

- Keep `.env.local` in project root
- Never commit `.env.local` to git
- Use `.env.example` as template
- Document required variables

### Production

- Set environment variables in hosting platform
- Use secrets management for sensitive data
- Rotate keys regularly
- Monitor API usage

### Team Collaboration

- Share `.env.example` with team
- Don't share actual keys in chat/email
- Each developer gets own keys
- Document setup process

## Environment File Template

Create `.env.example` for team:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=app_id

# Google Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
```

## Verification Checklist

- [ ] `.env.local` file created
- [ ] All variables added
- [ ] Firebase variables correct
- [ ] Gemini API key valid
- [ ] Development server restarted
- [ ] No console errors
- [ ] Authentication works
- [ ] AI features work

## Troubleshooting

### Check Variables Loaded

In browser console:
```javascript
console.log('Firebase API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...');
console.log('Gemini API Key:', process.env.NEXT_PUBLIC_GEMINI_API_KEY?.substring(0, 10) + '...');
```

### Common Mistakes

❌ Wrong:
```env
# Missing NEXT_PUBLIC_ prefix
FIREBASE_API_KEY=...

# Extra quotes
NEXT_PUBLIC_FIREBASE_API_KEY="your_key"

# Spaces around =
NEXT_PUBLIC_FIREBASE_API_KEY = your_key
```

✅ Correct:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
```

## Related Documentation

- [Firebase Setup](FIREBASE_SETUP.md) - Detailed Firebase configuration
- [Getting Started](../developer-guide/GETTING_STARTED.md) - Initial setup
- [Architecture](../architecture/OVERVIEW.md) - System design

---

**Last Updated**: November 2025

