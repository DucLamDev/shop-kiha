#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
if [[ -e .env ]]; then
  echo "deploy/vps/.env already exists; keeping the current credentials."
  exit 0
fi
command -v openssl >/dev/null
umask 077
# Hex passwords can safely be embedded in a MongoDB connection URI.
set -o noclobber
{
  printf 'SITE_URL=https://noithatkiha.vn\n'
  printf 'MONGO_ROOT_PASSWORD=%s\n' "$(openssl rand -hex 32)"
  printf 'MONGO_APP_PASSWORD=%s\n' "$(openssl rand -hex 32)"
} > .env
echo "Created deploy/vps/.env with private permissions. Keep it across releases."
