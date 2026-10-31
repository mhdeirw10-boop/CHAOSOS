/* Legacy compatibility shim.
 * The old floating CHAOSAI bubble was removed in v2.4.2. Shared local profile
 * management now lives in accountManager.js; this file creates no UI and sends no data.
 */
(function (root) {
  'use strict';
  if (root.ChaosAccountManager?.sync) root.ChaosAccountManager.sync();
})(typeof window !== 'undefined' ? window : globalThis);
