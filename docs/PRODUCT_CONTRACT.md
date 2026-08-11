# Product Contract — Tacoma World

**Version:** 1.0 · **Last updated:** 2026-08-11 · SOP §8

Every statement here is meant to be verifiable. Where a claim is enforced by a test, the test
is named. Do not soften a claim to make a test pass — fix the code, or change the contract
deliberately and say so here.

---

## Primary user and job

**User:** Caleb, the owner and sole mechanic of one specific truck.

**Job:** While standing at the truck — often in a garage or a parts-store parking lot with
poor signal, often with dirty hands — get the correct torque figure, part number, or procedure
for **this** vehicle, and record that the work was done.

**Dominant first action:** open the app and read a spec. Not sign in, not sync, not configure.

## The vehicle this serves

| | |
|---|---|
| Vehicle | 2019 Toyota Tacoma **TRD Sport** 4WD |
| VIN | `3TMCZ5AN4KM264896` |
| Model code | GRN305L-PRTSHA · built June 2019, Tijuana |
| Engine | 3.5L V6 2GR-FKS (D-4S) |
| Transmission | Aisin AC60F 6-speed automatic, 3.909 axle |
| Paint / interior | 4V6 Quicksand / FD15 |
| Mileage at last compile | 128,342 |

**The trim is TRD Sport. It is not a TRD Pro.** An earlier knowledge base for this truck said
Pro. That error propagated into part numbers and fluid capacities. See "Safety-critical data"
below. Enforced by `vehicle-contract.test.js → Trim identity`.

## Canonical navigation

Three tabs, no nesting deeper than one level:

1. **Schedule** — every task sorted by urgency against current mileage.
2. **Library** — searchable task list; tapping one opens torque specs, service specs, parts, tools, tips, and videos.
3. **AI Wrench** — chat with a mechanic assistant primed with this truck's specs.

A task detail screen offers **Mark Done**, which records the current mileage and date.

## Safety-critical data

These three values are wrong in the superseded TRD Pro documentation and are harmful if
reintroduced. Each has a dedicated regression test.

| Item | Wrong (Pro) | Correct (Sport) | Consequence of the error |
|---|---|---|---|
| Rear differential fill | ~4.0–4.2 qt, locking | **~3.1 qt, open, no friction modifier** | Overfills an open diff |
| Spark plug | 90919-01287 | **90919-01263** (Denso FK20HBR8) | 90919-01287 is the 2.7L four-cylinder plug |
| Shocks | FOX 2.5 internal bypass | **Hitachi/Tokico — front 48510-04222, rear 48530-04101** | Orders hardware the truck does not have |

Additionally:

- Spark plug interval is **120,000 mi** (V6), not 60,000 (four-cylinder). Past due at 128,342.
- Iridium plugs are **factory pre-gapped at 0.031–0.032 in and must not be re-gapped.** The
  0.043 in figure belongs to a different plug (FK20HBR11).
- Leaf-spring U-bolt torque is **genuinely unresolved** across sources and must be presented
  as unverified, never as a single settled number.
- The truck has **no locking rear differential, no Crawl Control, no Multi-Terrain Select.**
  The AI must not open a diagnostic path for hardware that was never fitted.

Enforced by `vehicle-contract.test.js`. Mutation-tested 2026-08-11: reintroducing the Pro
rear-diff volume, the four-cylinder plug number, or a CDN script tag each fail the suite.

## Offline behavior — exact

**Works with no network, after one successful online visit:**

- all three tabs and all navigation
- every torque spec, service spec, part number, tool list, and tip
- search and filtering
- entering mileage
- Mark Done, and the full service history

**Requires a network:**

- AI Wrench chat (calls `api.anthropic.com`)
- YouTube video links

The service worker caches only the fixed public shell. It never caches the API. Enforced by
`pwa-contract.test.js → Service worker, Offline contract`. Verified 2026-08-11 by loading with
the server stopped, not by inspection.

## Data, privacy, and persistence

**Classification: personal, low sensitivity.** Odometer readings, service dates, and an API key.
No financial data, no health data, nothing regulated.

- **Storage:** browser `localStorage` on the user's own device. Keys: `taco-mi` (mileage),
  `taco-log` (service history), `taco-apikey`.
- **No server.** No account, no sync, no telemetry, no analytics. Nothing this app stores ever
  leaves the device except the text of an AI chat message, which goes directly to Anthropic.
- **The API key** is entered by the user, stored on their device only, and sent only to
  `api.anthropic.com`. It is never in this repository — enforced by
  `vehicle-contract.test.js → Privacy`, which fails on any committed `sk-ant-` string.
- **Nothing is encrypted at rest.** This is a deliberate decision, not an oversight: the data
  is a mileage number and a maintenance log. Do not describe this app as encrypted or secure.

### Known behavioral gap — no baseline, no tracking

The Schedule tab can only judge a task once that task has a recorded last-done mileage.
On a fresh install every task reads **"No record"**, including ones that are genuinely past
due — at 128,342 mi the spark plugs are ~8,000 mi overdue and the schedule will not say so
until the work is logged once.

The app knows each interval but not when the work last happened, so it cannot infer this.
Until a baseline is recorded, past-due information reaches the user only through the interval
label and the AI assistant.

Pinned by `schedule-contract.test.js → Known gap`. Changing it is a product decision, not a
bug fix — see `PHASE_PLAN.md` Phase 3.

### Known loss risks — stated plainly

- Clearing Safari website data, or deleting the home-screen app, **erases the mileage and the
  full service log.** There is no backup and no export today.
- iOS may evict storage for web apps that go unused for an extended period.
- **Deferred, not solved.** See `PHASE_PLAN.md` Phase 3. Until then, this app is a convenient
  reference with a service log that can vanish. Do not describe it as durable or as a
  system of record.

## Accessibility and device support

- Target viewport range: **320px to desktop.** Primary target ~390px (iPhone).
- Content clears the notch and home indicator via `env(safe-area-inset-*)`.
- Inputs are 16px minimum so iOS does not zoom on focus.
- `prefers-reduced-motion` is respected.
- **Not yet verified:** full keyboard navigation, screen-reader labelling, and colour-contrast
  audit against WCAG AA. The interface is dark with `#888`/`#555` secondary text on near-black,
  and some of that likely fails AA. Listed in `PHASE_PLAN.md`, not claimed as done.

## Deliberately unsupported

- No account, login, or multi-device sync
- No backup, export, or import (Phase 3)
- No photos or attachments
- No parts ordering or price lookup
- No OBD-II or vehicle telemetry integration
- No support for any vehicle other than this VIN
- No offline AI (that is the Raspberry Pi project, a separate deliverable)

## Wording that must not overstate the product

| Do not say | Say instead |
|---|---|
| "native iPhone app" | "installable web app (PWA)" |
| "works offline" (unqualified) | "specs and logs work offline; AI chat needs a connection" |
| "secure" / "encrypted" | "stored locally on your device, unencrypted" |
| "your maintenance records are safe" | "clearing site data erases the log; there is no backup yet" |
| "verified torque spec" (for the U-bolts) | "unresolved across sources — verify against a current FSM" |
