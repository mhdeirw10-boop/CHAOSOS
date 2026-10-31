# CHAOSOS

**One eye. Another world.**  
A mysterious, community-driven operating environment from the Eye of Chaos project.

> **Release:** `v3.1.6` — experimental web-first release candidate  
> **Creator and project owner:** Void Walker  
> **Project:** Eye of Chaos  
> **Origin:** Independently developed in an Arab League member state; the state is intentionally undisclosed. This is not an official project, programme, or endorsement of the League of Arab States.

[العربية](#عن-chaosos) · [English](#about-chaosos)

---

## عن CHAOSOS

CHAOSOS هو مشروع مستقل ضمن عالم **Eye of Chaos**، يطوّر بيئة تشغيل ذات واجهة هاتف وتطبيقات محلية ومكوّن CHAOSAI. هويته البصرية عالمية وغامضة؛ دعم العربية جزء من تعدد اللغات وليس قيداً على هوية المشروع.

هذه النسخة مبنية على الويب وتعمل داخل المتصفح أو Android WebView عبر Cordova. لذلك فهي **بيئة تشغيل شبيهة بأنظمة التشغيل وليست حالياً نظام تشغيل مستقلاً أو نواة Android/Linux بديلة**.

### ما تتضمنه النسخة

- واجهة هاتف مع شاشة رئيسية وتنقل وتطبيقات مستقلة.
- نواة برمجية منظّمة حول إدارة التطبيقات والخدمات والأحداث والمهام.
- CHAOSAI محلي يعتمد على السياق والتوجيه والذاكرة والوحدات المعرفية المتاحة في المشروع.
- تطبيقات Eye of Chaos، ومنها VoidTube وVoidBrowserX وVoidStore وVoidPlanner وVoid Game Manager.
- مساحة محلية للوسائط في VoidTube، مع تعليقات وردود محلية وشخصيات متابعة محاكية ومعلّمة بوضوح على أنها محاكاة.
- مجموعة اختبارات Node.js وتدقيق للمسارات وملفات JavaScript ونسخة Cordova.

### حدود مهمة في الإصدار الحالي

- أزرار وحالات بعض وظائف الهاتف، مثل Wi-Fi والبلوتوث والسطوع والبطارية، هي تمثيل واجهة وليست تحكماً فعلياً بإعدادات Android.
- إدارة التطبيقات ودورة حياتها تتم داخل بيئة JavaScript، وليست مدير عمليات على مستوى نظام Android.
- شاشة القفل والحساب المحلي ليسا بديلاً عن قفل Android أو خدمة حسابات آمنة على خادم.
- متابعو VoidTube الآليون شخصيات محلية محاكية، وليسوا مستخدمين حقيقيين.
- منظومة توقيع الحزم واعتماد التطبيقات التي تصفها وثائق التصميم **مقترح معماري للمراحل اللاحقة وليست منفّذة في V3.1.6**.
- لم يُدّعَ بناء APK أو تثبيته أو اختباره على هاتف فعلي لهذه الحزمة.

## About CHAOSOS

CHAOSOS is an independent project within the **Eye of Chaos** universe. It is a phone-oriented, web-first operating environment with local applications and a CHAOSAI layer. Its visual identity is intentionally mysterious and global; Arabic support is part of its multilingual capability, not a restriction on its identity.

This release runs in a browser or Android WebView through Cordova. It is **not yet a standalone operating system and does not replace the native Android or Linux kernel**.

### Included in this release

- Phone-oriented shell, home screen, navigation, and standalone application folders.
- Modular JavaScript runtime for application lifecycle, services, events, tasks, and diagnostics.
- Local CHAOSAI context, intent routing, persona, memory, and knowledge components.
- Eye of Chaos applications including VoidTube, VoidBrowserX, VoidStore, VoidPlanner, and Void Game Manager.
- Local VoidTube media handling, comments, replies, and clearly labelled simulated follower personas.
- Node.js regression tests and static release audits.

### Known boundaries

Some native-looking controls are UI simulations. Runtime lifecycle management is JavaScript-level, not Android process management. The in-app lock screen and local profile are not Android security boundaries. VoidTube follower personas are simulated. The planned package-signing and application-approval system is documented but is not implemented in v3.1.6. No APK build or physical-device test is claimed for this package.

---

## Project structure

```text
CHAOSOS/
├── apps/                 # Each application has its own folder and assets
├── assets/               # Project-owned visual assets
├── cloud/                # Optional, disabled-by-default server foundation
├── css/                  # Shared shell styles
├── js/
│   ├── kernel/           # Runtime, lifecycle, services, permissions, routing
│   ├── brain/            # CHAOSAI cognition, memory, language, knowledge, voice
│   ├── platform/         # Host-platform adapters
│   └── cloud/            # Optional cloud adapters
├── terminal/             # CHAOS SYSTEM interface
├── tests/                # Regression tests and release audits
├── documentation/        # Architecture, security, boot, and release notes
├── cordova-project/      # Cordova wrapper; web source is mirrored into www/
└── README/               # Detailed subsystem and file-path notes
```

The physical source paths in this release are preserved. The documented target architecture separates the responsibilities of Core, Security, Services, CHAOSAI, Interface, and Apps without pretending that a folder move or native implementation has already happened. See [`documentation/architecture/ARCHITECTURE.md`](documentation/architecture/ARCHITECTURE.md).

## Run locally

Use Node.js 22 or newer for the supplied test commands. To preview the web interface, start a local static server from this directory:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/` in a modern browser. Some functions require a secure context or browser capabilities and may not behave identically under `file://`.

## Tests and release checks

```bash
npm test
npm run prepare:release
npm run check
```

- `npm test` runs the first-party regression suites.
- `npm run prepare:release` regenerates `project-index.json`, refreshes `cordova-project/www/`, and runs the static release audit.
- `npm run check` runs the tests, prepares the Cordova mirror, and checks release consistency.

These checks do not replace visual browser testing, Cordova build testing, Android installation, or real-device performance/security validation.

## Community and forks

Critical feedback is welcome. Report what is broken, how to reproduce it, what should happen instead, and what change you recommend. A report can be direct and strongly worded; the project asks for useful technical detail, not praise.

Developers may fork and rename their derivative systems. Preserve the license and the attribution notice, identify the original project as the source, and do not claim that a derivative is an official CHAOSOS release. A suggested description is:

> **[Your System Name] — based on CHAOSOS**

See [`CONTRIBUTING.md`](CONTRIBUTING.md), [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), [`DERIVATIVE_PROJECTS.md`](DERIVATIVE_PROJECTS.md), and [`SECURITY.md`](SECURITY.md).

## License

The project source is distributed under the Apache License 2.0. The `NOTICE` file records the original project attribution. Third-party components, if any, remain subject to their own notices and licenses; review [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) before redistribution.
