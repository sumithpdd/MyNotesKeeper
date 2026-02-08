// Simple test to verify environment variable is loaded
export const TEST_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

console.log('🔍 Environment Variable Check:');
console.log('Has KEY:', !!TEST_API_KEY);
console.log('Key value:', TEST_API_KEY?.substring(0, 10) + '...');
console.log('Full env keys:', Object.keys(process.env).filter(k => k.includes('GEMINI')));

