#!/usr/bin/env bash
set -euo pipefail

PORT=${1:-8000}
URL="http://127.0.0.1:$PORT/"

echo "🎮  Sprattelgubben på äventyr"
echo "    Startar server på $URL"
echo "    Tryck Ctrl+C för att stoppa."
echo ""

# Öppna webbläsaren efter en kort stund
(sleep 0.8 && open "$URL") &

cd "$(dirname "$0")"
python3 -m http.server "$PORT"
