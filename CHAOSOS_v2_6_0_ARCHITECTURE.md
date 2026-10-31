# CHAOSOS v2.6.0 — Architecture and Implementation Boundaries

## Ownership and branch
This is an experimental branch of Eye of Chaos / CHAOSOS created for Void Walker. Keep `eye_of_chaos_voidos_v2_0_0.zip` unchanged. Do not promote this branch to the canonical baseline merely because local tests pass.

## Runtime layers

```text
CHAOSOS Shell / Apps
        |
        v
Unified Kernel + Event Bus + Permission Surface
        |
        +--> Intent Engine --> Explainable CHAOSAI Decision Planner
        |                            |
        |                            +--> Aggregate outcomes / explicit preference profile
        |
        +--> Task Manager --> registered handlers only
        |
        +--> Service Supervisor --> dependency/state/health lifecycle
        |
        +--> Android Bridge Contract --> native adapters (not implemented by this web branch)
        |
        +--> Cloud Boundary --> opt-in request --> private server --> configured model provider
```

## CHAOSAI: what “learning” means in this branch

- `js/brain/cognition/decisionEngine.js` creates a visible plan from the existing intent classifier. It returns the selected local route, the named algorithm, bounded input fields, required/missing fields, execution steps, confidence, and a human-readable explanation. The current page can inspect which fields would be passed without executing the plan.
- `js/brain/cognition/userModel.js` stores only named preference choices (for example response style) and aggregate counters by intent/route. It does not store the raw user prompt or transcript.
- Explicit positive/negative feedback changes the aggregate quality record. Repeated failures lower adjusted confidence and become review recommendations; they do not patch JavaScript or silently rewrite system policy. Learning remains bounded to named preferences and aggregate intent/route measurements.
- The dashboard lets the user disable measurement, erase the profile, or export it.
- Existing local n-gram training remains a separate, explicit corpus-training feature. Its statistical model is not a neural language model.

This architecture is an explainable adaptive controller, not a claim that the current application independently understands every user or equals a general-purpose cloud AI model.

## Task and service lifecycle

- `VoidTaskManager` accepts work only when a matching handler was registered by trusted project code; raw user strings are not evaluated as source code or shell commands.
- Priority is bounded from -10 to +10; concurrency is 1–4; timeouts are bounded; retries are only allowed for explicitly idempotent handlers and capped at three.
- Payloads stay in memory. The persistent store carries state/metadata only. On reload, leftover queued/running metadata is marked interrupted, never silently replayed.
- `VoidServiceSupervisor` tracks desired/state values and declared dependencies, blocks dependency cycles, refuses to stop a service with live dependants unless cascade is requested, and limits restarts.
- Current service lifecycle applies to JavaScript modules in the application context, not Linux processes or Android services.

## Cloud inference boundary

The browser does not contain provider API keys. For a local server, configure environment values only on the server:

```sh
HOST=127.0.0.1 PORT=8787 \
CHAOSOS_CLIENT_TOKEN='YOUR_RANDOM_DEV_SESSION_TOKEN' \
CHAOSOS_AI_ENDPOINT='https://provider.example/v1/chat/completions' \
CHAOSOS_AI_API_KEY='YOUR_PROVIDER_API_KEY' \
CHAOSOS_AI_MODEL='configured-model-name' \
node cloud/server.cjs
```

Do not store the provider key in HTML, JavaScript, `config.xml`, or a public repository. Enter the client session token into the Cognitive Center only for that live page session. The client sends a request only after explicit in-page consent and a second confirmation. Prompts are bounded; redirects are rejected; request cookies are omitted; the server does not log prompt text. User-selected response preferences are sent only when the separate per-request preference-sharing checkbox is selected and confirmed. If the provider env values are absent, the AI route returns a disabled response.

The backend remains development-only: sync store is in-memory; no database, user account system, persistent job system, distributed rate limiting, TLS termination, backups, observability, or production auth exists here. The app does not publish/deploy any server. For a future public design, use a reverse proxy with TLS, real OIDC/session auth, per-user authorization and quotas, a durable database, private secret management, a job queue, data deletion/retention controls, monitoring, backups, and independent security review before exposure.

## Android path

`js/platform/androidBridge.js` is only an adapter contract/capability detector. It deliberately does not fake device-level permission, filesystem, service, process, or boot control. Future Android-specific work should live in a native Cordova plugin / Android module with narrow capability APIs, declared permissions, explicit runtime prompts, and tests on actual hardware. APK compilation is deferred to the computer and was not performed in this iteration.

## Release/verification checklist

- [x] preserve the canonical baseline archive
- [x] branch-local kernel, cognitive planner, aggregate feedback, task manager, service supervisor, Android contract
- [x] private-server model gateway structure; disabled until server credentials and provider are configured
- [x] expose a cognitive-control panel inside CHAOSOS, including inspectable algorithm input bindings and safe task handlers
- [ ] configure a real AI provider (no credentials supplied in this branch)
- [ ] persistent cloud database and real user authentication
- [ ] native Android service and permission integration
- [ ] APK build and device testing on the future computer
- [ ] production security and privacy review
