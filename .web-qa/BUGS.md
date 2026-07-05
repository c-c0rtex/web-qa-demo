- 2026-07-05 [matrix] backend `AuthTokenService.parse_jwt_token`: freshly-issued JWTs are
  intermittently rejected with `ImmatureSignatureError (iat not yet valid)` — `jwt.decode`
  runs with zero leeway, so any clock jitter (WSL2/VM/NTP step) makes the just-created
  `iat` land in the future. Symptom: random "Request failed" error boundary on app boot.
  Fix applied to the demo stand: `leeway=10`.
- 2026-07-05 [matrix] frontend: intermittent STALE-PAGE RENDER after client-side
  navigation (mobile emulation most runs, desktop occasionally). Navigating to a fresh
  article URL sometimes renders a previously-viewed article instead — wrong title, wrong
  comments — and the comment form then POSTs to the STALE article's slug: the comment
  lands on the wrong entity (screenshots: sample-reports/findings/mobile-comment-*.png —
  after reload the misdirected comment sits under the stale article). Originally observed
  as 'posted comment not rendered' and 'new article heading not visible'; both are this
  one bug. Specs TC-G2/TC-G5 are parked with test.fixme until the app is fixed.
