# Security hardening — 2026-10-16

## Implemented

- Compatible dependency updates; no forced Expo downgrade.
- Logout calls the existing backend `/auth/logout`; local credentials are cleared even when server revocation fails. Access JWTs remain valid until their existing expiration (15 minutes by default); this is not immediate access-token revocation.
- Serialized credential writes and session generation checks prevent a late refresh from restoring or replacing a logged-out session. Stale rotated refresh tokens are revoked.
- Production requires an explicit HTTPS API URL. Development retains local API support.
- WebView navigation is limited to its initial document; mixed content, file access, automatic windows and DOM storage are disabled. Map HTML has CSP and no-referrer policy.
- External address lookup requires a user decision; the privacy policy identifies Photon/Komoot and OpenStreetMap.
- Android release builds enable R8 and resource shrinking through Expo configuration.
- Environment variants are ignored, preserving `.env.example`.
- CI uses SHA-pinned actions, read-only permissions, no checkout credentials, credential-pattern scanning and regression checks.

## Operational requirements

- Deploy the backend changes before distributing the mobile build. Auth rate limits use in-memory storage per instance; configure trusted proxy networks for your deployment and distributed limiting before scaling horizontally. Do not trust arbitrary forwarded headers.
- Verify Firebase API restrictions in Google Cloud: Android package `com.homeeasy.mobile`, production signing SHA and only required APIs. No private credential was confirmed; no key was revoked blindly.
- Build the production AAB through EAS and verify its certificate, `debuggable=false`, permissions and R8 behavior. The generated local Gradle debug signing configuration is not evidence of the final EAS signature.
- Review provider agreements, retention/backups and actual account deletion. Policy text does not certify LGPD compliance.
- High transitive advisories with no compatible fix remain in Expo/Metro tools. CI blocks critical advisories; high alerts must be reviewed until upstream fixes exist. Motion must pass the high threshold.
- Credential-pattern scanning is a baseline, not a replacement for GitHub secret protection or a full entropy/provider-aware scanner. GitHub secret scanning and push protection were confirmed enabled. Dependabot vulnerability alerts and automated security fixes were enabled through the repository API.
- Pinning needs a dedicated native integration, certificate lifecycle and rotation plan; it has not been enabled as an untested change.
- No deployment, release, secret rotation, commit or push was performed. GitHub security settings were checked and Dependabot protection was enabled separately.

## Validation

- Mobile TypeScript, session race/revocation, form, permission, address and actual browser map/CSP checks passed.
- Backend TypeScript and 24 test suites / 91 tests passed, including HTTP login/reset limits and spoofed forwarded-IP rejection.
- Final audit: mobile 24 alerts (16 high / 8 moderate), no critical; motion zero. Remaining mobile root advisories: `braces`, `node-forge`, `uuid`, with no compatible fixes indicated by npm audit.
- Backend audit after compatible updates: 24 moderate alerts, no high or critical. These include MinIO transitive parsing dependencies and test tools; no forced downgrade was applied.
- Backend changes also validate upload signatures against authorized MIME types, remove query strings from request logs and exclude credentials from Docker context. Header validation is not antivirus or full image/PDF parsing; signed upload URL reuse remains a follow-up for object immutability.
