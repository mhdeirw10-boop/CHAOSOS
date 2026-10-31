# Eye of Chaos v1.4.1

## VoidOS app integration
- Added VoidTube v0.2 as an isolated app at `apps/voidtube/`.
- Added Void Store v1.0 as an isolated app at `apps/void-store/`.
- Added launch icons to the VoidOS home screen and registered both apps with the app switcher/recent-app list.
- Added app files to the PWA service-worker precache list and bumped the cache name to v1.4.1.
- Preserved both original standalone ZIP packages in `standalone-packages/`.
- Documented local-only behavior, demo account limitations, and server-dependent features.

## Scope
The integration uses the existing same-origin iframe shell. It does not turn either prototype into a server-backed service or provide real APK downloads in Void Store.
