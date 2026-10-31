# CHAOSOS v2.5.0 experimental iteration — Experimental Cloud & OS Foundations

## Branch safety
Built from the v2.5.0 final stability candidate. The canonical `eye_of_chaos_voidos_v2_0_0` archive was not modified.

## Added
1. Session lifecycle manager with boot/active/background/resume/page lifecycle events. It governs the web shell only; it cannot control Android's actual process scheduler.
2. Local-first cloud adapter, disabled by default. Public endpoints must use HTTPS; client code has no embedded secret; bounded request timeouts and response sizes; credentials omitted; redirects rejected.
3. Small Node.js cloud development foundation with health/status, bearer-token gated development sync, bounded request bodies, timing-safe token comparison, basic process-local rate limiting, and capped in-memory records.
4. Arabic deployment/security guide and regression tests. Web and Cordova copies of the client modules and shell were synchronized. Service-worker cache namespace advanced.

## Deliberate limits
- This is a starter backend, not a deployed cloud, not durable storage, and not production-ready.
- Sync is disabled unless a server-side environment token is set; client adapter remains disabled until explicitly configured. Never embed server tokens in client code.
- Before public deployment: real user authentication, HTTPS, persistent database, per-user authorization, audit/privacy/retention policies, stronger distributed rate limiting, monitoring, backups, security review.
- Android-native controls, APK build, install and device tests were not performed in this environment and remain deferred to the computer.

## Validation commands
`node tests/run-all-tests.cjs`
`node tests/release-audit.cjs`
`node tests/cloud-foundation-tests.cjs`
