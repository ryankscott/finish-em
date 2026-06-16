#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${REPO_ROOT}/dist"
APP_NAME="finish-em"
APP_DIR="${DIST_DIR}/${APP_NAME}.app"
CONTENTS_DIR="${APP_DIR}/Contents"
MACOS_DIR="${CONTENTS_DIR}/MacOS"
RESOURCES_DIR="${CONTENTS_DIR}/Resources"
SOURCE_BINARY="${DIST_DIR}/finish-em"
LAUNCHER_PATH="${MACOS_DIR}/${APP_NAME}"
ICON_SOURCE="${REPO_ROOT}/public/icon.svg"
ICONSET_DIR="${DIST_DIR}/AppIcon.iconset"
ICON_PATH="${RESOURCES_DIR}/AppIcon.icns"
ICON_RENDER_DIR="${DIST_DIR}/icon-render"
ICON_RENDER_SOURCE="${ICON_RENDER_DIR}/icon.png"
PLIST_PATH="${CONTENTS_DIR}/Info.plist"
export PATH="$HOME/.bun/bin:$PATH"
VERSION="$(bun -e "import pkg from './package.json' assert { type: 'json' }; console.log(pkg.version ?? '0.0.0')" 2>/dev/null || echo "0.0.0")"

cd "${REPO_ROOT}"
bun run build

if [[ ! -x "${SOURCE_BINARY}" ]]; then
  echo "Missing compiled binary at ${SOURCE_BINARY}."
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

cp "${SOURCE_BINARY}" "${RESOURCES_DIR}/finish-em-bin"
chmod +x "${RESOURCES_DIR}/finish-em-bin"

cat > "${LAUNCHER_PATH}" <<'EOF'
#!/usr/bin/env bash

set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BINARY_PATH="${APP_DIR}/Resources/finish-em-bin"

if [[ ! -x "${BINARY_PATH}" ]]; then
  osascript -e 'display alert "finish-em" message "The bundled finish-em binary is missing." as critical'
  exit 1
fi

osascript <<APPLESCRIPT
set binaryCommand to quoted form of "${BINARY_PATH}"
set targetTab to missing value

tell application "Terminal"
  activate
  set targetTab to do script binaryCommand
  delay 0.3
  set font size of front window to 18
end tell

repeat
  delay 1
  tell application "Terminal"
    if targetTab is missing value then
      exit repeat
    end if

    if not (exists targetTab) then
      exit repeat
    end if

    try
      if busy of targetTab is false then
        exit repeat
      end if
    on error
      exit repeat
    end try
  end tell
end repeat
APPLESCRIPT
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
  <string>${APP_NAME}</string>
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
</dict>
</plist>
EOF

touch "${APP_DIR}"

echo "Built macOS app bundle at ${APP_DIR}"
