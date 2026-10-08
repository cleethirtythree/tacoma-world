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
  main — this session adds 5 commits on top of e2e0f47, delivered as a patch
  series for Caleb to apply with `git am` and push. Verify with `git log`.
  github.com/cleethirtythree/tacoma-world (public) -> Vercel "tacoma-world"

LIVE URL:
  https://tacoma-world.vercel.app  (auto-deploys on push to main)

CURRENT OBJECTIVE:
  1. Push this series so the live site gets the model fix.
  2. Phase 2 on the iPhone (PHASE_PLAN.md, steps 3-7).
  3. Phase 4 on the Pi 5 (docs/CYBERDECK.md, PHASE_PLAN.md acceptance 1-5).

SOURCE PRECEDENCE:
  unchanged — see REUSE_MATRIX.md. Vehicle facts: the TRD Sport reference.

VERIFIED WORKING BEHAVIOR (2026-10-07, claude.ai sandbox — no browser, no Pi):
  80/80 contract tests pass (npm run check)
  43 UI checks against the compiled bundle in jsdom: baseline logging, export,
    import merge, offline AI streaming against a mock OpenAI-compatible server,
    warm-up, launch params, loopback rejection, missing-model and dead-server
    messages, cloud request shape, auth-error handling
  deck/setup.sh dry-run with stubbed apt/systemctl/sudo and real HTTP mocks:
    completes, idempotent on re-run, kiosk launches the offline URL
  scripts/serve.js returns 404 for /.git, /.env and encoded traversal
  shellcheck clean on deck/*.sh

NOT VERIFIED — needs hardware:
  - any real Claude API call (no network to Anthropic from the sandbox)
  - iPhone install, share-sheet export, file-picker import
  - Raspberry Pi: Ollama install, real model output, speed, kiosk autostart,
    raspi-config codes (do_wayland W3, do_boot_behaviour B4, do_blanking 1)

FILES CHANGED:
  src/app.jsx, assets/js/app.js (generated), service-worker.js (v1 -> v5),
  index.html, scripts/serve.js, deck/{setup,kiosk,update}.sh,
  tests/{extract,ai-contract,backup-contract,deck-contract}.test.js + run.js,
  tests/vehicle-contract.test.js (freshness markers), README, CLAUDE.md,
  AGENTS.md, docs/{CYBERDECK,PRODUCT_CONTRACT,ARCHITECTURE,PHASE_PLAN,HANDOFF}.md

SECURITY / DATA INVARIANTS:
  - service worker caches ONLY the public shell; never any API
  - no API key in the repo (test-enforced); the backup file never contains it
  - production CSP unchanged: connect-src 'self' https://api.anthropic.com
  - offline AI is loopback-only, in code (isLoopbackEndpoint) and on the Pi
    (OLLAMA_HOST=127.0.0.1, app server HOST=127.0.0.1)
  - no server-side code, no account, no sync, no telemetry
  - nothing encrypted at rest; the contract says so

KNOWN LIMITATIONS:
  1. Phone and deck logs are separate; export/import by hand is the only bridge.
  2. Offline model quality/speed unmeasured; UI says to confirm torque values.
  3. Accessibility unaudited (unchanged).
  4. Cloud chat does not stream.
  5. React updates are manual (unchanged).
  6. GitHub repo is public; flip to private in GitHub settings if intended.

NEXT EXACT ACTION:
  Caleb: apply the patch, `npm run check`, push. Then iPhone Phase 2.

DO NOT CHANGE:
  - assets/js/app.js by hand — generated from src/app.jsx
  - localStorage keys taco-mi / taco-log / taco-apikey — existing data
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

### 2026-10-07 — Claude (Code, desktop) — applied and pushed the 2026-10-07 patch series

Caleb explicitly set aside AI_WORKFLOW.md §2/§4 rule 8 and the CLAUDE.md push restriction for
this session. Recorded here per rule 11.

- Applied `tacoma-world-2026-10-07.patch` with `git am` (5 commits, clean). `npm run check`:
  80 passed, 0 failed; the rebuild left `assets/js/app.js` unchanged.
- The patch's edit to `tests/vehicle-contract.test.js` only adds bundle-freshness markers;
  no spec guard was weakened.
- First push failed: this Mac had no git credential. Claude did not handle the token. Caleb
  set `credential.helper osxkeychain` and pushed from his own Terminal. `origin/main` = `cf7a13c`.

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
