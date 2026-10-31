# CHAOSOS v3.1.2 — Hybrid CHAOSAI Voice (Experimental)

Owner: Void Walker. Experimental branch only. The original `eye_of_chaos_voidos_v2_0_0` baseline is not modified.

## Changes
- Added `js/brain/voice/hybridVoice.js`: a routing layer that tries a configured trusted voice proxy and falls back to local procedural synthesis.
- Added `cloud/chaosai-voice-proxy.cjs`: a Node.js server handler example for ElevenLabs TTS. The provider API key remains on the server, the voice ID is pinned server-side, requests are size-limited, and a basic per-client rate limit is applied.
- Updated CHAOSAI Center with controls for enabling the network path and setting the proxy URL. No key field exists in the client. Network speech is opt-in and requires an explicitly configured endpoint.
- Routed rare CHAOSAI speech through the hybrid layer; cosmic effects continue to run locally.
- Updated the service-worker cache namespace and Cordova runtime copies.

## Operational boundary
The code does not include or deploy a backend, API key, or ElevenLabs credentials. The network path works only after the owner hosts the proxy over HTTPS and configures the endpoint in the UI. If it is absent or fails, local procedural speech is used. The client-side model/voice preferences are not proof that the upstream service supports those exact identifiers; confirm them against the account's current ElevenLabs API access.

Test report: `CHAOSOS_v3_1_2_HYBRID_VOICE_TEST_REPORT.md`.

## Tests and limitations
- New local tests cover endpoint validation, fallback routing, UI/cache wiring, server-side key handling, request validation, voice pinning, and mocked audio response.
- Source syntax checks and full regression/audit tests are run for this package.
- No APK build, live ElevenLabs API request from CHAOSOS, or physical Android audio test is claimed.
