# Eye of Chaos / VoidOS — v1.9.0

## Highlights
- Added **VoidOS App Manager** as an integrated system app.
- Added a shared app catalogue and local enable/disable policy. Core apps are protected from accidental disabling.
- Added a local permission-policy manager for network, local storage, and notifications. The browser checks the network grant before navigation.
- Added **VoidBrowserX v1.2** as an integrated app with address/search bar, back/forward navigation, reload, home, shortcuts, local browsing history, copy URL, stop loading, and open externally fallback.
- Added Arabic intents for opening VoidBrowserX and the app manager through CHAOS SYSTEM.
- Expanded kernel service registration and diagnostics for the new apps and managers.
- Added a shared URL validation policy and regression tests for unsafe URL schemes, browser/app-manager routing, and permission flows.

## Security and limitations
- VoidBrowserX only accepts HTTP/HTTPS destinations and rejects `javascript:`, `data:`, `file:`, and other schemes.
- Embedded websites can refuse iframe display using their own security headers. The browser offers an external-open fallback; it does not bypass those protections.
- The permission manager is a web-app policy layer, not a native operating-system sandbox. Browser-level restrictions still apply.
- VoidOS remains a web/PWA shell, not a native Android operating system. Service worker/offline support requires HTTPS or localhost; `file://` has browser limitations.

## Validation
- Kernel regression tests include browser and manager routing.
- Manager tests cover app catalogue, enable/disable policy, and permission grant flows.
- JavaScript syntax and ZIP integrity are checked before packaging.
