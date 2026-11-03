#!/usr/bin/env bash
# Builds the engine for the web and drops it where the Next app serves it.
# Usage: engine-wasm/build.sh
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
out="$here/../artifacts/ccd-school/public/engine"
cd "$here"
RUSTFLAGS="-C target-feature=+simd128,+bulk-memory,+nontrapping-fptoint" \
  cargo build --release --target wasm32-unknown-unknown
mkdir -p "$out"
cp target/wasm32-unknown-unknown/release/ccd_engine_wasm.wasm "$out/ccd_engine.wasm"
ls -l "$out/ccd_engine.wasm"
