# AGENTS.md — Codex entry point

> This file exists so Codex CLI picks up the project rules automatically.
> It is a pointer, not the rules themselves. Keep it short; keep the rules in one place.

## Read these first, in order

1. **`AI_WORKFLOW.md`** — where work lives, how it moves between Claude and Codex, the 12 rules.
2. **`docs/HANDOFF.md`** — what the previous AI actually did and what to do next.
3. **`docs/AI_APP_BUILD_SOP.md`** — the build SOP (discovery → reuse matrix → phases → gates).

Verify `docs/HANDOFF.md` against `git log` before trusting it. If they disagree, the repository is right.

## What this is

An offline-capable Progressive Web App for maintaining a specific truck: a 2019 Toyota
Tacoma **TRD Sport**, VIN `3TMCZ5AN4KM264896`. React, vendored (no CDN), deployed static on Vercel.

It is a PWA. It is not a native iOS app. Do not describe it as one.

## Before you change anything

```sh
git pull
git status          # must be clean
npm install         # first time only
npm run check       # build + 39 contract tests; confirm green BEFORE you start
```

## The three things that break this project

1. **Editing `assets/js/app.js`.** It is generated from `src/app.jsx`. Your edits vanish on
   the next build. Edit the source.
2. **Forgetting `SHELL_VERSION` in `service-worker.js`.** Change any shell file without
   bumping it and installed phones keep serving the old build. The deploy looks like it did nothing.
3. **Weakening `tests/vehicle-contract.test.js`.** Those guards block spec regressions that
   are physically harmful — a rear-diff overfill, a wrong spark plug, ordering shocks the
   truck does not have. If one fails, the data is wrong, not the test. Read
   `docs/PRODUCT_CONTRACT.md` before touching them.

## Before you commit

```sh
npm run check       # must pass
git status          # inspect every path
git add <explicit paths>     # never `git add -A` blindly
git commit -m "..."
git push            # Vercel deploys in ~1 minute
```

Then update `docs/HANDOFF.md` if you are handing back to Claude.

## Authority

You may commit and push when the user asks. Do not deploy, delete data, or change external
systems without being asked for that exact action. Claude cannot push at all — if a change
appears in the working copy that you did not make, it is probably Claude's, and it still
needs `npm run check` before it goes anywhere.
