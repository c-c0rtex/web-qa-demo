#!/usr/bin/env bash
# web-qa-demo setup: fetch the RealWorld apps (pinned SHAs), apply demo patches,
# install dependencies, prepare the database, seed demo users and content.
#
# Requirements: git, docker, uv (https://docs.astral.sh/uv/), Node 20+, corepack/yarn.
#
# Upstream apps (both MIT):
#   backend  https://github.com/borys25ol/fastapi-realworld-backend
#   frontend https://github.com/yurisldk/realworld-react-fsd
set -euo pipefail
cd "$(dirname "$0")"

BACKEND_SHA=55111c6b335455734c139a2245d98be8288be528
FRONTEND_SHA=969709a379b13935b4e1caae0ad8cad548e5879a

mkdir -p apps

if [ ! -d apps/backend ]; then
  git clone https://github.com/borys25ol/fastapi-realworld-backend apps/backend
  git -C apps/backend checkout "$BACKEND_SHA"
fi
if [ ! -d apps/frontend ]; then
  git clone https://github.com/yurisldk/realworld-react-fsd apps/frontend
  git -C apps/frontend checkout "$FRONTEND_SHA"
fi

echo "== demo patches (upstream code is otherwise unmodified)"
# 1. The backend rate-limits at 100 req/min per IP — an E2E suite blows through that
#    in seconds and every failure turns into a mystery 429.
sed -i 's/rate_limit_requests = 100$/rate_limit_requests = 100000  # web-qa demo: raised for test throughput/' \
  apps/backend/conduit/api/middlewares.py || true
# 2. jwt.decode() runs with zero leeway, so any clock jitter (WSL2/VM/NTP step) makes a
#    freshly-issued token "not yet valid (iat)". Found by web-qa — see .web-qa/BUGS.md.
python3 - <<'EOF'
import pathlib
p = pathlib.Path("apps/backend/conduit/services/auth_token.py")
s = p.read_text()
old = "payload = jwt.decode(token, self._secret_key, algorithms=[self._algorithm])"
if old in s:
    s = s.replace(old, ("payload = jwt.decode(\n"
        "                token, self._secret_key, algorithms=[self._algorithm],\n"
        "                leeway=10,  # web-qa demo: clock jitter made fresh iat land in the future\n"
        "            )"))
    p.write_text(s)
EOF

echo "== backend env"
cat > apps/backend/.env <<'ENV'
APP_ENV=prod
SECRET_KEY=webqa-demo-secret
JWT_SECRET_KEY=webqa-demo-jwt-secret
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5433
POSTGRES_USER=conduit
POSTGRES_PASSWORD=conduit
POSTGRES_DB=conduit
API_PREFIX=/api
ENV

echo "== postgres (docker)"
docker rm -f webqa-demo-pg 2>/dev/null || true
docker run -d --name webqa-demo-pg \
  -e POSTGRES_DB=conduit -e POSTGRES_USER=conduit -e POSTGRES_PASSWORD=conduit \
  -p 5433:5432 postgres:16
sleep 5

echo "== backend deps + migrations"
(cd apps/backend && uv venv --python 3.12 .venv && uv pip install -q -r requirements.txt --python .venv/bin/python && .venv/bin/alembic upgrade head)

echo "== frontend build (production — a webpack dev-server flakes under E2E load)"
sed -i 's|^API_URL=.*|API_URL=http://127.0.0.1:8080/api|' apps/frontend/.env.production
(cd apps/frontend && yarn install --frozen-lockfile && yarn generate && yarn build:prod)

echo "== done. Start the stand with ./run.sh, then seed with ./seed.sh"
