import { NextResponse } from 'next/server';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const DEFAULT_ELEVENLABS_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

function getVoiceId(language: string): string | undefined {
  const normalized = (language || 'en').toLowerCase();
  if (normalized === 'mr') {
    return process.env.ELEVENLABS_VOICE_ID_MR || process.env.ELEVENLABS_VOICE_ID_HI || process.env.ELEVENLABS_VOICE_ID;
  }
  if (normalized === 'hi') {
    return process.env.ELEVENLABS_VOICE_ID_HI || process.env.ELEVENLABS_VOICE_ID;
  }
  if (normalized === 'gu') {
    return process.env.ELEVENLABS_VOICE_ID_GU || process.env.ELEVENLABS_VOICE_ID_HI || process.env.ELEVENLABS_VOICE_ID;
  }
  return process.env.ELEVENLABS_VOICE_ID_EN || process.env.ELEVENLABS_VOICE_ID;
}

function getVoiceSettings(language: string) {
  const normalized = (language || 'en').toLowerCase();
  if (normalized === 'mr') {
    return {
      stability: 0.35,
      similarity_boost: 0.9,
      style: 0.25,
      use_speaker_boost: true,
    };
  }

  if (normalized === 'hi' || normalized === 'gu') {
    return {
      stability: 0.4,
      similarity_boost: 0.85,
      style: 0.3,
      use_speaker_boost: true,
    };
  }

  return {
    stability: 0.45,
    similarity_boost: 0.8,
    style: 0.4,
    use_speaker_boost: true,
  };
}

export async function POST(req: Request) {
  try {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: 'ELEVENLABS_API_KEY is not configured' }, { status: 500 });
    }

    const { text, language } = await req.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required for speech generation' }, { status: 400 });
    }

    const requestedLanguage = language || 'en';
    const voiceId = getVoiceId(requestedLanguage) || DEFAULT_ELEVENLABS_VOICE_ID;
    const voiceSettings = getVoiceSettings(requestedLanguage);

    const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: voiceSettings,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `ElevenLabs request failed: ${errorText}` }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate speech';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
