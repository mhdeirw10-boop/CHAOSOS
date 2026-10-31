# CHAOS SYSTEM Command Center + Eye Boot Simulation

- The hamburger button in `terminal/index.html` now opens `../chaos-commands.html`.
- Conversation history remains available via its dedicated `📜 السجل` button.
- `chaos-commands.html` contains quick commands, custom command forwarding, local text-example training, generated-word support, synthesized audio, local data export and statistics.
- Commands are passed through `localStorage` key `chaos_pending_command_v1`; the shell receives the open-app message and the terminal consumes the pending command once.
- The main shell shows a CSS-rendered human-eye-inspired red-iris boot sequence once per tab session, with a skip control. This is a visual simulation only; it does not replace Android's real bootloader or startup animation.
- Updated files are mirrored under `cordova-project/www`.
- Local-only behavior is explicitly disclosed; no cloud services or neural model training are claimed.
