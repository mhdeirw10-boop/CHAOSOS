# CHAOSOS v2.5.0 — Integrated Workspace Experimental Report

## Branch ancestry and safety
- Base: `CHAOSOS_v2_4_2_memory_integrity_audit_experimental.zip`.
- This is an experimental branch. It does not overwrite `CHAOSOS v2.4.2` or the canonical `eye_of_chaos_voidos_v2_0_0` baseline.
- The project manager indexes files in the packaged project. User-selected imports and newly created files live in a separate IndexedDB workspace and do not overwrite source files embedded in the package.

## Changes
- Settings: categories, search, back navigation, compact phone-style layout; existing setting controls are retained and grouped rather than replaced with fake OS permissions.
- Desktop workspace: wide layouts can open app pages in independently movable, resizable, minimizable, maximizable and closable windows. A maximum of six windows is enforced. Narrow layouts retain the phone single-app interface.
- Void Files: package manifest browsing, folders, text preview, downloads, user-selected file/folder import, IndexedDB workspace, create/delete workspace files, and scoped read-only project search integration.
- ChaosAI: arithmetic and local app catalog queries respond in the conversation; explicit `open:` requests still open apps. Scoped project text search can be disabled in settings. Sensitive-looking paths/extensions are excluded from this search layer.
- Void Store: removed the local demo account/signup panel; local favorites and library remain. The catalog ranking considers query relevance, favorites/library, runnable local entries and recency. Mock entries are described as demos and must not be mistaken for published apps/APKs.
- VoidTube: added a local, explainable recommender using query relevance, likes/dislikes/saves/history/subscriptions and category/channel affinity with channel diversity. This is heuristic ranking, not a neural network; it runs locally.
- Desktop and Cordova sources are versioned as 2.5.0 in the branch package metadata.

## Important limitations
- This is a web/Cordova shell, not a standalone Android OS. Wi-Fi, Bluetooth, battery, brightness, filesystem root access and Android-level permissions cannot be controlled by HTML UI alone. Shell settings are simulated/local preferences unless a native plugin is wired and device-tested.
- File access is limited to files included in this package plus user-selected files/folders. A browser cannot browse the host computer or Android filesystem without explicit picker grants; app-created workspace data is not the packaged source tree.
- App-page code is stored as a copy in the project bundle; changing a copy from within Void Files does not rewrite source code or trigger rebuilding the APK. Download/edit/rebuild is the supported source change workflow.
- Videos added by VoidTube are local/browser-session content as implemented by the existing video app; this update does not create a server upload system or sync media across devices.
- The project was source-checked and tests are run separately in the attached test logs. No APK build, physical-device run, native permission test, or full visual-browser automation is claimed in this report.
