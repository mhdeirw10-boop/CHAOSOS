# CHAOSOS v3.1.5 — Natural Vocabulary and Secret Persona (Experimental)

## Added
- Expanded the Arabic/Iraqi Arabic phrase inventory while keeping existing phrases.
- Added `courtesy.js`, `emotions.js`, `technology.js`, `philosophy.js`, `naturalConversation.js`, and `secrets.js`.
- Added Arabic diacritic, alef, ta marbuta, and Arabic digit normalization. Longer whole phrases now win against shorter fallback phrases.
- Added handler-first dispatch and wired registry matching into the real application response path, so natural phrase patterns run before the broad local-language fallback (not just in isolated tests).
- Added a fictional secret-probing persona with escalating in-character replies. User-shared secrets are not saved by this module; it warns not to submit passwords/API keys and describes that normal conversation/retention depends on app settings.
- Added tests for dictionary growth, natural variants, secret guard, and wiring in home shell, terminal, and CHAOSAI Center.

## Preserved
- Explicit commands remain separate from everyday language.
- The existing 84 phrase entries and knowledge-base entries remain available; new entries expand the modular vocabulary.
- `eye_of_chaos_voidos_v3_0_0` remains the stable baseline and is not modified.

## Validation limits
This is an experimental web-app branch. Automated tests do not constitute an APK build or a physical Android test. The secret behavior is an in-character response rule, not a security boundary and not a promise of absolute confidentiality.
