# web-qa-demo — autonomous QA on a real open-source app

[web-qa](https://codeberg.org/c-c0rtex/web-qa) pointed at a real
[RealWorld/Conduit](https://github.com/gothinkster/realworld) stack — a React 19 SPA
([realworld-react-fsd](https://github.com/yurisldk/realworld-react-fsd)) on a FastAPI
backend ([fastapi-realworld-backend](https://github.com/borys25ol/fastapi-realworld-backend)) —
with every artifact the pipeline produced committed to this repo. You can read the whole
story without running anything.

## What web-qa found on a real app

Pointing the pipeline at a well-maintained open-source stack surfaced, in one afternoon
(see [`.web-qa/BUGS.md`](.web-qa/BUGS.md)):

1. **A JWT clock-skew bug** — the backend rejects freshly-issued tokens with
   `ImmatureSignatureError (iat not yet valid)` whenever the clock jitters:
   `jwt.decode()` runs with zero leeway. Symptom: a random "Request failed" error
   boundary on app boot. One `leeway=10` fixes it.
2. **A stale-render bug in the frontend that misdirects writes** — after client-side
   navigation the SPA intermittently keeps rendering the previously-viewed article
   (wrong title, wrong comments) under the new URL, and the comment form then posts
   to the *stale* article: the comment lands on the wrong entity. Mobile emulation
   hits it most runs, desktop occasionally. The specs that catch it are parked with
   `test.fixme` + an `APP-BUG` marker — assertions intact, waiting for the app fix.
3. **12 serious `color-contrast` violations** (axe-core) on the article feed — the
   classic green-on-white branding.
4. An environmental gotcha worth knowing: the backend rate-limits at 100 req/min per
   IP, which an E2E suite exhausts in seconds — every failure then masquerades as a
   429. The demo setup raises it.

## The committed artifacts

| Artifact | What to look at |
|---|---|
| [`.web-qa/app.context.md`](.web-qa/app.context.md) | The crawled app map. Note the `Origin` column: routes mined statically from the router config (`code:router-config`) appear even when no link points at them; `/login` and `/register` are honestly shown as *redirects to `/`* under an authenticated crawl |
| [`.web-qa/scenarios/article-lifecycle.md`](.web-qa/scenarios/article-lifecycle.md) | 7 test cases generated from one task description — typed (`passive`/`mutating`), role-annotated (`**Role:** reader`), human-reviewable markdown |
| [`.web-qa/specs/`](.web-qa/specs/) | Generated Playwright specs: UI-first, self-contained, `QA-` prefixed data created and deleted in `try/finally`, auth reused verbatim from the seed spec |
| [`.web-qa/seed.spec.ts`](.web-qa/seed.spec.ts) | The human-verified auth pattern (RealWorld keeps its JWT in localStorage — it must be planted via `addInitScript` *before* the app boots) |
| [`sample-reports/matrix.md`](sample-reports/matrix.md) | The deploy gate: every test × role × viewport (desktop + Pixel 7 emulation), route coverage incl. per-role, flaky markers 🔁, exit-code verdict |
| [`.web-qa/BUGS.md`](.web-qa/BUGS.md) | Findings ledger — bugs stay here until the app is fixed, they don't get "fixed" in the tests |
| [`sample-reports/findings/`](sample-reports/findings/) | Evidence for the findings: the stale-render bug caught on camera (`after-post` — the URL points at a fresh article, but a previously-viewed one is rendered; `after-reload` — the posted comment sits under the WRONG article) and the raw axe-core report with all 12 `color-contrast` nodes |
| [`.web-qa/history.json`](.web-qa/history.json) | The flaky-tracking data behind the 🔁 markers — pass/fail history per test over a 5-run window |
| [`sample-reports/junit.xml`](sample-reports/junit.xml) | The same matrix as JUnit XML (`web-qa-matrix --junit`) — drop it into any CI's test-report ingestion |

<details open>
<summary><b>junit.xml</b> — the deploy gate in a format every CI understands (click to expand)</summary>

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="web-qa-matrix" tests="18" failures="0">
  <testsuite name="realworld-demo 20260705-164534" tests="18" failures="0" skipped="9">
    <testcase name="article-lifecycle.md::TC-G1::reader::desktop"/>
    <testcase name="article-lifecycle.md::TC-G2::reader::desktop"><skipped message="manual"/></testcase>
    <testcase name="article-lifecycle.md::TC-G3::reader::desktop"/>
    <testcase name="article-lifecycle.md::TC-G4::reader::desktop"/>
    <testcase name="article-lifecycle.md::TC-G5::reader::desktop"><skipped message="manual"/></testcase>
    <testcase name="article-lifecycle.md::TC-G6::reader::desktop"><skipped message="manual"/></testcase>
    <testcase name="article-lifecycle.md::TC-G7::reader::desktop"><skipped message="manual"/></testcase>
    <testcase name="article-lifecycle.md::TC-G1::reader::mobile"/>
    <testcase name="article-lifecycle.md::TC-G2::reader::mobile"><skipped message="manual"/></testcase>
    <testcase name="article-lifecycle.md::TC-G3::reader::mobile"/>
    <testcase name="article-lifecycle.md::TC-G4::reader::mobile"/>
    <testcase name="article-lifecycle.md::TC-G5::reader::mobile"><skipped message="manual"/></testcase>
    <testcase name="article-lifecycle.md::TC-G6::reader::mobile"><skipped message="manual"/></testcase>
    <testcase name="article-lifecycle.md::TC-G7::reader::mobile"><skipped message="manual"/></testcase>
    <testcase name="article-lifecycle__tc-g2-create-a-new-article-via-the-editor.spec.ts"/>
    <testcase name="article-lifecycle__tc-g5-reader-adds-a-comment-on-the-article.spec.ts"><skipped message="skip"/></testcase>
    <testcase name="article-lifecycle__tc-g6-reader-favorites-the-article.spec.ts"/>
    <testcase name="article-lifecycle__tc-g7-author-deletes-the-article.spec.ts"/>
  </testsuite>
</testsuites>
```

Every matrix row becomes a `<testcase>` named `file::TC::role::viewport`; mutating TCs
executed by specs show as `skipped` in the passive rows, the specs themselves carry the
verdict. Inside GitHub Actions the human-readable matrix also lands on the run page
automatically via `$GITHUB_STEP_SUMMARY`.
</details>

The auth contract is declared, not hardcoded, in [`.web-qa/config.json`](.web-qa/config.json):

```json
"auth_login_path": "/api/users/login",
"auth_login_body": {"user": {"email": "{email}", "password": "{password}"}},
"auth_token_field": "user.token",
"auth_browser_storage": {"kind": "localStorage", "key": "realworld-auth-token", "value": "{token}"}
```

## Run it yourself

Requirements: git, docker, [uv](https://docs.astral.sh/uv/), Node 20+, yarn,
[web-qa](https://codeberg.org/c-c0rtex/web-qa) (`/plugin marketplace add c-c0rtex/web-qa`).

```bash
./setup.sh        # clone upstream apps (pinned SHAs), patch, install, migrate, build
./run.sh          # postgres + backend :8080 + frontend :30401
./seed.sh         # two demo users + three articles
```

Register the project in web-qa (credentials live in your machine-local registry only):

```bash
web-qa-register-project realworld-demo \
  --target-url http://127.0.0.1:30401 --backend-url http://127.0.0.1:8080 \
  --path "$(pwd)"
# then put qa-author@example.com / webqa-demo-1 into the registry's "auth",
# and qa-reader@example.com as role "reader"
```

And drive the pipeline (or just ask your agent — *"run the full regression"*):

```bash
web-qa-doctor    --alias realworld-demo
web-qa-explore   --alias realworld-demo            # crawl + static route mining
web-qa-generate  --alias realworld-demo --task "Article lifecycle: ..."
web-qa-spec-gen  --alias realworld-demo            # TCs → validated Playwright specs
web-qa-matrix --alias realworld-demo --roles reader --viewports desktop,mobile
```

The committed config pins `"workers": 1` — the whole stand shares one small backend,
and parallel chromiums turn timing into noise.

## Third-party

Upstream apps are fetched by `setup.sh` at pinned commits and are **not** vendored here:
[fastapi-realworld-backend](https://github.com/borys25ol/fastapi-realworld-backend) (MIT) and
[realworld-react-fsd](https://github.com/yurisldk/realworld-react-fsd) (MIT), both part of the
[RealWorld](https://github.com/gothinkster/realworld) family. The two tiny demo patches
(rate-limit raise, JWT leeway) are applied locally by `setup.sh` and documented inline.

## License

[MIT](https://codeberg.org/c-c0rtex/web-qa/blob/main/LICENSE) © [c-c0rtex](https://codeberg.org/c-c0rtex)
