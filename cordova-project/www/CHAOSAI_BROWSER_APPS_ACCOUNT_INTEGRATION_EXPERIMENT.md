# CHAOSAI + VoidBrowserX + VoidTube + Void Store — Experimental Integration

Owner: Void Walker
Branch: `eye_of_chaos_voidos_v2_0_0` experimental only

## Included in this experiment
- Added `js/chaos-hub.js`, a shared local assistant/profile panel.
- Loaded the shared panel in the OS shell, VoidBrowserX, VoidTube, and Void Store.
- The assistant can provide bounded local guidance, attempt existing `ChaosWebSearch` when the user asks for a search, and read the latest answer through the existing `VoidOS.speak()` text-to-speech function.
- The profile can reuse a locally published identity (including an active Void Store demo identity) and stores a common display profile under `voidos_unified_profile_v1`.
- Mirrored the changed app payloads into `cordova-project/www`.

## Important architecture truth
This does **not** turn the current HTML browser into a standalone browser engine. VoidBrowserX still displays websites through an HTML iframe, so sites can block embedding and some browser capabilities are unavailable. A proper Android browser independent of the Chrome *app* needs a native Android/Cordova plugin using Android WebView or an embedded Chromium-based engine. Android WebView is a system rendering component and may be updated independently; it is not the Chrome application, but it is still an external engine dependency. A truly bundled Chromium engine increases APK size and maintenance substantially.

## Account scope and security
The shared profile is local to the same WebView/origin and device. It is not a server-authenticated account, does not safely synchronize across separate APKs/devices, and must not be used for sensitive credentials. Void Store's existing local demo login remains separate authentication logic; this integration shares identity/display context but does not pretend that one local profile is secure single sign-on. Real SSO needs a backend/API, secure token storage, account recovery, and explicit privacy controls.

## CHAOSAI scope
The assistant is a local rules-and-tools layer. It can call the existing search module when available and uses the existing OS text-to-speech function. It is **not** a newly trained general-purpose LLM and does not claim cloud AI access.

## Verification status
ZIP integrity, JavaScript syntax, and mirror consistency should be checked for this archive. No Android APK build or physical-device test is claimed by this document.
