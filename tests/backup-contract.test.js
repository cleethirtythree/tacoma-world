/* Service log durability contract.
 *
 * Two devices (phone + cyberdeck) each keep their own log, and neither has a server.
 * The backup file is the only bridge between them, so the merge must be safe in both
 * directions: never delete, never let an older record overwrite a newer one, never
 * import junk, and never carry the API key.
 */

const fs = require("fs");
const path = require("path");
const { suite, test, assert, assertEqual, assertExcludes } = require("./harness");
const { extractFunction } = require("./extract");

const ROOT = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(ROOT, "src", "app.jsx"), "utf8");

const mergeBackup = extractFunction(source, "mergeBackup");
const buildBackup = extractFunction(source, "buildBackup");
const describeLog = extractFunction(source, "describeLog");
const getStatus = extractFunction(source, "getStatus");

const IDS = ["oil", "plugs", "coolant"];
const here = {
  mileage: 128342,
  logs: { oil: { mileage: 125000, date: "2026-07-01T00:00:00.000Z" }, plugs: { mileage: 0, date: null, baseline: true } },
};
const file = (logs, mileage = 0) => ({ app: "tacoma-world", version: 1, mileage, logs });

suite("Backup — export");

test("a backup carries mileage and the log, and nothing else", () => {
  const b = buildBackup(128342, here.logs);
  assertEqual(Object.keys(b).sort().join(","), "app,exportedAt,logs,mileage,version", "backup fields");
});

test("the backup never reads the API key", () => {
  const start = source.indexOf("function buildBackup");
  const body = source.slice(start, source.indexOf("\n}", start));
  assertExcludes(body, "apikey", "buildBackup must not touch the key");
  assertExcludes(body, "apiKey", "buildBackup must not touch the key");
});

suite("Backup — import merge");

test("rejects a file that is not a Tacoma World backup", () => {
  for (const bad of [null, {}, { app: "dream-atlas", logs: {} }, { app: "tacoma-world" }]) {
    let threw = false;
    try { mergeBackup(here, bad, IDS); } catch (e) { threw = true; }
    assert(threw, "accepted " + JSON.stringify(bad));
  }
});

test("adds records this device does not have", () => {
  const r = mergeBackup(here, file({ coolant: { mileage: 127000, date: "2026-06-01T00:00:00.000Z" } }), IDS);
  assertEqual(r.logs.coolant.mileage, 127000);
  assertEqual(r.added, 1);
});

test("a newer record replaces an older one", () => {
  const r = mergeBackup(here, file({ oil: { mileage: 130000, date: "2026-09-01T00:00:00.000Z" } }), IDS);
  assertEqual(r.logs.oil.mileage, 130000);
  assertEqual(r.updated, 1);
});

test("an older record never overwrites a newer one", () => {
  const r = mergeBackup(here, file({ oil: { mileage: 120000, date: "2026-01-01T00:00:00.000Z" } }), IDS);
  assertEqual(r.logs.oil.mileage, 125000);
  assertEqual(r.updated, 0);
});

test("never deletes a record missing from the file", () => {
  const r = mergeBackup(here, file({}), IDS);
  assertEqual(Object.keys(r.logs).sort().join(","), "oil,plugs");
});

test("drops unknown task ids and invalid mileages", () => {
  const r = mergeBackup(here, file({
    turbo: { mileage: 1 },
    coolant: { mileage: -5 },
    oil: { mileage: "999999" },
  }), IDS);
  assert(!r.logs.turbo, "unknown task imported");
  assert(!r.logs.coolant, "negative mileage imported");
  assertEqual(r.logs.oil.mileage, 125000, "string mileage should be ignored");
});

test("current mileage only ever moves forward", () => {
  assertEqual(mergeBackup(here, file({}, 129000), IDS).mileage, 129000);
  assertEqual(mergeBackup(here, file({}, 90000), IDS).mileage, 128342);
});

suite("Baseline capture");

test("'never done' at 0 mi makes past-due plugs show as overdue", () => {
  const s = getStatus({ interval: 120000 }, 128342, here.logs.plugs);
  assertEqual(s.label, "8,342 mi overdue");
});

test("a baseline reads as factory original, not as a date of 1970", () => {
  assertEqual(describeLog({ mileage: 0, date: null, baseline: true }), "factory original");
});

test("a past-service entry without a date says so instead of 'Invalid Date'", () => {
  const text = describeLog({ mileage: 98000, date: null, baseline: true });
  assert(/98,000 mi/.test(text) && /date not recorded/.test(text), text);
});
