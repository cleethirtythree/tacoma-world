/* AI Wrench contract.
 *
 * Offline (cyberdeck): chat goes to a model on the same computer. It must never be
 * pointable at another machine, must carry the same corrected spec reference as the
 * cloud prompt, and must be told not to guess torque values.
 *
 * Cloud: the model ID must be one that still exists. claude-sonnet-4-20250514 was retired
 * on 2026-06-15; this app shipped with it hardcoded on 2026-08-11, so every chat failed and
 * no test noticed, because no test ever sent a message. These guards make a retired ID a
 * build failure instead of a silent outage.
 */

const fs = require("fs");
const path = require("path");
const { suite, test, assert, assertEqual, assertIncludes, assertExcludes } = require("./harness");
const { extractFunction } = require("./extract");

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

test("the greeting and error notices are never sent to the model as history", () => {
  assertIncludes(source, "const [msgs, setMsgs] = useState([])", "chat history must start empty; the greeting is rendered separately");
  assertIncludes(source, "filter(m => !m.ui)", "history is not filtered");
  assert((source.match(/ui:true, content:/g) || []).length >= 2, "error notices must be marked UI-only");
});

test("an API error names its type instead of always blaming the key", () => {
  assertIncludes(source, "authentication_error", "error handling should distinguish a bad key");
});

suite("Offline AI — stays on this device");

const isLoopbackEndpoint = extractFunction(source, "isLoopbackEndpoint");

test("accepts only this device's own addresses", () => {
  for (const ok of ["http://127.0.0.1:11434", "http://localhost:11434", "http://[::1]:11434", "https://localhost:8443/v1"]) {
    assert(isLoopbackEndpoint(ok), "rejected " + ok);
  }
});

test("rejects other machines, lookalike hosts and non-http schemes", () => {
  for (const bad of [
    "http://192.168.1.20:11434", "https://api.example.com", "http://localhost.evil.com:11434",
    "http://127.0.0.1.nip.io", "javascript:alert(1)", "file:///etc/passwd", "", "not a url",
  ]) {
    assert(!isLoopbackEndpoint(bad), "accepted " + bad);
  }
});

test("every offline request and launch parameter is checked against it", () => {
  const sendLocal = source.slice(source.indexOf("const sendLocal"), source.indexOf("const send = async"));
  assert(sendLocal.indexOf("isLoopbackEndpoint(base)") !== -1 &&
    sendLocal.indexOf("isLoopbackEndpoint(base)") < sendLocal.indexOf("fetch("), "sendLocal must check before fetching");
  assertIncludes(source, "if (ep && isLoopbackEndpoint(ep))", "launch parameter endpoint not checked");
});

test("the production CSP still allows only Anthropic, so the phone can't reach a local port", () => {
  const vercel = fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8");
  assertExcludes(vercel, "localhost", "production CSP must not allow localhost");
  assertExcludes(vercel, "127.0.0.1", "production CSP must not allow 127.0.0.1");
});

suite("Offline AI — grounding");

test("the offline model gets the same corrected reference as the cloud model", () => {
  assertIncludes(source, "LOCAL_PREAMBLE + SYS_PROMPT", "offline prompt must include SYS_PROMPT");
});

test("the offline model is told not to guess torque values", () => {
  assert(/Never guess a torque value/.test(source), "no anti-guessing instruction");
  assert(/confirm (any )?torque value/i.test(source), "UI must tell the user to confirm offline torque values");
});

suite("Offline AI — streaming parser");

const parseStreamLine = extractFunction(source, "parseStreamLine");

test("reads text deltas from an OpenAI-compatible stream", () => {
  const line = 'data: {"id":"c1","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","content":"30 lb-ft"},"finish_reason":null}]}';
  assertEqual(parseStreamLine(line), "30 lb-ft");
});

test("ignores the end marker, keep-alives, role-only deltas and junk", () => {
  for (const line of ["data: [DONE]", ": keep-alive", "", "event: ping", "data: {not json",
    'data: {"choices":[{"delta":{"role":"assistant"}}]}']) {
    assertEqual(parseStreamLine(line), "", JSON.stringify(line));
  }
});
