#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/out"
DOCS_DIR="$ROOT_DIR/docs"

cd "$ROOT_DIR"

echo "[deploy-docs] Build Next.js project"
npm run build

echo "[deploy-docs] Export static site"
npm run export

echo "[deploy-docs] Refresh docs directory"
mkdir -p "$DOCS_DIR"
find "$DOCS_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
cp -R "$OUT_DIR"/. "$DOCS_DIR"/

echo "[deploy-docs] Ensure .nojekyll exists"
touch "$DOCS_DIR/.nojekyll"

echo "[deploy-docs] Done. docs/ has been updated from out/."
