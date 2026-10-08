/* Vehicle spec contract.
 *
 * This is a REGRESSION GUARD, not a style check.
 *
 * An earlier knowledge base for this truck described it as a TRD Pro. It is a
 * TRD Sport. Three of those Pro values are actively harmful if a future edit
 * reintroduces them:
 *
 *   - rear diff filled to the locking-diff volume (~4 qt) OVERFILLS an open diff
 *   - FOX shock part numbers order hardware this truck does not have
 *   - spark plug 90919-01287 is the 2.7L four-cylinder plug
 *
 * These tests fail the build if any of them come back. Do not weaken them
 * without reading docs/PRODUCT_CONTRACT.md first.
 */

const fs = require("fs");
const path = require("path");
const { suite, test, assert, assertIncludes, assertExcludes } = require("./harness");

const ROOT = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(ROOT, "src", "app.jsx"), "utf8");
const bundle = fs.readFileSync(path.join(ROOT, "assets", "js", "app.js"), "utf8");

suite("Trim identity");

test("the app identifies the truck as a TRD Sport", () => {
  assertIncludes(source, "2019 Tacoma TRD Sport", "trim label missing");
});

test("no screen claims this is a TRD Pro", () => {
  // "TRD Pro" may appear only inside an explicit contrast/warning sentence.
  const hits = [...source.matchAll(/.{90}TRD Pro.{60}/gs)].map((m) => m[0]);
  for (const hit of hits) {
    const isWarning = /NOT|not a|never|Off-Road\/Pro|LOCKING diff|do NOT|Pro\)/i.test(hit);
    assert(isWarning, "unqualified TRD Pro claim: ..." + hit.trim() + "...");
  }
});

test("carries this truck's VIN so the AI answers about the right vehicle", () => {
  assertIncludes(source, "3TMCZ5AN4KM264896", "VIN missing from the system prompt");
});

suite("Rear differential — overfill guard");

test("states the open-diff capacity", () => {
  assert(
    /~?3\.1\s*qt/.test(source) && /OPEN/i.test(source),
    "open rear diff capacity (~3.1 qt) not stated"
  );
});

test("does not present the locking-diff volume as this truck's fill", () => {
  // The 4 qt figure may appear only as an explicit warning about the wrong value.
  const hits = [...source.matchAll(/.{80}4\.[02]\s*qt.{80}/gs)].map((m) => m[0]);
  for (const hit of hits) {
    assert(
      /LOCKING|OVERFILL|Off-Road|not|NOT/i.test(hit),
      "unqualified 4 qt rear diff figure: ..." + hit.trim() + "..."
    );
  }
});

test("the old ambiguous '3.1-4.2 qt' range is gone", () => {
  assertExcludes(source, "3.1–4.2 qt", "ambiguous rear diff range restored");
  assertExcludes(source, "3.1-4.2qt", "ambiguous rear diff range restored");
});

test("warns that no friction modifier is needed for an open diff", () => {
  assertIncludes(source, "friction modifier", "friction modifier guidance missing");
});

suite("Spark plugs — wrong part number guard");

test("specifies 90919-01263 as the part to buy", () => {
  assertIncludes(source, "90919-01263", "correct spark plug PN missing");
});

test("the 4-cylinder plug number never appears as a recommendation", () => {
  const hits = [...source.matchAll(/.{80}90919-01287.{80}/gs)].map((m) => m[0]);
  assert(hits.length > 0, "expected 90919-01287 to appear as an explicit warning");
  for (const hit of hits) {
    assert(
      /NOT|4-cyl|4-cylinder|wrong|2\.7L/i.test(hit),
      "90919-01287 appears without a warning: ..." + hit.trim() + "..."
    );
  }
});

test("uses the 120k V6 interval, not the 60k four-cylinder interval", () => {
  assertIncludes(source, "interval:120000", "spark plug interval not corrected");
});

test("tells the user not to re-gap iridium plugs", () => {
  assert(/do NOT re-gap/i.test(source), "re-gap warning missing");
});

suite("Absent hardware — do-not-diagnose guard");

test("tells the AI this truck has no locker, no Crawl Control and no MTS", () => {
  assertIncludes(source, "WHAT THIS TRUCK DOES NOT HAVE", "absent-hardware block missing");
  assert(/NO electronically locking rear differential/i.test(source), "locker not excluded");
  assert(/NO Crawl Control/i.test(source), "Crawl Control not excluded");
  assert(/NO Multi-Terrain Select/i.test(source), "MTS not excluded");
});

test("names the correct Hitachi/Tokico shock part numbers", () => {
  assertIncludes(source, "48510-04222", "front strut PN missing");
  assertIncludes(source, "48530-04101", "rear shock PN missing");
});

test("never presents FOX shocks as fitted to this truck", () => {
  const hits = [...source.matchAll(/.{80}FOX.{80}/gs)].map((m) => m[0]);
  for (const hit of hits) {
    assert(/NO FOX|not|NOT/i.test(hit), "unqualified FOX shock reference: ..." + hit.trim() + "...");
  }
});

suite("Unresolved specs are labelled");

test("leaf spring U-bolt torque is marked unverified rather than stated flatly", () => {
  assert(
    /UNVERIFIED|unresolved/i.test(source),
    "leaf spring U-bolt torque must not be presented as settled"
  );
});

suite("Build freshness");

test("the committed bundle was built from the current source", () => {
  // Spot-check identifying strings so a stale bundle cannot ship with fresh source.
  for (const marker of ["90919-01263", "3TMCZ5AN4KM264896", "WHAT THIS TRUCK DOES NOT HAVE", "claude-sonnet-5-5", "tacoma-world-backup"]) {
    assertIncludes(
      bundle,
      marker,
      "assets/js/app.js is stale — run `npm run build` after editing src/app.jsx"
    );
  }
});

suite("Privacy");

test("no API key is hardcoded anywhere in the source or bundle", () => {
  for (const [label, text] of [["src/app.jsx", source], ["assets/js/app.js", bundle]]) {
    assert(!/sk-ant-[A-Za-z0-9_-]{10,}/.test(text), "an API key is committed in " + label);
  }
});

test("the key is read from local device storage, not embedded", () => {
  assertIncludes(source, 'localStorage.getItem("taco-apikey")', "key should come from device storage");
});
