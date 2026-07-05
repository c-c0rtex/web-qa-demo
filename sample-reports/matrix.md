# Test Matrix — realworld-demo

_Run: 20260705-145403 UTC_

**Deploy gate: ✅ PASS**

- Total tests: 18
- ✋ manual: 8
- ✅ pass: 9
- ⏭ skip: 1
- 🔁 flaky (unstable over last 5 runs): 2

**Route coverage:** 4/8 routes have tests
Uncovered: `/register`, `/settings`, `/profile/qa-author`, `/profile/{id}`
- role `reader`: 2/8 — uncovered: `/{id}`, `/login`, `/register`, `/settings`, `/profile/qa-author`, `/profile/{id}`

| # | Source | File | TC | Role | VP | Kind | Status | Note |
|---|---|---|---|---|---|---|---|---|
| 1 | scenario | article-lifecycle.md | TC-G1 | reader | desktop | passive | ✅ pass | GOTO / → 2/2 expected matched (visible text) |
| 2 | scenario | article-lifecycle.md | TC-G2 | reader | desktop | mutating | ✋ manual | skipped (mutating); reasons: declared **Type:** mutating |
| 3 | scenario | article-lifecycle.md | TC-G3 | reader | desktop | passive | ✅ pass | GOTO / → 1/1 expected matched (visible text) |
| 4 | scenario | article-lifecycle.md | TC-G4 | reader | desktop | passive | ✅ pass | GOTO / → 2/2 expected matched (visible text) |
| 5 | scenario | article-lifecycle.md | TC-G5 | reader | desktop | mutating | ✋ manual | skipped (mutating); reasons: declared **Type:** mutating |
| 6 | scenario | article-lifecycle.md | TC-G6 | reader | desktop | mutating | ✋ manual | skipped (mutating); reasons: declared **Type:** mutating |
| 7 | scenario | article-lifecycle.md | TC-G7 | reader | desktop | mutating | ✋ manual | skipped (mutating); reasons: declared **Type:** mutating |
| 8 | scenario | article-lifecycle.md | TC-G1 | reader | mobile | passive | ✅ pass 🔁 | GOTO / → 2/2 expected matched (visible text) |
| 9 | scenario | article-lifecycle.md | TC-G2 | reader | mobile | mutating | ✋ manual | skipped (mutating); reasons: declared **Type:** mutating |
| 10 | scenario | article-lifecycle.md | TC-G3 | reader | mobile | passive | ✅ pass | GOTO / → 1/1 expected matched (visible text) |
| 11 | scenario | article-lifecycle.md | TC-G4 | reader | mobile | passive | ✅ pass | GOTO / → 2/2 expected matched (visible text) |
| 12 | scenario | article-lifecycle.md | TC-G5 | reader | mobile | mutating | ✋ manual | skipped (mutating); reasons: declared **Type:** mutating |
| 13 | scenario | article-lifecycle.md | TC-G6 | reader | mobile | mutating | ✋ manual | skipped (mutating); reasons: declared **Type:** mutating |
| 14 | scenario | article-lifecycle.md | TC-G7 | reader | mobile | mutating | ✋ manual | skipped (mutating); reasons: declared **Type:** mutating |
| 15 | spec | article-lifecycle__tc-g2-create-a-new-article-via-the-editor.spec.ts |  | - | - | spec | ✅ pass | 2 test(s) |
| 16 | spec | article-lifecycle__tc-g5-reader-adds-a-comment-on-the-article.spec.ts |  | - | - | spec | ⏭ skip 🔁 | 2 test(s) |
| 17 | spec | article-lifecycle__tc-g6-reader-favorites-the-article.spec.ts |  | - | - | spec | ✅ pass | 2 test(s) |
| 18 | spec | article-lifecycle__tc-g7-author-deletes-the-article.spec.ts |  | - | - | spec | ✅ pass | 2 test(s) |
