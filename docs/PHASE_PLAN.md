# Phase Plan — Tacoma World

**Version:** 1.1 · **Last updated:** 2026-10-07 · SOP §11

SOP §11: "Do not allow Phase 1 to silently become the entire product roadmap."

---

## Phase 1 — Installable offline reference · **COMPLETE, deployed 2026-08-11**

**Included**

- Three-tab UI: Schedule, Library, AI Wrench
- 14 maintenance tasks with torque specs, service specs, parts, tools, tips, video links
- Mileage entry and interval status (ok / due / overdue)
- Mark Done with a persisted service log
- AI chat against `api.anthropic.com` with a user-supplied key
- Full offline operation of everything except AI chat
- iPhone home-screen install, fullscreen, safe-area handling
- All TRD Sport spec corrections, with regression tests
- Static deploy config with CSP and security headers

**Excluded from Phase 1**

Backup/export, accounts, sync, photos, multi-vehicle, offline AI, push notifications,
parts pricing, OBD-II.

**Acceptance criteria**

| Criterion | Status |
|---|---|
| 39 contract tests pass | Met |
| Renders and navigates at 390px and desktop | Met |
| Loads and works fully with the server stopped | Met |
| No CDN in the critical path | Met |
| No API key committed | Met |
| Wrong Pro specs cannot silently return | Met — mutation-tested |
| Installs to an iPhone home screen | **Not met — needs the live URL** |

**Stop condition:** the app is live at a URL, installed on the phone, and the install has been
confirmed on the physical device.

---

## Phase 2 — Deploy and confirm on the device · **IN PROGRESS**

1. ~~Push the repo to GitHub~~ — done 2026-08-11
2. ~~Connect the repo to Vercel, confirm the first deploy~~ — done 2026-08-11
3. Install to the iPhone home screen from the live URL
4. Enter the API key, send one chat message. *(Would have failed before 2026-10-07: the
   hardcoded model had been retired. Fixed; see HANDOFF.)*
5. Enter 128342, mark one task done, force-quit, reopen, confirm it persisted
6. Turn on Airplane Mode and confirm specs still load
7. ⚙ → Export log → Save to Files; confirm the file appears

**Acceptance:** all six confirmed on the physical phone, not in an emulator. Record results in
`HANDOFF.md`.

---

## Phase 3 — Durability and accessibility · **DEFERRED**

The honest gaps in Phase 1.

| Item | Why it matters |
|---|---|
| ~~**Export / import the service log**~~ | **Done 2026-10-07** (pulled forward: phone + deck need a bridge). Manual, merge-safe. |
| ~~**First-run baseline capture**~~ | **Done 2026-10-07** as *Done before? / Never done* per task, plus a Schedule hint. No guessing. |
| **WCAG AA contrast audit** | `#888` and `#555` on near-black likely fail AA. Never audited. |
| **Keyboard and screen-reader pass** | Never exercised. |
| ~~**Storage-eviction handling**~~ | **Done 2026-10-07**: `navigator.storage.persist()` requested. Export remains the real protection. |
| **AI chat streaming (cloud)** | Offline chat streams; cloud still waits for the whole reply. |
| ~~**Model ID review**~~ | **Done 2026-10-07**: the ID had been retired; now `CLOUD_MODEL`, and retired IDs fail the build. |

Remaining Phase 3 work waits for Phase 2 to be confirmed on the phone.

---

## Phase 4 — Cyberdeck offline mode · **BUILT 2026-10-07, not yet run on Pi hardware**

Rule from Caleb: the deck is used on the assumption that Wi-Fi is gone. So the deck runs this
same app, served from the Pi to itself (`scripts/serve.js` on `127.0.0.1:8600`), with AI Wrench
pointed at a local model (Ollama on `127.0.0.1:11434`). Because the app and the model are both
on the Pi, the mixed-content / local-certificate problem the earlier plan worried about doesn't
arise; it only exists for a *phone* reaching a Pi, which is not a goal.

Setup and operation: `docs/CYBERDECK.md`. Acceptance, on the physical deck:

1. `bash deck/setup.sh` completes with all three self-test lines `ok`
2. Reboot lands in the app, full screen, AI Wrench showing `OFFLINE AI`
3. With Wi-Fi **off**: ask "oil drain plug torque" and get 30 lb-ft
4. Record time-to-first-word and words per second in HANDOFF
5. Import a backup exported from the phone; confirm the merged log

`tacoma-copilot` (FastAPI + RAG) remains a **separate product**. It can replace Ollama behind
AI Wrench if it exposes an OpenAI-compatible `/v1/chat/completions`; otherwise it stays
standalone.

**The two products share vehicle facts, not code.** Both were corrected to TRD Sport on
2026-08-11. A future spec correction must be applied to both — `src/app.jsx` here, and
`data/context/2019_Tacoma_TRD_Sport_Master_Mechanic_KB.md` plus `app/seed.py` there.

---

## Known limitations, carried forward

State these plainly rather than letting them be discovered.

1. The service log has **no backup**. Clearing site data loses it.
2. The API key sits in browser `localStorage`, unencrypted, on the user's device.
3. Accessibility is **unaudited**.
4. Physical-device install is **untested** until Phase 2.
5. The leaf-spring U-bolt torque is genuinely unresolved and is labelled as such in the app.
6. React must be updated by hand — no dependency tooling watches the vendored files.
7. The Schedule tab flags nothing as overdue until each task has been marked done once.
