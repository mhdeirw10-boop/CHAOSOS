# VoidOS Global Integration Experiment — 2.0.0-lab

This is a **non-destructive experimental branch** based on the supplied v2.0.0 source. The original archive was not edited.

## Implemented in this branch
- Added `js/system-core.js`: shared device-local identity projection, central preferences, opt-in local text-corpus training, probabilistic word-chain generation, procedural word creation, and synthesized Web Audio tones.
- Added `apps/chaos-lab/index.html`: a UI for local generation, explicit user-submitted training examples, corpus statistics, invented-word generation, and synthesized audio.
- Registered CHAOS Lab in the VoidOS launcher.
- Expanded Settings with central language/theme/voice/learning/particles/motion/contrast/font-scale preferences. These settings are saved centrally; not every older app yet consumes every preference.
- Added a shared identity indicator to Void Store and VoidTube, and loaded the shared service layer across first-party app pages.
- Removed the nested standalone ZIP packages from this experimental distribution. The integrated app source directories remain.
- Kept the Eye Codex fictional and canon-safe; it does not invent a complete scripture or unconfirmed doctrine.

## Important limits
- The shared identity is local-only and is a compatibility projection over legacy local account records. It is not secure server authentication, not a cross-device account, and not yet a full migration of every legacy account form to one credential database. Existing legacy account records remain for compatibility.
- CHAOS Lab is a small word-chain / n-gram-style generator trained only on examples explicitly entered by the user. It is **not** a neural LLM and cannot match a foundation model. Data remains in browser/app local storage.
- Voice is procedural electronic audio generated with Web Audio; it is not natural speech or a recorded voice.
- Camera, battery telemetry, phone calls/SMS, push notifications, cloud sync, remote account recovery, and real app downloads require Android plugins, backend services, permissions, or verified package sources. This ZIP does not fake those capabilities.
- File URLs can isolate localStorage differently across browsers; the Cordova app shares one origin and is the more reliable test target for shared storage.
- No APK was built in this environment.

## Test
1. Extract into a new folder; do not overwrite the original project.
2. Open `eye_of_chaos/eye_of_chaos_site/index.html`.
3. Open CHAOS Lab; add a training sample, inspect statistics, generate text and a synthetic tone.
4. Open Settings and save preferences.
5. Sign in/create the existing local demo account in the shell or Void Store, then inspect the shared identity indicator in VoidTube and Void Store.
6. Check other apps, especially terminal, chapters, characters, Store, and Tube.
