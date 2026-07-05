# Full Regression v2 — realworld-demo

_Run: 20260705-142938 UTC_

- Target: http://127.0.0.1:30401
- Backend: http://127.0.0.1:8080
- Logged-in: None (None)
- Discovered ids: {}
- Total TC: 7
- ✋ manual: 2
- ✅ pass: 3
- ⏭ skip: 2

**a11y critical/serious violations:** 3 total, 1 unique (id+page)

## TC Results

| File | TC | Kind | Status | A11y | Title | Notes |
|---|---|---|---|---|---|---|
| article-lifecycle.md | TC-G1 | passive | ✅ pass | ♿❌(1) | Verify signed-in state on home page | GOTO / → 2/2 expected matched (visible text) |
| article-lifecycle.md | TC-G2 | mutating | ✋ manual | ♿✅ | Create a new article via the editor | skipped (mutating); reasons: declared **Type:** mutating |
| article-lifecycle.md | TC-G3 | passive | ✅ pass | ♿❌(1) | New article appears in the Global Feed | GOTO / → 1/1 expected matched (visible text) |
| article-lifecycle.md | TC-G4 | passive | ✅ pass | ♿❌(1) | New article appears on its own article page | GOTO / → 2/2 expected matched (visible text) |
| article-lifecycle.md | TC-G5 | role-specific | ⏭ skip | ♿✅ | Reader adds a comment on the article | declared for role(s): reader — run with --role |
| article-lifecycle.md | TC-G6 | role-specific | ⏭ skip | ♿✅ | Reader favorites the article | declared for role(s): reader — run with --role |
| article-lifecycle.md | TC-G7 | mutating | ✋ manual | ♿✅ | Author deletes the article | skipped (mutating); reasons: declared **Type:** mutating |

**Network failures (4xx/5xx, filtered):** 0

**Console errors/warnings:** 0

## A11y violations

- `/` [serious] **color-contrast** — Elements must meet minimum color contrast ratio thresholds (59 nodes)
- `/` [serious] **color-contrast** — Elements must meet minimum color contrast ratio thresholds (59 nodes)
- `/` [serious] **color-contrast** — Elements must meet minimum color contrast ratio thresholds (59 nodes)
