# Firebase Integration Setup Guide

## Step-by-Step Instructions to Complete Firebase Integration

### 1. Firebase Console Configuration

1. **Go to your Firebase Console**: https://console.firebase.google.com/u/0/project/

2. **Enable Authentication**:
   - Go to "Authentication" in the left sidebar
   - Click "Get started"
   - Go to "Sign-in method" tab
   - Enable "Google" provider
   - Add your domain to authorized domains (localhost:3000 for development)

3. **Enable Firestore Database**:
   - Go to "Firestore Database" in the left sidebar
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location for your database

4. **Get Firebase Configuration**:
   - Go to "Project Settings" (gear icon)
   - Scroll down to "Your apps" section
   - If you don't have a web app, click "Add app" and select web
   - Copy the Firebase configuration object

### 2. Environment Variables Setup

Update your `.env.local` file with your actual Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
```

### 3. Firestore Security Rules (Optional but Recommended)

In your Firebase Console, go to Firestore Database > Rules and update with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Authenticated users can read/write customers
    match /customers/{customerId} {
      allow read, write: if request.auth != null;
    }
    
    // Authenticated users can read/write customer profiles
    match /customerProfiles/{profileId} {
      allow read, write: if request.auth != null;
    }
    
    // Authenticated users can read/write customer notes
    match /customerNotes/{noteId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test the login flow**:
   - Open http://localhost:3000
   - You should see the login page
   - Click "Sign in with Google"
   - Complete the Google authentication
   - You should be redirected to the main dashboard

3. **Test CRUD operations**:
   - Try creating a new customer
   - Add notes to customers
   - Verify data is saved to Firestore
   - Check that user information is tracked

### 5. What's Been Implemented

✅ **Authentication System**:
- Google OAuth integration
- User context with name and initials
- Protected routes
- Login/logout functionality

✅ **Firebase Services**:
- Customer management (CRUD)
- Customer profile management (CRUD)
- Customer notes management (CRUD)
- User tracking for all operations

✅ **UI Components**:
- Login page with Google sign-in
- User header with profile and logout
- Loading states
- Error handling

✅ **Data Migration**:
- All CRUD operations now use Firebase
- User information is tracked for all operations
- Fallback to dummy data if Firebase fails

### 6. Key Features

- **User Authentication**: Google OAuth with user profile management
- **Real-time Data**: All data is stored in Firestore
- **User Tracking**: Every CRUD operation tracks who created/updated the data
- **Responsive Design**: Works on desktop and mobile
- **Error Handling**: Graceful fallbacks and error messages
- **Loading States**: User feedback during data operations

### 7. Next Steps (Optional Enhancements)

- Add user roles and permissions
- Implement real-time updates with Firestore listeners
- Add data export/import functionality
- Implement advanced search and filtering
- Add data validation and error boundaries
- Implement offline support with Firestore offline persistence

### 8. Troubleshooting

**Common Issues**:

1. **Authentication not working**:
   - Check Firebase console authentication settings
   - Verify authorized domains include localhost:3000
   - Check environment variables are correct

2. **Firestore permission denied**:
   - Check Firestore security rules
   - Ensure user is authenticated before making requests

3. **Data not loading**:
   - Check browser console for errors
   - Verify Firestore database is created and accessible
   - Check network tab for failed requests

4. **Environment variables not loading**:
   - Restart your development server after updating .env.local
   - Ensure variables start with NEXT_PUBLIC_

The integration is now complete! Your application will require users to sign in with Google before accessing any features, and all data will be stored in Firebase Firestore with proper user tracking.
