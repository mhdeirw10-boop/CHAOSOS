# CHAOSOS architecture

## 1. Purpose

The architecture is organized by **responsibility and ownership**, not by
stacking unrelated simulated systems. A layer is a project folder or module
boundary. It is not automatically a separate operating-system kernel or a
separate process.

The goal is to make each subsystem easy to locate, test, replace, and repair
without forcing unrelated applications to change.

## 2. Current implementation map (v3.1.6)

The current source paths are retained in this release candidate:

| Responsibility | Current source location | Current status |
|---|---|---|
| Shell and shared UI | `index.html`, `css/` | Implemented as web UI |
| Core runtime and app lifecycle | `js/kernel/`, `core.js`, `js/system-core.js` | JavaScript runtime modules |
| CHAOSAI cognition and language | `js/brain/` | Local modules, routing, context, memory, knowledge and voice components |
| App-specific code | `apps/<app-id>/` | Each app has its own folder; some have extracted CSS/JS entry points |
| Shared platform adapters | `js/platform/` | Web/Cordova host adapters |
| Optional cloud foundation | `cloud/`, `js/cloud/` | Optional; disabled unless configured |
| Regression tests | `tests/` | Node.js tests and static release audit |
| Android wrapper | `cordova-project/` | Cordova project; its `www/` directory mirrors web source |

The existing `js/brain/security/` folder contains CHAOSAI/security-related
policy and learning modules. It should not be mistaken for a native Android
security subsystem.

## 3. Target responsibility folders

The following is the **target architecture for the next refactoring phase**.
It is a design map, not a claim that all folders or modules have already been
created or moved.

```text
CHAOSOS/
├── kernel/
│   ├── core/             # Boot coordination, events, shared runtime contracts
│   ├── applications/     # App registry and lifecycle management
│   ├── services/         # Service registry, supervisor and task coordination
│   └── security/         # Trust decisions, permission policy and integrity checks
│
├── chaosai/
│   ├── cognition/        # Intent routing, planning and decision support
│   ├── context/          # Current conversation and task context
│   ├── memory/           # Short-, long-term and web memory
│   ├── language/         # Local language and vocabulary modules
│   └── persona/          # Stable identity and response profiles
│
├── services/
│   ├── files/            # Controlled file access
│   ├── storage/          # Local persistence adapters
│   ├── network/          # Network policy and request services
│   ├── notifications/   # Notification service
│   └── diagnostics/      # Logs, health and reports
│
├── interface/
│   ├── mobile/           # Phone shell and navigation
│   ├── components/       # Shared UI components
│   └── themes/           # Global visual identity and themes
│
├── apps/                 # Independent applications
├── platform/             # Android/WebView and future native adapters
├── shared/               # Shared schemas and small utilities
├── documentation/
└── tests/
```

### Important distinction

Core remains one central kernel made from cooperating modules. `CHAOSAI` is
one distinct system layer, not a second kernel. The folders describe module
responsibilities and permissions; they do not imply that JavaScript can manage
Android's real processes, memory, permissions, or kernel.

## 4. Dependency direction

1. Apps call documented system services or capability APIs.
2. Services call authorized kernel interfaces and host adapters.
3. CHAOSAI may analyze requests and propose actions, but its requests pass
   through Security and the relevant permission policy before execution.
4. Security does not depend on CHAOSAI's decision to approve an operation.
5. The kernel does not depend on any one app; removing VoidTube must not break
   boot or app management.
6. Apps do not access another app's private data directly.

## 5. Fault isolation and repair

Every module should expose a small documented interface, have an independent
unit test, return structured errors, and write diagnostic events without
logging secrets or raw private content. A failure in an optional app or service
should be contained where possible and should not stop the shell from loading.

## 6. Refactoring rule

Before moving a file, update the dependency map, identify all script and asset
references, update the Cordova mirror, and run the complete release checks.
Keep protected baseline archives unchanged. The first public package is a
source snapshot; future structural moves should happen in reviewed branches.
