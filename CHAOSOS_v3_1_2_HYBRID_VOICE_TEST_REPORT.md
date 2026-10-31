# CHAOSOS v3.1.2 — Hybrid CHAOSAI Voice Test Report

Owner: Void Walker. Experimental branch only. The original `eye_of_chaos_voidos_v2_0_0` baseline was not edited.

## Implemented files

- `js/brain/voice/hybridVoice.js`: hybrid speech router; uses an explicitly configured trusted proxy and falls back to the existing local procedural synthesizer.
- `cloud/chaosai-voice-proxy.cjs`: Node.js request handler example for a server-side ElevenLabs TTS proxy.
- `apps/chaosai-center/index.html`: opt-in network voice checkbox, endpoint setting, save action, async speech status, and stop/cancel action.
- `js/brain/voice/chaosPresenceAudio.js`: routes rare spoken phrases through the hybrid router when present; ambience cues remain local.
- `sw.js`: cache namespace bumped to `chaosos-shell-v3-1-2-hybrid-voice-experimental` and hybrid module added to the precache list.
- `README/04_VOICE_FOUNDRY.txt`, changelog, project index, and Cordova `www` runtime mirrors updated.

## Privacy and security boundaries

- No ElevenLabs API key is placed in the web app, local storage, or Cordova client.
- The server handler reads `ELEVENLABS_API_KEY` from server environment variables, pins the voice ID through `CHAOSAI_VOICE_ID`, bounds input length, applies a simple in-memory per-client rate limit, and does not return upstream error bodies.
- Remote speech is opt-in and sends the phrase to the configured proxy. The endpoint must be a trusted HTTPS server, or a same-origin relative route on a trusted HTTPS site.
- No backend is hosted or automatically deployed by this archive. For Express, mount it with `app.post('/api/chaosai/voice', require('./cloud/chaosai-voice-proxy.cjs').handler)`; configure the environment variables on the server before enabling the client setting.
- If remote speech is unconfigured or unavailable, the client falls back to local procedural speech. That fallback remains synthetic and has limited intelligibility. Cosmic effects remain local.

## Validation performed

- `node tests/run-all-tests.cjs`: 39/39 test suites passed after final updates.
- `node tests/release-audit.cjs`: 2,596 assertions passed; manifest 294 paths; service worker 230 unique paths; 882 local HTML references; 135 JavaScript files; 43 inline scripts.
- `node tests/release-consistency-tests.cjs`: passed.
- `node tests/hybrid-voice-v312-tests.cjs`: passed; includes mocked remote speech and local fallback paths.
- `node tests/voice-proxy-v312-tests.cjs`: passed; mocked upstream response, server-only key, voice pinning, validation, and method restrictions.
- JavaScript syntax checks passed for the hybrid client, server handler, and cosmic presence module.
- ZIP integrity check passed after packaging.

## Not claimed

- No live ElevenLabs API request was made by CHAOSOS; the proxy test uses a mocked upstream service.
- The user must host/configure the proxy and provide their own server-side key.
- No APK was built, installed, or signed. No physical Redmi 13C / Android WebView audio test was performed.
- Model and voice IDs may require adjustment to the provider account's current API availability.
