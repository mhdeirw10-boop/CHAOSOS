# v2.3.0 — Experimental implementation notes

This branch is based on the `eye_of_chaos_voidos_v2_2_0_cosmic_lock_system_controls_experimental.zip` archive. It is a new experiment, not the canonical v2.0.0 baseline.

The most visible change is that the hamburger button in `terminal/index.html` now opens a system drawer instead of redirecting immediately to `chaos-commands.html`. The drawer can route through the parent VoidOS shell when embedded as an app, or open matching local pages when visited standalone. `settings.html` can edit the same `voidos_shell_settings_v1` preferences used by the shell and request parent-shell navigation through a narrow message allowlist. The shell sends `VOIDOS_SHELL_READY` only to its loaded app frame so standalone preview wrappers are not mistaken for VoidOS.

Use the root `index.html` preview for the launcher and system menu. Open Terminal from the launcher and test its hamburger. Open Settings from either drawer and test search, shell preference controls and navigation requests.
