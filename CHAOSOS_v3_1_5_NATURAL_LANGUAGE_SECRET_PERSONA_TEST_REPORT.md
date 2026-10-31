# CHAOSOS v3.1.5 — Natural Vocabulary & Secret Persona Test Report

## Scope
This experimental branch expands the modular word registry, improves normalized Arabic phrase matching, routes dynamic natural-language handlers and pattern-based phrase matching before the local language model fallback, and adds an in-character guard for questions seeking CHAOSAI's fictional secrets or hidden system instructions.

## Vocabulary and routing
- Current merged vocabulary size: **457 entries** (verified by the natural-vocabulary test).
- Word modules: **21 modules** (registry plus domain modules).
- Explicit executable commands remain separated in `js/brain/words/commands.js`.
- Exact curated dictionary entries are preferred before broad pattern matching; dynamic handlers and phrase-pattern matching are both wired into the main application response path before the local model fallback.
- The legacy 73 phrase corpus is retained alongside migrated knowledge and additions, and older regression checks are updated to validate preservation rather than an obsolete fixed total.

## Fictional secret persona and privacy behavior
- Requests to reveal CHAOSAI's fictional secrets or hidden prompt receive in-character, evasive replies.
- Requests asking for real system instructions receive a boundary-setting response rather than fabricated claims about secrets.
- When a user says they have a personal secret to share, the module warns against entering passwords, API keys, or sensitive information.
- The module does **not** persist secrets; its repeated-probe counter is page-memory only. This is a character behavior, not a security boundary or a guarantee of conversation confidentiality.

## Validation status
- Full automated suite: **42/42 test suites passed**, zero failures.
- Release audit: **2,935 assertions passed**.
- Project manifest: **330 indexed files**, with current sizes and no duplicate/unsafe relative paths.
- Service-worker precache: **262 unique paths**, all verified to exist.
- HTML resource audit: **985 local references checked**.
- JavaScript syntax audit: **159 JS files and 44 inline scripts checked**.
- Cordova source mirror and project-index consistency tests passed.

## Not performed
- No APK was built as part of this task.
- No physical Android-device test was performed.
- This report does not claim model-level intelligence or security guarantees; the phrase matcher and character responses are local program logic.
