/* Minimal dependency-free test harness.
 * No jest, no mocha, no vitest — `node tests/run.js` and nothing else.
 * This keeps the repo runnable by any AI or person with only Node installed. */

const results = [];
let currentSuite = "";

function suite(name) {
  currentSuite = name;
}

function test(name, fn) {
  try {
    fn();
    results.push({ suite: currentSuite, name, ok: true });
  } catch (err) {
    results.push({ suite: currentSuite, name, ok: false, error: err.message });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "assertion failed");
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error((message || "not equal") + " — expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
  }
}

function assertIncludes(haystack, needle, message) {
  if (!String(haystack).includes(needle)) {
    throw new Error((message || "missing") + " — expected to find " + JSON.stringify(needle));
  }
}

function assertExcludes(haystack, needle, message) {
  if (String(haystack).includes(needle)) {
    throw new Error((message || "forbidden content present") + " — found " + JSON.stringify(needle));
  }
}

function report() {
  const passed = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);
  let lastSuite = null;

  for (const r of results) {
    if (r.suite !== lastSuite) {
      console.log("\n" + r.suite);
      lastSuite = r.suite;
    }
    console.log("  " + (r.ok ? "PASS" : "FAIL") + "  " + r.name);
    if (!r.ok) console.log("        " + r.error);
  }

  console.log("\n" + "-".repeat(60));
  console.log(passed.length + " passed, " + failed.length + " failed, " + results.length + " total");

  if (failed.length) process.exitCode = 1;
  return { passed: passed.length, failed: failed.length, total: results.length };
}

module.exports = { suite, test, assert, assertEqual, assertIncludes, assertExcludes, report };
