#!/usr/bin/env sh
set -eu

IMAGE=${1:?image name is required}
VERSION=${2:?image version is required}

if [ ! -f .env ]; then
  echo "Missing runtime .env in $(pwd)" >&2
  exit 1
fi

if ! grep -q '^PBJT_API_BASE_URL=' .env; then
  echo "PBJT_API_BASE_URL is missing from runtime .env" >&2
  exit 1
fi

if [ -f .deployment ]; then
  cp .deployment .previous-deployment
fi

export IMAGE VERSION
docker compose -f compose.yml config --quiet
docker compose -f compose.yml pull
docker compose -f compose.yml up -d --remove-orphans --wait

cat > .deployment <<EOF
IMAGE=$IMAGE
VERSION=$VERSION
EOF
