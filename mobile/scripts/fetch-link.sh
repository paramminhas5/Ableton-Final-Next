#!/usr/bin/env bash
# Fetches Ableton Link for the app:
# - vendor/LinkKit: LinkKit 4.1.3, Ableton's iOS SDK. Free and royalty-free under the
#   Ableton Link SDK licence (vendor/LinkKit/LICENSE.md). Follow the UI guidelines PDF.
# - vendor/link: open-source Link 4.1.1 (GPLv2+) for Android and desktop. Fine for
#   development and unofficial APKs; a Play Store release needs Ableton's proprietary
#   licence (link-devs@ableton.com).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p vendor
if [ ! -d vendor/LinkKit/LinkKit.xcframework ]; then
  tmp="$(mktemp -d)"
  curl -fsSL -o "$tmp/LinkKit.zip" https://github.com/Ableton/LinkKit/releases/download/LinkKit-4.1.3/LinkKit.zip
  mkdir -p vendor/LinkKit
  unzip -q "$tmp/LinkKit.zip" -d vendor/LinkKit
  curl -fsSL -o vendor/LinkKit/LICENSE.md https://raw.githubusercontent.com/Ableton/LinkKit/LinkKit-4.1.3/LICENSE.md
  rm -rf "$tmp"
  echo "LinkKit 4.1.3 in vendor/LinkKit"
fi
if [ ! -f vendor/link/include/ableton/Link.hpp ]; then
  git clone --depth 1 --branch Link-4.1.1 --recurse-submodules --shallow-submodules https://github.com/Ableton/link vendor/link
fi
