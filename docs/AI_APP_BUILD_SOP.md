# SOP: Reference-Led App Development With AI Systems

**Version:** 1.0  
**Last updated:** 2026-08-10  
**Reference implementation:** Dream Atlas standalone Progressive Web App (PWA)  
**Audience:** AI coding systems and the people directing them

> AI SYSTEM: Read this SOP completely before changing files. Treat the existing implementation as evidence and reusable infrastructure, not as disposable scaffolding.

## 1. Purpose

Use this SOP to build a new application from an existing application, prototype, native app, website, design system, or combination of references. The objective is to preserve proven work, replace only incompatible boundaries, and avoid an unnecessary rewrite.

The operating sequence is:

**Inspect → Map → Design → Adapt → Verify → Release → Hand off**

This SOP applies to:

- adapting an existing application to a new platform;
- creating a new product from a trusted application foundation;
- consolidating several prototypes into one canonical implementation;
- handing a partially completed application from one AI system to another;
- building a PWA or static web application from an existing browser or native product.

### Quick start for the person directing the AI

1. Give the AI this SOP and the paths or links to every approved reference.
2. Fill in the bracketed opening prompt in Section 21.
3. Require the discovery output, source-precedence table, product contract, reuse matrix, architecture, phase plan, and test plan before implementation.
4. Correct any source-precedence or scope error before authorizing the build phase.
5. Authorize only one stable phase at a time.
6. Require the verification and handoff report before starting the next phase or changing AI systems.

For a long-running project, save the product contract, reuse matrix, architecture decision, phase plan, and verification report as versioned Markdown files in the target repository. That prevents the next AI from reconstructing critical decisions from chat history.

## 2. Name the Deliverable Correctly

The AI must state what it is actually building:

- **Website:** browser-delivered pages, usually content-first.
- **Web application:** interactive software delivered through a browser.
- **Progressive Web App (PWA):** a web application with install metadata and a service worker, commonly installable through Add to Home Screen and capable of defined offline behavior.
- **Native application:** software built with a platform SDK and packaged for that platform, such as a Swift iOS application distributed as an App Store build.
- **Hybrid application:** web application code hosted inside a native wrapper.

Do not call a PWA a native iPhone application. Do not call a static marketing site an installable application.

## 3. Core Rules for the AI

1. Do not rewrite a working product from scratch unless the user explicitly approves a rewrite after reviewing the evidence.
2. Do not modify a reference implementation unless explicitly authorized.
3. Inspect the repository and exercise the existing product before editing files.
4. Separate product logic from platform-specific integration.
5. Reuse tested schemas, business rules, styles, assets, accessibility behavior, and tests where practical.
6. Replace only incompatible platform boundaries.
7. Do not add a framework, backend, package, build system, analytics product, or external service without documenting a concrete need and obtaining any required approval.
8. Implement only the current approved phase.
9. Never claim a feature works without testing its user-visible workflow.
10. Never commit, push, deploy, publish, delete data, or change remote systems unless the user has authorized that exact action.
11. Preserve unrelated user changes and dirty-worktree files.
12. Report uncertainty, test gaps, source conflicts, and deferred work plainly.

## 4. Required Inputs

Before work begins, assemble an input package. Use `unknown` when an item cannot be established; do not invent it.

| Input | Required information |
|---|---|
| Product goal | Who it serves, the primary problem, and the first useful outcome |
| Target type | Website, web app, PWA, native app, or hybrid app |
| Primary reference | The implementation that controls current behavior and visual identity |
| Secondary references | Native apps, prototypes, earlier versions, designs, requirements, and tests |
| Target platform | Hosting, browsers/devices, runtime constraints, and installation method |
| Phase scope | Features that must ship now and features explicitly deferred |
| Data sensitivity | Public, personal, confidential, regulated, or unknown |
| Persistence model | Local-only, account-backed, server-backed, synchronized, or none |
| Reuse rights | Ownership, license, attribution, and modification rights for source code, fonts, icons, media, designs, and component references |
| Deployment authority | Whether the AI may only prepare, or may also commit, push, and deploy |
| Acceptance tests | Workflows that prove the phase is complete |

If a missing input would materially change the product or create a security risk, pause and ask. Otherwise, state a narrow assumption and continue.

## 5. Define Source Precedence

When several sources exist, decide which source controls each kind of decision before coding.

Example:

| Source | Authority |
|---|---|
| Existing browser application | Primary implementation and visual reference |
| Native mobile application | Feature, data-model, and platform-UX reference |
| Existing tests | Expected behavior and compatibility contract |
| Existing assets | Branding and iconography |
| New specification | Target architecture and current phase scope |

If sources disagree, record the conflict and its impact. Do not silently choose the easiest source.

## 6. Select the Build Route

### Route A — Platform adaptation

Use when a working product is being moved to another host or platform.

- Preserve domain logic and user workflows.
- Replace the bootstrap, authentication, persistence, synchronization, and deployment boundaries that belong to the old platform.
- Keep the source product unchanged unless fixes must deliberately be shared.

### Route B — New app from an existing foundation

Use when the new product is different but an existing application offers a proven technical foundation.

- Reuse architecture, infrastructure, accessible UI patterns, test structure, and deployment mechanics.
- Replace branding, data model, business behavior, product copy, permissions, storage identifiers, exports, and fixtures.
- Prove that no reference-product names or private content remain.

### Route C — Greenfield with references only

Use when no code is reusable.

- Extract a product contract, information architecture, design tokens, and acceptance tests from the references before creating the foundation.
- Justify each new dependency and boundary.
- Build the smallest stable vertical slice first.

“Greenfield” does not mean “skip discovery.”

## 7. Phase 0: Discovery — No File Changes

The AI must complete the following before implementation:

1. Record the repository root, branch, remotes, current commit, and working-tree state.
2. Inventory directories, entry points, bootstraps, assets, styles, models, tests, manifests, service workers, storage code, authentication, network calls, and deployment files.
3. Search surrounding project directories, history, archives, previews, and backups within the user-authorized scope when provenance is uncertain.
4. Run the existing product through its primary user workflows only in an isolated test profile, staging copy, or disposable local environment using fictional fixtures. If safe isolation is unavailable, keep discovery read-only and report the untested workflows.
5. Inspect all secondary reference implementations.
6. Identify secrets, private data, databases, exports, recordings, caches, generated output, local environment files, and ignored artifacts.
7. Record current functionality, unfinished behavior, known failures, and unsupported claims.
8. Identify the current data model and every persistence location.
9. Identify all old-platform dependencies.
10. Locate licenses and provenance for source code, fonts, icons, media, designs, and third-party component references. Mark anything whose reuse or modification rights are unknown.

Useful read-only commands, or their equivalents:

```sh
git status --short --branch
git log --oneline -5
git remote -v
rg --files
rg -l -i "fetch|XMLHttpRequest|localStorage|indexedDB|serviceWorker|nonce|token|password"
find . -type f -size +5M -print
```

Use filename-only output or a purpose-built secret scanner for credential patterns. Do not print suspected credential values into tool logs or reports.

Required discovery output:

- feature inventory;
- primary user-flow map;
- architecture summary;
- platform-dependency list;
- data/privacy inventory;
- source-precedence statement;
- risks and unknowns;
- recommendation to adapt, rebuild a boundary, or defer.

### Discovery gate

No implementation begins until the AI can explain where the current behavior lives and which files are authoritative. If the user requested proposal approval before implementation, stop here and wait.

## 8. Create a Product Contract

The product contract is a short, testable description of what must survive the adaptation.

Record:

- primary user and job-to-be-done;
- dominant first action;
- canonical navigation and workflows;
- required data fields and provenance;
- privacy and security promises;
- accessibility requirements;
- supported device and viewport range;
- backup, recovery, and deletion behavior;
- required offline behavior;
- deliberately unsupported capabilities;
- wording that must not overstate the product.

Each contract statement should be verifiable. Replace “secure” with the exact protection. Replace “works offline” with the exact workflows available without a network.

## 9. Build a Reuse Matrix

Classify every important artifact or behavior as one of:

- **Reuse unchanged**
- **Reuse with adaptation**
- **Rewrite platform boundary**
- **Defer**
- **Discard with justification**

Template:

| Artifact or behavior | Source path | Current role | Decision | Rights/license | Required adaptation | Risk | Verification |
|---|---|---|---|---|---|---|---|
| Data model | `…` | Record schema | Reuse with adaptation | Project-owned | Rename domain fields | Migration errors | Contract tests |
| App controller | `…` | UI orchestration | Reuse with adaptation | Project-owned | Replace network calls | State regressions | Browser workflows |
| Authentication | `…` | Host login | Rewrite boundary | Project-owned | Local vault or new identity provider | Data exposure | Lock/sign-in tests |
| Styling | `…` | Visual system | Reuse with adaptation | Verify fonts/assets | Responsive fixes | Overflow | Desktop/mobile tests |
| Native-only API | `…` | Transcription | Defer | Platform terms | Preserve schema seam | Missing capability | Documented limitation |

The reuse matrix is the main defense against accidental rewrites.

Do not copy or modify an artifact whose reuse rights remain unknown. Publicly accessible code or media is not automatically licensed for reuse.

## 10. Propose the Target Architecture

Before implementation, document:

- canonical target directory;
- entry point and bootstrap;
- domain/core layer;
- persistence adapter;
- encryption or authentication boundary;
- UI/controller layer;
- attachment/media strategy;
- asset and design-token strategy;
- test organization;
- PWA/offline layer, when applicable;
- deployment configuration;
- backup, restore, migration, and deletion behavior;
- explicitly deferred capabilities.

Prefer narrow boundaries:

```text
UI and workflows
        ↓
Domain rules and versioned data model
        ↓
Storage interface
        ↓
Target-specific persistence
```

A host REST adapter can be replaced by IndexedDB without rewriting search, normalization, interpretation logic, or the entire interface.

### Architecture gate

The architecture is acceptable only when:

- every old-platform dependency has an explicit disposition;
- the target can run without importing files from the old implementation at runtime;
- tests for the target can run without the old implementation beside it;
- phase scope and deferred scope are both written;
- new dependencies have written justification.

## 11. Plan Stable Phases

Each phase must be independently useful and testable.

Recommended sequence:

1. **Foundation:** shell, navigation, bootstrap, schema, storage, and security boundary.
2. **Core workflows:** create, view, edit, delete, and search.
3. **Recovery:** drafts, reload persistence, import/export, corruption handling, and concurrency.
4. **Secondary value:** patterns, analytics, interpretations, and settings.
5. **Installability and delivery:** manifest, service worker, icons, headers, and deployment configuration.
6. **Deferred enhancements:** synchronization, accounts, external AI, richer analytics, and platform-only integrations.

For every phase define:

- included features;
- explicit exclusions;
- acceptance criteria;
- required automated and browser tests;
- known risks;
- stop condition.

Do not allow “Phase 1” to silently become the entire product roadmap.

## 12. Implementation Discipline

The AI should:

- create the target in a separate directory when preserving a reference;
- port one layer or workflow at a time;
- keep stable identifiers and schema compatibility where useful;
- replace platform calls behind narrow interfaces;
- avoid copying dead platform code;
- keep the target self-contained;
- preserve semantic HTML, keyboard access, focus behavior, and responsive layouts;
- avoid speculative abstractions and unused dependencies;
- run syntax and targeted tests after each meaningful change;
- record intentional deviations from the source;
- preserve the original application and unrelated user work.

When UI component registries or design libraries are available, use them as structural and visual references only when their terms permit it. Record licenses and attribution requirements. Do not install a React, Tailwind, animation, or component dependency into a vanilla application merely because a sample component uses it.

## 13. Data, Privacy, and Security Gate

First classify application data as public, personal, confidential, regulated, or unknown. Apply only promises that the implementation can support.

For applications handling private local data, verify:

- no credentials, `.env` files, private records, recordings, exports, or recovery files enter Git;
- schemas and export formats are explicitly versioned;
- record identifiers remain stable;
- raw source, user-edited content, user reflections, and generated content remain distinguishable where provenance matters;
- passphrases and raw keys are not persisted;
- established platform cryptography is used rather than custom algorithms;
- unique IVs/nonces and appropriate key derivation are used;
- saved data, drafts, and attachments receive equivalent protection;
- locking and deletion remove decrypted content from application state and the DOM, stop media tracks, revoke object URLs, release app-owned blobs/buffers, clear app-owned clipboard-sensitive state where possible, and prevent late asynchronous results from restoring plaintext;
- long-running asynchronous work is bound to a session generation or equivalent authority check that is invalidated by lock, account change, replacement, and deletion;
- background/automatic locking fails closed;
- storage writes resolve only after transaction completion;
- stale tabs cannot overwrite a newer record or delete a replacement vault;
- destructive actions report partial failure honestly;
- local caches contain only public application resources;
- backup limitations and loss risks are documented;
- losing a passphrase or clearing site data has clear consequences.

Do not describe an application as private, encrypted, durable, synchronized, or recoverable until each applicable behavior is tested.

For regulated or high-risk data, require a dedicated security review. A reference application's encryption implementation is not a substitute for compliance analysis.

For account-backed, server-backed, shared, or synchronized applications, require a separate server threat-model gate. Verify:

- authentication and object-level authorization on every protected operation;
- tenant and user isolation in queries, storage paths, exports, and background jobs;
- API secrets remain server-side and never enter client bundles or Git;
- session cookies or tokens use appropriate lifetime, rotation, revocation, secure transport, and browser protections;
- CSRF and CORS policies match the actual client/server trust boundary;
- request bodies, filenames, uploads, content types, sizes, and parsed data are validated server-side;
- rate limiting and abuse controls protect authentication, exports, uploads, and expensive operations;
- logs, telemetry, error reports, queues, and backups do not expose private content unnecessarily;
- retention, account deletion, attachment deletion, and backup deletion behavior are defined and tested;
- synchronization conflicts cannot silently overwrite newer client or server data;
- server backup restoration, schema migration, and disaster recovery are tested;
- third-party processors and data residency are disclosed where relevant.

Do not reuse the local-only threat model as evidence that a server-backed product is secure.

## 14. PWA Gate

For a PWA, verify:

- the application is served through HTTPS or localhost, not `file://`;
- the manifest has a stable ID, name, short name, start URL, scope, display mode, theme/background colors, and valid icons;
- all install resources are same-origin or deliberately permitted;
- the service worker caches only a fixed public shell;
- private records, drafts, recordings, exports, and arbitrary responses never enter Cache Storage;
- shell cache versions change when deployed assets change;
- a new cache version bypasses stale HTTP cache content during installation;
- older application-shell caches are removed safely;
- offline behavior is tested after the server or network is actually unavailable;
- update and first-install limitations are documented;
- the deployment root matches manifest, service-worker, and asset paths;
- security headers and a restrictive Content Security Policy are configured;
- permission-based capabilities are tested on the real target device.

## 15. Testing and Acceptance Gate

### Automated tests

Test the applicable contracts:

- domain normalization and schema validation;
- version/migration rejection or handling;
- create/read/update/delete persistence;
- encryption round trips, wrong-passphrase failure, and tamper rejection;
- unique encryption nonces/IVs;
- draft creation, recovery, conflict, and deletion;
- attachment/audio encryption and identity binding;
- import/export compatibility;
- search, filtering, analysis, and generated-output behavior;
- safe HTML rendering;
- service-worker and manifest contracts;
- stale-write, stale-delete, and multi-window conflicts;
- absence of old-platform runtime coupling.

Tests for a self-contained target must resolve only files inside that target.

### Real-browser workflows

Exercise the product as a user would:

- first-run setup;
- create, view, edit, and delete;
- reload persistence;
- lock and unlock;
- draft recovery after interruption;
- search and filters;
- secondary views;
- import/export;
- desktop viewport;
- approximately 390-pixel mobile viewport;
- keyboard, focus, dialog, and reduced-motion behavior;
- offline reload after one online visit;
- console errors, warnings, and failed requests.

A screenshot is not a workflow test. Page rendering is not persistence testing.

### Physical-device checks

Test microphone, camera, installation, background behavior, safe-area layout, storage eviction behavior, and other platform permissions on the actual target device. If the AI cannot perform a physical-device test, report it as outstanding rather than passed.

### Evidence format

For every verification report, record:

| Test | Environment | Result | Evidence or limitation |
|---|---|---|---|
| Create/edit/delete | Desktop browser | Pass/Fail | Exact workflow |
| Mobile layout | 390 × 844 browser | Pass/Fail | Overflow and navigation |
| Offline shell | Server stopped | Pass/Fail | Cached shell behavior |
| Microphone | Physical device | Not run | Requires target hardware |

## 16. Git Release Gate

Before staging:

1. Run `git status` and inspect every path.
2. Confirm reference/source directories are unchanged.
3. Scan for secrets and private data.
4. Review temporary files, caches, databases, exports, recordings, screenshots, browser profiles, test output, and local deployment metadata.
5. Update `.gitignore` only when a real or predictable local artifact is not already covered.
6. Run tests, syntax checks, and configuration parsing.
7. Run a whitespace/diff integrity check.
8. Stage explicit intended paths rather than staging the entire repository indiscriminately.
9. Inspect the staged file list and staged diff.
10. Commit with the exact requested message.
11. Verify the commit hash and working-tree state.
12. Do not push or deploy without separate authorization.

Recommended ignore categories:

- environment and key files;
- dependencies and package caches;
- build, coverage, and test output;
- browser automation output;
- local deployment metadata;
- databases and SQL dumps;
- backups, exports, recordings, and private recovery files;
- OS and editor metadata.

## 17. Handoff Protocol Between AI Systems

Every AI system must finish with an evidence-based handoff containing:

- objective and approved scope;
- canonical application directory;
- source-precedence decisions;
- product and security invariants;
- files created;
- files reused unchanged;
- files adapted;
- platform boundaries rewritten;
- dependencies removed and introduced;
- reference implementations confirmed unchanged;
- automated test results with counts;
- browser/device workflows tested;
- known limitations and deferred features;
- deployment readiness;
- Git branch, commit hash, remote, and working-tree state;
- whether anything was pushed or deployed;
- exact next recommended action.

Use this compact continuation block when moving work to another AI:

```text
PROJECT:
REPOSITORY / BRANCH / HEAD:
CANONICAL TARGET DIRECTORY:
CURRENT OBJECTIVE:
SOURCE PRECEDENCE:
VERIFIED WORKING BEHAVIOR:
FILES CHANGED:
TESTS PASSED:
SECURITY / DATA INVARIANTS:
KNOWN LIMITATIONS:
DEFERRED FEATURES:
UNCOMMITTED OR UNPUSHED WORK:
BLOCKERS:
NEXT EXACT ACTION:
DO NOT CHANGE:
```

The receiving AI must verify this block against the repository before trusting it.

## 18. Forking the Dream Atlas Foundation Into a Fresh App

Dream Atlas demonstrates a reusable, dependency-free vanilla PWA structure:

```text
standalone/
├── index.html
├── manifest.webmanifest
├── service-worker.js
├── vercel.json
├── README.md
├── package.json
├── assets/
│   ├── css/dream-atlas.css
│   ├── icons/
│   └── js/
│       ├── dream-atlas-core.js
│       ├── dream-atlas-store.js
│       └── dream-atlas-app.js
└── tests/
    ├── core-contract.test.js
    ├── store-contract.test.js
    └── pwa-contract.test.js
```

### What may be reused as a technical pattern

- dependency-free HTML/CSS/JavaScript delivery;
- separation between domain core, persistence, and UI orchestration;
- root-scoped CSS and responsive layout conventions;
- IndexedDB transaction-completion and optimistic-concurrency patterns;
- secure-context capability gates;
- versioned schema and backup contracts;
- draft recovery and cross-window conflict handling;
- public-shell-only service-worker strategy;
- manifest, install metadata, security-header structure, and static deployment configuration;
- dependency-free contract-test organization;
- accessible navigation, modal, confirmation, focus, and mobile-bottom-navigation patterns.

### What must be replaced for a different product

- Dream Atlas name, copy, icons, visual identity, and product language;
- storage database names;
- broadcast-channel names;
- service-worker cache prefix;
- schema names, fields, limits, and migrations;
- backup/export format identifiers and downloaded filenames;
- demo data and test fixtures;
- interpretations, pattern logic, and domain-specific business rules;
- navigation destinations and workflows;
- microphone/audio permissions if the new product does not require them;
- Content Security Policy and permissions policy when runtime needs differ;
- README, deployment instructions, and privacy disclosures.

### What must be reconsidered, not copied automatically

- whether local encryption is necessary and what threat model it serves;
- whether local-only persistence meets the product goal;
- whether IndexedDB eviction risk is acceptable;
- whether attachments belong in a separate encrypted store;
- whether a service worker adds enough value;
- whether a backend, account system, or synchronization is now required;
- whether vanilla JavaScript remains appropriate at the expected scale;
- whether the product handles regulated or shared data.

### Fresh-app fork checklist

1. Create a new target directory or repository; preserve the Dream Atlas reference.
2. Write the new product contract and source-precedence table.
3. Build the reuse matrix before copying files.
4. Copy only approved foundation files.
5. Rename every global, database, cache, channel, export, manifest, package, and download identifier.
6. Replace all product copy, branding, icons, domain data, and fixtures.
7. Rewrite the core schema and tests together.
8. Keep storage APIs domain-neutral or adapt them deliberately.
9. Remove unused permissions, media logic, views, styles, and security-policy allowances.
10. Search the new target for reference-product names and identifiers.
11. Rebuild the test matrix around the new product contract.
12. Run fresh first-install, update, persistence, mobile, offline, privacy, and deployment tests.

Never ship a renamed clone whose internal identifiers, fixtures, exports, or privacy statements still describe the reference product.

## 19. Dream Atlas Reference Architecture

Dream Atlas used this source precedence:

| Source | Role |
|---|---|
| WordPress vanilla frontend | Primary browser implementation and visual base |
| Native SwiftUI Dream Atlas | Feature, data-model, capture, recovery, and UX reference |
| Existing web tests | Core behavior and WordPress compatibility contract |
| New standalone specification | Canonical PWA architecture and Phase 1 boundary |

The standalone version did not rewrite the product. It retained and adapted the browser core, app controller, CSS, icon, data model, encryption format, interpretation system, and tests. It replaced WordPress PHP bootstrap, authentication, REST persistence, nonce handling, server revisions, and remote-sync assumptions with local IndexedDB storage, a local encrypted vault, encrypted drafts, separately encrypted recordings, and a static PWA shell.

### Reference baseline

At the time this SOP was written:

- canonical PWA directory: `standalone/`;
- reference commit: `ceb2b88` (`Add standalone Dream Atlas PWA`);
- standalone contracts: 38 passing tests;
- legacy core/WordPress contracts: 21 passing tests;
- service-worker shell version: `dream-atlas-public-shell-v6`.

These values are a provenance snapshot, not permanent truth. A receiving AI must inspect the current commit and rerun the current tests.

Current module responsibilities:

| Module | Responsibility |
|---|---|
| `assets/js/dream-atlas-core.js` | Versioned schema, normalization, search, patterns, deterministic interpretation, encryption, backups, escaping |
| `assets/js/dream-atlas-store.js` | IndexedDB vault/draft persistence, validation, conditional writes/deletes, storage persistence request |
| `assets/js/dream-atlas-app.js` | Bootstrap, state, rendering, forms, dialogs, capture/audio, lock/unlock, import/export, conflict recovery |
| `assets/css/dream-atlas.css` | Scoped visual system, responsive behavior, mobile navigation, dialogs, focus, reduced motion |
| `service-worker.js` | Versioned cache of the fixed public application shell only |
| `manifest.webmanifest` | Installation identity and icon metadata |
| `vercel.json` | Static hosting and security headers |
| `tests/` | Self-contained domain, storage, concurrency, privacy, and PWA contracts |

### Dream Atlas data and storage contract

The versioned dream model retains stable IDs and timestamps; title and remembered text; optional raw transcript, waking context, sleep notes, associations, and reflection; people, places, emotions, symbols, and tags; vividness and intensity; a lucidity level; nightmare, recurring, and significant flags; local interpretation; and an immutable audio-storage identifier. Some retained compatibility fields are not yet exposed in every screen. Do not delete them merely because a current form does not render them.

Dream Atlas-specific persistence uses:

- `DreamAtlasStandaloneV1` for the encrypted text vault and draft;
- `DreamAtlasStandaloneAudioV1` for encrypted recordings and audio-vault metadata;
- one active vault and one active draft record;
- separate immutable recording IDs, allowing a recording to be replaced without letting a stale operation target its successor;
- vault saves compared against the expected current vault IV;
- draft saves and deletes compared against the expected draft IV, with draft saves also bound to the exact source vault ID and IV;
- audio-vault identity and tombstone metadata to prevent stale-tab resurrection.

Dream Atlas-specific encryption uses Web Crypto AES-256-GCM and PBKDF2-HMAC-SHA-256 with 600,000 iterations. A vault receives a random 16-byte salt when created; later vault saves and encrypted drafts intentionally reuse that vault salt while always generating a fresh 12-byte IV. Each audio encryption receives its own random salt and fresh IV. Vault and audio records use purpose-specific authenticated additional data. These values document compatibility with the current format; a different product must review its own threat model rather than treating these parameters as universal compliance guidance.

Dream Atlas text-vault exports do not contain recordings. Recordings require separate encrypted exports from each dream. Clearing site data can remove both text and audio stores, so backup and restoration must be tested with fictional data before relying on the journal.

The application locks after 15 minutes of inactivity or five minutes in the background. Draft preservation is attempted before teardown, and the interface remains privacy-covered if an automatic lock must retry encrypted draft storage.

### UX and tool-selection method

The Dream Atlas build used component registries as design and interaction research, not as automatic dependencies. Dialog/drawer, alert-dialog, mobile navigation, search/filter, progressive-capture, toast/status, and chart-card patterns were translated into the existing vanilla DOM/CSS system. Browser automation exercised actual workflows at desktop and mobile widths. This is the preferred rule for future forks: borrow the behavior and accessibility contract unless the referenced component's framework is already justified for the target.

Non-negotiable Dream Atlas invariants include:

- the WordPress version remains independently usable and unchanged;
- no runtime WordPress dependency exists in `standalone/`;
- private records are not stored in localStorage or Cache Storage;
- the passphrase is never persisted; it exists only transiently during entry and in runtime memory while unlocked;
- vaults, drafts, and recordings are encrypted before persistence;
- drafts are tied to the exact source vault version;
- stale tabs cannot overwrite or delete newer data;
- Delete Everything is bound to the exact selected vault ID and IV;
- the service worker caches only same-origin public shell assets;
- target tests remain runnable when `standalone/` is copied by itself;
- physical-device microphone and installation checks are reported separately from browser automation.

## 20. Common Failure Modes

Reject or correct an AI implementation that:

- starts coding before inspecting references;
- rebuilds familiar features instead of reusing working code;
- changes the reference during migration without permission;
- leaves hidden imports or runtime calls to the old platform;
- introduces a framework or backend without a demonstrated need;
- expands the approved phase into a full-product rewrite;
- creates target tests that rely on the old source tree;
- stores passphrases or plaintext private records in browser storage;
- caches private data in the service worker;
- ignores transaction completion or concurrent-tab behavior;
- lets stale tabs overwrite or delete newer data;
- silently discards unsaved drafts during lock, replacement, or conflict;
- claims offline support while the server is still reachable;
- claims mobile support based only on a screenshot;
- claims physical-device behavior from desktop emulation;
- ships reference names, identifiers, demo content, or privacy statements in a new product;
- stages caches, exports, databases, recordings, secrets, or local deployment metadata;
- reports “all tests passed” without counts and tested workflows;
- pushes or deploys because a commit was requested.

## 21. Copy-Ready Opening Prompt for Another AI System

Replace bracketed values before use:

```text
Act as a reference-led application engineer.

Goal:
Build [NEW PRODUCT] as a [WEBSITE / WEB APP / PWA / NATIVE APP] for [TARGET USERS AND PLATFORM]. Use [PRIMARY REFERENCE PATH] as the implementation foundation and [SECONDARY REFERENCE PATHS] as feature, data-model, or UX references.

Non-negotiable instructions:
- Do not rewrite the product or foundation from scratch.
- Preserve [REFERENCE DIRECTORIES] unchanged.
- Inspect the repository and run the existing workflows before editing.
- Classify every major component as reuse unchanged, reuse with adaptation, rewrite platform boundary, defer, or discard with justification.
- Select and state Route A, B, or C from this SOP. If the target remains the same product, preserve its identity and compatibility identifiers unless the new specification explicitly changes them, regardless of route. Replace reference-product names, identifiers, data, branding, exports, and permissions only when creating a different product or deliberate fork.
- Do not introduce a framework, backend, package, or external service without a concrete technical reason.
- Implement only [PHASE NAME AND SCOPE].
- Do not commit, push, deploy, delete, or modify external systems unless separately authorized.

Before changing files, provide:
1. Repository and history findings.
2. Feature and user-flow inventory.
3. Source-precedence table.
4. Product contract.
5. Reuse matrix.
6. Target architecture.
7. Phase plan with exclusions and acceptance criteria.
8. Data/privacy risks.
9. Test plan.

Implementation requirements:
[INSERT REQUIRED FEATURES, DATA MODEL, SECURITY, PWA, ACCESSIBILITY, AND DEPLOYMENT REQUIREMENTS]

Validation requirements:
- Run all existing and new automated tests.
- Test create/view/edit/delete, persistence, recovery, and search as applicable.
- Test desktop and approximately 390px mobile widths.
- Test offline behavior with the server or network unavailable if this is a PWA.
- Report physical-device checks separately.
- Verify the target is self-contained and has no unintended runtime dependency on the reference.

Final report:
- Files created, reused, adapted, and rewritten.
- Reference files confirmed unchanged.
- Dependencies removed and introduced.
- Privacy/security decisions.
- Deferred features and known limitations.
- Automated test counts and browser/device results.
- Deployment readiness.
- Git status, commit hash, and whether anything was pushed or deployed.
```

## 22. Definition of Done

The phase is complete only when:

- the approved user workflows work in the target environment;
- the target is self-contained;
- reference implementations remain unchanged unless authorized;
- the reuse matrix matches the delivered code;
- automated and browser tests pass or failures are documented;
- privacy and offline claims match observed behavior;
- accessibility and mobile layouts have been exercised;
- documentation explains setup, storage, backup, limitations, and deployment;
- no secrets, private data, or local artifacts are staged;
- Git status and release actions are reported accurately;
- deferred work is explicit enough for another AI system to continue without reconstructing the project history.
