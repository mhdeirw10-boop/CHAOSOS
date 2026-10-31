# CHAOSOS v2.5.0 — Integrated Workspace

This is an experimental branch based on `CHAOSOS v2.4.2`. The canonical `eye_of_chaos_voidos_v2_0_0` baseline and the v2.4.2 audit ZIP are preserved separately.

## Highlights
- Phone-like settings categories with search and back navigation.
- Desktop responsive workspace with movable/resizable windows, maximize, minimize, close and a six-window cap; narrow screens keep the phone shell.
- Void Files project index, text preview, download, selected file/folder import, and a separate IndexedDB workspace for user-created/imported items.
- Bounded, read-only project-text search for CHAOSAI, switchable in settings; it does not read secrets or arbitrarily access the host/device filesystem.
- In-chat arithmetic and local app-store lookup instead of automatic app launches. Explicit open commands are still honored.
- Removed the demo account/signup panel from Void Store; favorites/library stay local.
- Local heuristic recommendations for Void Store and VoidTube; no claim of a neural recommendation model.
- Updated offline cache version and Cordova/www mirror.

## Stabilization pass (v2.5.0 source candidate)
- Corrected stale project/Cordova setup documentation.
- Added a one-command runner for all regression suites and a static release audit for manifest, cache, local paths, syntax, and web/Cordova parity.
- Removed a duplicate service-worker cache path and advanced the cache namespace to `chaosos-shell-v2-5-0-integrated-workspace2`.
- This is a source-stability pass, not an APK or device-release claim.

## Validation
- Automated regression suite: run `node tests/run-all-tests.cjs`; this runner discovers all `*-tests.cjs` suites and reports the exact count. The static release audit is `node tests/release-audit.cjs`.
- Standalone JavaScript and inline HTML script syntax were checked separately.
- Service-worker shell list was checked for missing local paths.
- No APK/device test is claimed; a Chromium headless screenshot attempt did not complete in this runtime, so visual rendering still needs a real browser check.

## Limitations
The application remains a web/Cordova simulation, not a replacement Android OS. Wi-Fi, Bluetooth, brightness and Android-level permissions are not controlled natively by the HTML interface. Changes created in Void Files live in the browser workspace; they do not rewrite files baked into the APK. Selected user imports require an explicit picker. Build or install a new APK to test the actual Cordova experience.
