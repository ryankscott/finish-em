#!/usr/bin/env bash

set -euo pipefail

TARGET_BINARY="${HOME}/.local/bin/finish-em"

if [[ -L "${TARGET_BINARY}" || -f "${TARGET_BINARY}" ]]; then
  rm -f "${TARGET_BINARY}"
  echo "Removed ${TARGET_BINARY}"
else
  echo "No installed binary at ${TARGET_BINARY}"
fi
