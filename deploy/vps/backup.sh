#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
umask 077
backup_dir="backups/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p -- backups
mkdir -- "$backup_dir"
# Pause API writes so the MongoDB dump and video files describe the same state.
api_id="$(docker compose ps --status running -q api)"
if [[ -z "$api_id" ]]; then
  echo "API must be running before backup." >&2
  exit 1
fi
trap 'docker compose start api >/dev/null' EXIT
docker compose stop api
docker compose exec -T mongo sh -c \
  'mongodump --username="$MONGO_INITDB_ROOT_USERNAME" --password="$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase=admin --db=kiha --archive --gzip' \
  > "$backup_dir/mongo.archive.gz"
docker compose run --rm --no-deps -T api \
  tar -C /var/lib/kiha/videos -czf - . > "$backup_dir/videos.tar.gz"
cp -- .env "$backup_dir/deployment.env"
echo "Backup written to $backup_dir. Copy this private directory off the VPS."
