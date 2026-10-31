# VoidOS v2.3.0 — Unified System Settings & Hamburger Menu (Experimental)

## Added
- A unified hamburger drawer on the VoidOS home shell for navigation, quick controls, recent apps, app manager, lock settings and immediate shell locking.
- A real navigation drawer on the CHAOS SYSTEM terminal. The old hamburger redirection to `chaos-commands.html` was replaced; that command page remains accessible from the menu.
- Parent-shell messages from the terminal and Settings app for home, controls, recents, app manager, lock settings and immediate lock actions.
- Shared local settings controls in `settings.html`: theme, simulated brightness, simulated Wi-Fi/Bluetooth/sound, particles, contrast and font scale.
- Settings search and quick navigation for global preferences, backups, manual memories and diagnostics.
- Better accessible labels, expanded settings sidebar, Escape/backdrop closing, and standalone query entry points for lock/control/recent screens.
- Main shell applies supported shared preferences instead of resetting brightness/contrast styles.

## Important boundaries
- Wi-Fi, Bluetooth, sound status, brightness and battery are UI simulations. This is not an Android system settings panel.
- The lock screen is an in-app shell lock and is not a replacement for Android's secure lock screen.
- Settings and lock preferences use browser/Cordova local storage; they can be lost with app data clearing and are not synced to a server.
- APK packaging and on-device touch/navigation have not been validated by this patch step.
