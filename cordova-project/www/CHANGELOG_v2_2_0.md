# VoidOS v2.2.0 — Cosmic Lock & System Controls (Experimental)

## Added
- Cosmic-horror lock screen with clock, date, rotating in-world messages, and swipe-to-unlock.
- Optional 4–8 digit PIN mode with SHA-256 digest where Web Crypto is available and a labeled compatibility fallback otherwise.
- Lock configuration entry in the quick-settings/notification shade.
- Existing notification shade, quick toggles, and recent-apps manager retained as the integrated system-control layer.
- Session-only unlocked state; reloading a new session returns to the lock screen.

## Limitations
- This is a UI lock for the VoidOS web shell, not Android's secure lock screen. Local browser storage can be modified or cleared.
- Quick toggles are simulations; they do not toggle real Wi-Fi, Bluetooth, sound, brightness, or Android battery state.
- No APK build or physical-device interaction test was performed for this archive.
