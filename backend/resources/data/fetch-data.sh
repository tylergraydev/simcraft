#!/bin/bash
# Downloads all game data files listed in Raidbots metadata.json
# Usage: ./fetch-data.sh [output_dir]

set -e

BASE_URL="https://www.raidbots.com/static/data/live"
OUT_DIR="${1:-.}"

mkdir -p "$OUT_DIR"

echo "Fetching metadata..."
curl -sL "$BASE_URL/metadata.json" -o "$OUT_DIR/metadata.json"

echo "Downloading data files..."
for file in $(sed -n 's/.*"\([^"]*\.\(json\|txt\|lua\)\)".*/\1/p' "$OUT_DIR/metadata.json"); do
    echo "  $file"
    curl -sL "$BASE_URL/$file" -o "$OUT_DIR/$file"
done

# Copy season-config.json (manually maintained, not on Raidbots)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SEASON_CONFIG="$SCRIPT_DIR/../../core/season-config.json"
if [ -f "$SEASON_CONFIG" ]; then
    cp "$SEASON_CONFIG" "$OUT_DIR/season-config.json"
    echo "Copied season-config.json"
fi

echo "Done."
