#!/usr/bin/env bash

# Builds the desktop server binary (HTTP API + embedded web UI assets).
# Output: dist/desktop/finish-em-desktop with dist/desktop/web/ alongside,
# which the server discovers via path.dirname(process.execPath).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${REPO_ROOT}/dist/desktop"
export PATH="$HOME/.bun/bin:$PATH"

cd "${REPO_ROOT}"

bun run web:build

rm -rf "${OUT_DIR}"
mkdir -p "${OUT_DIR}"

bun build --compile src/server/http/main.ts --outfile "${OUT_DIR}/finish-em"
cp -R "${REPO_ROOT}/dist/web" "${OUT_DIR}/web"

echo "Built desktop server binary at ${OUT_DIR}/finish-em"
