import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const apiKey = process.env.GOOGLE_AI_API_KEY;
if (!apiKey) {
  console.error('GOOGLE_AI_API_KEY is not set in environment variables');
  throw new Error('Server configuration error');
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: Request) {
  try {
    console.log('Received request to generate document');
    
    const requestBody = await request.json();
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const { documentType, userInputs, language } = requestBody;

    if (!documentType || !userInputs) {
      console.error('Missing required fields:', { documentType, userInputs });
      return NextResponse.json(
        { error: 'Missing required fields: documentType and userInputs are required' },
        { status: 400 }
      );
    }

    console.log('Initializing model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are an expert legal document generator AI named CovenAI.

Your task is to create a professional, legally formatted document based on the user's inputs.

Document Type: ${documentType}
User Details: ${userInputs}
Language: ${language || 'English'}

If the user doesn't specify a language, generate the document in English.
If a specific Indian language (like Marathi, Hindi, Gujarati, etc.) is chosen, translate and format the document in that language with correct grammar, tone, and legal terms.

The document should have:
1. Proper title in bold
2. Structured sections with headings (e.g., Parties, Terms, Agreement Details, Signatures)
3. Legal language and formatting
4. At the end, include placeholders for signatures, dates, and witnesses.`;

    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    console.log('Received response from Gemini API');
    
    const response = await result.response;
    console.log('Gemini response status:', response.promptFeedback?.blockReason || 'Success');
    
    if (!response.candidates || response.candidates.length === 0) {
      console.error('No candidates in response:', response);
      throw new Error('No response content from AI model');
    }

    const text = response.text();
    console.log('Successfully generated document content');
    
    return NextResponse.json({ content: text });
  } catch (error) {
    console.error('Error generating document:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to generate document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
