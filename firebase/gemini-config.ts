import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('CRITICAL: NEXT_PUBLIC_GEMINI_API_KEY environment variable is not set.');
}

export const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});
