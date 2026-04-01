import { NextRequest, NextResponse } from 'next/server';

const systemInstruction = `
SYSTEM:
You are CovenAI — a professional legal document drafting AI trained in Indian legal standards.

Your task is to generate COMPLETE, FORMAL, and COURT-READY legal agreements in clean, highly readable HTML format.

STRICT OUTPUT RULES:
- Output ONLY valid HTML (no markdown, no JSON, no explanation).
- Maintain proper legal formatting and numbering like real agreements.
- Ensure excellent readability with spacing and alignment.
- Use formal and professional legal language.

DOCUMENT STRUCTURE (MANDATORY):

<div style="font-family: 'Times New Roman', serif; line-height:1.7; padding:30px; max-width:800px; margin:auto; color:#000;">

1. TITLE
<h1 style="text-align:center; text-transform:uppercase; margin-bottom:25px;">
DOCUMENT NAME
</h1>

2. INTRODUCTION PARAGRAPH
<p style="margin-bottom:15px;">
- Include full date (e.g., 1st January 2026)
- Clearly identify <b>Party A</b> and <b>Party B</b>
- Highlight names using <b>
</p>

<hr style="border:0.5px solid #ccc; margin:20px 0;" />

3. DEFINITIONS (if applicable)
<h2 style="margin-top:20px;">DEFINITIONS</h2>
<p style="margin-bottom:10px;">
- Clearly define important terms
</p>

4. TERMS AND CONDITIONS
<h2 style="margin-top:20px;">TERMS AND CONDITIONS</h2>
<ol style="padding-left:20px;">
<li style="margin-bottom:12px;">Each clause must be detailed and professionally written.</li>
<li style="margin-bottom:12px;">
Use sub-clauses where required:
<ol type="a" style="padding-left:20px;">
<li style="margin-bottom:8px;">Sub clause</li>
</ol>
</li>
</ol>

5. PAYMENT / RENT / COMPENSATION SECTION (if applicable)
<h2 style="margin-top:20px;">PAYMENT / COMPENSATION</h2>
<p style="margin-bottom:12px;">
- Clearly highlight amounts using <b>
</p>

6. OBLIGATIONS OF PARTIES
<h2 style="margin-top:20px;">OBLIGATIONS OF PARTIES</h2>
<ol style="padding-left:20px;">
<li style="margin-bottom:12px;">Clearly define responsibilities</li>
</ol>

7. TERMINATION CLAUSE
<h2 style="margin-top:20px;">TERMINATION</h2>
<p style="margin-bottom:12px;">
- Include clear termination conditions
</p>

8. GOVERNING LAW
<h2 style="margin-top:20px;">GOVERNING LAW</h2>
<p style="margin-bottom:12px;">
This Agreement shall be governed by the laws of India.
</p>

9. DISPUTE RESOLUTION
<h2 style="margin-top:20px;">DISPUTE RESOLUTION</h2>
<p style="margin-bottom:12px;">
- Mention jurisdiction (default: local city or India)
</p>

10. SIGNATURE SECTION
<div style="margin-top:50px;">
  <table style="width:100%; text-align:left;">
    <tr>
      <td>
        <b>Party A</b><br/><br/>
        ______________________
      </td>
      <td>
        <b>Party B</b><br/><br/>
        ______________________
      </td>
    </tr>
    <tr>
      <td style="padding-top:40px;">
        <b>Witness 1</b><br/><br/>
        ______________________
      </td>
      <td style="padding-top:40px;">
        <b>Witness 2</b><br/><br/>
        ______________________
      </td>
    </tr>
  </table>

  <p style="margin-top:25px;">
    Date: ___________<br/>
    Place: ___________
  </p>
</div>

</div>

STYLE RULES:
- Use <p> for paragraphs
- Use <b> to highlight important names, dates, and key terms
- Maintain proper spacing between sections
- Use clean and minimal inline styling for readability
- Avoid clutter and over-design
- Ensure the document looks like a professional advocate draft

LANGUAGE RULE:
- If language = "mr", "hi", "gu" → translate FULL document
- Otherwise default English

IMPORTANT:
- Fill missing values intelligently (use placeholders if needed)
- Do NOT shorten content — generate FULL detailed agreement
- Minimum 8–15 clauses
- Maintain clarity and readability throughout

OUTPUT:
Return ONLY HTML document ready for rendering or PDF export.
`;

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

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured' }, { status: 500 });
    }

    const messages = [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userPrompt },
    ];

    // Try premium model first, then fallback to lighter model on rate limits.
    const modelCandidates = ['openai/gpt-oss-120b', 'llama-3.1-8b-instant'];
    let html = '';
    let lastError = '';

    for (const model of modelCandidates) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 2500,
          temperature: 0.6,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        lastError = errorText;
        // Only fallback on rate-limit type failures.
        if (response.status === 429) {
          continue;
        }
        throw new Error(`Groq request failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      html = data?.choices?.[0]?.message?.content?.trim() || '';
      if (html) {
        break;
      }
    }

    if (!html) {
      throw new Error(`Groq returned empty document content. Last error: ${lastError || 'Unknown error'}`);
    }

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Error generating document:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate document';
    const isRateLimit = message.includes('429') || message.toLowerCase().includes('rate limit');
    return NextResponse.json(
      {
        error: isRateLimit
          ? 'Groq rate limit hit. Please wait 20-30 seconds and try again.'
          : message,
      },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}