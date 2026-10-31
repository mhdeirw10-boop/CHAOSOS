# CHAOSOS v2.5.0 experimental iteration — Cloud-ready OS foundations (experimental)

- Added a session/lifecycle manager for web-shell boot, background, resume and page lifecycle events. This is not Android process control.
- Added a local-first cloud adapter that is disabled by default and requires HTTPS for non-local endpoints. No secret is embedded in client code.
- Added a Node.js development server foundation with health/status routes, bounded JSON requests, timing-safe bearer token check, per-process rate limiting, and capped in-memory sync records.
- Added Arabic deployment/security notes and explicit production blockers.
- Baseline v2.0.0 remains unchanged. APK build/device tests remain deferred to the computer stage.
