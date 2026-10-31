'use strict';
/*
 * Minimal Node HTTP handler for a trusted CHAOSAI voice proxy.
 * Mount as POST /api/chaosai/voice in your own HTTPS server.
 * Keep ELEVENLABS_API_KEY in server environment variables; never ship it to the browser.
 */
const MAX_BODY = 12 * 1024;
const MAX_TEXT = 500;
const DEFAULT_VOICE = 'XFj57SKCdgD5SEUJbj1U';
const DEFAULT_MODEL = 'eleven_v4';
const rate = new Map();
function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.statusCode = status;
  res.setHeader?.('Content-Type', type);
  res.setHeader?.('Cache-Control', 'no-store');
  if (typeof res.end === 'function') res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
}
function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise((resolve, reject) => {
    let raw = '', size = 0;
    req.on('data', chunk => { size += chunk.length; if (size > MAX_BODY) { reject(Object.assign(new Error('BODY_TOO_LARGE'), { status: 413 })); req.destroy?.(); return; } raw += chunk; });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch (_) { reject(Object.assign(new Error('INVALID_JSON'), { status: 400 })); } });
    req.on('error', reject);
  });
}
function clientKey(req) { return String(req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim().slice(0, 80); }
async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader?.('Allow', 'POST'); return send(res, 405, { error: 'METHOD_NOT_ALLOWED' }); }
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return send(res, 503, { error: 'VOICE_PROVIDER_NOT_CONFIGURED' });
  const key = clientKey(req), now = Date.now(), windowMs = 60_000;
  const entry = rate.get(key);
  if (entry && now - entry.start < windowMs && entry.count >= 12) return send(res, 429, { error: 'RATE_LIMITED' });
  if (!entry || now - entry.start >= windowMs) rate.set(key, { start: now, count: 1 }); else entry.count++;
  let input;
  try { input = await readBody(req); } catch (e) { return send(res, e.status || 400, { error: e.message || 'INVALID_REQUEST' }); }
  const text = typeof input.text === 'string' ? input.text.trim() : '';
  if (!text || text.length > MAX_TEXT) return send(res, 400, { error: 'TEXT_LENGTH_INVALID', maxLength: MAX_TEXT });
  // The deployment owner controls the voice ID; do not accept arbitrary IDs from the client.
  const voiceId = process.env.CHAOSAI_VOICE_ID || DEFAULT_VOICE;
  const allowedModel = process.env.CHAOSAI_VOICE_MODEL || DEFAULT_MODEL;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`;
  let upstream;
  try {
    upstream = await fetch(url, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: allowedModel,
        voice_settings: { stability: 0.72, similarity_boost: 0.78, style: 0.18, use_speaker_boost: true }
      }),
      signal: AbortSignal.timeout(20_000)
    });
  } catch (_) { return send(res, 502, { error: 'VOICE_PROVIDER_UNAVAILABLE' }); }
  if (!upstream.ok) {
    // Do not forward provider response bodies, which can contain implementation details.
    return send(res, upstream.status === 429 ? 429 : 502, { error: upstream.status === 429 ? 'VOICE_PROVIDER_RATE_LIMITED' : 'VOICE_PROVIDER_ERROR' });
  }
  const audio = Buffer.from(await upstream.arrayBuffer());
  if (!audio.length || audio.length > 8 * 1024 * 1024) return send(res, 502, { error: 'AUDIO_SIZE_INVALID' });
  res.statusCode = 200;
  res.setHeader?.('Content-Type', upstream.headers.get('content-type') || 'audio/mpeg');
  res.setHeader?.('Content-Length', String(audio.length));
  res.setHeader?.('Cache-Control', 'no-store');
  res.setHeader?.('X-Content-Type-Options', 'nosniff');
  return res.end(audio);
}
module.exports = { handler, readBody, MAX_BODY, MAX_TEXT };
