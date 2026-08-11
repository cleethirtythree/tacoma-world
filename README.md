# Tacoma World

An offline-capable Progressive Web App for maintaining one specific truck: a **2019 Toyota
Tacoma TRD Sport**, VIN `3TMCZ5AN4KM264896`.

Maintenance schedule, torque specs, part numbers, tools, tips, and an AI mechanic — installable
to an iPhone home screen and usable in a parking lot with no signal.

It is a **PWA**, not a native iOS app.

---

## Run it locally

```sh
npm install
npm run build     # src/app.jsx -> assets/js/app.js
npm run serve     # http://localhost:8600
```

Use `npm run serve`, not `file://` — service workers require a secure context, so opening the
HTML directly will not register one and offline behavior cannot be tested.

## Test it

```sh
npm test          # 48 contract tests, no packages required
npm run check     # build + test — run this before every commit
```

## Deploy

Push to GitHub. Vercel deploys automatically. Settings: framework preset **Other**, root
directory **/**, no build command — the compiled bundle is committed, so there is nothing to build.

**After changing any shell file, bump `SHELL_VERSION` in `service-worker.js`.** Otherwise
installed phones keep serving the old build from cache and the deploy appears to do nothing.

## Install on an iPhone

Open the deployed URL in **Safari** → Share → **Add to Home Screen**.

Then tap **⚙** and paste an Anthropic API key from console.anthropic.com to enable AI chat. The
key is stored on that device only and is sent nowhere except Anthropic.

## What works without a signal

Everything except AI chat and the YouTube links: all torque specs, part numbers, tools, tips,
search, mileage entry, and the service log.

## What you should know before relying on it

- **The service log has no backup.** Clearing Safari website data erases it. See
  `docs/PHASE_PLAN.md` Phase 3.
- **Nothing is encrypted.** It stores an odometer reading and a maintenance log on your device.
- **The Schedule tab shows "No record" until a task is marked done once** — it knows each
  interval but not when the work last happened, so a fresh install flags nothing as overdue.
- **Accessibility is unaudited.** The dark theme likely fails WCAG AA contrast in places.

## Layout

```
src/app.jsx              ← edit this. All app logic and vehicle data.
assets/js/app.js         ← generated. Do not edit.
service-worker.js        ← offline shell cache. Bump SHELL_VERSION on change.
tests/                   ← 48 contract tests, dependency-free
docs/                    ← product contract, reuse matrix, architecture, phases, handoff
```

## Working on this with AI

This repo is set up so Claude and Codex can both work on it without stepping on each other.

- **`AI_WORKFLOW.md`** — how that works and the rules both follow
- **`AGENTS.md`** — Codex entry point
- **`CLAUDE.md`** — Claude entry point
- **`docs/HANDOFF.md`** — what the last session did and what is next

Start any AI session with: *"Read AI_WORKFLOW.md and docs/HANDOFF.md, then <task>."*

## The vehicle specs are load-bearing

`tests/vehicle-contract.test.js` blocks three regressions that would cause real harm: a
rear-differential overfill, ordering the wrong spark plug, and ordering shocks this truck does
not have. An earlier knowledge base described this truck as a TRD Pro; it is a TRD Sport, and
several Pro figures are wrong for it.

If one of those tests fails, the data is wrong — not the test. Read `docs/PRODUCT_CONTRACT.md`.
