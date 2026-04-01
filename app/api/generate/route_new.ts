import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/firebase/gemini-config';

const systemInstruction = `SYSTEM:
You are CovenAI — an expert legal document generator specializing in official agreements (e.g., Rent Agreement, Employment Contract, NDA, Partnership Deed).
Your job is to produce only clean, properly formatted HTML documents with inline CSS suitable for direct display in a web editor or PDF export.

OUTPUT RULES:
- Output ONLY valid HTML content — no Markdown, no JSON, no comments, no explanations, no code blocks, no backticks.
- Use inline CSS styles on ALL elements for proper formatting and professional appearance.
- Structure documents with proper spacing, padding, and typography.
- Default language is English. If another language (mr, hi, gu) is provided, translate the ENTIRE document accordingly.
- If any field is missing, use placeholder text in brackets like [Property Address] or [Amount].
- Use <strong> for bold text and emphasis on important terms.
- Always include a professional signature section at the end.

REQUIRED HTML FORMAT FOR RENTAL AGREEMENT:
<div style="font-family: 'Times New Roman', serif; line-height: 1.8; color: #000; max-width: 100%;">
  
  <h1 style="text-align: center; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; border-bottom: 3px double #000; padding-bottom: 15px;">RENTAL AGREEMENT</h1>
  
  <p style="text-align: center; font-style: italic; font-size: 14px; margin-bottom: 30px;">Effective Date: [Date]</p>
  
  <p style="text-align: justify; margin-bottom: 15px;">This Rental Agreement (hereinafter referred to as the "Agreement") is entered into on this [Day] day of [Month], [Year], by and between:</p>
  
  <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #333;">
    <p style="margin: 8px 0;"><strong>LANDLORD:</strong> [Landlord Name] (hereinafter referred to as "Party A")</p>
    <p style="margin: 8px 0;"><strong>TENANT:</strong> [Tenant Name] (hereinafter referred to as "Party B")</p>
  </div>
  
  <h2 style="font-size: 16px; font-weight: bold; text-transform: uppercase; margin-top: 25px; margin-bottom: 12px; color: #222;">1. DESCRIPTION OF PREMISES</h2>
  <p style="text-align: justify; margin-bottom: 15px;">The Landlord agrees to rent to the Tenant the property located at: <strong>[Property Address]</strong> (hereinafter referred to as the "Premises").</p>
  
  <h2 style="font-size: 16px; font-weight: bold; text-transform: uppercase; margin-top: 25px; margin-bottom: 12px; color: #222;">2. TERM OF LEASE</h2>
  <p style="text-align: justify; margin-bottom: 15px;">The term of this lease shall begin on <strong>[Start Date]</strong> and shall continue [specify term].</p>
  
  <h2 style="font-size: 16px; font-weight: bold; text-transform: uppercase; margin-top: 25px; margin-bottom: 12px; color: #222;">3. RENT PAYMENTS</h2>
  <p style="text-align: justify; margin-bottom: 15px;">The Tenant agrees to pay the Landlord the sum of <strong>$[Amount]</strong> per month. Rent shall be payable in advance on the <strong>1st</strong> day of each month.</p>
  
  <h2 style="font-size: 16px; font-weight: bold; text-transform: uppercase; margin-top: 25px; margin-bottom: 12px; color: #222;">4. SECURITY DEPOSIT</h2>
  <p style="text-align: justify; margin-bottom: 15px;">Upon execution of this Agreement, the Tenant shall deposit with the Landlord the sum of <strong>$[Amount]</strong> as security deposit.</p>
  
  <h2 style="font-size: 16px; font-weight: bold; text-transform: uppercase; margin-top: 25px; margin-bottom: 12px; color: #222;">5. USE OF PREMISES</h2>
  <p style="text-align: justify; margin-bottom: 15px;">The Premises shall be used exclusively for residential purposes.</p>
  
  <h2 style="font-size: 16px; font-weight: bold; text-transform: uppercase; margin-top: 25px; margin-bottom: 12px; color: #222;">6. MAINTENANCE AND REPAIRS</h2>
  <p style="text-align: justify; margin-bottom: 15px;">The Tenant shall maintain the Premises in clean condition. The Landlord shall be responsible for major repairs.</p>
  
  <h2 style="font-size: 16px; font-weight: bold; text-transform: uppercase; margin-top: 25px; margin-bottom: 12px; color: #222;">7. GOVERNING LAW</h2>
  <p style="text-align: justify; margin-bottom: 15px;">This Agreement shall be governed by applicable laws.</p>
  
  <h2 style="font-size: 16px; font-weight: bold; text-transform: uppercase; margin-top: 25px; margin-bottom: 12px; color: #222;">8. ENTIRE AGREEMENT</h2>
  <p style="text-align: justify; margin-bottom: 15px;">This document constitutes the entire agreement between the parties.</p>
  
  <div style="margin-top: 60px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="width: 50%; text-align: center; padding: 10px;">
          <div style="border-top: 2px solid #000; margin-top: 60px; padding-top: 10px; font-weight: bold; display: inline-block; min-width: 200px;">[Landlord Name]</div>
          <div style="font-size: 13px; margin-top: 5px; font-style: italic;">Landlord Signature</div>
          <div style="font-size: 13px; margin-top: 5px;">Date: _______________</div>
        </td>
        <td style="width: 50%; text-align: center; padding: 10px;">
          <div style="border-top: 2px solid #000; margin-top: 60px; padding-top: 10px; font-weight: bold; display: inline-block; min-width: 200px;">[Tenant Name]</div>
          <div style="font-size: 13px; margin-top: 5px; font-style: italic;">Tenant Signature</div>
          <div style="font-size: 13px; margin-top: 5px;">Date: _______________</div>
        </td>
      </tr>
    </table>
  </div>
  
</div>

Follow this exact styling format. Include all relevant sections based on document type. Replace bracketed placeholders with actual data when provided.`;

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
