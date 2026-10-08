# Product Contract — Tacoma World

**Version:** 1.2 · **Last updated:** 2026-10-07 · SOP §8 · changes in v1.1 and v1.2 listed at the end

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

**Two devices, one rule:** the **iPhone** is used when there's Wi-Fi or signal, so its AI is
cloud (Anthropic). The **cyberdeck** (Raspberry Pi 5) is used on the assumption that Wi-Fi has
gone out, so it serves the app to itself and its AI is a local model. The deck never depends
on the network.

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

A task detail screen offers **Mark Done**, which records the current mileage and date, and
**Done before? / Never done**, which records a past odometer reading (or 0 mi for a
factory-original part) so the schedule can judge work done before the app existed.

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

- AI Wrench chat **on the phone** (calls `api.anthropic.com`)
- the **ElevenLabs** read-aloud voice, when chosen (calls `api.elevenlabs.io`)
- YouTube video links

**Reading answers aloud** (🔊 in AI Wrench) uses the device's built-in voice by default, which
needs no network and works on the deck. ElevenLabs is opt-in in ⚙ → Voice; if it fails or there
is no signal, the device voice reads instead. Enforced by `voice-contract.test.js`.

**On the cyberdeck, AI Wrench needs no network.** It calls a model running on the same Pi
(`http://127.0.0.1:11434`, OpenAI-compatible API, Ollama by default). The app refuses any
offline-model address that isn't the device itself — enforced by
`ai-contract.test.js → Offline AI — stays on this device`. The production CSP still allows only
`api.anthropic.com` and `api.elevenlabs.io`, so the phone build cannot be pointed at a local port. Deck operation is in
`docs/CYBERDECK.md`; it was dry-run against stubs and mock servers on 2026-10-07 and has **not
yet run on Pi hardware**.

**The offline model is less reliable than cloud.** It gets the same corrected spec reference
plus an instruction never to guess a torque value, and the UI tells the user to confirm torque
values in the Library. The Library remains the source of truth.

The service worker caches only the fixed public shell. It never caches the API. Enforced by
`pwa-contract.test.js → Service worker, Offline contract`. Verified 2026-08-11 by loading with
the server stopped, not by inspection.

## Data, privacy, and persistence

**Classification: personal, low sensitivity.** Odometer readings, service dates, and an API key.
No financial data, no health data, nothing regulated.

- **Storage:** browser `localStorage` on the user's own device. Keys: `taco-mi` (mileage),
  `taco-log` (service history), `taco-apikey`, `taco-ai` (`cloud` or `local`),
  `taco-local-endpoint`, `taco-local-model`, `taco-voice` (`on`/`off`), `taco-voice-engine`
  (`device`/`elevenlabs`), `taco-elevenlabs-key`, `taco-elevenlabs-voice`.
- **No server.** No account, no sync, no telemetry, no analytics. Nothing this app stores ever
  leaves the device except the text of an AI chat message, which goes directly to Anthropic or,
  on the deck, to a model on the same machine — and, **only while the ElevenLabs voice is chosen**,
  the text of each answer being read aloud, which goes directly to ElevenLabs (never the question,
  the chat history, or the system prompt). A backup file leaves only when the user exports it.
- **The ElevenLabs key** is entered by the user, stored on their device only, sent only to
  `api.elevenlabs.io`, and never exported — `voice-contract.test.js → keys stay private`.
- **The API key** is entered by the user, stored on their device only, and sent only to
  `api.anthropic.com`. It is never in this repository — enforced by
  `vehicle-contract.test.js → Privacy`, which fails on any committed `sk-ant-` string.
- **Nothing is encrypted at rest.** This is a deliberate decision, not an oversight: the data
  is a mileage number and a maintenance log. Do not describe this app as encrypted or secure.

### No baseline, no tracking — now user-fixable

The Schedule tab can only judge a task once that task has a last-done record, so a fresh
install reads **"No record"** everywhere, even for past-due work. The app still does not guess
(pinned by `schedule-contract.test.js → Known gap`). Instead, since v1.1:

- the Schedule tab says how many tasks have no record and why that matters;
- each task offers **Done before?** (log a past odometer reading) and **Never done** (0 mi,
  shown as "factory original"). Logging the plugs as never done shows them 8,342 mi overdue at
  128,342 — `backup-contract.test.js → Baseline capture`.

### Known loss risks — stated plainly

- Clearing Safari website data, or deleting the home-screen app, **erases the mileage and the
  service log** unless it was exported first.
- **Backup is manual.** ⚙ → Export log writes a JSON file (share sheet on iPhone, download
  elsewhere); Import merges one in. Per task the higher-mileage record wins, nothing is deleted,
  mileage only moves forward, and the API key is never exported —
  `backup-contract.test.js`. The phone and the deck keep **separate** logs; the file is the
  only bridge.
- iOS may evict storage for web apps that go unused for an extended period. The app requests
  persistent storage (`navigator.storage.persist()`), which reduces but does not remove this.
- Do not describe the log as durable or as a system of record. It is as safe as the last export.

## Accessibility and device support

- Target viewport range: **320px to desktop.** Primary target ~390px (iPhone).
- Content clears the notch and home indicator via `env(safe-area-inset-*)`.
- Inputs are 16px minimum so iOS does not zoom on focus.
- `prefers-reduced-motion` is respected.
- **Not yet verified:** full keyboard navigation, screen-reader labelling, and colour-contrast
  audit against WCAG AA. The interface is dark with `#888`/`#555` secondary text on near-black,
  and some of that likely fails AA. Listed in `PHASE_PLAN.md`, not claimed as done.

## Deliberately unsupported

- No account, login, or automatic multi-device sync (manual export/import only)
- No photos or attachments
- No parts ordering or price lookup
- No OBD-II or vehicle telemetry integration
- No support for any vehicle other than this VIN
- No offline AI **on the phone** (a phone can't run the model; offline AI is a deck feature)

## Wording that must not overstate the product

| Do not say | Say instead |
|---|---|
| "native iPhone app" | "installable web app (PWA)" |
| "works offline" (unqualified) | "specs and logs work offline; AI chat needs a connection" |
| "secure" / "encrypted" | "stored locally on your device, unencrypted" |
| "your maintenance records are safe" | "clearing site data erases anything not exported" |
| "the AI works offline" (unqualified) | "on the cyberdeck, AI uses a local model; the phone needs a signal" |
| "the offline AI knows the specs" | "it answers from the same reference, can still be wrong — confirm in the Library" |
| "synced" | "exported and imported by hand" |
| "hands-free" | "reads answers aloud; you still type or use the keyboard's dictation mic to ask" |
| "verified torque spec" (for the U-bolts) | "unresolved across sources — verify against a current FSM" |

## Contract changes in v1.1 (2026-10-07)

Changed deliberately, per the instruction at the top of this file:

| Was (v1.0) | Now (v1.1) | Why |
|---|---|---|
| No offline AI; that's the separate Pi project | Offline AI on the deck via a local model; phone unchanged | Caleb: "if I'm using the cyberdeck we must assume wifi has gone out." `tacoma-copilot` (FastAPI + RAG) stays a separate product; see `ARCHITECTURE.md`. |
| No backup, export, or import | Manual export/import with a merge | Two devices now keep separate logs and need a bridge. |
| Fresh install can't flag past-due work | Still won't guess, but the user can log baselines in two taps | The Known-gap test still pins the no-guess behavior. |
| AI chat used `claude-sonnet-4-20250514` | `CLOUD_MODEL = claude-sonnet-5-5`; retired IDs fail the build | That model was retired 2026-06-15; cloud chat had never worked in production. |

## Contract changes in v1.2 (2026-10-07)

| Was (v1.1) | Now (v1.2) | Why |
|---|---|---|
| AI Wrench is text only | 🔊 reads answers aloud; device voice by default, ElevenLabs opt-in | Caleb wants to hear answers while working on the truck. |
| Nothing but chat text goes to Anthropic; no other third party | With the ElevenLabs voice chosen, the text of answers read aloud goes to ElevenLabs | Caleb approved this explicitly on 2026-10-07, opt-in only. |
| CSP `connect-src 'self' https://api.anthropic.com` | adds `https://api.elevenlabs.io`; `media-src 'self' blob:` for the audio | Needed for the ElevenLabs call and playback. The test now checks the exact host list. |
