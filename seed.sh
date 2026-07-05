#!/usr/bin/env bash
# Register the two demo users and create sample content (idempotent-ish: re-running
# after a fresh DB is fine; existing users/articles just produce 4xx that are ignored).
set -euo pipefail

B=http://127.0.0.1:8080/api

curl -sf -X POST "$B/users" -H 'Content-Type: application/json' \
  -d '{"user":{"username":"qa-author","email":"qa-author@example.com","password":"webqa-demo-1"}}' >/dev/null || true
curl -sf -X POST "$B/users" -H 'Content-Type: application/json' \
  -d '{"user":{"username":"qa-reader","email":"qa-reader@example.com","password":"webqa-demo-1"}}' >/dev/null || true

TOKEN=$(curl -sf -X POST "$B/users/login" -H 'Content-Type: application/json' \
  -d '{"user":{"email":"qa-author@example.com","password":"webqa-demo-1"}}' | python3 -c 'import json,sys; print(json.load(sys.stdin)["user"]["token"])')

post_article() {
  curl -sf -X POST "$B/articles" -H 'Content-Type: application/json' -H "Authorization: Token $TOKEN" \
    -d "$1" >/dev/null || true
}
post_article '{"article":{"title":"Exploring the RealWorld app with web-qa","description":"A tour of automated QA","body":"This article exists so the demo has real content to test against.","tagList":["qa","demo"]}}'
post_article '{"article":{"title":"Visual regression on a Medium clone","description":"Pixel diffs catch layout breaks","body":"Second seeded article so pagination and lists render.","tagList":["testing"]}}'
post_article '{"article":{"title":"Accessibility of the Conduit UI","description":"axe-core findings on a real app","body":"Third seeded article used by the favorites flow.","tagList":["a11y","demo"]}}'

echo "seeded: qa-author / qa-reader (password webqa-demo-1), 3 articles"
