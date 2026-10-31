# VoidOS v2.4.0 — Focused Terminal, App Discovery & Orientation (Experimental)

## Fixed
- Removed the large CHAOS SYSTEM quick-command panel from the terminal page so the conversation/history viewport can use the available height. The same tools remain in the separate CHAOS command center accessible from the hamburger menu.
- Replaced the hard-coded two-page launcher paging rule with adaptive paging based on the current search and orientation.

## Added
- `js/appCatalog.js`: searchable metadata catalog for local apps, their project paths, declared features/permissions and known limitations.
- `apps/void-discovery/`: app detail pages, launches into local apps, live search from available public sources, GitHub repository lookups, plus direct Google, DuckDuckGo, Google Play and GitHub search links.
- Orientation preference (auto/portrait/landscape) in shared settings and quick controls.
- Cordova `cordova-plugin-screen-orientation` declaration; responsive landscape layout when the viewport actually enters landscape.
- Expanded app manager registry and discover navigation from the launcher/CHAOS hamburger.

## Known boundaries
- Web result APIs can fail due to network/CORS/rate limits; direct search links remain as a fallback. No app ratings or version facts are invented.
- The actual Android orientation lock needs the Cordova plugin to be fetched and installed in a built APK; it was not proven on a device in this build session. Browser previews may not let JavaScript lock orientation.
- Wi-Fi, Bluetooth, brightness, audio and battery indicators remain simulated.
- APK build and physical phone tests were not performed.
