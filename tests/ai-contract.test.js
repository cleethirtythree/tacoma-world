/* AI Wrench contract.
 *
 * Cloud: the model ID must be one that still exists. claude-sonnet-4-20250514 was retired
 * on 2026-06-15; this app shipped with it hardcoded on 2026-08-11, so every chat failed and
 * no test noticed, because no test ever sent a message. These guards make a retired ID a
 * build failure instead of a silent outage.
 */

const fs = require("fs");
const path = require("path");
const { suite, test, assert, assertIncludes, assertExcludes } = require("./harness");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const source = read("src/app.jsx");
const bundle = read("assets/js/app.js");

// Retired per https://platform.claude.com/docs/en/about-claude/model-deprecations
// Add to this list when Anthropic retires another model; never remove from it.
const RETIRED_MODELS = [
  "claude-sonnet-4-20250514",
  "claude-opus-4-20250514",
  "claude-3-7-sonnet-20250219",
  "claude-3-5-sonnet-20241022",
  "claude-3-5-sonnet-20240620",
  "claude-3-5-haiku-20241022",
  "claude-3-haiku-20240307",
  "claude-3-opus-20240229",
  "claude-3-sonnet-20240229",
];

suite("Cloud AI — model ID");

test("no retired model ID appears in the source or the bundle", () => {
  for (const id of RETIRED_MODELS) {
    assertExcludes(source, id, "retired model in src/app.jsx");
    assertExcludes(bundle, id, "retired model in assets/js/app.js");
  }
});

test("the cloud model is defined once, as CLOUD_MODEL", () => {
  const defs = source.match(/const CLOUD_MODEL\s*=\s*"claude-[a-z0-9-]+"/g) || [];
  assert(defs.length === 1, "expected exactly one CLOUD_MODEL definition, found " + defs.length);
  assertIncludes(source, "model:CLOUD_MODEL", "the Anthropic request must use CLOUD_MODEL");
});

test("no other request hardcodes a Claude model string", () => {
  assert(!/model:\s*"claude-/.test(source), "a request hardcodes a model ID instead of CLOUD_MODEL");
});

suite("Cloud AI — conversation hygiene");

test("UI-only lines (greeting, error notices) are never sent to the model as history", () => {
  assertIncludes(source, "filter(m => !m.ui)", "history is not filtered");
  assertIncludes(source, 'role:"assistant", ui:true, content:"Ready.', "greeting is not marked UI-only");
});

test("an API error names its type instead of always blaming the key", () => {
  assertIncludes(source, "authentication_error", "error handling should distinguish a bad key");
});
