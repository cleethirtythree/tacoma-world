# CLAUDE.md — Claude entry point

> This file exists so Claude Code and Claude Cowork pick up the project rules automatically.
> It is a pointer, not the rules themselves.

## Read these first, in order

1. **`AI_WORKFLOW.md`** — where work lives, how it moves between Claude and Codex, the 12 rules.
2. **`docs/HANDOFF.md`** — what the previous AI actually did and what to do next.
3. **`docs/AI_APP_BUILD_SOP.md`** — the build SOP (discovery → reuse matrix → phases → gates).

Verify `docs/HANDOFF.md` against the repository before trusting it. If they disagree, the repository is right.

## What this is

An offline-capable Progressive Web App for maintaining a specific truck: a 2019 Toyota
Tacoma **TRD Sport**, VIN `3TMCZ5AN4KM264896`. React, vendored (no CDN), deployed static on Vercel.

It is a PWA. It is not a native iOS app. Do not describe it as one.

## Your specific constraint

**You cannot commit or push.** You have no credentials for this GitHub account and must not
ask for any. You write files into the working copy through the desktop bridge; Codex or Caleb
commits them.

This means:

- Always say plainly which files you changed, so they can be reviewed and staged.
- Never report something as "deployed." The most you can truthfully say is "written to the
  working copy, ready to commit."
- If you cannot reach the repo, the Desktop folder is not connected in the Claude desktop app.
  Ask for it to be connected. Do not fall back to emailing zips — that is the failure mode
  this whole workflow replaces.

## Running things

Your cloud sandbox has Node and a browser. You can and should:

```sh
npm install && npm run check    # build + 80 contract tests
npm run serve                   # then drive it with Playwright at localhost:8600
```

Test offline by stopping the server, not by trusting the code. SOP §20: claiming offline
support while the server is still reachable is a listed failure mode.

## The three things that break this project

1. **Editing `assets/js/app.js`.** Generated from `src/app.jsx`. Edit the source.
2. **Forgetting `SHELL_VERSION` in `service-worker.js`** when a shell file changes.
3. **Weakening `tests/vehicle-contract.test.js`.** Those guards block physically harmful spec
   regressions. A failure means the data is wrong, not the test.

## Tone for this project

Caleb has asked for plain, sequenced instructions over exhaustive explanation. Lead with what
changed and what he needs to do. Keep the reasoning available but short. He is capable and not
a full-time developer — do not pad, and do not assume unstated knowledge of git, npm, or deploy tooling.
