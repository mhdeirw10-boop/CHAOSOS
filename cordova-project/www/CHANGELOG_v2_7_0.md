# CHAOSOS v2.7.0 — Modular Science & Cognition (Experimental)

## Main changes

- Refactored `js/brain/commands.js` into a compatibility façade and intent/knowledge dispatcher, with independent registered specialist modules under `js/brain/knowledgeModules/`.
- Expanded modular local knowledge to 26 registered modules, including physics, biology, chemistry, mathematics, astronomy, Earth science, computer science, engineering, medicine, statistics, ecology, materials science, psychology, economics, linguistics, robotics, cybersecurity, neuroscience, genetics, science methodology, stories, curated links, app access, project-file discovery, safe calculator support, and general fallback.
- Added explainable cognition planning that reports the chosen specialist and processing steps, while tracking aggregate routing metadata instead of persisting raw query text.
- Added a local app capability bridge and 13 registered connector identities across productivity, media, system, CHAOSAI, terminal, and personal-data categories. Reads require consent; writes require a separate write grant and a fresh confirmation. Results are bounded and marked local-only.
- Added app API inspection, clearer media/bookmark routing, sensitive-key redaction in settings summaries, and refusal when required app permissions are not granted or an app is disabled.
- Updated the kernel diagnostics/version, service-worker cache name, project index generator, and experimental Cordova metadata to v2.7.0.

## Boundaries

- This is an experimental web/Cordova operating environment, not a replacement Android kernel.
- Local knowledge modules are deterministic curated rules and summaries, not a bundled trained neural model or an exhaustive encyclopedia.
- No cloud server is published. No app data is sent to a remote provider through the local connector bridge.
- Native Android private data (full contacts, real SMS, unrestricted file system, camera roll and other apps' private storage) is not accessible merely because the project runs in a WebView. Access requires explicit supported APIs and Android permission mediation.
- No APK was built. Android packaging remains deferred to the computer phase.

## Automated validation (current experimental source)

- Regression runner: 27/27 suites passed in the recorded full-suite run.
- Release audit: 2,198 assertions passed; all counted precache paths were unique and all audited local HTML references resolved.
- Visual browser testing and device/APK verification remain pending.
