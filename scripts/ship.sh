#!/usr/bin/env bash
# Ship main to production: checks, push, remote migrations, Worker deploy, and
# a fresh macOS app installed in /Applications and relaunched.
#
#   bun run ship
#
# Run from main with a clean tree. Every step stops the script on failure, so a
# failing test never reaches production.
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$HOME/.bun/bin:$PATH"

APP_NAME="finish-em"
BUILT_APP="dist/${APP_NAME}.app"
INSTALLED_APP="/Applications/${APP_NAME}.app"

step() { printf '\n==> %s\n' "$1"; }

# Wrangler's OAuth token expires and is only refreshed by some calls, so the
# first D1 query after a quiet spell can fail with 7403 "account is not valid".
# Retry once after a whoami, which refreshes it.
with_retry() {
  if ! "$@"; then
    echo "Retrying after refreshing the Cloudflare login..." >&2
    bunx wrangler whoami >/dev/null 2>&1 || true
    sleep 2
    "$@"
  fi
}

step "Checking branch and working tree"
branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$branch" != "main" ]; then
  echo "On '$branch'. Merge into main first." >&2
  exit 1
fi
if [ -n "$(git status --porcelain)" ]; then
  echo "Uncommitted changes. Commit or stash them first." >&2
  git status --short >&2
  exit 1
fi
git pull --ff-only origin main

step "Tests and lint"
bun test
bun run check

step "Pushing main"
git push origin main

step "Checking the Cloudflare login"
if ! bunx wrangler whoami 2>&1 | grep -q "You are logged in"; then
  echo "Not logged in to Cloudflare. Run: bunx wrangler login" >&2
  exit 1
fi

step "Applying D1 migrations (remote)"
with_retry bunx wrangler d1 migrations apply finish-em --remote

step "Deploying the Worker"
with_retry bun run worker:deploy

step "Building the macOS app"
bun run desktop:app
remote_url="$(/usr/libexec/PlistBuddy -c 'Print :FinishEmRemoteURL' "${BUILT_APP}/Contents/Info.plist" 2>/dev/null || true)"
echo "App targets: ${remote_url:-local server}"

step "Installing to ${INSTALLED_APP}"
osascript -e "tell application \"${APP_NAME}\" to quit" >/dev/null 2>&1 || true
for _ in 1 2 3 4 5 6 7 8 9 10; do
  pgrep -f "${INSTALLED_APP}/Contents/MacOS/" >/dev/null || break
  sleep 0.5
done
rm -rf "${INSTALLED_APP}"
ditto "${BUILT_APP}" "${INSTALLED_APP}"
open "${INSTALLED_APP}"

step "Shipped $(git rev-parse --short HEAD)"
