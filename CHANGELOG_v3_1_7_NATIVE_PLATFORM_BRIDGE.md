# CHAOSOS v3.1.7 — Native Platform Bridge Evolution

## Added
- Added a local Cordova Android plugin at `cordova-project/native-plugins/cordova-plugin-void-native`.
- Added native device/build metadata reporting.
- Added Android Storage Access Framework document selection (`ACTION_OPEN_DOCUMENT`). It returns a user-selected content URI and metadata; it does not grant broad filesystem access.
- Added Android 13+ `POST_NOTIFICATIONS` runtime permission request through Cordova's permission helper.
- Upgraded `VoidAndroidBridge` to discover and call the native plugin without pretending unavailable capabilities exist.
- Added `VoidPermissionManager.requestNative('notifications')` for the real Android permission flow.

## Boundaries
- This remains a Cordova Android application with a JavaScript runtime, not a standalone OS or native kernel.
- Native methods execute under the app's Android sandbox and only receive permissions granted by Android/the user.
- Document picker access is scoped to the document selected by the user. No broad storage permission is requested.
- No root, bootloader, kernel, process-table, RAM-management, or arbitrary app-control capability is added.

## Verification status
- JavaScript syntax and repository consistency checks are run for this package.
- An Android APK build and physical-device test are not claimed by this package preparation.
