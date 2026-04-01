import { NextResponse } from 'next/server';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const SCANNER_GROQ_API_KEY = process.env.GROQ_API_KEY_SCANNER || process.env.GROQ_API_KEY;

export async function POST(req: Request) {
  try {
    if (!req.body) {
      return new NextResponse(JSON.stringify({ error: 'No request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!SCANNER_GROQ_API_KEY) {
      return new NextResponse(JSON.stringify({ error: 'GROQ_API_KEY_SCANNER (or GROQ_API_KEY) is not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let requestBody: any;
    try {
      requestBody = await req.json();
    } catch {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { text, image, language } = requestBody;

    if (!text && !image) {
      return new NextResponse(
        JSON.stringify({ error: 'Either text or image must be provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await simplifyLegalText(text, image, language);

    return new NextResponse(JSON.stringify({
      simplifiedText: result.simplifiedText,
      ...(result.ocrText ? { ocrText: result.ocrText } : {}),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({
        error: errorMessage,
        details: errorMessage,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function simplifyLegalText(text?: string, imageData?: string, outputLanguage?: string): Promise<{ simplifiedText: string; ocrText?: string }> {
  try {
    let ocrText = '';

    if (imageData) {
      // OCR via Groq multimodal model
      let imageUrl = imageData;
      if (!imageData.startsWith('data:')) {
        imageUrl = `data:image/jpeg;base64,${imageData}`;
      }

      const ocrPrompt = 'Extract all visible text from this document image. Preserve line breaks and structure. Keep original language. Return plain text only.';
      ocrText = await groqChatWithFallback([
        {
          role: 'user',
          content: [
            { type: 'text', text: ocrPrompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ], ['meta-llama/llama-4-scout-17b-16e-instruct']);

      if (!ocrText) {
        throw new Error('No text could be extracted from the image');
      }

      if (!text) {
        text = ocrText;
      }
    }

    if (!text) {
      throw new Error('No text provided for simplification');
    }
    
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

    let simplifyPrompt: string;

    if (outputLanguage && outputLanguage !== 'auto' && languageMap[outputLanguage]) {
      simplifyPrompt = `Act as an expert legal advisor explaining a document to a normal person.
      Analyze the following document and explain what it is about in a very simple, easy-to-understand way in ${languageMap[outputLanguage]}. 
      
      IMPORTANT INSTRUCTIONS:
      1. Provide your response ENTIRELY in ${languageMap[outputLanguage]}.
      2. Start with a clear, 1-2 sentence high-level summary of what this document is (e.g., "This is a rental agreement between...", "This is a non-disclosure agreement protecting...").
      3. Do NOT just translate or copy the original text. You must EXPLAIN the document.
      4. Break down the key points, obligations, and rights mentioned in the text using simple bullet points.
      5. Make the legal text easy to understand for a non-lawyer. Use shorter sentences.
      6. If there are important legal terms, you can keep them but provide simple explanations in parentheses.
      7. Use clear Markdown formatting (e.g., headers like ### Summary, bullet points, bold text for key terms) to make it highly readable and visually structured.
      
      Here's the text to analyze and explain:
      ${text}

      Remember: Respond ONLY in ${targetLanguage} and explain what the document actually means.`;
    } else {
      simplifyPrompt = `Act as an expert legal advisor explaining a document to a normal person.
      Analyze the following document and explain what it is about in a very simple, easy-to-understand way. 
      
      IMPORTANT INSTRUCTIONS:
      1. First, detect the language of the input text (e.g., English, Marathi, Hindi, Gujarati, etc.).
      2. Provide your response in the EXACT SAME LANGUAGE as the input text.
      3. Start with a clear, 1-2 sentence high-level summary of what this document is.
      4. Do NOT just copy or repeat the original text. You must EXPLAIN what the document means.
      5. Break down the key points, obligations, and rights mentioned in the text using simple bullet points.
      6. Make the legal text easy to understand for a non-lawyer while keeping the same language.
      7. If there are important legal terms, provide simple explanations in parentheses (in the same language).
      8. Preserve the original language direction natively - DO NOT translate to English.
      9. Use clear Markdown formatting (e.g., headers like ### Summary, bullet points, bold text for key terms) to make it highly readable and visually structured.
      
      Here's the text to analyze and explain:
      ${text}

      Remember: Respond in the SAME LANGUAGE as the input text, and clearly explain what the document actually means.`;
    }

    const simplifiedText = await groqChatWithFallback(
      [{ role: 'user', content: simplifyPrompt }],
      ['openai/gpt-oss-120b', 'llama-3.1-8b-instant']
    );

    if (!simplifiedText) {
      throw new Error('No simplified text in response from Groq');
    }

    return {
      simplifiedText,
      ...(ocrText ? { ocrText } : {}),
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('rate limit')) {
      throw new Error('Groq rate limit hit. Please wait 20-30 seconds and try again.');
    }

    throw new Error(`Failed to process text: ${errorMessage}`);
  }
}

async function groqChatWithFallback(messages: any[], models: string[]): Promise<string> {
  let lastError = '';

  for (const model of models) {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SCANNER_GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 2200,
        stream: false,
      }),
    });

    if (!response.ok) {
      lastError = await response.text();
      if (response.status === 429) {
        continue;
      }
      throw new Error(`Groq request failed (${response.status}): ${lastError}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (content) {
      return content;
    }
  }

  throw new Error(lastError || 'Groq did not return valid content.');
}
