- 2026-07-05 [matrix] backend `AuthTokenService.parse_jwt_token`: freshly-issued JWTs are
  intermittently rejected with `ImmatureSignatureError (iat not yet valid)` — `jwt.decode`
  runs with zero leeway, so any clock jitter (WSL2/VM/NTP step) makes the just-created
  `iat` land in the future. Symptom: random "Request failed" error boundary on app boot.
  Fix applied to the demo stand: `leeway=10`.
- 2026-07-05 [matrix] frontend (mobile emulation only): a comment posted via "Post Comment"
  is not rendered in the comments list after a successful POST + refetch (API returns it;
  count stays 0 for 20s). After a manual page reload the comment IS there. Desktop usually renders
  it immediately but intermittently hits the same gap under repeated runs. Repro: probe spec, Pixel 7.
