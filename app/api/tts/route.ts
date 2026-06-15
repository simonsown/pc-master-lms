export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text');
  const lang = searchParams.get('lang') || 'vi';
  if (!text) {
    return new Response('Missing text', { status: 400 });
  }

  const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(googleUrl);
    if (!res.ok) {
      return new Response('TTS unavailable', { status: 502 });
    }
    const audio = await res.arrayBuffer();
    return new Response(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new Response('TTS failed', { status: 502 });
  }
}
