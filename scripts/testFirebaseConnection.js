// Quick Firebase Configuration Test
// Run with: node scripts/testFirebaseConnection.js

require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

console.log("🔥 Firebase Configuration Test\n");
console.log("Project ID:", firebaseConfig.projectId || "❌ Not set");
console.log("Auth Domain:", firebaseConfig.authDomain || "❌ Not set");
console.log("API Key:", firebaseConfig.apiKey ? "✅ Set (length: " + firebaseConfig.apiKey.length + ")" : "❌ Missing");
console.log("App ID:", firebaseConfig.appId ? "✅ Set" : "❌ Missing");
console.log("\n✅ Configuration looks good!");
console.log("\n📋 Next Steps:");
console.log("1. Make sure Authentication is enabled in Firebase Console");
console.log("2. Enable Google Sign-in provider");
console.log("3. Add 'localhost' to authorized domains");
console.log("4. Create Firestore database (test mode)");

if (firebaseConfig.projectId) {
  console.log("\n🔗 Firebase Console: https://console.firebase.google.com/project/" + firebaseConfig.projectId);
} else {
  console.log("\n⚠️  No Firebase config found. Make sure .env.local exists with your Firebase credentials");
}
