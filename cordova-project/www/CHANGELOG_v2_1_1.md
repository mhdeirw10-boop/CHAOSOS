# VoidOS v2.1.1 — Phone Foundation Plus (Experimental)

## Added
- Added six lightweight essential app prototypes: Phone, Messages, Mail, Camera, Gallery, and Download.
- Added two-page home app navigation with swipe gestures and visible page controls.
- Added simulated battery percentage and charging toggle. This is explicitly a simulation and does not read or change Android battery state.
- Improved the main Eye identity with a red iris mark.
- Added CHAOS input classifier to distinguish explicit command syntax from ordinary text; this is a lightweight classifier, not natural-language understanding.
- Download manager stores a local list and can export that list as JSON.
- Camera uses getUserMedia only when the environment and permissions support it; otherwise shows a clear message. Gallery displays images explicitly selected by the user.

## Boundaries
- Phone/SMS/Mail open the OS handler via tel:, sms:, and mailto:; no hidden calls, SMS sending, or mailbox access.
- Camera and Gallery are web prototypes, not replacements for Android system apps. Camera may require HTTPS/localhost or native Android integration.
- Download does not access the system Downloads directory automatically.
- Battery is simulated.
- No APK was built and no physical-device testing is claimed.

## Validation
ZIP integrity and JavaScript syntax checks should be run before release; existing automated tests are run where supported.
