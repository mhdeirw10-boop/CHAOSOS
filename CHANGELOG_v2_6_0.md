# CHAOSOS v2.6.0 — Unified System Core / Cognitive Services (Experimental)

## Added
- `js/brain/cognition/`: explainable intent plans with named algorithm/field bindings, bounded preference profile, aggregate route outcomes, explicit feedback, and review recommendations after repeated failures.
- `js/kernel/taskManager.js` and `js/kernel/defaultTaskHandlers.js`: registered-handler-only task queue, safe diagnostics/evaluation/health-check jobs, bounded concurrency, task priorities, cancellation, execution deadlines, capped retries, and metadata-only persistence.
- `js/kernel/serviceSupervisor.js` and `js/kernel/osServices.js`: service states, dependency checks, health probes, lifecycle operations, and restart limits.
- `js/platform/androidBridge.js`: future Android adapter contract that detects real capabilities and refuses to pretend a web shell can control Android internals.
- `js/cloud/aiGateway.js` and `cloud/providers/openai-compatible.cjs`: explicit-consent cloud request boundary; user-selected reply preferences may be shared per request only through a separate checkbox, and provider endpoint/key remain server-side.
- `apps/chaosai-center/index.html`: local cognitive console for intent plans, privacy-preserving learning statistics, task management, service inspection, cloud setup, and Android capability status.
- Additional regression coverage for cognitive planning, task execution, service dependencies, privacy boundaries, and cloud provider configuration.

## Changed
- Kernel dispatch now asks CHAOSAI for an explainable plan and records aggregate outcome metadata, without storing the raw prompt in the adaptive profile.
- CHAOSAI Cognitive Center was added to the app catalog and system menu.
- Version metadata and service-worker cache namespace advanced to 2.6.0.

## Safety and limits
- The canonical `eye_of_chaos_voidos_v2_0_0` archive is not edited by this branch.
- No APK was built. Android compilation and device tests remain deferred to the computer.
- The local intent engine is rule/retrieval-based; a neural model is not embedded in this code. Cloud inference works only after an operator deliberately configures a private HTTPS service, server-side provider credentials, and a session access token.
- Cloud and sync are disabled by default. The development server binds to `127.0.0.1` unless an operator changes the host. Do not expose it publicly as-is.
- This learning system adjusts preferences and evaluates aggregate route outcomes; it does not rewrite source code, invent new algorithms autonomously, or learn neural weights. Raw chat messages are not written to the adaptive profile.
- Task payloads stay in page memory and are not persisted; interrupted tasks are not resumed silently after page reload.
- Android-native runtime management is unavailable until separately implemented, packaged, permissioned, and tested with native adapters.

## Validation
Run `node tests/run-all-tests.cjs` and `node tests/release-audit.cjs` from the site root. These tests do not replace Android build/device testing or a production security review.
