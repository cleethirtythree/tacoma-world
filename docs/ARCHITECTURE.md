# Architecture — Tacoma World

**Version:** 1.1 · **Last updated:** 2026-10-07 · SOP §10

## Shape

```
    index.html                 shell: install metadata, vendored React, SW registration
         │
    assets/js/app.js           GENERATED from src/app.jsx
         │
    ┌────┴─────────────────────────────────────┐
    │  src/app.jsx                                     │
    │    TASKS[]            domain data (14 items)     │
    │    SYS_PROMPT         LLM grounding              │
    │    LOCAL_PREAMBLE     extra rules, offline model │
    │    getStatus()        interval arithmetic        │
    │    mergeBackup()      backup import rule         │
    │    isLoopbackEndpoint() offline-AI address gate  │
    │    TacomaHub          state + rendering          │
    │      └ localStorage: taco-mi / taco-log / taco-ai│
    │      └ fetch: api.anthropic.com      (phone)     │
    │      └ fetch: 127.0.0.1:11434        (deck)      │
    └──────────────────────────────────────────────────┘

    service-worker.js          public shell cache only, versioned
    vercel.json                static hosting + CSP + security headers (phone)
    scripts/serve.js           static server; on the deck, a loopback-only service
    deck/                      cyberdeck setup, kiosk launcher, updater
```

There is no server-side code, no database, and no build output beyond one compiled file. On the
deck, `scripts/serve.js` serves the same static files to the Pi itself.

## Layer boundaries

| Layer | Where | Notes |
|---|---|---|
| Domain data | `TASKS[]` in `src/app.jsx` | Plain array. Corrections live here and are guarded by tests. |
| Domain rules | `getStatus()` | Mileage vs. interval → ok / due / overdue. The only real logic. |
| Persistence | `localStorage` | Six keys. No adapter layer — the surface is too small to justify one. Backup is a JSON file the user exports. |
| Network | `sendCloud()` / `sendLocal()` | Cloud: Anthropic Messages API. Local: OpenAI-compatible chat API on loopback, streamed. Chosen in ⚙ per device. |
| UI | React components | Inline style objects, no CSS framework. |
| Delivery | service worker + manifest | The platform boundary that was rewritten. |

**Deliberate non-abstraction:** the SOP's recommended `core / store / app` split is not applied.
At ~700 lines with three storage keys and one network call, an interface layer would be the
speculative abstraction SOP §12 warns against. If a second persistence target or a second
vehicle is ever added, revisit this.

## Dependency justifications

SOP §3 rule 7 — every dependency needs a written reason.

### Runtime: React + ReactDOM 18.3.1 (MIT), vendored

**Kept because** the primary reference is a working React app; removing it is the rewrite SOP §3
rule 1 forbids. **Vendored rather than CDN-loaded** because a CDN fetch on every load makes the
offline contract impossible — this was the single biggest defect in the original hub page.
Cost: 143 KB, served once and cached. Update by replacing the two files and bumping `SHELL_VERSION`.

### Build-time: @babel/core + @babel/preset-react

**Needed because** browsers cannot execute JSX. The alternative — Babel standalone in the
browser — is what the original did, and it required a CDN at runtime. Moving compilation ahead
of time is precisely what buys the offline behavior. Dev-only; nothing ships to the browser.

### Deck runtime: Ollama (not a repo dependency)

**Needed because** the deck must answer with no internet, and the Anthropic API is the only
other AI path. Ollama is installed on the Pi by `deck/setup.sh`; nothing in this repo imports it.
The app speaks the **OpenAI-compatible** `/v1/chat/completions` API rather than Ollama's native
API, so llama.cpp server, LM Studio, or `tacoma-copilot` (if it exposes that API) can replace
Ollama by changing the address in ⚙. Bound to `127.0.0.1`; `OLLAMA_ORIGINS` admits only the app.

**Why not `tacoma-copilot` directly:** it's a separate FastAPI + RAG product that lives outside
this repo (`~/Desktop/Tacoma/App - Tacoma Copilot/`), and its API was not available when this
was built. The two products still share vehicle facts, not code.

### Not added, and why

| Considered | Rejected because |
|---|---|
| Vite / webpack / bundler | One source file, one output. `scripts/build.js` is 60 lines and needs no config. |
| jest / vitest | The harness is 60 lines and needs no install, so any AI can run `node tests/run.js` immediately. |
| Tailwind / CSS framework | Styling already exists as inline objects. Adding a framework means restyling a working UI. |
| IndexedDB + encryption (Dream Atlas pattern) | Data is an odometer reading and a service log. See `REUSE_MATRIX.md`. |
| A server-side API-key proxy | Would require a backend for a single-user personal tool. The key stays on the user's own device; the tradeoff is stated in `PRODUCT_CONTRACT.md`. |
| A sync backend for phone ↔ deck | The deck is used without network by definition, so sync couldn't run when it matters. A merge-safe backup file works in both directions. |
| Allowing a LAN address for the offline model | Would let a link point chat at another machine. Loopback only; the deck runs its own model. |
| React Router | Three tabs held in `useState`. A router would add a dependency and URL complexity for nothing. |

## Architecture gate (SOP §10)

| Requirement | Status |
|---|---|
| Every old-platform dependency has an explicit disposition | Yes — CDN React vendored, CDN Babel replaced by a build step |
| Target runs without importing files from the old implementation | Yes — no reference to `taco-world.html` at build or runtime |
| Tests run without the old implementation beside them | Yes — `tests/` resolves only paths inside this repo |
| Phase scope and deferred scope both written | Yes — `PHASE_PLAN.md` |
| New dependencies justified in writing | Yes — above |

## Build and deploy

```
src/app.jsx  ──npm run build──►  assets/js/app.js  ──committed──►  GitHub  ──►  Vercel
```

The compiled bundle **is committed**. Vercel therefore needs no build command and the repo is
deployable by anyone who clones it. The tradeoff is that source and bundle can drift, which is
why `vehicle-contract.test.js → Build freshness` fails when they do.

**Vercel project settings:** framework preset `Other`, root directory `/`, build command empty,
output directory empty. It is a static site; there is nothing to build in CI.

## Cache invalidation

The one operational thing that is easy to get wrong.

1. Edit `src/app.jsx`
2. `npm run build`
3. **Bump `SHELL_VERSION` in `service-worker.js`** (`...-v1` → `...-v2`)
4. `npm run check`, commit, push

Skip step 3 and installed phones keep serving the old build indefinitely. The new worker
installs with `cache: "reload"` so it bypasses stale CDN copies, and `activate` deletes older
`tacoma-world-` caches only, leaving other apps on the same origin untouched.
