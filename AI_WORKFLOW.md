# Shared AI Workflow — Claude and Codex on one repository

**Version:** 1.0
**Last updated:** 2026-08-11
**Companion document:** `docs/AI_APP_BUILD_SOP.md` (governs *how* to build; this document governs *where work lives and how it changes hands*)
**Reference implementation:** this repository, `tacoma-world`

> AI SYSTEM: read this file and `docs/AI_APP_BUILD_SOP.md` before changing anything.
> Then read `docs/HANDOFF.md` to find out what the previous system actually did.

---

## 1. The problem this replaces

Before this workflow, moving a project between Claude and Codex meant exporting a chat
transcript, downloading a zip, and re-uploading it to the other system. The observable
symptoms of that method, all found in the FinPilot project on 2026-08-11:

- `_previous_versions/` containing `index.html` **and** `index (1).html`
- `app.js` **and** `app (1).js`
- `styles.css` **and** `styles (1).css`
- `conversation-transcript.md` used as the memory medium
- `AGENTS.md` reading *"based on a chat with Claude (I uploaded the complete markdown file)"*
- no Git repository anywhere

Nothing there says which file is current. That is the failure this workflow exists to prevent.

**The rule that fixes it: the repository is the only source of truth. Not a chat, not a zip,
not a download.** A conversation is how you direct an AI. It is not where the project lives.

---

## 2. Topology

```
                       GitHub  origin/main
                      ┌──────────────────────┐
                      │  the source of truth │──────► Vercel (auto-deploys on push)
                      └──────────────────────┘              │
                          ▲              │                  ▼
                   git push│              │git pull    https://<project>.vercel.app
                          │              ▼
              ~/Desktop/Projects/tacoma-world
                   the local working copy on your Mac
                          ▲                    ▲
                          │                    │
                  ┌───────┴───────┐   ┌────────┴─────────┐
                  │   Codex CLI   │   │  Claude (Cowork) │
                  │ your Terminal │   │  desktop bridge  │
                  └───────────────┘   └──────────────────┘
```

Both AI systems edit **the same folder on your Mac.** Git tracks who changed what.
GitHub is the backup and the deploy trigger. Vercel replaces SFTP.

### What each participant can and cannot do

| | Reads repo | Writes files | Runs `git` | Runs `npm` / tests | Pushes to GitHub |
|---|---|---|---|---|---|
| **Codex CLI** | yes | yes | **yes** | yes | **yes** |
| **Claude (Cowork)** | yes, via desktop bridge | yes, via desktop bridge | no | in its own cloud sandbox only | **no** |
| **You** | yes | yes | yes | yes | yes |

**Claude cannot commit or push.** Claude has no credentials for your GitHub account and
should never be given any. Claude writes files into the working copy; **Codex or you commit
them.** This is a deliberate boundary, not a limitation to work around — it means every
change Claude makes passes a human or Codex review before it reaches the deployed site.

### Where the repository must live

The folder must sit inside a folder connected to the Claude desktop app, or Claude cannot
see it. Connected folders as of 2026-08-11: **Desktop, Downloads, Pictures, Movies, Music.**

Canonical location: **`~/Desktop/Projects/tacoma-world`**

If a Claude session reports it cannot find the repo, the fix is to connect the Desktop
folder in the Claude desktop app — not to email files around.

---

## 3. The loop

### Starting any session, with either AI

```sh
cd ~/Desktop/Projects/tacoma-world
git pull
git status          # must be clean before you start
```

Then tell the AI: **"Read AI_WORKFLOW.md and docs/HANDOFF.md, then <task>."**

That one sentence replaces uploading a transcript.

### Finishing any session, with either AI

```sh
npm run check       # builds, then runs the test suite — must pass
git status          # inspect every path before staging
git add <explicit paths>
git commit -m "<what changed and why>"
git push
```

Vercel deploys within about a minute of the push.

### Switching from one AI to the other

1. Finish the current change. Do not hand over mid-edit.
2. Run `npm run check`. A failing suite is not a handoff, it is a mess.
3. Update **`docs/HANDOFF.md`** — the outgoing AI fills in the continuation block.
4. Commit and push.
5. Point the incoming AI at the repo.

The incoming AI must **verify the handoff block against the repository** before trusting it
(SOP §17). A handoff note that disagrees with `git log` is wrong; the repository wins.

---

## 4. Rules

These bind both AI systems. They exist because each one has already been violated in a
previous project.

1. **The repo is truth.** Never reconstruct state from a chat transcript when the repo is
   reachable. If they disagree, the repo is right.
2. **One AI at a time.** Two systems editing the same working copy without an intervening
   commit produces exactly the `file (1).js` problem this workflow replaces.
3. **Pull before you start, push before you stop.** Uncommitted work is invisible to the
   other AI.
4. **Never edit a generated file.** `assets/js/app.js` is built from `src/app.jsx`. Editing
   it directly means the next `npm run build` silently deletes your work. The file carries a
   header saying so, and a test fails if it goes stale.
5. **`npm run check` must pass before any commit.** Build plus 39 contract tests. No exceptions.
6. **Bump `SHELL_VERSION` in `service-worker.js` whenever a shell file changes.** Otherwise
   installed phones keep serving the old build from cache and the deploy appears to do nothing.
7. **Never commit secrets.** No API keys, no `.env`. The Anthropic key lives in the user's
   browser storage on their own device and is never in this repo. A test enforces this.
8. **Claude does not commit, push, or deploy.** See the table in §2.
9. **Do not add a dependency, framework, or service without writing down why** in
   `docs/ARCHITECTURE.md`. This repo has two dev dependencies and zero runtime dependencies
   beyond a vendored React. Keep it that way unless there is a stated reason.
10. **Never claim a feature works without exercising it.** "It renders" is not "it works."
    Offline claims require the server actually stopped. Device claims require the device.
11. **Record intentional deviations from the SOP** rather than silently diverging. There is
    one in this repo — see §6.
12. **Preserve unrelated work.** Do not revert, reformat, or clean up files outside the task.

---

## 5. Repository layout

```
tacoma-world/
├── AI_WORKFLOW.md            ← this file: where work lives, how it changes hands
├── AGENTS.md                 ← Codex entry point (points here)
├── CLAUDE.md                 ← Claude entry point (points here)
├── README.md                 ← human-facing: what it is, how to run it
├── index.html                ← app shell
├── manifest.webmanifest      ← PWA install metadata
├── service-worker.js         ← offline shell cache
├── vercel.json               ← static hosting + security headers
├── package.json              ← build / test / serve scripts
├── src/
│   └── app.jsx               ← THE FILE YOU EDIT. All app logic and spec data.
├── assets/
│   ├── css/tacoma-world.css  ← document styling, iOS safe-area fixes
│   ├── js/app.js             ← GENERATED from src/app.jsx. Do not edit.
│   ├── js/react.min.js       ← vendored, so the app works offline
│   ├── js/react-dom.min.js   ← vendored
│   └── icons/                ← install icons + iOS splash
├── scripts/
│   ├── build.js              ← src/app.jsx -> assets/js/app.js
│   └── serve.js              ← local https-equivalent server for offline testing
├── tests/
│   ├── harness.js            ← dependency-free assertions
│   ├── pwa-contract.test.js  ← install, caching, offline, headers
│   └── vehicle-contract.test.js ← guards against dangerous spec regressions
└── docs/
    ├── AI_APP_BUILD_SOP.md   ← the build SOP this workflow serves
    ├── PRODUCT_CONTRACT.md   ← what must remain true
    ├── REUSE_MATRIX.md       ← what was reused, adapted, rewritten, deferred
    ├── ARCHITECTURE.md       ← structure and dependency justifications
    ├── PHASE_PLAN.md         ← what ships now, what is deferred
    └── HANDOFF.md            ← the continuation block. Update before switching AIs.
```

---

## 6. Recorded deviation from the SOP

SOP §18 describes the Dream Atlas foundation as **dependency-free vanilla JavaScript**, split
into `core` / `store` / `app` modules.

**This project is React and is not split that way. That is deliberate.**

- The primary reference (`taco-world.html`) is an existing, working React application. SOP §3
  rule 1 forbids rewriting a working product without explicit approval, and SOP §12 warns
  against changing a framework to match a sample.
- Converting ~700 lines of working JSX to vanilla DOM to match a structural convention would
  be a rewrite with no user-visible benefit and real regression risk.
- React is **vendored into the repo**, not pulled from a CDN, so the dependency-free
  *delivery* property the SOP actually cares about is preserved: no network, no third party,
  no runtime fetch.

What was adopted from the Dream Atlas pattern: the directory shape, the public-shell-only
service worker, versioned cache naming, the dependency-free contract-test organization, the
static hosting and security-header configuration, and the docs-in-repo discipline.

A future project starting from scratch should prefer the vanilla structure. This one inherited React.

---

## 7. Adding the next app to this workflow

FinPilot and Dream Atlas can follow the same path. Per SOP §18, do not ship a renamed clone.

1. `git init` a new repository. Do not copy `.git` from this one.
2. Copy the **structure**, not the content: `package.json` scripts, `scripts/build.js`,
   `scripts/serve.js`, `tests/harness.js`, `vercel.json`, `AI_WORKFLOW.md`, `AGENTS.md`,
   `CLAUDE.md`, and the `docs/` skeleton.
3. Rename every identifier: `SHELL_VERSION` prefix, manifest `id` / `name` / `short_name`,
   package name, storage keys (`taco-*` here), download filenames, and the CSP `connect-src`
   allowlist if it talks to a different API.
4. Write `docs/PRODUCT_CONTRACT.md` **before** writing code.
5. Replace `tests/vehicle-contract.test.js` with that product's own domain guards. The PWA
   contract test is largely portable; the domain one is not.
6. Grep the new repo for `tacoma`, `Tacoma`, `taco-`, and `TRD` before the first commit.
7. Connect the new GitHub repo to Vercel and confirm the first deploy before building features.

---

## 8. When something goes wrong

| Symptom | Cause | Fix |
|---|---|---|
| Deployed site shows the old version | `SHELL_VERSION` not bumped | Bump it, rebuild, push. On the phone, close the app fully and reopen twice. |
| `npm run build` does nothing useful | dependencies not installed | `npm install` in the repo root |
| Tests fail on `app.js is stale` | edited the source but did not rebuild | `npm run build` |
| Claude says it cannot find the repo | Desktop folder not connected | Connect it in the Claude desktop app |
| Two versions of a file appear | two AIs edited without committing between | `git diff`, pick one, commit. Then re-read rule 2. |
| Offline test passes but the phone still needs signal | tested with the server running | Stop the server, then reload |
| Vercel deploy succeeded but the URL 404s | output directory misconfigured | Vercel project settings: framework preset **Other**, root directory **/**, no build command |
