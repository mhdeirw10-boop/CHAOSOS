#!/usr/bin/env node
'use strict';
/* CHAOSOS Cloud Foundation v0.3.0. Local development only; no public bind or production claim. */
const http = require('node:http');
const crypto = require('node:crypto');
const { createProvider } = require('./providers/openai-compatible.cjs');
const PORT = Math.max(1024, Math.min(65535, Number(process.env.PORT) || 8787));
const HOST = process.env.HOST || '127.0.0.1';
const TOKEN = process.env.CHAOSOS_API_TOKEN || '';
const CLIENT_TOKEN = process.env.CHAOSOS_CLIENT_TOKEN || '';
const aiProvider = createProvider(process.env);
const ALLOWED_ORIGINS = new Set((process.env.CHAOSOS_ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean));
const MAX_BODY = 64 * 1024, MAX_ITEMS = 500, MAX_PER_DEVICE = 50, WINDOW_MS = 60_000, MAX_REQUESTS = 60;
const records = new Map(), rates = new Map();
const started = Date.now();
const json = (res, status, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, { 'X-Request-Id': crypto.randomUUID(), 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body), 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
  res.end(body);
};
function same(a, b) { if (!a || !b) return false; const aa = Buffer.from(a), bb = Buffer.from(b); return aa.length === bb.length && crypto.timingSafeEqual(aa, bb); }
function authorize(req, expected) { const auth = String(req.headers.authorization || ''); return !!expected && auth.startsWith('Bearer ') && same(auth.slice(7), expected); }
function rateLimit(key) {
  const t = Date.now(); let x = rates.get(key);
  if (!x || t - x.start > WINDOW_MS) x = { start: t, count: 0 };
  x.count++; rates.set(key, x);
  if (rates.size > 2000) for (const [k, v] of rates) if (t - v.start > WINDOW_MS) rates.delete(k);
  return x.count <= MAX_REQUESTS;
}
async function body(req) {
  let raw = '', size = 0;
  for await (const chunk of req) { size += chunk.length; if (size > MAX_BODY) throw Object.assign(new Error('body too large'), { status: 413 }); raw += chunk; }
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { throw Object.assign(new Error('invalid JSON'), { status: 400 }); }
}
function safeId(v) { return typeof v === 'string' && /^[a-zA-Z0-9_-]{8,80}$/.test(v); }
function cleanCount(rows) { return rows.length; }
const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.size && !ALLOWED_ORIGINS.has(origin)) return json(res, 403, { ok: false, error: 'origin_not_allowed' });
  if (origin && ALLOWED_ORIGINS.has(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Authorization,Content-Type,X-CHAOSOS-Request-Mode', 'Vary': 'Origin' });
    return res.end();
  }
  const ip = req.socket.remoteAddress || 'unknown';
  if (!rateLimit(ip)) return json(res, 429, { ok: false, error: 'rate_limited' });
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, {
    ok: true, service: 'chaosos-cloud-foundation', version: '0.3.0', uptimeSeconds: Math.floor((Date.now() - started) / 1000),
    storage: 'ephemeral-memory', syncAuthConfigured: !!TOKEN, aiGatewayConfigured: !!CLIENT_TOKEN, aiProviderConfigured: aiProvider.configured, productionReady: false
  });
  if (url.pathname === '/api/v1/capabilities' && req.method === 'GET') return json(res, 200, {
    ok: true, apiVersion: 1, schemaVersion: 1, service: 'chaosos-cloud-foundation',
    endpoints: ['GET /health', 'GET /api/v1/status', 'GET /api/v1/capabilities', 'POST /api/v1/ai/respond', 'POST /api/v1/sync/push', 'POST /api/v1/sync/pull'],
    policies: { syncRequiresBearerToken: true, aiRequiresPerRequestConsentHeader: true, chatLogging: false, automaticSync: false, productionReady: false },
    allowedSyncKeys: ['system.settings.theme', 'system.settings.language', 'chaosai.preferences', 'chaosai.learning.metrics']
  });
  if (url.pathname === '/api/v1/status' && req.method === 'GET') return json(res, 200, {
    ok: true, apiVersion: 1, service: 'chaosos-cloud-foundation', syncEnabled: !!TOKEN, schemaVersion: 1,
    aiGatewayConfigured: !!CLIENT_TOKEN, aiProviderConfigured: aiProvider.configured, storage: 'ephemeral-memory', productionReady: false
  });
  if (url.pathname === '/api/v1/ai/respond' && req.method === 'POST') {
    if (!CLIENT_TOKEN || !aiProvider.configured) return json(res, 503, { ok: false, error: 'ai_gateway_disabled', message: 'بوابة الذكاء السحابي غير مهيأة؛ لا يوجد موفر AI مفعّل على الخادم.' });
    if (!authorize(req, CLIENT_TOKEN)) return json(res, 401, { ok: false, error: 'unauthorized', message: 'رمز وصول الجلسة غير صالح.' });
    if (req.headers['x-chaosos-request-mode'] !== 'explicit-user-consent') return json(res, 400, { ok: false, error: 'consent_header_required', message: 'يلزم مسار موافقة صريح.' });
    try {
      const data = await body(req);
      if (typeof data.prompt !== 'string' || !data.prompt.trim() || data.prompt.length > 8000) return json(res, 400, { ok: false, error: 'invalid_prompt', message: 'النص غير صالح أو تجاوز 8000 حرف.' });
      // Deliberately do not log prompt text, authentication headers, or provider responses.
      const result = await aiProvider.respond(data.prompt);
      return json(res, 200, { ok: true, answer: result.answer, model: result.model, provider: result.provider, stored: false });
    } catch (e) {
      const code = String(e?.code || 'AI_REQUEST_FAILED');
      const status = code === 'PROMPT_SIZE_INVALID' ? 400 : code === 'PROVIDER_TIMEOUT' ? 504 : 502;
      return json(res, status, { ok: false, error: code, message: status === 504 ? 'انتهت مهلة موفر الذكاء الاصطناعي.' : 'تعذّر إكمال الطلب لدى موفر الذكاء الاصطناعي.' });
    }
  }
  if (!['/api/v1/sync/push', '/api/v1/sync/pull'].includes(url.pathname)) return json(res, 404, { ok: false, error: 'not_found' });
  if (!TOKEN) return json(res, 503, { ok: false, error: 'sync_disabled', message: 'Set CHAOSOS_API_TOKEN to enable the development sync endpoints.' });
  if (!authorize(req, TOKEN)) return json(res, 401, { ok: false, error: 'unauthorized' });
  try {
    const data = await body(req);
    if (!safeId(data.deviceId)) return json(res, 400, { ok: false, error: 'invalid_device_id' });
    if (url.pathname.endsWith('/push')) {
      if (!Array.isArray(data.items) || data.items.length > MAX_PER_DEVICE) return json(res, 400, { ok: false, error: 'invalid_items' });
      const proposed = [];
      for (const item of data.items) {
        if (!item || typeof item.key !== 'string' || !/^[a-zA-Z0-9_.:-]{1,100}$/.test(item.key) || typeof item.value !== 'string' || Buffer.byteLength(item.value) > 8000) return json(res, 400, { ok: false, error: 'invalid_record' });
        if (item.baseRevision !== undefined && (!Number.isInteger(item.baseRevision) || item.baseRevision < 0)) return json(res, 400, { ok: false, error: 'invalid_base_revision' });
        proposed.push({ key: item.key, value: item.value, baseRevision: item.baseRevision });
      }
      const device = records.get(data.deviceId) || new Map();
      const conflicts = proposed.filter(item => item.baseRevision !== undefined && item.baseRevision !== (device.get(item.key)?.revision || 0))
        .map(item => ({ key: item.key, expectedRevision: item.baseRevision, currentRevision: device.get(item.key)?.revision || 0 }));
      if (conflicts.length) return json(res, 409, { ok: false, error: 'revision_conflict', conflicts, message: 'تغيّرت سجلات على الخادم؛ راجع التعارض قبل إعادة الإرسال.' });
      const now = Date.now(), accepted = [];
      for (const item of proposed) {
        const previous = device.get(item.key);
        const row = { key: item.key, value: item.value, updatedAt: now, revision: (previous?.revision || 0) + 1 };
        device.set(item.key, row); accepted.push({ key: row.key, revision: row.revision });
      }
      while (device.size > MAX_ITEMS) device.delete(device.keys().next().value);
      records.set(data.deviceId, device);
      return json(res, 200, { ok: true, accepted: cleanCount(accepted), records: accepted, schemaVersion: 1, storage: 'ephemeral-memory', warning: 'Data is lost when this development server restarts.' });
    }
    const device = records.get(data.deviceId) || new Map();
    return json(res, 200, { ok: true, schemaVersion: 1, items: [...device.values()].slice(-MAX_ITEMS), storage: 'ephemeral-memory' });
  } catch (e) { return json(res, e.status || 400, { ok: false, error: e.status === 413 ? 'payload_too_large' : 'bad_request' }); }
});
server.listen(PORT, HOST, () => process.stdout.write(`CHAOSOS cloud foundation listening on http://${HOST}:${PORT}\n`));
process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
