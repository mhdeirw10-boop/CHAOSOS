# v2.4.0 implementation notes

Experimental branch based on v2.3.0. It is not the canonical `eye_of_chaos_voidos_v2_0_0` baseline.

## Terminal layout correction
The full-width `chaos-quickbar` and its script were removed from `terminal/index.html`; local tools remain reachable through the hamburger's separate CHAOS command center.

## Search behavior
Launcher app search routes an app match to `apps/void-discovery/index.html`, where local metadata is displayed immediately and web search can be requested. The discovery page queries the existing ChaosWebSearch abstraction and GitHub's public repository search API. External search links are provided for Google, DuckDuckGo, Play Store and GitHub. Results are not guaranteed complete; failures are shown instead of fabricating details.

## Orientation behavior
Settings support `auto`, `portrait`, and `landscape`. Cordova metadata declares `cordova-plugin-screen-orientation` and removes the fixed portrait preference. When the device viewport is landscape, CSS changes the launcher to a six-column layout. Some browser previews cannot force device orientation; only a build/install/device test can verify native rotation.
