#!/usr/bin/env bash
# scripts/optimize-assets.sh
# Small helper script to optimize glTF/glb files locally.
# Requires: gltfpack (https://github.com/zeux/meshoptimizer/tree/master/gltfpack)
# Optional: basisu (for KTX2/Basis) or the KTX-Software tools for KTX2 conversion.

set -euo pipefail

ASSETS_DIR="public/assets"
OUT_DIR="public/optimized-assets"
mkdir -p "$OUT_DIR"

find "$ASSETS_DIR" -type f \( -iname "*.gltf" -o -iname "*.glb" \) | while read -r f; do
  base=$(basename "$f")
  out="$OUT_DIR/$base"
  echo "Optimizing $f -> $out"
  # Example gltfpack command: reduce file size while keeping reasonable quality
  # -cc (compress textures), -o output file
  if command -v gltfpack >/dev/null 2>&1; then
    gltfpack -i "$f" -o "$out" -cc -ct -om 0
  else
    echo "gltfpack not found; copying without changes"
    cp "$f" "$out"
  fi
done

echo "Optimized assets written to $OUT_DIR"
