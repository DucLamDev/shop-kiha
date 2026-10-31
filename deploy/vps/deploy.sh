#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
if [[ ! -f .env ]]; then
  echo "Run bash deploy/vps/setup-env.sh from the repository root first." >&2
  exit 1
fi
docker compose config --quiet
docker compose build --pull
docker compose up -d --wait --wait-timeout 180
docker compose ps
echo "Services are ready on 127.0.0.1:3100 (web) and 127.0.0.1:4100 (API)."
echo "Configure the supplied Nginx site and HTTPS before using admin login."
