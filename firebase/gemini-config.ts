import { GoogleGenAI } from '@google/genai';

// CRITICAL: Replace with your actual API key. Do not commit this file to version control.
const GEMINI_API_KEY = 'AIzaSyAEbLIznCqqcbhYpn8zfaGx0fOnBflepng';

if (!GEMINI_API_KEY || GEMINI_API_KEY === 'AIzaSyAEbLIznCqqcbhYpn8zfaGx0fOnBflepng') {
  console.error('CRITICAL: Gemini API key is not set in firebase/gemini-config.ts. Please replace the placeholder.');
}

export const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});
