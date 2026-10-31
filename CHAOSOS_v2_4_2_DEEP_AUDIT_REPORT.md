# CHAOSOS v2.4.2 — Deep Audit / Experimental Memory Integrity Patch

**Branch:** `CHAOSOS_v2_4_2_memory_integrity_audit_experimental`  
**Base:** `CHAOSOS_v2_4_2_context_reasoning_account_unification_experimental.zip`  
**Canonical baseline preserved:** `eye_of_chaos_voidos_v2_0_0.zip` was not modified.  
**Scope:** Static syntax checks, existing regression suites, and an executable Node.js VM simulator for local-storage memory integration.

## Confirmed defect

`js/brain/hippocampus/hippocampus.js` treated `chaos_persistent_long_term` as an array, while `js/brain/hippocampus/longTerm.js` stored an object with `{ profile, history }`. This made mixed use of the two APIs unsafe (`.push()` on an object / `.length` not representing history) and risked clobbering profile metadata.

## Changes applied

- `Hippocampus.loadLongTerm()` now accepts the legacy array and the object schema, returns history records to its callers, and tolerates malformed JSON without throwing.
- `Hippocampus.recordExperience()` now writes the shared `{ profile, history }` schema, preserves profile fields, increments interaction metadata, and bounds history to 50 records.
- `LongTermMemory.load()` migrates legacy arrays in memory to `{ profile, history }`, validates malformed/unexpected shapes, and preserves legacy records on subsequent writes.
- `LongTermMemory.saveExperience()` now bounds history to 50 entries.
- Synced the two modified files to the Cordova `www` tree.
- Added `tests/memory-integration-tests.cjs`, which simulates the browser storage APIs in a Node VM.

## Test results

- Existing and new test suites: **16/16 passed**.
- Standalone JavaScript files checked with `node --check`: **142 files, 0 syntax failures**.
- Inline JavaScript blocks in HTML checked: **80 blocks, 0 syntax failures**.
- New memory integration simulator covers: both writers sharing the schema; profile preservation; legacy array migration; memory-disabled behavior; malformed JSON recovery; 50-record long-term cap; five-record short-term cap.
- Release consistency test passed, including the existing critical site/Cordova file parity assertions.

## Important limits

- These are local static and simulated tests, not a full browser automation run on a real Android device.
- No APK was built; no Redmi 13C / Android 15 device test was performed.
- This patch addresses the confirmed memory-schema incompatibility only. It does not certify every feature or every permission path as correct.
- `Hippocampus` and `LongTermMemory` are both declared as top-level `const`; this test loads them in one VM realm as browser scripts. Actual page script order and page-specific storage behavior still need browser integration coverage.
