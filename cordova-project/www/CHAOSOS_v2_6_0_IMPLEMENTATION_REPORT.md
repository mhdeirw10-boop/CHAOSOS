# CHAOSOS v2.6.0 — Implementation Report (Experimental Branch)

## Ownership and baseline integrity

This is a separate experimental branch for Eye of Chaos / CHAOSOS, developed for Void Walker. The canonical archive `eye_of_chaos_voidos_v2_0_0.zip` was not used as the working directory and was not modified. Do not promote this branch to the canonical baseline without a separate review. No APK was built; Android packaging and device testing remain deferred to the future computer environment.

## Implemented in this branch

### 1. Explainable CHAOSAI decision planning

- Added `js/brain/cognition/decisionEngine.js` plans for math, local app search, web-search dispatch, explicit app launch, notes, tasks, calendar events, time, help, diagnostics, and ordinary conversation.
- Each plan names its algorithm identifier, accepted input fields, missing required fields, bounded parameters, ordered processing steps, confidence, warnings, and a review recommendation when local outcome measurements repeatedly show poor results.
- `js/brain/cognition/cognitiveEngine.js` connects plan, outcome observation, explicit feedback, evaluation, and an opt-in cloud request entry point. It is still an explainable local controller and not a neural model embedded in the app.
- `js/brain/cognition/userModel.js` saves named preference choices, aggregate intent/route counters, and positive/negative feedback locally. It does not save raw prompts or transcripts. It does not rewrite source code or silently train executable algorithms.
- The Cognitive Center makes the selected algorithm, input fields, steps, confidence, learning measurements, and recommendations inspectable. It can export or reset the profile.

### 2. Managed local tasks

- `js/kernel/taskManager.js` provides an allowlisted handler queue, bounded priority and concurrency, execution timeouts, explicit cancellation, capped retries only for registered retryable handlers, and progress metadata.
- Task payloads exist in page memory while processing; only task metadata and results summary are persisted. Queued/running tasks discovered after a reload are marked interrupted rather than replayed automatically.
- `js/kernel/defaultTaskHandlers.js` registers read-only diagnostic snapshots, local CHAOSAI evaluation, service-health checks, and last-plan explanation. It exposes no shell, arbitrary source execution, or user-supplied handler registration from the UI.

### 3. Supervised services and Android boundary

- `js/kernel/serviceSupervisor.js` tracks service availability, lifecycle states, dependencies, health checks, and bounded restarts. Stopping/restarting a service with active dependants is refused unless the user explicitly confirms cascading actions in the dashboard.
- `js/kernel/osServices.js` registers the common core, task manager, cognition controller, Android bridge, and cloud gateway. Cloud and Android-native runtime remain off/unavailable by default.
- `js/platform/androidBridge.js` is a capability-detection and adapter contract. It does not claim to control real Android processes, boot flow, permissions, filesystem, or native services from the web shell.

### 4. Optional private cloud inference

- `js/cloud/aiGateway.js` and `cloud/providers/openai-compatible.cjs` provide a bounded, explicit-consent request path to a configured HTTPS provider. Provider keys remain in server environment configuration; they are not embedded in the client.
- The user must enable the local gateway, enter a per-session development token, tick a request-consent checkbox, and confirm sending. Sharing response-format preferences (reply style, explanation style, code style, language) requires a separate checkbox and is announced in the confirmation.
- `cloud/server.cjs` keeps AI disabled without explicit server environment configuration. The development service defaults to loopback and uses ephemeral in-memory sync storage; it is not a public deployment or production-ready backend.

## Verification

- Automated regression runner: **24/24 test suites passed** (`node tests/run-all-tests.cjs`). The full output is available in the sibling artifact `CHAOSOS_v2_6_0_TESTS.log`.
- Added focused tests for plan input bindings, aggregate privacy, explicit per-request preference sharing, task cancellation/timeout, dependency-aware service restart, provider safeguards, and the disabled-by-default cloud AI endpoint.
- The test suite covers static/runtime module contracts and server boundary behavior. It is not a visual test on a physical Android device, an Android APK build, a penetration test, or an independent production security review.

## Outstanding limits

1. The local cognitive layer remains rule-based intent classification plus explainable policies, named user preferences, and aggregate feedback. It does not learn neural weights or autonomously rewrite code.
2. Cloud inference has not been configured with real provider credentials in this branch, and no server has been published.
3. There is no durable cloud database, real user identity/authentication system, distributed queue, backups, operational monitoring, or production deployment configuration.
4. Native Android task/service integration requires a separate Cordova plugin or Android module with declared permissions and tests on hardware.
5. APK build and device validation are deliberately deferred to the computer.
