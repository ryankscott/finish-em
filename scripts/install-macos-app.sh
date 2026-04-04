#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_SOURCE="${REPO_ROOT}/dist/finish-em.app"
INSTALL_ROOT="${1:-${HOME}/Applications}"
APP_TARGET="${INSTALL_ROOT}/finish-em.app"

if [[ ! -d "${APP_SOURCE}" ]]; then
  echo "Missing app bundle at ${APP_SOURCE}."
  echo "Build it first: bun run app:build"
  exit 1
fi

mkdir -p "${INSTALL_ROOT}"
rm -rf "${APP_TARGET}"
cp -R "${APP_SOURCE}" "${APP_TARGET}"
touch "${INSTALL_ROOT}"

echo "Installed finish-em.app to ${APP_TARGET}"
echo "Launch it from Finder, Spotlight, or Launchpad after indexing updates."
