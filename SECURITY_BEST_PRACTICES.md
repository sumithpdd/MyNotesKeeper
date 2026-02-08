# Security Best Practices

## 🔒 Quick Reference Guide

### ✅ Your Project is Secure!

All API keys and secrets are properly protected. This guide explains best practices to keep it that way.

---

## 🎯 Golden Rules

1. **NEVER commit `.env.local`** - It's in `.gitignore` for a reason
2. **NEVER hardcode secrets** - Always use `process.env.*`
3. **Firebase API keys are PUBLIC** - This is normal and safe (see explanation below)
4. **Security = Authentication + Rules** - Not secret keys
5. **Review before committing** - Check for accidental secrets

---

## 🔐 Understanding Firebase Security

### Why Firebase API Keys Can Be Public

**Common Misconception:**
> "My Firebase API key is in client code, it's exposed!"

**Reality:**
> Firebase API keys are **designed** to be public. They identify your project, they don't secure it.

**Security comes from:**
1. ✅ **Firestore Security Rules** - Who can access what
2. ✅ **Authentication** - Verify user identity
3. ✅ **Authorized Domains** - Restrict where app can run
4. ✅ **Firebase App Check** - Verify requests come from your app

**Think of it like:**
- API Key = Your house address (public)
- Security Rules = Locks on your doors (secure)
- Authentication = Keys to get in (secure)

**Reference:** [Firebase: Using API Keys](https://firebase.google.com/docs/projects/api-keys#api-keys-for-firebase-are-different)

---

## 📁 What Goes Where

### ❌ NEVER Commit (`.gitignore`)

```
.env.local          # Your actual secrets
.env.development    # Development secrets
.env.production     # Production secrets
.firebase/          # Firebase cache
node_modules/       # Dependencies
```

### ✅ Safe to Commit

```
.env.example        # Template with placeholders
README.md           # Documentation
src/                # Source code (using process.env.*)
firestore.rules     # Security rules (these are your real security)
```

---

## 🔑 Managing Secrets

### Creating `.env.local`

```bash
# 1. Copy the example
copy .env.example .env.local

# 2. Edit with real values
# Use your code editor to add actual keys

# 3. NEVER commit it
# Already in .gitignore, but double-check:
git status
# Should NOT show .env.local
```

### Adding New Secrets

```javascript
// 1. Add to .env.local
NEXT_PUBLIC_NEW_API_KEY=your_key_here

// 2. Add placeholder to .env.example
NEXT_PUBLIC_NEW_API_KEY=your_new_api_key

// 3. Use in code
const apiKey = process.env.NEXT_PUBLIC_NEW_API_KEY;

// 4. Add validation
if (!apiKey) {
  throw new Error('NEW_API_KEY not configured');
}
```

### Environment Variable Naming

```bash
# Client-side (available in browser)
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_GEMINI_API_KEY=xxx

# Server-side only (NOT available in browser)
# Would be: DATABASE_PASSWORD=xxx
# Would be: PRIVATE_API_KEY=xxx
```

**Important:** `NEXT_PUBLIC_*` variables are **embedded in client bundle**. This is okay for Firebase/Gemini because security is handled elsewhere.

---

## 🛡️ Firestore Security Rules

### Your Real Security Layer

```javascript
// firestore.rules - This is what keeps your data safe!

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ❌ BAD: Anyone can access
    match /{document=**} {
      allow read, write: if true;
    }
    
    // ✅ GOOD: Only authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // ✅ BETTER: User-specific access
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### Publishing Rules

```bash
# Rules must be published in Firebase Console:
# 1. Go to Firestore Database → Rules
# 2. Paste your rules
# 3. Click "Publish" (not just save!)
```

---

## 👥 Team Collaboration

### Sharing Credentials

**❌ DON'T:**
- Email API keys
- Slack/Teams API keys
- Commit `.env.local`
- Share screenshots with keys

**✅ DO:**
- Use secure password manager (1Password, LastPass)
- Share Firebase Console access instead
- Document how to get keys (in README)
- Use different keys per environment

### Onboarding New Developers

```bash
# Share this process:

# 1. Clone repo
git clone <repo>

# 2. Copy env template
copy .env.example .env.local

# 3. Get credentials from:
# - Firebase Console (share access)
# - Google AI Studio (create own key)
# - Team password manager

# 4. Add keys to .env.local

# 5. Start development
npm run dev
```

---

## 🚨 If a Secret is Exposed

### Immediate Steps

1. **Don't Panic** - Follow the process
2. **Rotate the Key** - Generate new one immediately
3. **Check Activity** - Look for unauthorized access
4. **Update Everywhere** - All environments need new key
5. **Review How** - Prevent future exposure

### Rotating Firebase API Key

```bash
# 1. Firebase Console → Project Settings → Your Apps
# 2. Click "..." → "Reset key"
# 3. Copy new key
# 4. Update .env.local
# 5. Restart dev server
```

### Rotating Gemini API Key

```bash
# 1. Go to https://makersuite.google.com/app/apikey
# 2. Delete old key
# 3. Create new key
# 4. Update .env.local
# 5. Restart dev server
```

### Checking Git History

```bash
# Check if secret was committed
git log -p | grep "AIzaSy"

# If found in history, consider:
# 1. Rotating the key immediately
# 2. Using git-filter-branch or BFG Repo-Cleaner
# 3. Force pushing (if repository is private and small team)
```

---

## 📝 Code Review Checklist

### Before Committing

- [ ] No hardcoded API keys
- [ ] All secrets use `process.env.*`
- [ ] `.env.local` not staged
- [ ] Console.logs don't expose full keys
- [ ] Error messages don't leak secrets
- [ ] Comments don't contain secrets
- [ ] No database credentials in code

### Before Pushing

```bash
# Quick check
git diff origin/main

# Look for:
# - API keys (AIzaSy, pk_, sk_)
# - Passwords
# - Database URLs
# - Private tokens
```

---

## 🎓 Testing Without Exposing Secrets

### Using Environment Variables in Tests

```javascript
// ✅ GOOD: Mock in tests
jest.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
}));

// ✅ GOOD: Test with fake keys
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'fake-key-for-testing';
```

### Local Development

```bash
# Use .env.local for real keys
# Use .env.test for test keys (if needed)

# Never use production keys in development!
```

---

## 📊 Security Monitoring

### What to Monitor

1. **Firebase Console**
   - Unusual authentication patterns
   - Unexpected database usage
   - Error rates

2. **Application Logs**
   - Failed authentication attempts
   - Unauthorized access attempts
   - API errors

3. **Usage Quotas**
   - Firebase free tier limits
   - Gemini API quotas
   - Unusual spikes

### Setting Up Alerts

```
Firebase Console → Project Settings → Integrations
→ Enable alerts for:
  - Authentication anomalies
  - Usage spikes
  - Quota approaching limits
```

---

## ✅ Final Checklist

### Daily Development

- [ ] Using `.env.local` for secrets
- [ ] Never hardcoding keys
- [ ] Checking `git status` before committing
- [ ] Not logging full secrets

### Before Deployment

- [ ] All secrets in environment variables
- [ ] Security rules published
- [ ] Authentication enabled
- [ ] Authorized domains configured
- [ ] Secrets rotated (if needed)

### Monthly Maintenance

- [ ] Review security rules
- [ ] Check Firebase logs
- [ ] Update dependencies
- [ ] Review access permissions
- [ ] Test authentication flow

---

## 📚 Learn More

### Official Documentation
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [OWASP Security Guidelines](https://owasp.org/)

### In This Project
- [SECURITY_AUDIT.md](SECURITY_AUDIT.md) - Full security audit
- [docs/setup/FIREBASE_SETUP.md](docs/setup/FIREBASE_SETUP.md) - Firebase configuration
- [docs/setup/ENVIRONMENT.md](docs/setup/ENVIRONMENT.md) - Environment setup

---

**Remember:** Your data's security comes from **Security Rules + Authentication**, not from hiding API keys!

**Last Updated**: February 8, 2026  
**Security Status**: ✅ SECURE
