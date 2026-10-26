/** User-facing messages for Firebase Auth errors (Google sign-in). */
export function firebaseAuthErrorMessage(error: unknown): string {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: string }).code)
      : '';
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : 'Sign-in failed';

  switch (code) {
    case 'auth/unauthorized-domain':
      return (
        'This site is not authorized for Firebase Auth. In Firebase Console → Authentication → ' +
        'Settings → Authorized domains, add customerengagementhub.vercel.app (no https://), then try again.'
      );
    case 'auth/operation-not-allowed':
      return 'Google sign-in is disabled in Firebase. Enable Google under Authentication → Sign-in method.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked. Allow popups for this site and try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled.';
    case 'auth/invalid-api-key':
      return (
        'Invalid Firebase API key in this deployment. Set NEXT_PUBLIC_FIREBASE_* on Vercel, then redeploy ' +
        '(env vars are baked in at build time).'
      );
    case 'auth/network-request-failed':
      return 'Network error talking to Firebase. Check your connection or corporate proxy.';
    default:
      if (message.includes('Firebase client is not configured')) {
        return 'Firebase web config is missing. Set NEXT_PUBLIC_FIREBASE_* on Vercel and redeploy.';
      }
      return message || 'Sign-in failed. Open the browser console (F12) for details.';
  }
}
