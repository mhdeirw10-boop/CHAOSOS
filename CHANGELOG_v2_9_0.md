# CHAOSOS v2.9.0 — System Integration & Language Cognition (Experimental)

## Added
- Unified system core (`js/kernel/unifiedCore.js`) with a declared, bounded tool registry, integration checks, plan execution wrapper, and metadata-only trace/explanation interface.
- Local language orchestration (`js/brain/cognition/languageEngine.js`) for intent planning, bounded history context, follow-up resolution, and evaluation metadata. This is not a trained neural language model.
- Manual cloud sync foundation (`js/cloud/syncEngine.js`) with explicit consent, strict key allowlist, size/count limits, revision conflict support, and no automatic application of pulled data.
- Cloud server capabilities endpoint and opt-in revision-checked development sync; storage remains process-memory only and is not production persistence.
- Android capability matrix that marks native-only capabilities and permission requirements without claiming control over Android OS services.
- Terminal and CHAOSAI center integration surfaces for core diagnostics, trace explanation, and manually consented sync.

## Safety and boundaries
- Cloud and model-provider requests remain disabled unless explicitly configured and approved.
- Local diagnostic traces store metadata rather than raw prompt/response text.
- The app sandbox does not grant hidden access to other applications or private phone data. Connectors expose declared data only and require their own permissions.
- No APK was built. Android build and on-device WebView checks remain deferred to a computer.

## Validation
- Run `node tests/run-all-tests.cjs` from the project root.
- Release checks verify source/Cordova mirror consistency, local HTML resource references, JavaScript syntax, service-worker precache paths, and project-index file sizes.

This release is an experimental branch. The original `eye_of_chaos_voidos_v2_0_0.zip` remains separate and unchanged.
