# Application trust, review, and signing — design proposal

**Status: planned; not implemented in CHAOSOS v3.1.6.**

## 1. Goals

- Developers should be able to submit an app without managing signing keys.
- VoidStore should automatically sign an app after it passes the store's
  published rules and review process.
- Developers who want to distribute outside VoidStore should be able to ask
  the creator/maintainer for direct approval.
- CHAOSOS Security should verify the package's trusted signature before
  installation and detect any change made after signing.

## 2. Two submission paths

### Path A — VoidStore publication

1. Developer uploads an application package to VoidStore.
2. VoidStore validates package format, app identity, declared permissions,
   content policy, dependency notices, and malware indicators.
3. VoidStore approves or rejects the submission under its published terms.
4. When approved, the store's signing service signs the exact reviewed package.
5. The signed package is published. A later update is reviewed and signed as
   a new version.
6. CHAOSOS verifies the store signature, app ID, version, and package digest
   before installation.

The developer never receives the store's private signing key.

### Path B — direct maintainer approval

1. The developer contacts the CHAOSOS creator/maintainer and submits the
   package and its metadata for direct review.
2. The maintainer explicitly approves or rejects the request.
3. If approved, the authorized signing service issues the accepted trust
   signature or a maintainer-approved certificate for that package.
4. CHAOSOS accepts the package only if its signer is in the trusted key set
   and the package integrity check succeeds.

A direct approval is not an automatic bypass of security checks. It is a second
review path for distribution outside VoidStore.

## 3. Trust roles

| Component | Responsibility |
|---|---|
| VoidStore review | Apply the store's publication rules and record approval/rejection |
| VoidStore signer | Sign packages approved for store distribution |
| Maintainer approval | Decide requests for direct distribution outside the store |
| Signing authority | Keep private keys protected and issue authorized signatures |
| CHAOSOS Security | Verify signer, signature, package identity and integrity |
| Installer | Install only after Security returns an accepted result |

## 4. Cryptographic design requirements

The implementation should use a modern public-key signature scheme (Ed25519 is
a candidate), a cryptographic digest such as SHA-256, versioned signing keys,
key rotation and revocation, and an auditable record of approvals. Private keys
must remain in a protected server-side or offline signing environment, never in
HTML, JavaScript, a public APK, or the developer portal.

A package signature should bind at least:

- canonical application ID;
- package version;
- package digest;
- signer/key ID;
- signing time and signature format version.

The verifier must reject modified packages, unknown or revoked signers,
malformed manifests, app-ID substitution, and unsafe downgrade attempts.

## 5. Current implementation boundary

Current JavaScript permission controls are logical app policies inside the
web runtime. They are not tamper-resistant signatures or Android's package
installer trust mechanism. The planned signing system requires a trusted
backend/signing process and native integration with the Android installer (or
an independently controlled native host). It must not be presented as active
until implemented and tested end to end.
