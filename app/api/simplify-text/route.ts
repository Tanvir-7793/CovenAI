import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google's Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  console.log('Simplify-text endpoint called');
  
  try {
    // Check if request has a body
    if (!req.body) {
      console.error('No request body');
      return new NextResponse(JSON.stringify({ error: 'No request body' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse the request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new NextResponse(
        JSON.stringify({ error: 'Invalid JSON in request body' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { text, image, language } = requestBody;
    console.log('Request received with:', { 
      hasText: !!text, 
      textLength: text?.length || 0,
      hasImage: !!image,
      imageLength: image?.length || 0,
      language: language || 'auto'
    });

    if (!text && !image) {
      console.error('No text or image provided in request');
      return new NextResponse(
        JSON.stringify({ error: 'Either text or image must be provided' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing request with Gemini...');
    const result = await simplifyLegalText(text, image, language);
    
    return new NextResponse(JSON.stringify({
      simplifiedText: result.simplifiedText,
      ...(result.ocrText ? { ocrText: result.ocrText } : {})
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: unknown) {
    console.error('Error in simplify-text endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function simplifyLegalText(text?: string, imageData?: string, outputLanguage?: string): Promise<{ simplifiedText: string; ocrText?: string }> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      throw new Error('API key not configured');
    }

    console.log('Initializing Gemini model...');
    const model = text && !imageData 
      ? genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
      : genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    
    let result;
    let ocrText = '';

    if (imageData) {
      console.log('Processing image with Gemini...');
      // Extract base64 data from data URL if needed
      const base64Data = imageData.includes('base64,') 
        ? imageData.split('base64,')[1] 
        : imageData;
      
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg' // Default to jpeg, adjust if needed
        }
      };

      const prompt = "Extract all text from this image. Preserve the formatting, line breaks, and structure as much as possible. Maintain the original language of the text (e.g., if it's in Marathi, extract it in Marathi; if Hindi, extract in Hindi). Do not translate the text.";
      const result = await model.generateContent([prompt, imagePart]);
      ocrText = (await result.response.text()).trim();
      
      if (!ocrText) {
        throw new Error('No text could be extracted from the image');
      }
      
      console.log('Successfully extracted text from image');
      
      // If we only have image data, use the OCR text as input for simplification
      if (!text) {
        text = ocrText;
      }
    }

    if (!text) {
      throw new Error('No text provided for simplification');
    }
    
    console.log('Simplifying text with Gemini...');
    
    // Language mapping
    const languageMap: Record<string, string> = {
      'en': 'English',
      'mr': 'Marathi',
      'hi': 'Hindi',
      'gu': 'Gujarati',
      'auto': 'same as the input text'
    };
    
    const targetLanguage = outputLanguage && languageMap[outputLanguage] 
      ? languageMap[outputLanguage] 
      : 'same as the input text';
    
    // Build prompt based on language selection
    let simplifyPrompt: string;
    
    if (outputLanguage && outputLanguage !== 'auto' && languageMap[outputLanguage]) {
      // User selected a specific language
      simplifyPrompt = `Please simplify the following legal text in ${languageMap[outputLanguage]}. 
      
      IMPORTANT INSTRUCTIONS:
      1. Simplify the text in ${languageMap[outputLanguage]}
      2. If the input text is in a different language, translate it to ${languageMap[outputLanguage]} while simplifying
      3. Make the legal text easy to understand for a non-lawyer
      4. Keep the meaning accurate but use simpler language and shorter sentences
      5. Break down complex legal concepts into straightforward explanations
      6. If there are important legal terms, you can keep them but provide simple explanations in parentheses (in ${languageMap[outputLanguage]})
      7. Ensure the output is entirely in ${languageMap[outputLanguage]}
      
      Here's the text to simplify:
      ${text}

      Remember: Respond ONLY in ${languageMap[outputLanguage]}.`;
    } else {
      // Auto-detect: use the same language as input
      simplifyPrompt = `Please analyze the following text and simplify it in the SAME LANGUAGE as the input text. 
      
      IMPORTANT INSTRUCTIONS:
      1. First, detect the language of the input text (e.g., English, Marathi, Hindi, Gujarati, etc.)
      2. Simplify the text in the EXACT SAME LANGUAGE as the input
      3. If the text is in Marathi, respond in Marathi. If it's in Hindi, respond in Hindi. If English, respond in English.
      4. Make the legal text easy to understand for a non-lawyer while keeping the same language
      5. Keep the meaning accurate but use simpler language and shorter sentences
      6. Break down complex legal concepts into straightforward explanations
      7. If there are important legal terms, you can keep them but provide simple explanations in parentheses (in the same language)
      8. Preserve the original language - DO NOT translate to English
      
      Here's the text to simplify:
      ${text}

      Remember: Respond in the SAME LANGUAGE as the input text.`;
    }

    const simplifyResult = await model.generateContent(simplifyPrompt);
    const simplifiedText = (await simplifyResult.response.text()).trim();
    
    if (!simplifiedText) {
      throw new Error('No simplified text in response from Gemini');
    }
    
    console.log('Successfully simplified text');
    return { 
      simplifiedText,
      ...(ocrText ? { ocrText } : {})
    };
    
  } catch (error: unknown) {
    console.error('Error in simplifyLegalText:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    throw new Error(`Failed to process text: ${errorMessage}`);
  }
}
