# Changelog — Global Integration Experiment

- Added the first shared local service layer (`VoidOS`) for identity projection, preferences, opt-in training, word-chain generation, word invention, and Web Audio synthesis.
- Added CHAOS Lab and launcher registration.
- Expanded system settings with global preference controls.
- Added shared-identity indicators to Store and Tube.
- Removed bundled standalone ZIPs from this branch; source apps remain integrated under `apps/`.
- Preserved source project files and the original archive.
- No APK build, cloud backend, real phone-service integration, or neural LLM is claimed.


## Global integrated experimental follow-up
- Added original playable Void Arcade mini-game: Rift Runner (canvas, keyboard/touch, scoring, local best score).
- Registered the game in the VoidOS launcher and Void Store with a working in-site launch target.
- Improved CHAOS terminal with quick command chips, opt-in local text examples, synthetic speech, export and local statistics.
- Improved VoidBrowserX home shortcuts for developer resources and built-in VoidOS apps; retained external-site embedding limitations.
- Extended `settings.html` (the actual settings page) with settings backup/restore, local-storage diagnostics and browser-history cleanup.
- Mirrored all changes to Cordova `www`.
- These features are local/browser-level; they do not create a cloud backend, native Android permissions, or a neural LLM.
