# Deploy Firestore Rules (Fix "Missing or insufficient permissions")

The "Missing or insufficient permissions" error means your Firestore rules must be deployed to Firebase.

## Quick steps

1. **Install Firebase CLI** (if not installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Log in to Firebase**:
   ```bash
   firebase login
   ```

3. **Select your project** (use your project ID from `.env.local` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`):
   ```bash
   firebase use YOUR_PROJECT_ID
   ```

4. **Deploy the rules**:
   ```bash
   npm run deploy:rules
   ```

   Or:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Verify

After deploying, reload the app and try again. The rules in [`firestore.rules`](../firestore.rules) allow read/write for signed-in users (`request.auth != null`) on customers, notes, opportunities, contacts, products, partners, martech tools, **engagement tasks**, **task categories**, and related collections. For production multi-tenant isolation, tighten rules with `orgId` or similar (see [SECURITY.md](SECURITY.md)).

## Manual deploy (alternative)

1. Open [Firebase Console](https://console.firebase.google.com) → your project
2. Go to **Firestore Database** → **Rules**
3. Copy the contents of `firestore.rules` into the editor
4. Click **Publish**
