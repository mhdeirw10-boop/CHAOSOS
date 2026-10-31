# Eye of Chaos / VoidOS v1.7.0

- Routed CHAOS intents to app-specific services instead of answering every request in the terminal.
- Math requests queue an expression for Void Calculator and open that app.
- App/download requests open Void Store with a search term; items with no package URL remain unavailable.
- Removed the floating CHAOS widget from the home screen; terminal dock icon remains.
- Split security.js into policy.js, input.js, storage.js, and index.js under js/brain/security/.
- Added shared security facade, bounded audit log, security policy inspection, safe URL validation, and input normalization.
- Replaced the calculator Function-based expression evaluator with a bounded recursive-descent parser.
- Updated PWA cache version and security module assets.

Limitations: the project is still a browser-based local-first shell. Client-side security cannot provide server-grade protection; real APK downloads, remote accounts, cloud sync, and Android OS privileges require further infrastructure.

- Hardened integrated Void Store demo password storage with PBKDF2-SHA-256 and successful-login migration for older local demo accounts.

- Added automated tests for security policy, input bounds, URL validation, audit logging, and the calculator parser.
