#!/usr/bin/env bash
# Pull, build and restart on the VPS.
#   ssh root@juooa.cloud "bash /var/www/dialogue-futures/deploy/deploy.sh"
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/dialogue-futures}"
SERVICE="${SERVICE:-dialogue-futures}"

cd "$APP_DIR"
echo "→ pulling latest"
git pull --ff-only

echo "→ backend dependencies"
cd "$APP_DIR/backend"
[ -d .venv ] || python3 -m venv .venv
.venv/bin/pip install -q --upgrade pip
.venv/bin/pip install -q -r requirements.txt

echo "→ frontend build"
cd "$APP_DIR/frontend"
npm ci --omit=dev --no-audit --no-fund || npm install --no-audit --no-fund
npm run build

echo "→ restarting $SERVICE"
sudo systemctl restart "$SERVICE"
sudo systemctl --no-pager --lines=5 status "$SERVICE" || true

echo "→ health check"
curl -fsS http://127.0.0.1:8071/api/health && echo " ok"
