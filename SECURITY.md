# Security policy

## Current status

CHAOSOS v3.1.6 is a web-first environment hosted by a browser or Android
WebView. JavaScript permission checks, local storage policies, and UI lock
screens are not equivalent to Android sandboxing or a native operating-system
security boundary. Do not use this release to protect high-value secrets.

## Reporting a vulnerability

Do not publish a working exploit, private data, API token, or signing key in a
public issue. Use GitHub's private vulnerability reporting for this repository
when it is enabled. If private reporting is unavailable, contact the repository
maintainer through the GitHub account associated with the project and share
only the minimum details needed to establish a private channel.

Include the affected version, impact, reproduction steps, and any proposed
mitigation. The maintainer will acknowledge and triage reports as repository
access and time permit; no response-time guarantee is made.

## Release security rules

- Keep secrets and private keys out of the repository and client-side code.
- Use environment variables for optional server credentials; keep `.env` files
  untracked.
- Treat downloaded applications, archive imports, URLs, and user content as
  untrusted input.
- Review permissions and content before accepting an application into
  VoidStore.
- Do not claim that the planned app-signing flow, antivirus scanning, or
  native permission enforcement exists until those components are implemented
  and tested in the native host.
