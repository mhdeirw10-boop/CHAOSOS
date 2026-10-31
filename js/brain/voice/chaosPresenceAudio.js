/* CHAOSAI Cosmic Presence v3.1.1-experimental.
 * Entirely procedural Web Audio. No network, remote TTS, or prerecorded assets.
 * Audio begins only after an explicit user gesture.
 */
(function (g) {
  'use strict';
  if (g.CHAOSPresenceAudio?.version === '3.1.1-experimental') return;
  let ctx = null;
  let active = [];
  let generation = 0;
  const TYPES = new Set(['awakening', 'thinking', 'warning', 'heartbeat', 'release']);
  const getContext = () => {
    const C = g.AudioContext || g.webkitAudioContext;
    if (!C) return null;
    if (!ctx) ctx = new C();
    return ctx;
  };
  const track = node => {
    active.push(node);
    node.onended = () => {
      try { node.disconnect(); } catch (_) {}
      active = active.filter(n => n !== node);
    };
  };
  function stop() {
    generation++;
    for (const n of active) {
      try { n.stop(); } catch (_) {}
      try { n.disconnect(); } catch (_) {}
    }
    active = [];
    return { ok: true, stopped: true };
  }
  function tone(ac, { at, duration, frequency, endFrequency, type = 'sine', volume = .08, pan = 0, filter = 900 }) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const low = ac.createBiquadFilter();
    const panner = ac.createStereoPanner ? ac.createStereoPanner() : null;
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, at);
    if (endFrequency) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), at + duration);
    low.type = 'lowpass'; low.frequency.setValueAtTime(filter, at); low.Q.value = .7;
    gain.gain.setValueAtTime(.0001, at);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume), at + Math.min(.22, duration * .28));
    gain.gain.setTargetAtTime(.0001, at + duration * .55, Math.max(.025, duration * .18));
    osc.connect(low); low.connect(gain);
    if (panner) { panner.pan.setValueAtTime(pan, at); gain.connect(panner); panner.connect(ac.destination); }
    else gain.connect(ac.destination);
    osc.start(at); osc.stop(at + duration + .04); track(osc);
    osc.onended = () => { for (const n of [low, gain, panner].filter(Boolean)) try { n.disconnect(); } catch (_) {} active = active.filter(n => n !== osc); };
  }
  function noise(ac, at, duration, volume, pan = 0) {
    const length = Math.max(1, Math.floor(ac.sampleRate * duration));
    const buffer = ac.createBuffer(1, length, ac.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) { last = last * .82 + (Math.random() * 2 - 1) * .18; data[i] = last; }
    const src = ac.createBufferSource(), filter = ac.createBiquadFilter(), gain = ac.createGain();
    src.buffer = buffer; filter.type = 'bandpass'; filter.frequency.setValueAtTime(1300, at); filter.Q.value = .55;
    gain.gain.setValueAtTime(.0001, at); gain.gain.linearRampToValueAtTime(volume, at + .08); gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    src.connect(filter); filter.connect(gain); gain.connect(ac.destination); src.start(at); src.stop(at + duration + .02); track(src);
    src.onended = () => { for (const n of [filter, gain].filter(Boolean)) try { n.disconnect(); } catch (_) {} active = active.filter(n => n !== src); };
  }
  async function play(kind = 'awakening', options = {}) {
    if (!TYPES.has(kind)) return { ok: false, code: 'UNKNOWN_PRESENCE_CUE' };
    const ac = getContext();
    if (!ac) return { ok: false, code: 'WEB_AUDIO_UNAVAILABLE', message: 'Web Audio غير متاح في بيئة التشغيل.' };
    stop(); const id = generation;
    try { if (ac.state === 'suspended') await ac.resume(); } catch (_) { return { ok: false, code: 'AUDIO_RESUME_FAILED' }; }
    if (id !== generation) return { ok: false, code: 'CANCELLED' };
    const now = ac.currentTime + .04;
    const scale = Math.max(.1, Math.min(.8, Number(options.volume ?? .28)));
    const add = (t, d, f, ef, type, v, p, filter) => tone(ac, { at: now + t, duration: d, frequency: f, endFrequency: ef, type, volume: v * scale, pan: p, filter });
    if (kind === 'awakening') {
      noise(ac, now, 2.6, .025 * scale);
      add(0, 3.1, 58, 31, 'sine', .34, -.15, 180);
      add(.35, 2.7, 117, 54, 'triangle', .15, .22, 380);
      add(.95, 2.1, 432, 110, 'sine', .08, -.45, 1100);
      add(1.35, 2.4, 861, 202, 'sine', .045, .4, 1800);
    } else if (kind === 'thinking') {
      add(0, 1.25, 72, 66, 'sine', .22, -.2, 240);
      add(.42, .85, 181, 176, 'triangle', .11, .2, 520);
      add(.88, 1.05, 365, 343, 'sine', .07, -.3, 900);
      add(1.4, .7, 91, 48, 'sine', .16, .1, 280);
    } else if (kind === 'warning') {
      add(0, .85, 48, 37, 'sine', .36, 0, 140);
      add(.22, .6, 147, 98, 'triangle', .19, -.15, 420);
      add(.75, 1.1, 52, 34, 'sine', .3, .12, 150);
      noise(ac, .8 + now, .55, .025 * scale);
    } else if (kind === 'heartbeat') {
      add(0, .34, 49, 32, 'sine', .42, 0, 140);
      add(.22, .25, 42, 29, 'sine', .29, .08, 130);
      add(1.05, .34, 49, 32, 'sine', .42, 0, 140);
      add(1.27, .25, 42, 29, 'sine', .29, -.08, 130);
    } else {
      add(0, 1.6, 190, 46, 'sine', .12, 0, 420);
      add(.15, 1.8, 380, 73, 'triangle', .06, .1, 800);
    }
    return { ok: true, kind, localOnly: true, prerecordedAudio: false, networkUsed: false, cue: 'procedural-cosmic-atmosphere' };
  }
  function speakRare(text) {
    const phrase = String(text || '').trim().slice(0, 90);
    if (!phrase) return { ok: false, code: 'EMPTY_TEXT' };
    // Deliberately does not fall back to system TTS or network speech.
    if (g.CHAOSHybridVoice?.speak) return g.CHAOSHybridVoice.speak(phrase, { texture: 'deep', pitch: .68, speed: .72, volume: .13 });
    if (!g.CHAOSVoiceEngine?.speak) return { ok: false, code: 'LOCAL_SYNTH_UNAVAILABLE' };
    return g.CHAOSVoiceEngine.speak(phrase, { mode: 'procedural', texture: 'deep', pitch: .68, speed: .72, volume: .13 });
  }
  function status() { return { version: '3.1.1-experimental', available: !!(g.AudioContext || g.webkitAudioContext), localOnly: true, networkUsed: false, prerecordedAudio: false, cues: [...TYPES], activeSources: active.length }; }
  const api = { version: '3.1.1-experimental', play, stop, speakRare, status };
  g.CHAOSPresenceAudio = api;
  // Optional kernel event bridge; no sound is triggered on page load.
  if (g.document?.addEventListener) {
    g.document.addEventListener('chaosai:presence', event => { const d = event?.detail || {}; void play(d.cue || 'thinking', { volume: d.volume }); });
    g.document.addEventListener('chaosai:ready', () => { void play('awakening'); });
    g.document.addEventListener('chaosai:thinking', () => { void play('thinking'); });
    g.document.addEventListener('chaosai:warning', () => { void play('warning'); });
    g.document.addEventListener('chaosai:idle', () => { void play('release'); });
  }
})(window);
