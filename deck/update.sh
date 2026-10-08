#!/usr/bin/env bash
# Pull the latest Tacoma World onto the deck. Needs internet.
# The service log lives in the browser's storage, not in this folder, so updating never touches it.
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO"
git pull --ff-only
sudo systemctl restart tacoma-world
echo "Updated to: $(git log -1 --format='%h %s')"
echo "Reboot (sudo reboot) to load it. The app reloads itself once when the new version takes over."
