# CHAOSOS V3.1.6 — Operating System Evolution (Experimental)

## Added
- OS Runtime process registry: launch, suspend, resume, terminate, list, stats and health.
- CHAOSAI Context Engine with bounded per-session conversation context and simple reference resolution.
- Intent Router with explicit intent classes and confidence values.
- Persona Engine with stable identity and context-adaptive delivery profiles.
- Per-application CSS/JavaScript extraction: inline styles and scripts moved into each app's own `css/` and `js/` folders where present.
- VoidTube mobile bottom navigation with a central `+` upload action.
- VoidTube local-video IndexedDB persistence where browser storage is available; session-only fallback otherwise.
- VoidTube local comments, nested replies and clearly labelled simulated follower-bot responses.

## Boundaries
- This is a web/Android-hosted OS-like runtime, not a replacement for the Android/Linux native kernel.
- Follower bots are simulated local personas, not real users or network accounts.
- Local media stays on the device/browser profile; it is not uploaded.
- Audio model/custom voice development remains deferred.

## Validation
- JavaScript syntax checks and structural checks are run for this archive.
- Real-device Android/Cordova installation and performance tests are not claimed.

## GitHub release preparation
- Aligned Cordova package/widget metadata and visible release labels to v3.1.6.
- Advanced the service-worker cache namespace for this release candidate.
- Added a Content Security Policy to the Void Game Manager shell.
- Updated regression tests to follow the per-app JavaScript extraction introduced in the v3.1.6 work.
- Added community contribution templates, fork/attribution guidance, origin statement, architecture map, boot storyboard specification, and planned app-trust/signing specification.
- Added a repeatable release-preparation script that regenerates the project index, refreshes the Cordova web mirror, and runs static checks.
