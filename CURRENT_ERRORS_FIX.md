# Quick Fix Guide - Current Errors

## ✅ Fixed Issues

### 1. Turbopack Root Warning
**Status**: ✅ FIXED
- Updated `next.config.ts` with explicit root directory
- Warning should be gone after server restart

### 2. Metadata Warnings (themeColor, viewport)
**Status**: ✅ FIXED  
- Updated `src/app/layout.tsx` to use Next.js 15's new `viewport` export
- Warnings will disappear after server restart

---

## 🔥 Remaining Issue: Firebase Permissions

### Error
```
FirebaseError: Missing or insufficient permissions
```

### Cause
Firestore security rules are blocking access to your database.

### Solution

#### Step 1: Go to Firebase Console
🔗 [Open Firestore Rules](https://console.firebase.google.com/project/customerengagementhub/firestore/rules)

#### Step 2: Update Security Rules

Click the **"Rules"** tab and replace with:

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

#### Step 3: Publish Rules

Click **"Publish"** button to apply the changes.

### What This Does
- ✅ Allows authenticated users to read/write data
- ✅ Blocks unauthenticated access (secure)
- ✅ Works for all collections

### Alternative: Detailed Rules

For more granular control, use the rules in `firestore.rules` file:
- Specific permissions per collection
- Better security
- Easier to maintain

---

## 🔄 After Fixing

1. **Publish the Firestore rules** in Firebase Console
2. **Wait 1-2 minutes** for rules to propagate
3. **Refresh your browser** (http://localhost:3000)
4. **Try signing in** with Google
5. **Create a customer** to test database access

---

## 📋 Checklist

- [x] Turbopack root configured
- [x] Metadata warnings fixed
- [ ] Firestore rules updated in Firebase Console
- [ ] Rules published
- [ ] App tested with sign-in

---

## 🆘 If Still Having Issues

### Authentication Not Working
- Check: Is Google sign-in enabled in Firebase Console?
- Check: Is `localhost` in authorized domains?
- See: `docs/setup/FIREBASE_SETUP.md`

### Database Still Blocked
- Wait 2-3 minutes after publishing rules
- Check rules were published (not just saved)
- Verify you're signed in (check console for auth state)
- Try signing out and back in

### Other Errors
- Check browser console (F12) for specific error messages
- Check terminal for server-side errors
- See: `docs/HOW_TO_RUN.md#troubleshooting`

---

**Last Updated**: February 8, 2026  
**Status**: 2/3 issues fixed, 1 requires Firebase Console action
