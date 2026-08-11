# Reuse Matrix — Tacoma World

**Version:** 1.0 · **Last updated:** 2026-08-11 · SOP §5, §9

## Source precedence

| Source | Authority | Location |
|---|---|---|
| `taco-world.html` (React hub, 735 lines) | **Primary implementation and visual identity** | `~/Desktop/Tacoma/Hub Pages/taco-world.html` |
| "2019 Tacoma TRD Sport — DIY Maintenance & Torque Reference" | **Vehicle facts. Overrides all other spec sources.** | `~/Desktop/Tacoma/Maintenance Reference/` |
| `2019_Tacoma_TRD_Pro_Master_Mechanic_KB.md` | **Superseded — wrong trim. Do not use.** | `~/Desktop/Tacoma/_to_delete (TRD Pro - wrong trim)/` |
| `tacoma-copilot/` (FastAPI + RAG, Raspberry Pi) | Sibling product. Shares vehicle facts, shares no code. | `~/Desktop/Tacoma/App - Tacoma Copilot/` |
| `AI_APP_BUILD_SOP.md` (Dream Atlas) | **Process and repo structure.** Not a code source. | `docs/AI_APP_BUILD_SOP.md` |
| Dream Atlas / FinPilot implementations | Structural pattern only. No code copied. | not in this repo |

### Recorded source conflicts

| Conflict | Resolution | Basis |
|---|---|---|
| Trim: hub said Sport, copilot KB said Pro | **TRD Sport** | VIN, paint code 4V6 (never offered on the 2019 Pro), open diff, absence of CRAWL/MTS — four independent confirmations |
| Spark plug PN: hub `90919-01253`, KB `90919-01287` | **Neither. `90919-01263`.** | Toyota OE catalog: "V6 2GRFKS · FK20HBR8 · 90919-01263". `-01287` is the 2.7L; `-01253` matches nothing on this engine |
| Spark plug interval: hub 60k, KB 120k | **120k** | 60k is the four-cylinder interval, widely mis-applied to the V6 |
| Rear diff: hub "3.1–4.2 qt", KB "3.8–4.0 L locking" | **~3.1 qt, open** | The truck has an open diff; the larger figure is the locking variant |
| Plug gap: hub "1.1 mm max", reference "0.031–0.032 in, do not re-gap" | **Do not re-gap** | 1.1 mm belongs to the FK20HBR11, a different plug |
| Leaf U-bolt torque: 37 vs 52 vs 80–90 lb-ft | **Unresolved — labelled as such** | Sources genuinely disagree; presenting one number would be false confidence |

SOP §5: conflicts are recorded rather than silently resolved to the easiest source.

## Build route

**Route A — platform adaptation** (SOP §6). A working React application moved from a
single CDN-dependent HTML file to a self-contained, installable, offline-capable PWA.
Domain logic and visual identity preserved; only delivery and platform boundaries replaced.

Explicitly **not** Route B or C: this is the same product, so its identity, storage keys, and
data shape are preserved rather than renamed.

## Matrix

| Artifact / behavior | Source | Role | Decision | Rights | Adaptation | Risk | Verification |
|---|---|---|---|---|---|---|---|
| Task data (14 maintenance items) | `taco-world.html` | Domain data | **Reuse with adaptation** | Owned | Corrected spark plug PN + interval, rear diff capacity, leaf U-bolt confidence, skid plate → under-cover | Wrong spec reaches a torque wrench | `vehicle-contract.test.js` (12 tests) |
| AI system prompt | `taco-world.html` | LLM grounding | **Reuse with adaptation** | Owned | Added VIN, absent-hardware block, recalls, corrected all of the above | AI confidently states Pro specs | `vehicle-contract.test.js → Absent hardware` |
| React component tree (`TacomaHub`, `Detail`, `TaskHover`) | `taco-world.html` | Entire UI | **Reuse unchanged** | Owned | None — logic and markup untouched | — | Browser workflows, desktop + 390px |
| Inline style map (`T`) | `taco-world.html` | Visual system | **Reuse with adaptation** | Owned | `height: 100vh` → `100%` (iOS viewport bug) | Layout shift on iOS | 390px browser test |
| `localStorage` schema (`taco-mi`, `taco-log`, `taco-apikey`) | `taco-world.html` | Persistence | **Reuse unchanged** | Owned | None — deliberately preserved so existing users keep their data | Silent data loss on rename | `vehicle-contract.test.js → Privacy` |
| Anthropic API call | `taco-world.html` | AI chat | **Reuse unchanged** | Anthropic ToS | None | Key exposure if hardcoded | Privacy test rejects any `sk-ant-` string |
| Base CSS (~20 lines) | `taco-world.html` `<style>` | Document styling | **Reuse with adaptation** | Owned | Extracted to a file; added safe-area insets, 16px inputs, reduced-motion | — | `pwa-contract.test.js → iOS install metadata` |
| React + ReactDOM 18.3.1 | unpkg CDN | Runtime | **Rewrite platform boundary** | MIT | Vendored into `assets/js/`. **This is the change that makes offline possible.** | Manual version bumps | `pwa-contract.test.js → Offline contract` |
| Babel standalone (in-browser JSX) | unpkg CDN | Runtime compiler | **Discard with justification** | MIT | Replaced by a build step. In-browser compilation required a CDN fetch on every load, which defeated the entire offline goal, and cost ~200ms of startup. | Source and bundle can drift | Build-freshness test |
| Service worker | none — new | Offline shell | **New** | — | Public-shell-only, versioned, cross-origin-exempt | Caching private data or the API | 7 tests |
| `manifest.webmanifest` | none — new | Install metadata | **New** | — | Root scope, maskable icon | Not installable | 5 tests |
| App icons | none — new | Branding | **New** | Generated for this project | Drawn to match the app's red/black identity | — | Manifest test checks each file exists |
| `vercel.json` | Dream Atlas pattern (SOP §18) | Hosting + headers | **Reuse with adaptation** | Pattern only, no file copied | CSP `connect-src` allows only `api.anthropic.com` | Over-permissive CSP | 3 tests |
| Test harness | Dream Atlas pattern | Test infrastructure | **Reuse with adaptation** | Pattern only, no file copied | Written from scratch, dependency-free | — | Self-testing |
| Dream Atlas encryption / IndexedDB vault | SOP §19 | Persistence + crypto | **Discard with justification** | — | Not applicable. This app stores an odometer reading and a service log. A PBKDF2 vault would be security theatre over non-sensitive data and would add a passphrase prompt to a glovebox reference tool. | Under-protection if scope changes | Reconsider if photos or personal records are ever added |
| Dream Atlas vanilla core/store/app split | SOP §18 | Architecture | **Discard with justification** | — | The primary reference is React. Rewriting it to match a structural convention is the rewrite SOP §3 rule 1 forbids. Deviation recorded in `AI_WORKFLOW.md` §6. | Structural divergence between sibling projects | Documented, accepted |
| Backup / export / import | Dream Atlas | Recovery | **Defer** | — | Not built. The loss risk is stated plainly in `PRODUCT_CONTRACT.md` rather than papered over. | Service log lost if site data cleared | Phase 3 |
| Accessibility audit (WCAG AA) | — | Compliance | **Defer** | — | Dark theme with low-contrast secondary text likely fails AA | Unusable for low-vision users | Phase 3, reported as not run |
| `tacoma-copilot` FastAPI/RAG code | copilot project | Pi assistant | **Defer — separate product** | Owned | No code shared. Vehicle facts are shared through the corrected KB, not through imports. | Divergent specs between the two | Both were corrected together on 2026-08-11 |

## Rights

Everything reused is the user's own work, except **React and ReactDOM 18.3.1 (MIT)**, which
are vendored with their licence intact and permit redistribution. No third-party fonts, icons,
media, or component libraries were copied. Icons were generated for this project. The
YouTube links in the task data are outbound links, not embedded content.
