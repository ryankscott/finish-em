#!/usr/bin/env bash

# Builds "finish-em Desktop.app": a macOS bundle whose launcher starts the
# bundled Bun server (if not already running) and opens the web UI in a
# chromeless browser app window (Chrome/Edge --app=), falling back to the
# default browser. The TUI's Terminal-based .app (build-macos-app.sh) is
# unaffected.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${REPO_ROOT}/dist"
APP_NAME="finish-em Desktop"
APP_DIR="${DIST_DIR}/${APP_NAME}.app"
CONTENTS_DIR="${APP_DIR}/Contents"
MACOS_DIR="${CONTENTS_DIR}/MacOS"
RESOURCES_DIR="${CONTENTS_DIR}/Resources"
SOURCE_DIR="${DIST_DIR}/desktop"
LAUNCHER_PATH="${MACOS_DIR}/finish-em-desktop-launcher"
ICON_SOURCE="${REPO_ROOT}/public/icon.svg"
ICONSET_DIR="${DIST_DIR}/AppIcon.iconset"
ICON_PATH="${RESOURCES_DIR}/AppIcon.icns"
ICON_RENDER_DIR="${DIST_DIR}/icon-render"
ICON_RENDER_SOURCE="${ICON_RENDER_DIR}/icon.png"
PLIST_PATH="${CONTENTS_DIR}/Info.plist"
export PATH="$HOME/.bun/bin:$PATH"
VERSION="$(bun -e "import pkg from './package.json' assert { type: 'json' }; console.log(pkg.version ?? '0.0.0')" 2>/dev/null || echo "0.0.0")"

cd "${REPO_ROOT}"
bash scripts/build-desktop-binary.sh

if [[ ! -x "${SOURCE_DIR}/finish-em-desktop" ]]; then
  echo "Missing compiled binary at ${SOURCE_DIR}/finish-em-desktop."
  exit 1
fi

rm -rf "${APP_DIR}" "${ICONSET_DIR}" "${ICON_RENDER_DIR}"
mkdir -p "${MACOS_DIR}" "${RESOURCES_DIR}" "${ICONSET_DIR}" "${ICON_RENDER_DIR}"

if [[ -f "${ICON_SOURCE}" ]] && command -v qlmanage >/dev/null 2>&1 && command -v sips >/dev/null 2>&1 && command -v iconutil >/dev/null 2>&1; then
  qlmanage -t -s 1024 -o "${ICON_RENDER_DIR}" "${ICON_SOURCE}" >/dev/null 2>&1
  mv "${ICON_RENDER_DIR}/$(basename "${ICON_SOURCE}").png" "${ICON_RENDER_SOURCE}"
  for size in 16 32 128 256 512; do
    sips -z "${size}" "${size}" "${ICON_RENDER_SOURCE}" --out "${ICONSET_DIR}/icon_${size}x${size}.png" >/dev/null
    retina_size=$((size * 2))
    sips -z "${retina_size}" "${retina_size}" "${ICON_RENDER_SOURCE}" --out "${ICONSET_DIR}/icon_${size}x${size}@2x.png" >/dev/null
  done
  iconutil -c icns "${ICONSET_DIR}" -o "${ICON_PATH}"
  rm -rf "${ICONSET_DIR}" "${ICON_RENDER_DIR}"
else
  echo "Skipping icon generation; missing ${ICON_SOURCE}, sips, or iconutil."
fi

cp "${SOURCE_DIR}/finish-em-desktop" "${RESOURCES_DIR}/finish-em-desktop"
chmod +x "${RESOURCES_DIR}/finish-em-desktop"
cp -R "${SOURCE_DIR}/web" "${RESOURCES_DIR}/web"

cat > "${LAUNCHER_PATH}" <<'EOF'
#!/usr/bin/env bash

set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BINARY_PATH="${APP_DIR}/Resources/finish-em-desktop"
PORT="${FINISH_EM_PORT:-5717}"
URL="http://127.0.0.1:${PORT}"
LOG_FILE="${HOME}/.finish-em/desktop-server.log"

mkdir -p "${HOME}/.finish-em"

server_up() {
  curl -s -o /dev/null --max-time 1 "${URL}/api/settings"
}

if ! server_up; then
  PORT="${PORT}" nohup "${BINARY_PATH}" >> "${LOG_FILE}" 2>&1 &
  for _ in $(seq 1 50); do
    if server_up; then break; fi
    sleep 0.1
  done
fi

if ! server_up; then
  osascript -e 'display alert "finish-em" message "The finish-em server failed to start. See ~/.finish-em/desktop-server.log" as critical'
  exit 1
fi

for browser in \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" \
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"; do
  if [[ -x "${browser}" ]]; then
    exec "${browser}" --app="${URL}" --user-data-dir="${HOME}/.finish-em/app-window-profile"
  fi
done

exec open "${URL}"
EOF
chmod +x "${LAUNCHER_PATH}"

cat > "${PLIST_PATH}" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>en</string>
  <key>CFBundleExecutable</key>
  <string>finish-em-desktop-launcher</string>
  <key>CFBundleIconFile</key>
  <string>AppIcon</string>
  <key>CFBundleIdentifier</key>
  <string>com.ryankscott.finish-em-desktop</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>${APP_NAME}</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>${VERSION}</string>
  <key>CFBundleVersion</key>
  <string>${VERSION}</string>
  <key>LSMinimumSystemVersion</key>
  <string>13.0</string>
  <key>NSHighResolutionCapable</key>
  <true/>
</dict>
</plist>
EOF

touch "${APP_DIR}"

echo "Built macOS app bundle at ${APP_DIR}"
