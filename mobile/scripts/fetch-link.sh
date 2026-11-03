#!/usr/bin/env bash
# Fetches Ableton Link 4.1.1 (with its bundled asio) into mobile/vendor/link.
# Link is GPLv2+ or a commercial licence from Ableton (link-devs@ableton.com).
# A closed App Store / Play Store release needs the commercial licence.
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -f vendor/link/include/ableton/Link.hpp ]; then echo "link already in vendor/link"; exit 0; fi
git clone --depth 1 --branch Link-4.1.1 --recurse-submodules --shallow-submodules https://github.com/Ableton/link vendor/link
