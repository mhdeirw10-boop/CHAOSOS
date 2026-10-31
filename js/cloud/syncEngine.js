/* CHAOSOS manual sync foundation. Nothing is read from localStorage automatically; caller supplies records. */
(function (g) {
  'use strict';
  const ALLOWED_KEYS = new Set(['system.settings.theme', 'system.settings.language', 'chaosai.preferences', 'chaosai.learning.metrics']);
  const MAX_ITEMS = 20, MAX_VALUE_BYTES = 8000;
  const text = (v, n = 160) => String(v ?? '').replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ').trim().slice(0, n);
  function status() { const cloud = g.CHAOSCloud?.status?.() || { enabled: false, configured: false }; return { available: !!g.CHAOSCloud?.request, enabled: !!cloud.enabled, configured: !!cloud.configured, mode: 'manual-consent-only', automaticSync: false, chatHistoryAllowed: false, accountCredentialsAllowed: false, allowedKeys: [...ALLOWED_KEYS] }; }
  function prepare(records, { consent = false } = {}) {
    if (consent !== true) return { ok: false, code: 'CONSENT_REQUIRED', message: 'يلزم تأكيد صريح قبل تجهيز بيانات للمزامنة.' };
    if (!Array.isArray(records) || records.length > MAX_ITEMS) return { ok: false, code: 'INVALID_ITEMS', message: `يُسمح بما يصل إلى ${MAX_ITEMS} سجلًا محددًا يدويًا.` };
    const items = [], rejected = [];
    for (const row of records) {
      const key = text(row?.key, 100);
      if (!ALLOWED_KEYS.has(key)) { rejected.push({ key: key || '(empty)', reason: 'KEY_NOT_ALLOWLISTED' }); continue; }
      let value;
      try { value = typeof row.value === 'string' ? row.value : JSON.stringify(row.value); } catch { rejected.push({ key, reason: 'VALUE_NOT_SERIALIZABLE' }); continue; }
      if (typeof value !== 'string' || BufferSafeLength(value) > MAX_VALUE_BYTES) { rejected.push({ key, reason: 'VALUE_TOO_LARGE' }); continue; }
      items.push({ key, value, ...(Number.isInteger(row?.baseRevision) && row.baseRevision >= 0 ? { baseRevision: row.baseRevision } : {}) });
    }
    if (!items.length) return { ok: false, code: 'NO_ALLOWED_ITEMS', message: 'لا توجد سجلات مسموح بها للمزامنة.', rejected };
    return { ok: true, items, rejected, consented: true, rawChatIncluded: false, secretsIncluded: false };
  }
  function BufferSafeLength(value) { try { return new TextEncoder().encode(value).length; } catch { return value.length * 2; } }
  async function push(records, options = {}) {
    if (options.consent !== true) return { ok: false, code: 'CONSENT_REQUIRED', message: 'لم تُرسل بيانات؛ الموافقة غير موجودة.' };
    const c = status(); if (!c.enabled || !c.configured) return { ok: false, code: 'CLOUD_NOT_CONFIGURED', message: 'فعّل عنوان خادم موثوق أولًا.' };
    const token = text(options.sessionToken, 256), deviceId = text(options.deviceId || '', 80);
    if (!token) return { ok: false, code: 'SESSION_TOKEN_REQUIRED', message: 'رمز الوصول مطلوب لهذه الجلسة فقط.' };
    if (!/^[a-zA-Z0-9_-]{8,80}$/.test(deviceId)) return { ok: false, code: 'DEVICE_ID_INVALID', message: 'معرّف الجهاز غير صالح.' };
    const clean = prepare(records, { consent: true }); if (!clean.ok) return clean;
    const response = await g.CHAOSCloud.request('/sync/push', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: { schemaVersion: 1, deviceId, items: clean.items } });
    return response.ok ? { ok: true, result: response.data, rejected: clean.rejected, sentCount: clean.items.length, automaticSync: false } : { ok: false, code: response.data?.error || response.code || 'SYNC_PUSH_FAILED', message: response.data?.message || response.message || 'فشلت المزامنة.' };
  }
  async function pull(options = {}) {
    if (options.consent !== true) return { ok: false, code: 'CONSENT_REQUIRED', message: 'لم تُسترجع بيانات؛ الموافقة غير موجودة.' };
    const c = status(); if (!c.enabled || !c.configured) return { ok: false, code: 'CLOUD_NOT_CONFIGURED', message: 'فعّل عنوان خادم موثوق أولًا.' };
    const token = text(options.sessionToken, 256), deviceId = text(options.deviceId || '', 80);
    if (!token) return { ok: false, code: 'SESSION_TOKEN_REQUIRED', message: 'رمز الوصول مطلوب لهذه الجلسة فقط.' };
    if (!/^[a-zA-Z0-9_-]{8,80}$/.test(deviceId)) return { ok: false, code: 'DEVICE_ID_INVALID', message: 'معرّف الجهاز غير صالح.' };
    const response = await g.CHAOSCloud.request('/sync/pull', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: { schemaVersion: 1, deviceId } });
    if (!response.ok) return { ok: false, code: response.data?.error || response.code || 'SYNC_PULL_FAILED', message: response.data?.message || response.message || 'فشل استرجاع البيانات.' };
    const rows = Array.isArray(response.data?.items) ? response.data.items.filter(x => x && ALLOWED_KEYS.has(x.key) && typeof x.value === 'string' && BufferSafeLength(x.value) <= MAX_VALUE_BYTES).map(x => ({ key: x.key, value: x.value, updatedAt: Number(x.updatedAt) || 0 })) : [];
    return { ok: true, items: rows, receivedCount: rows.length, appliedAutomatically: false, rawChatIncluded: false };
  }
  g.CHAOSSync = { version: '1.0.0', allowedKeys: () => [...ALLOWED_KEYS], status, prepare, push, pull };
})(window);
