# Phase Plan — Tacoma World

**Version:** 1.0 · **Last updated:** 2026-08-11 · SOP §11

SOP §11: "Do not allow Phase 1 to silently become the entire product roadmap."

---

## Phase 1 — Installable offline reference · **COMPLETE, not yet deployed**

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

## Phase 2 — Deploy and confirm on the device · **NEXT**

1. Push the repo to GitHub
2. Connect the repo to Vercel, confirm the first deploy
3. Install to the iPhone home screen from the live URL
4. Enter the API key, send one chat message
5. Enter 128342, mark one task done, force-quit, reopen, confirm it persisted
6. Turn on Airplane Mode and confirm specs still load

**Acceptance:** all six confirmed on the physical phone, not in an emulator. Record results in
`HANDOFF.md`.

---

## Phase 3 — Durability and accessibility · **DEFERRED**

The honest gaps in Phase 1.

| Item | Why it matters |
|---|---|
| **Export / import the service log** | Today, clearing Safari data erases the maintenance history with no recovery. This is the single largest real defect. |
| **First-run baseline capture** | Every task reads "No record" until logged once, so a fresh install never flags anything overdue — even the spark plugs, ~8,000 mi past due. Options: prompt for known service history on first run, or seed sensible defaults. Found during Phase 1 browser verification. |
| **WCAG AA contrast audit** | `#888` and `#555` on near-black likely fail AA. Never audited. |
| **Keyboard and screen-reader pass** | Never exercised. |
| **Storage-eviction handling** | iOS may evict data for unused web apps. `navigator.storage.persist()` is not requested. |
| **AI chat streaming** | Currently blocks until the whole reply arrives. |
| **Model ID review** | `claude-sonnet-4-20250514` is hardcoded in `src/app.jsx` and may be superseded. |

**Do not begin Phase 3 until Phase 2 is confirmed on the device.**

---

## Phase 4 — Pi assistant integration · **DEFERRED, separate product**

`tacoma-copilot` is a FastAPI + RAG application intended for a Raspberry Pi 5 (on order as of
2026-08-11). It is a **sibling product, not a component of this one.**

Possible later integration: when on home wifi, route AI Wrench at the Pi instead of the
Anthropic API — free, fully offline inference. This requires the Pi to be reachable over HTTPS
from an installed PWA, which is a real networking problem (mixed content, local certificates).
Not scoped.

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
