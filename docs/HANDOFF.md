# Handoff — Tacoma World

> **The outgoing AI updates this file before handing over. The incoming AI verifies it against
> the repository before trusting it.** If this file and `git log` disagree, the repository is right.
>
> SOP §17.

---

## Current continuation block

```text
PROJECT:
  Tacoma World — offline-capable PWA for a 2019 Toyota Tacoma TRD Sport
  (VIN 3TMCZ5AN4KM264896). Two devices: iPhone (cloud AI) and a Raspberry Pi 5
  cyberdeck (local AI, assumes no Wi-Fi).

REPOSITORY / BRANCH / HEAD:
  main. The 2026-10-07 patch series is pushed (origin/main b965663 before this
  session's voice work). The voice feature is written to the working copy,
  ready to commit. Verify with `git log` and `git status`.
  github.com/cleethirtythree/tacoma-world (public) -> Vercel "tacoma-world"

LIVE URL:
  https://tacoma-world.vercel.app  (auto-deploys on push to main)

CURRENT OBJECTIVE:
  1. Commit + push the voice feature; try it on the iPhone (device voice first,
     then ElevenLabs with a real key).
  2. Phase 2 on the iPhone (PHASE_PLAN.md, steps 3-7).
  3. Phase 4 on the Pi 5 (docs/CYBERDECK.md, PHASE_PLAN.md acceptance 1-5).

SOURCE PRECEDENCE:
  unchanged — see REUSE_MATRIX.md. Vehicle facts: the TRD Sport reference.

VERIFIED WORKING BEHAVIOR (2026-10-07, Claude Code on Caleb's Mac, Chromium preview):
  97/97 contract tests pass (npm run check), 17 of them new in voice-contract
  Voice, with Anthropic and ElevenLabs responses stubbed in the page:
    toggle on -> answer auto-read by device voice, units spoken as words,
    markdown/URLs dropped; STOP shown while reading, cleared after
    ElevenLabs path: one request to api.elevenlabs.io with only {text, model_id}
    and the xi-api-key header; audio played from a blob; device voice silent
    ElevenLabs 401 -> clear message + device voice reads instead
    layout checked at 375px; no console errors
  Offline: server stopped (curl refused), app reloaded from shell-v6 cache
  From the claude.ai session (earlier 2026-10-07): 43 jsdom UI checks, deck
    dry-run, serve.js dotfile 404s, shellcheck clean

NOT VERIFIED — needs hardware or real keys:
  - any real ElevenLabs call (no key used); real Claude call on the live site
  - iOS audio unlock: answers arrive seconds after the Send tap; the app
    "unlocks" audio on the tap (silent clip + silent utterance). If iPhone still
    blocks it, the message says to tap ▶ READ, which always works.
  - iPhone: audio stops when the screen locks or the app is backgrounded
  - iPhone install, share-sheet export, file-picker import
  - Raspberry Pi: Ollama, real model output, speed, kiosk autostart,
    device voice on Pi OS (needs a speech engine such as speech-dispatcher)

FILES CHANGED (voice session):
  src/app.jsx, assets/js/app.js (generated), service-worker.js (v5 -> v6),
  vercel.json (CSP), tests/voice-contract.test.js (new), tests/run.js,
  tests/pwa-contract.test.js (CSP check now exact),
  docs/{PRODUCT_CONTRACT (v1.2),ARCHITECTURE,HANDOFF}.md

SECURITY / DATA INVARIANTS:
  - service worker caches ONLY the public shell; never any API
  - no API key in the repo (test-enforced: sk-ant- and ElevenLabs sk_ keys);
    the backup file never contains either key or voice settings
  - production CSP: connect-src exactly 'self' https://api.anthropic.com
    https://api.elevenlabs.io; media-src 'self' blob: (test checks exact set)
  - ElevenLabs is opt-in; it receives only the text of an answer being read,
    never the question, history or system prompt (test-enforced)
  - offline AI is loopback-only, in code (isLoopbackEndpoint) and on the Pi
  - no server-side code, no account, no sync, no telemetry
  - nothing encrypted at rest; the contract says so

KNOWN LIMITATIONS:
  1. Phone and deck logs are separate; export/import by hand is the only bridge.
  2. Offline model quality/speed unmeasured; UI says to confirm torque values.
  3. Accessibility unaudited (unchanged).
  4. Cloud chat does not stream, so reading starts only once the whole answer arrives.
  5. Voice is read-aloud only; asking is still typed or via the keyboard dictation mic.
  6. ⚙ text says "Get a free key" for Anthropic; usage needs paid credit.
  7. React updates are manual (unchanged).
  8. GitHub repo is public; flip to private in GitHub settings if intended.

NEXT EXACT ACTION:
  Commit and push the voice work. On iPhone: AI Wrench -> 🔈 VOICE OFF to turn
  it on -> ask a question -> confirm it's read aloud. Then ⚙ -> Voice ->
  ElevenLabs, paste a key, ▶ TEST VOICE.

DO NOT CHANGE:
  - assets/js/app.js by hand — generated from src/app.jsx
  - localStorage keys taco-mi / taco-log / taco-apikey / taco-voice* /
    taco-elevenlabs-* — existing data
  - tests/vehicle-contract.test.js guards — a failure means the DATA is wrong
  - tests/ai-contract.test.js RETIRED_MODELS — add to it, never remove
```

---

## Reference implementations confirmed unchanged

Verified 2026-08-11. None of these were modified while building this repo:

- `~/Desktop/Tacoma/Hub Pages/taco-world.html` — the primary reference
- `~/Desktop/Tacoma/Hub Pages/tacoma-maintenance-hub.jsx`
- `~/Desktop/Tacoma/Maintenance Reference/` — the vehicle-facts source
- `~/Desktop/Tacoma/App - Tacoma Copilot/` — the sibling Pi product

---

## Session log

Newest first. One short entry per session. If an entry needs more than a few lines, it belongs
in a doc, not here.

### 2026-10-07 — Claude (Code, desktop) — AI Wrench reads answers aloud

- Added 🔊 talk-back: device voice by default (free, offline, works on the deck), ElevenLabs
  opt-in in ⚙ → Voice. Caleb explicitly approved answer text going to ElevenLabs while that
  voice is chosen; recorded as PRODUCT_CONTRACT v1.2.
- Any ElevenLabs failure (no signal, bad key, quota) falls back to the device voice with a
  one-line reason. ▶ READ on each answer replays it.
- CSP widened to api.elevenlabs.io + media-src blob:; the CSP test now checks the exact host
  list. SHELL_VERSION v6. 97/97 tests; browser-verified with stubbed APIs; offline reload
  verified with the server stopped. Not tried on an iPhone or with a real ElevenLabs key.

### 2026-10-07 — Claude (Code, desktop) — applied and pushed the 2026-10-07 patch series

Caleb explicitly set aside AI_WORKFLOW.md §2/§4 rule 8 and the CLAUDE.md push restriction for
this session. Recorded here per rule 11.

- Applied `tacoma-world-2026-10-07.patch` with `git am` (5 commits, clean). `npm run check`:
  80 passed, 0 failed; the rebuild left `assets/js/app.js` unchanged.
- The patch's edit to `tests/vehicle-contract.test.js` only adds bundle-freshness markers;
  no spec guard was weakened.
- First push failed: this Mac had no git credential. Claude did not handle the token. Caleb
  set `credential.helper osxkeychain` and pushed from the Terminal. `origin/main` = `cf7a13c`.

### 2026-10-07 — Claude (claude.ai chat) — model fix, backup, cyberdeck offline mode

Worked in a sandbox clone; no commit or push to GitHub (AI_WORKFLOW rule 8 respected —
delivered as a `git format-patch` series for Caleb to review and apply).

- Found the live AI Wrench had never worked: `claude-sonnet-4-20250514` was retired 2026-06-15,
  before the first deploy. No test sent a message. Fixed (`CLOUD_MODEL`), and retired IDs now
  fail the build.
- Caleb set the device rule: phone = Wi-Fi/cloud; deck = assume no Wi-Fi. Built the deck as this
  same app served locally plus a local model (Ollama), not as a route to `tacoma-copilot`.
  Contract change recorded in PRODUCT_CONTRACT v1.1 (rule 11).
- Pulled export/import and baseline capture forward from Phase 3, since two devices now keep
  separate logs.
- Verified in jsdom and with stubbed dry-runs; nothing has run on an iPhone or a Pi yet.

### 2026-08-11 — Claude (Cowork) — Phase 2 deploy

Caleb explicitly asked Claude to disregard AI_WORKFLOW.md §2/§4 rule 8 ("Claude does not
commit, push, or deploy") for this session. Recorded here per rule 11 (record intentional
SOP deviations rather than silently diverging).

- `git init`, committed, and pushed to a new GitHub repo Caleb created
  (github.com/cleethirtythree/tacoma-world). Excluded `.claude/settings.local.json` from the
  commit (local machine config, not project code) and added it to .gitignore.
- First Vercel deploy failed: Vercel ran `npm run build` (package.json has a build script) and
  then expected output in `public/`, which doesn't exist — this is a static site served from
  the repo root. Fixed by adding `"outputDirectory": "."` to vercel.json and pushed again.
- Verified the live deployment directly, not just "it built": confirmed CSP/HSTS/X-Frame-Options
  headers present via curl, confirmed the service worker registers on the real origin, and
  confirmed the full shell is present in Cache Storage (`tacoma-world-public-shell-v1`) against
  `https://tacoma-world.vercel.app`, not localhost.
- Noted the GitHub repo came out public, not private as intended — no secrets in the repo
  (test-enforced) so not a security issue, but Caleb may want to flip it private in GitHub
  Settings.
- Did not touch the iPhone install — that needs physical hardware.

### 2026-08-11 — Claude (Cowork) — Phase 1 build

Adapted `taco-world.html` into this repo. Route A (platform adaptation) per SOP §6 — the
product was not rewritten.

- Replaced CDN React + in-browser Babel with vendored React and an ahead-of-time build. This
  is what made the offline contract achievable; the original showed a blank screen with no signal.
- Carried the TRD Sport spec corrections into the task data and the AI system prompt, and
  locked each one behind a regression test.
- Added service worker, manifest, icons, iOS safe-area handling, CSP and security headers.
- Wrote the SOP-required docs so the next session does not reconstruct decisions from chat.
- Found and documented the "no baseline, no tracking" gap during browser verification. Not
  fixed — out of Phase 1 scope, and changing it is a product decision.

Not deployed. Nothing committed. Claude has no push access by design.
