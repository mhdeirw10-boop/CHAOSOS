# Contributing to CHAOSOS

Thank you for helping improve CHAOSOS. Critical feedback is useful, including
reports that a feature is confusing, unreliable, poorly designed, or should be
removed.

## Ways to contribute

- **Bug report:** identify the version, device/browser, steps to reproduce,
  actual result, expected result, and relevant console output.
- **Critical review:** describe what is wrong, why it is a problem, and what
  change would improve it. Positive feedback is not required.
- **Feature proposal:** explain the user problem, expected behaviour, boundaries,
  and compatibility impact before proposing implementation.
- **Code contribution:** submit a focused pull request with tests and updated
  documentation.
- **Security report:** use the private process in `SECURITY.md`; do not publish
  exploitable details in a public issue.

## Before opening a pull request

1. Search existing issues and pull requests.
2. Describe the problem being solved and the affected component.
3. Keep each application inside its own `apps/<app-id>/` directory.
4. Keep the source of truth in the repository root. Do not edit only the built
   Cordova mirror under `cordova-project/www/`.
5. Avoid introducing new dependencies unless they are necessary and their
   license, maintenance status, and security implications are documented.
6. Do not add API keys, tokens, private keys, passwords, local user data, or
   device-specific paths.
7. Add or update regression tests and the relevant documentation.
8. Run `npm run check` before requesting review.

## Architecture expectations

- Keep Core, Security, shared Services, CHAOSAI, Interface, and Apps separated
  by responsibility. The target boundaries are documented in
  `documentation/architecture/ARCHITECTURE.md`.
- Applications must use documented system interfaces rather than reaching into
  internal kernel state or another application's private storage.
- Security decisions must not be delegated solely to CHAOSAI. A request from
  CHAOSAI remains subject to the system's permission and security policy.
- Do not describe JavaScript-level simulation as native Android or kernel
  functionality.

## Pull requests and attribution

By intentionally submitting a contribution for inclusion in this repository,
you agree that it is submitted under the repository's Apache License 2.0,
unless you clearly state another arrangement and the maintainer accepts it.
You confirm that you have the right to submit the work and have listed relevant
third-party sources and licenses.

The original project remains credited to Void Walker. Contributor credit is
preserved in project history and release notes where appropriate.
