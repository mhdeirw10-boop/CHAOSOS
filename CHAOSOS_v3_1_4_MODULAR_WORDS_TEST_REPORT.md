# CHAOSOS v3.1.4 Modular Words Test Report

Status: experimental branch; automated tests passed in the current development container.

## Changes verified
- `js/brain/commands.js` removed after migrating consumers to `js/brain/words/commands.js`.
- `js/brain/knowledge.js` removed after its unused legacy `knowledgeBase` data was migrated into `js/brain/words/knowledgeBase.js`.
- Phrase entries split into specialized modules: greetings, identity, AI tools, ordinary phrases, relationships, locations, countries, archive, dark vocabulary, banter, stories, jokes, links, and migrated knowledge-base entries.
- Terminal and app script order now loads the word registry and modules before the legacy knowledge adapter.
- Website and Cordova `www` sources synchronized for changed modules and pages.
- Service worker cache namespace bumped to `chaosos-shell-v3-1-4-modular-words-experimental`.

## Automated results
- `node tests/run-all-tests.cjs`: 41/41 test suites passed.
- `node tests/words-modularization-v314-tests.cjs`: 84 phrase entries; module routing and command-only dispatch passed.
- `node tests/kernel-words-integration-v313-tests.cjs`: passed.
- `node tests/project-manifest-v250-tests.cjs`: passed after manifest regeneration.
- `node tests/release-consistency-tests.cjs`: passed.

## Not claimed
- No APK was built in this run.
- No physical Android device test was performed.
- Automated tests do not prove every UI interaction works on the target phone.
