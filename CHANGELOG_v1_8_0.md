# Eye of Chaos / VoidOS v1.8.0

- Kernel-first architecture under `js/kernel/`.
- Arabic-first intent classification and task routing.
- Fixed `أحسب 1+1` and Arabic-indic digit support.
- Calculator requests are validated and routed to Void Calculator.
- Store search/download requests are passed to Void Store without fabricating unavailable packages.
- Terminal implementation now lives in `terminal/index.html`; `terminal.html` redirects for backward compatibility.
- Added service registry, event bus, result bus, diagnostics, and regression tests.
