# Sign-In Not Redirecting - Troubleshooting Guide

## Issue
After successfully signing in with Google, the app stays on the login page instead of redirecting to the home page.

## Root Cause
This is almost always due to **Firestore permissions blocking the user document creation**.

When you sign in:
1. ✅ Google authentication succeeds
2. ❌ App tries to create user document in Firestore
3. ❌ Firestore blocks the request (permissions)
4. ❌ App thinks authentication failed
5. ❌ Stays on login page

## Quick Fix

### Step 1: Update Firestore Rules

Go to: https://console.firebase.google.com/project/customerengagementhub/firestore/rules

Replace with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Click **"Publish"**

### Step 2: Check Browser Console

1. Open browser console (F12)
2. Look for these messages after signing in:
   - ✅ `"Google sign-in successful: your@email.com"`
   - ✅ `"Creating/updating user document for: your@email.com"`
   - ❌ `"Error creating user document: Missing or insufficient permissions"`

If you see the error, the Firestore rules aren't published yet.

### Step 3: Hard Refresh

After publishing Firestore rules:
1. Wait 1-2 minutes for rules to propagate
2. Sign out (if signed in)
3. Hard refresh browser (Ctrl + Shift + R)
4. Sign in again

## Updated Code

I've updated `src/lib/auth.tsx` to:
- ✅ Log authentication progress to console
- ✅ Allow login even if Firestore fails (graceful degradation)
- ✅ Show clear error messages about permissions

## What to Check

### In Browser Console (F12)
After clicking "Sign in with Google":

**Expected Success Flow:**
```
Starting Google sign-in...
Google sign-in successful: your@email.com
Creating/updating user document for: your@email.com
User document created successfully
Auth state changed: User logged in
→ Home page loads ✅
```

**If Permissions Issue:**
```
Starting Google sign-in...
Google sign-in successful: your@email.com
Creating/updating user document for: your@email.com
Error creating user document: Missing or insufficient permissions
This is likely a Firestore permissions issue. Check Firebase Console
Auth state changed: User logged in
→ Home page should still load now! ✅
```

## Testing Steps

1. **Open browser console** (F12)
2. **Click "Sign in with Google"**
3. **Watch console messages**
4. **Look for errors**

### Common Scenarios

#### Scenario 1: Firestore Rules Not Published
```
Error: Missing or insufficient permissions
```
**Fix**: Publish Firestore rules (see Step 1)

#### Scenario 2: Authentication Popup Blocked
```
Error: Popup blocked by browser
```
**Fix**: Allow popups for localhost

#### Scenario 3: API Key Invalid
```
Error: auth/invalid-api-key
```
**Fix**: Check Firebase config in `.env.local`

#### Scenario 4: Authorized Domain Not Set
```
Error: auth/unauthorized-domain
```
**Fix**: Add `localhost` to authorized domains in Firebase Console

## Firestore Rules Checklist

Go to: https://console.firebase.google.com/project/customerengagementhub/firestore

- [ ] Clicked "Firestore Database" in sidebar
- [ ] Clicked "Rules" tab
- [ ] Pasted the security rules
- [ ] Clicked "Publish" (not just save)
- [ ] Waited 1-2 minutes
- [ ] Refreshed browser
- [ ] Tried signing in again

## Still Not Working?

### Check These:

1. **Is Firestore Database created?**
   - Go to Firestore Database in Firebase Console
   - Should show "Cloud Firestore" not "Get Started"

2. **Are rules actually published?**
   - Check "Rules" tab shows your new rules
   - Look for green checkmark or "Published" status

3. **Is Authentication enabled?**
   - Go to Authentication in Firebase Console
   - Google provider should be "Enabled"

4. **Is localhost authorized?**
   - Authentication → Settings → Authorized domains
   - Should include `localhost`

## Quick Test

After updating Firestore rules, run this in browser console:
```javascript
// Check if user is authenticated
firebase.auth().currentUser
// Should show user object if signed in
```

Or check the AuthProvider logs:
```
Auth state changed: User logged in
User document created successfully
```

## Need More Help?

See detailed Firebase setup: `docs/setup/FIREBASE_SETUP.md`

---

**Last Updated**: February 8, 2026  
**Status**: Code updated with better error handling
