/* CHAOSOS Unified Local Profile v2.4.2
 * Unifies the visible profile across shell, lock/boot screens and legacy app profiles.
 * It deliberately does not claim a server account or merge password credentials.
 */
(function (root) {
  'use strict';
  const PROFILE_KEY = 'chaosos_unified_account_v2';
  const LEGACY_PROFILE_KEY = 'voidos_unified_profile_v1';
  const IDENTITY_KEY = 'voidos_unified_identity_v1';
  const LEGACY_CHAOS_HISTORY_KEY = 'voidos_chaosai_history_v1';
  const read = (key, fallback = null) => {
    try { const value = localStorage.getItem(key); return value == null ? fallback : JSON.parse(value); }
    catch (_) { return fallback; }
  };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; } };
  const clean = value => String(value ?? '').replace(/[\u0000-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g, '').trim().slice(0, 120);

  function candidates() {
    const rows = [];
    const shellSession = read('voidos_local_session_v1', null);
    const shellAccounts = read('voidos_local_accounts_v1', {});
    if (shellSession && typeof shellSession === 'object' && shellSession.username) {
      const key = String(shellSession.username).toLowerCase();
      const account = shellAccounts && typeof shellAccounts === 'object' ? shellAccounts[key] : null;
      if (account || shellSession.displayName) rows.push({
        username: clean(shellSession.displayName || account?.username || shellSession.username),
        email: clean(shellSession.email || account?.email || ''), source: 'voidos-shell', active: true,
        updatedAt: Number(shellSession.updatedAt || account?.updatedAt || 0)
      });
    }
    const storeAccount = read('voidStoreV1DemoAccount', null);
    let storeSession = '';
    try { storeSession = localStorage.getItem('voidStoreV1DemoSession') || ''; } catch (_) {}
    if (storeAccount && typeof storeAccount === 'object' && storeSession && storeSession === storeAccount.username) rows.push({
      username: clean(storeAccount.username), email: clean(storeAccount.email || ''), source: 'void-store', active: true,
      updatedAt: Number(storeAccount.updatedAt || storeAccount.createdAtTime || 0)
    });
    const existing = read(IDENTITY_KEY, null);
    if (existing?.username) rows.push({ username: clean(existing.displayName || existing.username), email: clean(existing.email || ''), source: clean(existing.source || 'local-profile'), active: false, updatedAt: Date.parse(existing.updatedAt || '') || 0 });
    const legacy = read(LEGACY_PROFILE_KEY, null);
    if (legacy?.username) rows.push({ username: clean(legacy.username), email: clean(legacy.email || ''), source: 'migrated-chaosai-profile', active: false, updatedAt: Date.parse(legacy.updatedAt || legacy.createdAt || '') || 0 });
    const canonical = read(PROFILE_KEY, null);
    if (canonical?.username) rows.push({ username: clean(canonical.displayName || canonical.username), email: clean(canonical.email || ''), source: clean(canonical.source || 'unified-local-profile'), active: false, updatedAt: Date.parse(canonical.updatedAt || '') || 0 });
    return rows.filter(row => row.username.length > 0);
  }
  function resolve() {
    const rows = candidates();
    // The shell's signed-in local session is authoritative; otherwise use the Void Store session.
    const active = rows.find(row => row.active && row.source === 'voidos-shell') || rows.find(row => row.active && row.source === 'void-store');
    if (active) return active;
    return rows.find(row => row.source === 'migrated-chaosai-profile') || rows.find(row => row.source === 'unified-local-profile') || rows[0] || null;
  }
  function sync() {
    const p = resolve();
    if (!p) return null;
    const existing = read(PROFILE_KEY, {}) || {};
    const next = {
      schema: 2, username: p.username, displayName: p.username, email: p.email || '',
      source: p.source, activeSession: !!p.active, scope: 'this-device-only',
      createdAt: existing.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    const changed = existing.username !== next.username || existing.email !== next.email || existing.source !== next.source || existing.activeSession !== next.activeSession;
    if (changed) {
      write(PROFILE_KEY, next);
      const oldId = read(IDENTITY_KEY, {}) || {};
      if (oldId.username !== next.username || oldId.email !== next.email || oldId.source !== next.source) {
        write(IDENTITY_KEY, { username: next.username, displayName: next.displayName, email: next.email, source: next.source, scope: next.scope, updatedAt: next.updatedAt });
      }
      try { root.dispatchEvent(new CustomEvent('chaosos:account-changed', { detail: next })); } catch (_) {}
    }
    return next;
  }
  function profile() {
    const now = resolve();
    if (now) {
      const saved = read(PROFILE_KEY, {}) || {};
      const p = { schema: 2, username: now.username, displayName: now.username, email: now.email || '', source: now.source, activeSession: !!now.active, scope: 'this-device-only', createdAt: saved.createdAt || new Date().toISOString(), updatedAt: saved.updatedAt || new Date().toISOString() };
      return p;
    }
    return null;
  }
  function publishShellLogin(username, email = '') {
    const name = clean(username); if (name.length < 2) return { ok:false, message:'اسم الملف غير صالح.' };
    const next = { schema:2, username:name, displayName:name, email:clean(email), source:'voidos-shell', activeSession:true, scope:'this-device-only', createdAt:(read(PROFILE_KEY,{})||{}).createdAt || new Date().toISOString(), updatedAt:new Date().toISOString() };
    if (!write(PROFILE_KEY, next)) return { ok:false, message:'تعذر حفظ الملف الموحد.' };
    root.VoidOS?.publishIdentity?.(name, next.email, 'voidos-shell');
    try { root.dispatchEvent(new CustomEvent('chaosos:account-changed', { detail:next })); } catch (_) {}
    return { ok:true, profile:next };
  }
  function refresh() {
    const next = sync();
    try { root.dispatchEvent(new CustomEvent('voidos:profile-changed', { detail:next })); } catch (_) {}
    return next;
  }
  // Preserve the legacy CHAOSAI profile on migration without re-creating its floating UI.
  if (!read(PROFILE_KEY, null) && read(LEGACY_PROFILE_KEY, null)) sync();
  const api = { version:'2.4.2', profile, getProfile:profile, sync:refresh, publishShellLogin,
    status() { const p=profile(); return { available:!!p, username:p?.username||null, source:p?.source||null, activeSession:!!p?.activeSession, scope:'this-device-only', passwordCredentialsMerged:false, historyRows:(read(LEGACY_CHAOS_HISTORY_KEY,[])||[]).length }; } };
  root.ChaosAccountManager = api;
  root.addEventListener('storage', event => {
    if (['voidos_local_session_v1','voidos_local_accounts_v1','voidStoreV1DemoAccount','voidStoreV1DemoSession',IDENTITY_KEY,PROFILE_KEY,LEGACY_PROFILE_KEY].includes(event.key)) refresh();
  });
  root.addEventListener('voidos:identity', refresh);
  root.addEventListener('voidos:profile-changed', refresh);
  // Initial event matters because the shell may have rendered its boot/lock labels
  // before this module finished loading, while the stored profile itself was unchanged.
  const initialProfile = sync();
  try { root.dispatchEvent(new CustomEvent('chaosos:account-changed', { detail: initialProfile })); } catch (_) {}
})(typeof window !== 'undefined' ? window : globalThis);
