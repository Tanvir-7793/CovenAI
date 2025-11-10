import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google's Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString('base64');
    const mimeType = file.type;

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    
    const prompt = "Extract all text from this image. Preserve the formatting, line breaks, and structure as much as possible. Include all visible text, including headers, footers, and page numbers. If there are any handwritten notes or annotations, include those as well. Format the output to maintain the original document's structure.";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      },
    ]);

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error processing image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
