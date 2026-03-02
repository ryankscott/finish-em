#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_BINARY="${REPO_ROOT}/dist/finish-em"
BIN_DIR="${HOME}/.local/bin"
TARGET_BINARY="${BIN_DIR}/finish-em"

if [[ ! -x "${SOURCE_BINARY}" ]]; then
  echo "Missing executable at ${SOURCE_BINARY}."
  echo "Build it first: bun run cli:build"
  exit 1
fi

mkdir -p "${BIN_DIR}"
ln -sfn "${SOURCE_BINARY}" "${TARGET_BINARY}"

echo "Installed finish-em symlink:"
echo "  ${TARGET_BINARY} -> ${SOURCE_BINARY}"

case ":${PATH}:" in
  *":${BIN_DIR}:"*) ;;
  *)
    echo
    echo "PATH is missing ${BIN_DIR}."
    echo "Add this to your shell profile:"
    echo "  export PATH=\"${BIN_DIR}:\$PATH\""
    ;;
esac
