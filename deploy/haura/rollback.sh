#!/usr/bin/env sh
set -eu

if [ ! -f .previous-deployment ]; then
  echo "No previous deployment is available" >&2
  exit 1
fi

set -a
. ./.previous-deployment
set +a

docker compose -f compose.yml pull
docker compose -f compose.yml up -d --remove-orphans --wait
cp .previous-deployment .deployment

