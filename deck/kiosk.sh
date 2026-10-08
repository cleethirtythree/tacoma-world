#!/usr/bin/env bash
# Opens Tacoma World full screen with offline AI. Started at login by the desktop
# autostart that deck/setup.sh installs. Needs no network.
CONF="$HOME/.config/tacoma-world/deck.env"
# shellcheck source=/dev/null
[ -f "$CONF" ] && . "$CONF"
PORT="${PORT:-8600}"
MODEL="${MODEL:-llama3.2:3b}"
URL="http://127.0.0.1:${PORT}/?ai=local&endpoint=http://127.0.0.1:11434&model=${MODEL}"

# Wait for the local app server; it starts with the system, usually within seconds.
for _ in $(seq 1 60); do
  curl -fs -o /dev/null "http://127.0.0.1:${PORT}/" && break
  sleep 1
done

BROWSER="$(command -v chromium || command -v chromium-browser || true)"
[ -n "$BROWSER" ] || { echo "Chromium not found. Re-run deck/setup.sh." >&2; exit 1; }

exec "$BROWSER" --kiosk --noerrdialogs --disable-infobars --disable-session-crashed-bubble \
  --no-first-run --password-store=basic --check-for-update-interval=31536000 "$URL"
