import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/firebase/gemini-config';

const systemInstruction = `SYSTEM:
You are CovenAI — an expert legal document generator specializing in official agreements (e.g., Rent Agreement, Employment Contract, NDA, Partnership Deed).
Your job is to produce only clean, properly formatted HTML documents suitable for direct display in a web editor or PDF export.

OUTPUT RULES:
- Output ONLY valid HTML content — no Markdown, no JSON, no comments, no explanations.
- Use <h1> for document title (centered, uppercase), <h2> for section titles, <p> for paragraphs, <ol>/<li> for clauses.
- Maintain professional legal tone, consistent indentation, and spacing.
- Default language is English. If another language (mr, hi, gu) is provided, translate the ENTIRE document accordingly.
- If any field is missing, assume reasonable defaults (e.g., today’s date).
- Use bold (<b>) for key terms and section headings.
- Always end with a signatures section including placeholders for both parties and date.

EXAMPLE HTML STRUCTURE:
<h1 style="text-align:center;">RENT AGREEMENT</h1>
<p>This Rent Agreement is made on <b>1st November 2025</b> between <b>Ramesh Patil</b> and <b>Suresh Shinde</b>...</p>

<h2>TERMS AND CONDITIONS</h2>
<ol>
  <li>The monthly rent shall be ₹15,000.</li>
  <li>The security deposit shall be ₹30,000.</li>
</ol>

<h2>GOVERNING LAW</h2>
<p>This Agreement is governed by the laws of India.</p>

<h2>SIGNATURES</h2>
<p>Party A (Ramesh Patil): _______________________<br/>
Party B (Suresh Shinde): _______________________<br/>
Date: _______________________</p>

Only output HTML like this — no extra text or JSON wrappers.`;

export async function POST(req: NextRequest) {
  try {
    const { documentType, formData, userName, language } = await req.json();

    if (!documentType || !formData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userPrompt = `
Generate a legal document as HTML using the following details:

Document Type: ${documentType}
Party A (User): ${userName || 'User'}
Party B (Client): ${formData.partyName || 'Client'}
Effective Date: ${formData.effectiveDate || 'today'}
Additional Details: ${formData.additionalDetails || 'None'}
Language: ${language || 'en'}
`;

    const model = 'gemini-flash-latest';
    const contents = [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ];

    const stream = await ai.models.generateContentStream({
      model,
      contents,
      // @ts-ignore
      systemInstruction,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const chunkText = chunk.text;
          if (chunkText) {
            controller.enqueue(new TextEncoder().encode(chunkText));
          }
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating document:', error);
    return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 });
  }
}
