# CHAOSOS v3.1.3 — Kernel, Words & App Integration Experimental Test Report

**Branch:** experimental; derived from the supplied `CHAOSOS_v3_1_2_HYBRID_CHAOSAI_VOICE_EXPERIMENTAL.zip` archive.  
**Stable mother baseline:** `eye_of_chaos_voidos_v3_0_0` was not modified.  
**Scope:** local source changes, static checks, automated tests, and release/package consistency. This report does not claim a successful APK build or physical-device test.

## Changes included

- Added `js/kernel/healthManager.js` for explicit, local kernel/service health checks and recovery proposals. Recovery is gated by an explicit confirmation and `recoverySafe` service metadata; there is no automatic restart loop.
- Added `js/kernel/presenceDirector.js` to track boot, idle, thinking, working, warning, and resting states from local kernel/task/service events.
- Added `js/kernel/adaptiveTaskPlanner.js` for explainable task plans. Only allowlisted diagnostic handlers may execute; other requests remain plans and do not execute generated code.
- Added `js/kernel/appLifecycleManager.js` for local app-launch counts, recent history, favorites, and export/clear controls. It stores app metadata, not page contents or conversation prompts.
- Added `js/brain/words/` split into `commands.js`, `identity.js`, `ordinary.js`, `stories.js`, `links.js`, `jokes.js`, and `registry.js`. The legacy knowledge facade remains for compatibility, preserving the 73 old phrase/response entries across the word modules.
- Integrated the kernel health/planner panel in CHAOSAI Center, app activity/favorite/open controls in Void Manager, and presence/app usage summary in Void Game Manager.
- Updated app-shell presence integration, version metadata, documentation, tests, and service-recovery safety gates. Synchronized the static site into the Cordova `www` mirror.

## Verification

The validation run checks these areas:

- Legacy phrase preservation and the separation of command parsing from ordinary phrases.
- Presence-state tracking, health reporting, allowlisted planning, app lifecycle statistics, and explicit recovery gates.
- Existing knowledge/routing and cognitive-kernel tests.
- Release metadata, static paths, JavaScript/HTML references, project manifest, and exact site/Cordova mirror consistency.
- ZIP integrity for the delivered package.

See the final verification summary below after running the packaged test suite. Tests validate code paths in the available Node.js environment; they do not replace interactive browser testing or testing on the target Android phone.

## Known limits

- No APK was built in this work session and no physical-device test was performed.
- The custom CHAOSAI speech engine remains deferred until the desktop development phase, as requested. No new ElevenLabs connection or deployed voice proxy is claimed.
- Android-native background services are not implemented merely by adding a browser-side service supervisor; the current managers operate within the web application unless a native bridge is separately provided and tested.
- External resource links are curated URL entries, not live link-availability checks.

## Final verification summary

- **Automated project test suites:** 40/40 passed; 0 failed in the final local run.
- **Release audit and consistency:** passed, including required local asset/path checks, JavaScript/HTML reference validation, version metadata, and exact root/Cordova mirror consistency.
- **New v3.1.3 integration suite:** passed. It verifies legacy phrase retention, domain-split words, command-only dispatch, local story/joke/link modules, presence states, health reports, allowlisted planning, app lifecycle statistics/favorites, and explicit safe-recovery gates.
- **Existing regression suites:** knowledge modules, cognitive routing/kernel, release metadata, security, game manager, hybrid voice configuration and legacy routing all passed as part of the 40-suite run.
- **Manifest:** `project-index.json` regenerated and checked for 309 paths, without duplicate paths, traversal entries, or stale file sizes.
- **JavaScript runtime used by test suite:** Node.js 22.16.0. These tests do not execute every page in a real browser or exercise Android-specific behavior.

**Not verified:** no APK was built; no physical Android device/browser UI run was performed; no live external speech provider or proxy deployment was tested as part of this update. The new modules are local web-app logic and do not themselves create native Android background services.
