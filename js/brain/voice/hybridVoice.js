/* CHAOSAI Hybrid Voice Router v3.1.2-experimental.
 * Keeps procedural speech/effects local and optionally delegates speech to a trusted proxy.
 * Never stores provider API keys in the browser. The endpoint must be a server-side proxy.
 */
(function (g) {
  'use strict';
  if (g.CHAOSHybridVoice?.version === '3.1.2-experimental') return;
  const KEY = 'chaosai_hybrid_voice_v1';
  const defaults = { enabled: false, endpoint: '', voiceId: 'XFj57SKCdgD5SEUJbj1U', modelId: 'eleven_v4', timeoutMs: 12000 };
  let activeAudio = null, requestController = null, serial = 0;
  function read() {
    try { return { ...defaults, ...(JSON.parse(g.localStorage.getItem(KEY) || '{}')) }; }
    catch (_) { return { ...defaults }; }
  }
  function configure(p = {}) {
    const c = read();
    if (typeof p.enabled === 'boolean') c.enabled = p.enabled;
    if (typeof p.endpoint === 'string') c.endpoint = p.endpoint.trim().slice(0, 500);
    if (typeof p.voiceId === 'string' && p.voiceId.trim()) c.voiceId = p.voiceId.trim().slice(0, 120);
    if (typeof p.modelId === 'string' && p.modelId.trim()) c.modelId = p.modelId.trim().slice(0, 120);
    c.timeoutMs = 12000;
    if (c.endpoint && !/^https:\/\//i.test(c.endpoint) && !/^\/(?!\/)/.test(c.endpoint)) {
      return { ok: false, code: 'ENDPOINT_MUST_BE_HTTPS_OR_RELATIVE', config: c };
    }
    try { g.localStorage.setItem(KEY, JSON.stringify(c)); return { ok: true, config: c }; }
    catch (_) { return { ok: false, code: 'STORAGE_UNAVAILABLE', config: c }; }
  }
  function stop() {
    serial++;
    if (requestController) { try { requestController.abort(); } catch (_) {} requestController = null; }
    if (activeAudio) { try { activeAudio.pause(); activeAudio.src = ''; } catch (_) {} activeAudio = null; }
    try { g.CHAOSVoiceEngine?.stop(); } catch (_) {}
    return { ok: true, stopped: true };
  }
  async function playRemote(text, c, id) {
    if (!c.enabled || !c.endpoint || typeof g.fetch !== 'function') return { ok: false, code: 'REMOTE_NOT_CONFIGURED' };
    const AC = g.AbortController;
    requestController = AC ? new AC() : null;
    let timer;
    try {
      const timeout = new Promise((_, reject) => { timer = g.setTimeout(() => { try { requestController?.abort(); } catch (_) {} reject(new Error('VOICE_TIMEOUT')); }, c.timeoutMs); });
      const req = g.fetch(c.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'audio/mpeg, audio/wav, application/octet-stream, application/json' },
        body: JSON.stringify({
          text,
          provider: 'elevenlabs',
          voiceId: c.voiceId,
          modelId: c.modelId,
          voice_settings: { stability: 0.72, similarity_boost: 0.78, style: 0.18, use_speaker_boost: true },
          persona: { archetype: 'cosmic_nonhuman', delivery: 'calm_ominous', pace: 'slow', sparse: true }
        }),
        signal: requestController?.signal
      });
      const response = await Promise.race([req, timeout]);
      if (id !== serial) return { ok: false, code: 'CANCELLED' };
      if (!response.ok) return { ok: false, code: 'REMOTE_HTTP_ERROR', status: response.status };
      let audioBlob;
      const type = (response.headers?.get?.('content-type') || '').toLowerCase();
      if (type.includes('application/json')) {
        const data = await response.json();
        if (typeof data.audioBase64 === 'string') {
          const raw = g.atob(data.audioBase64.replace(/^data:[^,]+,/, ''));
          const bytes = new Uint8Array(raw.length); for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
          audioBlob = new Blob([bytes], { type: data.mimeType || 'audio/mpeg' });
        } else if (typeof data.audioUrl === 'string' && /^https:\/\//i.test(data.audioUrl)) {
          const audioResponse = await g.fetch(data.audioUrl, { signal: requestController?.signal });
          if (!audioResponse.ok) return { ok: false, code: 'REMOTE_AUDIO_FETCH_FAILED' };
          audioBlob = await audioResponse.blob();
        } else return { ok: false, code: 'REMOTE_RESPONSE_MISSING_AUDIO' };
      } else audioBlob = await response.blob();
      if (id !== serial) return { ok: false, code: 'CANCELLED' };
      if (!g.Audio || !g.URL?.createObjectURL) return { ok: false, code: 'AUDIO_PLAYBACK_UNAVAILABLE' };
      const url = g.URL.createObjectURL(audioBlob);
      const audio = new g.Audio(url); activeAudio = audio; audio.volume = 0.72;
      await audio.play();
      audio.addEventListener?.('ended', () => { try { g.URL.revokeObjectURL(url); } catch (_) {} if (activeAudio === audio) activeAudio = null; }, { once: true });
      return { ok: true, mode: 'elevenlabs-proxy', networkUsed: true, provider: 'elevenlabs', textLength: text.length };
    } catch (e) {
      return { ok: false, code: e?.name === 'AbortError' ? 'REMOTE_ABORTED' : (e?.message === 'VOICE_TIMEOUT' ? 'REMOTE_TIMEOUT' : 'REMOTE_UNAVAILABLE') };
    } finally { if (timer) g.clearTimeout(timer); requestController = null; }
  }
  async function speak(text, options = {}) {
    const phrase = String(text || '').trim().slice(0, 500);
    if (!phrase) return { ok: false, code: 'EMPTY_TEXT' };
    stop(); const id = serial; const c = read();
    const remote = await playRemote(phrase, c, id);
    if (remote.ok) return remote;
    if (id !== serial) return { ok: false, code: 'CANCELLED' };
    const local = g.CHAOSVoiceEngine?.speak?.(phrase, { mode: 'procedural', texture: options.texture || 'deep', pitch: options.pitch ?? 0.68, speed: options.speed ?? 0.72, volume: options.volume ?? 0.13 });
    return local?.ok ? { ...local, hybridFallback: true, remoteCode: remote.code, networkUsed: false, message: 'تعذّر الصوت الشبكي أو لم يُضبط؛ استُخدم الصوت المحلي البديل. وضوح الكلام المحلي محدود.' } : (local || { ok: false, code: 'LOCAL_SYNTH_UNAVAILABLE' });
  }
  function status() {
    const c = read();
    return { version: '3.1.2-experimental', mode: 'hybrid', enabled: c.enabled, endpointConfigured: !!c.endpoint, provider: 'elevenlabs-via-user-configured-proxy', voiceId: c.voiceId, modelId: c.modelId, apiKeyStoredInBrowser: false, fallback: 'procedural-local', requiresProxyForElevenLabs: true };
  }
  g.CHAOSHybridVoice = { version: '3.1.2-experimental', configure, config: read, status, speak, stop };
})(window);
