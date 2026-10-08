#!/usr/bin/env bash
# Tacoma World — cyberdeck setup.
# Raspberry Pi 5 (8 GB recommended), Raspberry Pi OS 64-bit *with desktop*.
#
# Run ONCE, as your normal user, WITH internet:
#
#     cd ~/tacoma-world && bash deck/setup.sh
#
# Afterwards the deck needs no network at all:
#   app        served from this Pi       tacoma-world.service   127.0.0.1:8600
#   AI Wrench  local model               ollama.service         127.0.0.1:11434
#   screen     boots straight into the app, full screen (deck/kiosk.sh)
#
# Safe to re-run. Pick a different model with:  MODEL=qwen2.5:3b bash deck/setup.sh
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-8600}"
CONF_DIR="$HOME/.config/tacoma-world"
CONF="$CONF_DIR/deck.env"

step() { printf '\n\033[1;31m==>\033[0m %s\n' "$*"; }
die()  { printf '\n\033[1;31mSTOP:\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -ne 0 ] || die "Run as your normal user, not with sudo. The script asks for sudo when it needs it."
[[ "$REPO" != *" "* ]] || die "Move the repo to a path without spaces, e.g. ~/tacoma-world"

# --------------------------------------------------------------------------- hardware
step "Checking hardware"
ARCH="$(uname -m)"
[ "$ARCH" = "aarch64" ] || die "Needs a 64-bit OS on a Pi 4 or 5 (found $ARCH). A Pi 2B can't run a local model. Reflash with Raspberry Pi OS (64-bit) and re-run."
MEM_GB="$(awk '/MemTotal/ { printf "%d", $2 / 1024 / 1024 }' /proc/meminfo)"
if [ -z "${MODEL:-}" ]; then
  if [ "$MEM_GB" -ge 7 ]; then MODEL="llama3.2:3b"; else MODEL="llama3.2:1b"; fi
fi
[[ "$MODEL" =~ ^[A-Za-z0-9._:/-]+$ ]] || die "Odd model name: $MODEL"
echo "RAM ${MEM_GB} GB  ->  model ${MODEL}"

curl -fsS --max-time 15 -o /dev/null https://ollama.com || die "No internet. Setup needs it once to download the model; after that the deck runs offline."

# --------------------------------------------------------------------------- packages
step "Installing system packages"
sudo apt-get update -qq
sudo apt-get install -y -qq nodejs curl git
if ! command -v chromium >/dev/null && ! command -v chromium-browser >/dev/null; then
  sudo apt-get install -y -qq chromium || sudo apt-get install -y -qq chromium-browser
fi
node -e 'process.exit(+process.versions.node.split(".")[0] >= 18 ? 0 : 1)' \
  || die "Node $(node -v) is too old; Tacoma World needs 18 or newer."

# --------------------------------------------------------------------------- local model
step "Installing Ollama (the local model server)"
command -v ollama >/dev/null || curl -fsSL https://ollama.com/install.sh | sh

sudo mkdir -p /etc/systemd/system/ollama.service.d
sudo tee /etc/systemd/system/ollama.service.d/tacoma-world.conf >/dev/null <<EOF
# Written by tacoma-world/deck/setup.sh
[Service]
# Only this computer can reach the model.
Environment="OLLAMA_HOST=127.0.0.1:11434"
# The app, running at http://127.0.0.1:${PORT}, may call it from the browser.
Environment="OLLAMA_ORIGINS=http://127.0.0.1:${PORT},http://localhost:${PORT}"
# Keep the model in RAM so answers don't wait on a reload from storage.
Environment="OLLAMA_KEEP_ALIVE=-1"
# Room for the ~1,300-token spec reference plus a short conversation.
Environment="OLLAMA_CONTEXT_LENGTH=4096"
# One conversation at a time keeps the cached reference prompt warm.
Environment="OLLAMA_NUM_PARALLEL=1"
Environment="OLLAMA_MAX_LOADED_MODELS=1"
EOF
sudo systemctl daemon-reload
sudo systemctl enable ollama >/dev/null 2>&1
sudo systemctl restart ollama
for _ in $(seq 1 30); do curl -fs -o /dev/null http://127.0.0.1:11434/api/tags && break; sleep 1; done
curl -fs -o /dev/null http://127.0.0.1:11434/api/tags || die "Ollama didn't start. Check: journalctl -u ollama -n 50"

step "Downloading ${MODEL} (the big download, about 1-2 GB)"
ollama pull "$MODEL"

# --------------------------------------------------------------------------- app server
step "Installing the Tacoma World service"
NODE_BIN="$(command -v node)"
sudo tee /etc/systemd/system/tacoma-world.service >/dev/null <<EOF
# Written by tacoma-world/deck/setup.sh
[Unit]
Description=Tacoma World (served locally for the cyberdeck)
After=network.target

[Service]
User=${USER}
WorkingDirectory=${REPO}
Environment=HOST=127.0.0.1
Environment=PORT=${PORT}
ExecStart=${NODE_BIN} ${REPO}/scripts/serve.js
Restart=always
RestartSec=2

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload
sudo systemctl enable tacoma-world >/dev/null 2>&1
sudo systemctl restart tacoma-world

mkdir -p "$CONF_DIR"
printf 'PORT=%s\nMODEL=%s\n' "$PORT" "$MODEL" > "$CONF"

# --------------------------------------------------------------------------- kiosk
step "Setting the deck to boot straight into the app"
if command -v raspi-config >/dev/null; then
  sudo raspi-config nonint do_wayland W3 || true        # labwc desktop (current default)
  sudo raspi-config nonint do_boot_behaviour B4 || true # desktop, auto-login
  sudo raspi-config nonint do_blanking 1 || true        # never blank the screen
fi
LABWC="$HOME/.config/labwc/autostart"
mkdir -p "$(dirname "$LABWC")"
# A user autostart file replaces the system one, so start from a copy to keep the desktop.
[ -f "$LABWC" ] || cp /etc/xdg/labwc/autostart "$LABWC" 2>/dev/null || touch "$LABWC"
grep -q "deck/kiosk.sh" "$LABWC" || echo "bash \"${REPO}/deck/kiosk.sh\" &" >> "$LABWC"

# --------------------------------------------------------------------------- self-test
step "Self-test"
for _ in $(seq 1 15); do curl -fs -o /dev/null "http://127.0.0.1:${PORT}/" && break; sleep 1; done
curl -fs "http://127.0.0.1:${PORT}/" | grep -q "Tacoma World" \
  || die "App server isn't answering on port ${PORT}. Check: systemctl status tacoma-world"
echo "App server ........ ok   http://127.0.0.1:${PORT}"

curl -fs -D - -o /dev/null -X OPTIONS http://127.0.0.1:11434/v1/chat/completions \
  -H "Origin: http://127.0.0.1:${PORT}" -H "Access-Control-Request-Method: POST" \
  | grep -qi "access-control-allow-origin" \
  || die "The model server is refusing the app's origin. Check OLLAMA_ORIGINS in /etc/systemd/system/ollama.service.d/tacoma-world.conf"
echo "Browser access .... ok"

echo "Asking the model one question (the first load can take a minute)..."
START="$(date +%s)"
REPLY="$(curl -fs --max-time 300 http://127.0.0.1:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"${MODEL}\",\"max_tokens\":12,\"messages\":[{\"role\":\"user\",\"content\":\"Reply with the single word: ready\"}]}" || true)"
[ -n "$REPLY" ] || die "The model didn't answer. Check: journalctl -u ollama -n 50"
echo "Local model ....... ok   $(( $(date +%s) - START ))s"

cat <<EOF

Done. The deck no longer needs the internet.

  1. Reboot:  sudo reboot
  2. It should come up in Tacoma World, full screen. The AI Wrench tab says
     "OFFLINE AI · ${MODEL}". The first answer after boot is the slowest.

Update later (needs internet):  bash ${REPO}/deck/update.sh
Leave kiosk mode:               Alt+F4
EOF
