# Release preparation

The project root is the source of truth. `cordova-project/www/` is generated
from that source by `scripts/prepare-release.cjs`.

Before creating a public release:

1. Update the project version consistently in `cordova-project/package.json`
   and `cordova-project/config.xml`.
2. Update `CHANGELOG_v3_1_6.md` or add the next release changelog.
3. Run `npm run check`.
4. Review `VALIDATION_REPORT.md` and replace it with the exact output for the
   release candidate being distributed.
5. Inspect the final diff, third-party assets and dependency notices.
6. Build the Cordova Android project in an environment with Android SDK,
   platform tools, and accepted SDK packages. The static checks do not perform
   this native build.
7. Install the resulting build on representative physical devices and record
   the model, Android version, test date, and test results.

Do not publish a release as stable solely because the Node.js tests pass.
