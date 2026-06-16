#!/usr/bin/env bash

# Builds "finish-em Desktop.app": a macOS bundle whose executable is a native
# Swift/AppKit app. It starts the bundled Bun server (if not already running)
# as a hidden child process and hosts the web UI in a native WKWebView window —
# no terminal window, no Chrome. The TUI's Terminal-based .app
# (build-macos-app.sh) is unaffected.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${REPO_ROOT}/dist"
APP_NAME="finish-em"
APP_DIR="${DIST_DIR}/${APP_NAME}.app"
CONTENTS_DIR="${APP_DIR}/Contents"
MACOS_DIR="${CONTENTS_DIR}/MacOS"
RESOURCES_DIR="${CONTENTS_DIR}/Resources"
SOURCE_DIR="${DIST_DIR}/desktop"
SWIFT_SOURCE="${REPO_ROOT}/desktop/FinishEmApp.swift"
LAUNCHER_NAME="finish-em"
LAUNCHER_PATH="${MACOS_DIR}/${LAUNCHER_NAME}"
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

if [[ ! -x "${SOURCE_DIR}/finish-em" ]]; then
  echo "Missing compiled binary at ${SOURCE_DIR}/finish-em."
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

# Bundle the Bun server binary (renamed to avoid colliding with the Swift
# launcher executable name) and the built web assets.
cp "${SOURCE_DIR}/finish-em" "${RESOURCES_DIR}/finish-em-server"
chmod +x "${RESOURCES_DIR}/finish-em-server"
cp -R "${SOURCE_DIR}/web" "${RESOURCES_DIR}/web"

# Compile the native Swift/AppKit launcher into the bundle's executable.
if [[ ! -f "${SWIFT_SOURCE}" ]]; then
  echo "Missing Swift source at ${SWIFT_SOURCE}."
  exit 1
fi
swiftc -O "${SWIFT_SOURCE}" -o "${LAUNCHER_PATH}"
chmod +x "${LAUNCHER_PATH}"

cat > "${PLIST_PATH}" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>en</string>
  <key>CFBundleExecutable</key>
  <string>${LAUNCHER_NAME}</string>
  <key>CFBundleIconFile</key>
  <string>AppIcon</string>
  <key>CFBundleIdentifier</key>
  <string>com.ryankscott.finish-em</string>
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
  <key>NSAppTransportSecurity</key>
  <dict>
    <key>NSAllowsLocalNetworking</key>
    <true/>
  </dict>
</dict>
</plist>
EOF

# Ad-hoc sign so Gatekeeper runs the locally-built app without a deep prompt.
codesign --force --deep --sign - "${APP_DIR}" >/dev/null 2>&1 || \
  echo "Warning: codesign failed; app may prompt on first launch."

touch "${APP_DIR}"

echo "Built macOS app bundle at ${APP_DIR}"
