/* Schedule logic contract.
 *
 * getStatus() is the only real domain rule in the product: it turns
 * (current mileage, last-done record) into ok / due / overdue.
 *
 * The function is not exported — it lives inside the React module — so it is
 * extracted from source and evaluated here. That is deliberate: it keeps the
 * app a single file while still allowing the rule to be tested in isolation.
 */

const fs = require("fs");
const path = require("path");
const { suite, test, assert, assertEqual } = require("./harness");

const ROOT = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(ROOT, "src", "app.jsx"), "utf8");

// Pull `function getStatus(...) { ... }` out of the module and evaluate it standalone.
const start = source.indexOf("function getStatus");
assert(start !== -1, "getStatus not found in src/app.jsx");
let depth = 0,
  end = -1;
for (let i = source.indexOf("{", start); i < source.length; i++) {
  if (source[i] === "{") depth++;
  else if (source[i] === "}") {
    depth--;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}
assert(end !== -1, "could not find the end of getStatus");

// eslint-disable-next-line no-new-func
const getStatus = new Function(source.slice(start, end) + "; return getStatus;")();

const TASK = { interval: 5000 };
const MANUAL = { interval: 0 };

suite("Schedule status logic");

test("a task with no interval is always a manual check", () => {
  assertEqual(getStatus(MANUAL, 128342, { mileage: 100000 }).status, "manual");
});

test("without a mileage reading, nothing can be judged", () => {
  assertEqual(getStatus(TASK, 0, { mileage: 100000 }).status, "unknown");
  assertEqual(getStatus(TASK, 0, { mileage: 100000 }).label, "Set mileage");
});

test("well inside the interval reads ok, with distance remaining", () => {
  const s = getStatus(TASK, 101000, { mileage: 100000 });
  assertEqual(s.status, "ok");
  assertEqual(s.label, "4,000 mi left");
});

test("at 80% of the interval it flips to due", () => {
  assertEqual(getStatus(TASK, 104000, { mileage: 100000 }).status, "due");
});

test("just under 80% is still ok — the boundary is not off by one", () => {
  assertEqual(getStatus(TASK, 103999, { mileage: 100000 }).status, "ok");
});

test("past the full interval it reads overdue, by the right amount", () => {
  const s = getStatus(TASK, 106500, { mileage: 100000 });
  assertEqual(s.status, "overdue");
  assertEqual(s.label, "1,500 mi overdue");
});

test("exactly at the interval is overdue by zero, not ok", () => {
  assertEqual(getStatus(TASK, 105000, { mileage: 100000 }).status, "overdue");
});

suite("Known gap: no baseline means no tracking");

/* DOCUMENTED LIMITATION, not a bug to fix casually.
 *
 * With mileage set but no service history, EVERY task reports "No record" —
 * including ones that are genuinely past due. On a fresh install at 128,342 mi
 * the Schedule tab therefore shows nothing as overdue, even though spark plugs
 * are ~8,000 mi past their 120k interval.
 *
 * The app cannot compute this: it knows the interval but not when the work was
 * last done. Until a baseline is recorded per task, "past due" information
 * reaches the user only through the interval label and the AI assistant.
 *
 * Changing this is a product decision (seed baselines? ask on first run?),
 * tracked in docs/PHASE_PLAN.md Phase 3. This test pins the CURRENT behavior so
 * a future change is deliberate rather than accidental. */

test("a task with no service record reads 'No record', even when past due", () => {
  const plugs = { interval: 120000 };
  const s = getStatus(plugs, 128342, null);
  assertEqual(s.status, "unknown");
  assertEqual(s.label, "No record");
});

test("once a baseline exists, the same task tracks normally", () => {
  const plugs = { interval: 120000 };
  const s = getStatus(plugs, 128342, { mileage: 0 });
  assertEqual(s.status, "overdue");
  assertEqual(s.label, "8,342 mi overdue");
});
