// Simple test to verify environment variable is loaded
export const TEST_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Never log key values - only presence check
if (typeof window === 'undefined') {
  console.log('🔍 Environment Variable Check:');
  console.log('Gemini API key configured:', !!TEST_API_KEY);
}

