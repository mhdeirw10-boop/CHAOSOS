# CHAOSAI Voice + Phone-First Integration Update

Experimental update for `eye_of_chaos_voidos_v2_0_0`; the original project archive remains untouched.

## Changes
- Replaced the oscillator-based pseudo-speech (click/beep-like tones) with the browser/Android WebView Speech Synthesis API. CHAOSAI now asks the device's installed speech voices to read real text.
- Added manual read-aloud and stop-speaking controls to the CHAOS SYSTEM command center.
- Added an opt-in `autoReadReplies` shared preference. When enabled, newly generated terminal replies are sent to speech synthesis; it is off by default.
- Added Arabic/English language selection logic based on text, with preference override support (`voiceLanguage` in shared settings).
- Synced changed shell, command center, and shared-core files into `cordova-project/www`.
- Retained the phone-first responsive layout and visual boot simulation from the previous experimental branch.

## Important limits
- Speech is not an embedded human recording or a new neural voice model. It uses the voices installed in the browser/Android system. If the device has no Arabic voice installed, the user may need to install an Arabic text-to-speech voice in Android settings.
- Speech synthesis availability and voice quality vary by browser and Android WebView. `file://` preview and Cordova APK behavior can differ.
- CHAOSAI reads the text produced by the existing local command/conversation engine. This update does not create a remote LLM or turn the local engine into a neural model.
- The boot animation remains an in-app simulation, not Android bootloader startup.

## Validation performed
- `node --check` on changed shared JavaScript files (web and Cordova copies).
- Inline JavaScript syntax check across shell, terminal, command center, and Cordova copies.
- ZIP integrity check after packaging.
- Not built as an APK and not tested on a physical phone in this environment.
