#!/usr/bin/env bash
# Start the demo stand: Postgres (docker) + FastAPI backend :8080 + static frontend :30401.
# Ctrl+C stops the foreground processes; `docker rm -f webqa-demo-pg` stops the DB.
set -euo pipefail
cd "$(dirname "$0")"

docker start webqa-demo-pg 2>/dev/null || docker run -d --name webqa-demo-pg \
  -e POSTGRES_DB=conduit -e POSTGRES_USER=conduit -e POSTGRES_PASSWORD=conduit \
  -p 5433:5432 postgres:16

(cd apps/backend && .venv/bin/uvicorn conduit.app:app --host 127.0.0.1 --port 8080) &
BACK_PID=$!
(cd apps/frontend && npx --yes serve -s build -l 30401) &
FRONT_PID=$!

trap 'kill $BACK_PID $FRONT_PID 2>/dev/null' EXIT
echo "backend  → http://127.0.0.1:8080  (OpenAPI: /openapi.json)"
echo "frontend → http://127.0.0.1:30401"
wait
