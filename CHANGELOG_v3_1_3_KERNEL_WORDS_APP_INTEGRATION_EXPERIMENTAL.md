# CHAOSOS v3.1.3 — Kernel, Words and App Integration (Experimental)

This branch is derived from the supplied v3.1.2 experimental archive. The v3.0.0 mother baseline is not modified.

## Included
- `js/kernel/healthManager.js`: local read-only checks, deep service health checks, report generation, and explicit recovery limited to services marked recovery-safe. No background timer or automatic restart.
- `js/kernel/presenceDirector.js`: event-driven state model (`booting`, `idle`, `thinking`, `working`, `warning`, `resting`) with a bounded in-memory history.
- `js/kernel/adaptiveTaskPlanner.js`: explainable plans and allowlisted diagnostic task execution; arbitrary requests remain analysis-only.
- `js/kernel/appLifecycleManager.js`: local app launch/close stats, favorites and a bounded recent event history; it does not record app content or queries.
- `js/brain/words/`: separate modules for explicit commands, identity/greetings, ordinary phrases, stories/mystery, jokes, and curated links. The prior 73 key-answer entries are retained through a compatibility adapter.
- The app manager now exposes health checks and usage/favorites; CHAOSAI Center exposes health/planning controls; Void Game Manager shows its actual local presence/usage integration.
- Site and Cordova source mirrors are synchronized.

## Scope and limits
This remains a web/Cordova experimental branch. It does not implement a native Android background service, a custom speech model, or real consciousness. Voice-engine redesign remains deferred to the desktop stage. No APK build or physical-device test is claimed.
