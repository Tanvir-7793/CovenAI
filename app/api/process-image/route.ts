import { NextResponse } from 'next/server';
import * as pdfParseModule from 'pdf-parse';
const SCANNER_GROQ_API_KEY = process.env.GROQ_API_KEY_SCANNER || process.env.GROQ_API_KEY;

export async function POST(req: Request) {
  try {
    if (!SCANNER_GROQ_API_KEY) {
      return new NextResponse('GROQ_API_KEY_SCANNER (or GROQ_API_KEY) is not configured', { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const fileData = formData.get('fileData') as string | null;
    const requestedFileType = (formData.get('fileType') as string | null) || '';

    if (!file && !fileData) {
      return new NextResponse('No file provided', { status: 400 });
    }

    let base64Data = '';
    let mimeType = requestedFileType || 'image/jpeg';

    if (fileData) {
      base64Data = fileData.includes('base64,') ? fileData.split('base64,')[1] : fileData;
      if (!requestedFileType && fileData.startsWith('data:')) {
        const mimeMatch = fileData.match(/^data:([^;]+);/);
        if (mimeMatch?.[1]) {
          mimeType = mimeMatch[1];
        }
      }
    } else if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      base64Data = buffer.toString('base64');
      mimeType = file.type || mimeType;
    }

    // PDF cannot be sent as image_url to Groq vision; extract text directly.
    if (mimeType === 'application/pdf') {
      const pdfBuffer = Buffer.from(base64Data, 'base64');
      const pdfParse = (pdfParseModule as unknown as { default?: (dataBuffer: Buffer) => Promise<{ text?: string }> }).default
        || (pdfParseModule as unknown as (dataBuffer: Buffer) => Promise<{ text?: string }>);
      const parsedPdf = await pdfParse(pdfBuffer);
      const text = (parsedPdf.text || '').trim();

      if (!text) {
        return new NextResponse('Could not extract text from PDF. Please upload a clearer PDF or image.', { status: 400 });
      }

      return NextResponse.json({ text });
    }

    const imageUrl = `data:${mimeType};base64,${base64Data}`;
    const prompt = 'Extract all visible text from this document image. Preserve line breaks and structure. Keep original language. Return plain text only.';
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SCANNER_GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 1800,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new NextResponse(`Groq OCR request failed: ${errorText}`, { status: response.status });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || '';

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error processing image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
