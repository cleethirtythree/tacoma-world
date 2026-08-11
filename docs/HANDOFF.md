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
  (VIN 3TMCZ5AN4KM264896)

REPOSITORY / BRANCH / HEAD:
  Not yet initialized. No commits exist.
  Intended: ~/Desktop/Projects/tacoma-world  ->  GitHub  ->  Vercel

CANONICAL TARGET DIRECTORY:
  the repository root (this directory)

CURRENT OBJECTIVE:
  Phase 2 — get it deployed and confirm the install on the physical iPhone.
  Phase 1 is complete and verified locally.

SOURCE PRECEDENCE:
  taco-world.html                       primary implementation + visual identity
  "TRD Sport DIY Maintenance & Torque Reference"   vehicle facts, overrides everything
  2019_Tacoma_TRD_Pro_*.md              SUPERSEDED, wrong trim, do not use
  docs/AI_APP_BUILD_SOP.md              process and repo structure
  (full table: docs/REUSE_MATRIX.md)

VERIFIED WORKING BEHAVIOR:
  48/48 contract tests pass
  12/13 browser workflows pass at 390px and 1440x900 (the 13th was a wrong test
    expectation, since corrected — see KNOWN LIMITATIONS)
  Offline reload renders fully with the network disabled, user data intact
  No CDN in the critical path; React vendored
  No API key anywhere in the repo
  Mutation-tested: reintroducing the Pro rear-diff volume, the 4-cylinder spark
    plug PN, or a CDN script tag each fail the suite

FILES CHANGED:
  Everything. This is the initial import — no prior commits.
  Adapted from taco-world.html: src/app.jsx (spec corrections + iOS viewport fix)
  New: service worker, manifest, icons, build/serve scripts, 48 tests, all docs
  Vendored: react.min.js, react-dom.min.js (18.3.1, MIT)

TESTS PASSED:
  48 automated (21 PWA contract, 18 vehicle contract, 9 schedule contract)
  Browser: first run, mileage entry, mark done, reload persistence, search,
    missing-key handling, offline reload, desktop, mobile overflow, keyboard,
    console cleanliness

SECURITY / DATA INVARIANTS:
  - service worker caches ONLY the fixed public shell; never the Anthropic API
  - no API key in the repo (test-enforced against any sk-ant- string)
  - the key lives in the user's own browser localStorage, sent only to Anthropic
  - no server, no account, no sync, no telemetry, no analytics
  - nothing is encrypted at rest; the product contract says so plainly
  - CSP connect-src allows exactly 'self' and https://api.anthropic.com

KNOWN LIMITATIONS:
  1. NOT YET DEPLOYED. No live URL. iPhone install is UNTESTED on hardware.
  2. Service log has no backup/export — clearing site data loses it.
  3. Schedule tab reads "No record" for every task until it is marked done once,
     so a fresh install flags nothing overdue even though plugs are ~8,000 mi
     past due. Pinned by schedule-contract.test.js. Product decision, Phase 3.
  4. Accessibility unaudited; dark theme likely fails WCAG AA contrast.
  5. Model ID claude-sonnet-4-20250514 is hardcoded and may be superseded.
  6. React updates are manual.

DEFERRED FEATURES:
  export/import, accounts, sync, photos, multi-vehicle, offline AI,
  first-run baseline capture, streaming chat.  See docs/PHASE_PLAN.md.

UNCOMMITTED OR UNPUSHED WORK:
  ALL of it. Nothing has been committed. Claude cannot commit or push
  (see AI_WORKFLOW.md §2) — Codex or Caleb must make the first commit.

BLOCKERS:
  None technical. Needs a human to: create the GitHub repo, make the first
  commit, and connect Vercel.

NEXT EXACT ACTION:
  cd ~/Desktop/Projects/tacoma-world
  git init && git add . && git commit -m "Initial import: Tacoma World PWA"
  gh repo create tacoma-world --private --source=. --push
  Then connect the repo at vercel.com/new (preset Other, no build command).

DO NOT CHANGE:
  - assets/js/app.js by hand — it is generated from src/app.jsx
  - the localStorage keys taco-mi / taco-log / taco-apikey — existing users' data
  - tests/vehicle-contract.test.js guards — a failure means the DATA is wrong
  - ~/Desktop/Tacoma/Hub Pages/taco-world.html — the untouched reference
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
