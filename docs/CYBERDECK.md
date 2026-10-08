# Cyberdeck — offline Tacoma World

**Rule:** if you're using the deck, assume there is no Wi-Fi. Everything it needs lives on the
Pi: the app, the spec data, the service log, and the AI model. The phone uses cloud AI; the deck
never does.

```
 Raspberry Pi 5 ──────────────────────────────────────────────────────────┐
 │  Chromium (kiosk) ── http://127.0.0.1:8600 ── tacoma-world.service     │
 │        │                                       (scripts/serve.js)      │
 │        └── AI Wrench ── http://127.0.0.1:11434 ── ollama.service       │
 │                                                  (llama3.2:3b, local)  │
 └─────────────────────────────── nothing leaves the Pi ──────────────────┘
```

## What you need

| | |
|---|---|
| Computer | Raspberry Pi 5, **8 GB** recommended (4 GB works with a smaller, weaker model). A Pi 2B can't run a model. |
| OS | Raspberry Pi OS **64-bit, with desktop** |
| Storage | 32 GB+; the model is ~2 GB. An SSD loads it much faster than an SD card. |
| Cooling | Active cooler. Answering a question runs all four cores flat out. |
| Once only | Internet, for setup |

## First-time setup (needs internet once)

```sh
git clone https://github.com/cleethirtythree/tacoma-world.git ~/tacoma-world
cd ~/tacoma-world
bash deck/setup.sh
sudo reboot
```

Setup installs Node, Chromium and Ollama, downloads the model, makes both servers start at boot
on `127.0.0.1` only, sets desktop auto-login with no screen blanking, adds the kiosk to the
desktop autostart, then tests all of it. Re-running it is safe.

It picks `llama3.2:3b` on 8 GB and `llama3.2:1b` below that. To choose: `MODEL=qwen2.5:3b bash deck/setup.sh`.

## Using it

It boots straight into Tacoma World, full screen. **AI Wrench** shows `OFFLINE AI · <model>`.

- On boot the app loads the model and pre-reads the spec reference. Until the banner clears,
  the first answer is slow.
- Answers stream in word by word. A CPU model is far slower than cloud; expect seconds to
  start and a few words per second (not yet measured on this deck).
- **A small model can be wrong. Confirm any torque value in the Library tab before final
  torque.** The Library is the source of truth; the model is a convenience.
- `Alt+F4` leaves kiosk mode.

## Moving the service log between phone and deck

Each device keeps its own log. There's no sync and no server. Use a file:

1. Phone: ⚙ → **Export log** → Save to Files → copy to a USB stick.
2. Deck: ⚙ → **Import backup** → pick the file.

The other direction works the same way. Imports merge: per task the higher-mileage record wins,
nothing is deleted, and the API key is never included.

## Updating (needs internet)

```sh
bash ~/tacoma-world/deck/update.sh
sudo reboot
```

The service log is in the browser's storage, not the repo folder, so updates never touch it.

## When something's wrong

| Symptom | Check |
|---|---|
| Black screen or browser error at boot | `systemctl status tacoma-world` |
| "Can't reach the offline model" | `systemctl status ollama`, then `journalctl -u ollama -n 50` |
| "…isn't installed" | Needs internet: `ollama pull llama3.2:3b` |
| Answers never finish | Out of memory. Try `MODEL=llama3.2:1b bash deck/setup.sh` |
| Desktop appears but not the app | Kiosk autostart missing: `grep kiosk ~/.config/labwc/autostart` |
| Old version after updating | Reboot again; the app reloads itself once the update takes over |

## Files

| | |
|---|---|
| `deck/setup.sh` | one-time install + self-test |
| `deck/kiosk.sh` | boot launcher (Chromium, kiosk, offline mode) |
| `deck/update.sh` | `git pull` + restart |
| `/etc/systemd/system/tacoma-world.service` | app server |
| `/etc/systemd/system/ollama.service.d/tacoma-world.conf` | model server settings |
| `~/.config/tacoma-world/deck.env` | port and model the kiosk uses |
