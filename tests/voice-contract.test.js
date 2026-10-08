/* Talk-back contract.
 *
 * AI Wrench can read answers aloud. The device's built-in voice is the default: free, no key,
 * works with no signal and on the deck. ElevenLabs is opt-in (Caleb approved sending answer
 * text to ElevenLabs on 2026-10-07, only while that voice is chosen). These guards keep it that
 * way: ElevenLabs is never the default, its key goes only to api.elevenlabs.io and never into a
 * backup or the repo, and a failure falls back to the device voice instead of going silent.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { suite, test, assert, assertEqual, assertIncludes, assertExcludes } = require("./harness");
const { extractFunction } = require("./extract");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const source = read("src/app.jsx");
const bundle = read("assets/js/app.js");

const speakableText = extractFunction(source, "speakableText");
const splitForSpeech = extractFunction(source, "splitForSpeech");
const isElevenVoiceId = extractFunction(source, "isElevenVoiceId");
const pickDeviceVoice = extractFunction(source, "pickDeviceVoice");
const buildBackup = extractFunction(source, "buildBackup");

suite("Voice — what gets read aloud");

test("units are spoken as words, not letters", () => {
  const s = speakableText("Drain plug: 30 lb-ft. Cover bolts 89 in-lbs. Lug nuts 112 N·m.");
  assertIncludes(s, "30 pound-feet", "lb-ft");
  assertIncludes(s, "89 inch-pounds", "in-lbs");
  assertIncludes(s, "112 newton-meters", "N·m");
});

test("markdown, emoji and URLs are not read out", () => {
  const s = speakableText("## Steps\n**Warning** use `TOY640`.\n⚠️ Hot oil.\nSee https://www.youtube.com/watch?v=abc and [the FSM](https://drive.google.com/x) 🔧");
  for (const bad of ["#", "*", "`", "https://", "youtube.com", "drive.google", "🔧"]) assertExcludes(s, bad, "read aloud");
  assertIncludes(s, "link on screen", "URL should be replaced by a short phrase");
  assertIncludes(s, "the FSM", "link text should be kept");
  assertIncludes(s, "Warning: Hot oil", "⚠️ should be spoken as a warning");
});

test("a warning mid-line or at the start gets its own sentence", () => {
  assertEqual(speakableText("Drain plug: 30 lb-ft ⚠️ hot oil."), "Drain plug: 30 pound-feet. Warning: hot oil.");
  assertEqual(speakableText("⚠️ Support the truck on stands."), "Warning: Support the truck on stands.");
});

test("numbered steps on separate lines get a pause between them", () => {
  assertEqual(speakableText("1. Remove the cover\n2. Drain the oil"), "1. Remove the cover. 2. Drain the oil");
});

test("part numbers and specs survive intact", () => {
  const s = speakableText("Plugs 90919-01263, gap 0.028 in, 4WD capacity 6.2 qt.");
  for (const keep of ["90919-01263", "0.028", "6.2"]) assertIncludes(s, keep, "spec altered");
});

test("a long answer is cut at a sentence and says the rest is on screen", () => {
  const long = Array.from({ length: 300 }, (_, i) => `Step ${i} done.`).join(" ");
  const s = speakableText(long, 500);
  assert(s.length < 560, "not capped: " + s.length);
  assert(/done\. The rest is on screen\.$/.test(s), "should end on a whole sentence: " + s.slice(-60));
});

test("device-voice chunks are short, keep every word, and never split a decimal", () => {
  const text = speakableText("Gap is 0.028 in. Capacity is 4.5 qt. " + "This is a long sentence with many words in it ".repeat(12));
  const chunks = splitForSpeech(text, 120);
  assert(chunks.length > 2, "expected several chunks");
  for (const c of chunks) assert(c.length <= 120, "chunk too long: " + c.length);
  assertEqual(chunks.join(" ").replace(/\s+/g, " "), text.replace(/\s+/g, " "), "words lost or reordered");
  assert(chunks.some((c) => c.includes("0.028 in")) && chunks.some((c) => c.includes("4.5 qt")), "a decimal was split");
});

test("prefers an Enhanced/Premium English voice when the device has one", () => {
  const voices = [
    { name: "Thomas", lang: "fr-FR", default: true },
    { name: "Samantha", lang: "en-US" },
    { name: "Ava (Enhanced)", lang: "en-US" },
  ];
  assertEqual(pickDeviceVoice(voices).name, "Ava (Enhanced)");
  assertEqual(pickDeviceVoice([{ name: "Thomas", lang: "fr-FR" }]), null, "never picks a non-English voice");
  assertEqual(pickDeviceVoice([]), null);
});

suite("Voice — ElevenLabs is opt-in and contained");

test("the device voice is the default; ElevenLabs only when chosen", () => {
  assertIncludes(source, 'localStorage.getItem("taco-voice-engine") === "elevenlabs" ? "elevenlabs" : "device"', "engine must default to device");
  assertIncludes(source, 'localStorage.getItem("taco-voice") === "on"', "voice must default to off");
  assertIncludes(source, 'voiceEngine === "elevenlabs" && elevenKey', "ElevenLabs must require the choice and a key");
});

test("ElevenLabs is called at exactly one address, with the key in one place", () => {
  assertIncludes(source, 'const ELEVEN_API = "https://api.elevenlabs.io"', "ElevenLabs base URL");
  assertEqual((source.match(/elevenlabs\.io\//g) || []).length, 1, "only the settings help link may name another elevenlabs.io URL");
  assertEqual((source.match(/"xi-api-key"/g) || []).length, 1, "the ElevenLabs key header must appear once");
  const fn = source.slice(source.indexOf("const speakEleven"), source.indexOf("const speak = async"));
  assertIncludes(fn, "fetch(`${ELEVEN_API}/v1/text-to-speech/", "request must go to ELEVEN_API");
  assertIncludes(fn, "encodeURIComponent(elevenVoice)", "voice ID must be encoded into the path");
});

test("a voice ID can't redirect the request", () => {
  for (const ok of ["JBFqnCBsd6RMkjVDRZzb", "21m00Tcm4TlvDq8ikWAM"]) assert(isElevenVoiceId(ok), "rejected " + ok);
  for (const bad of ["", "abc", "../../v1/user", "x?y=1", "a b c d e f g h", "JBFqnCBsd6RMkjVDRZzb/../x", null, 42]) {
    assert(!isElevenVoiceId(bad), "accepted " + JSON.stringify(bad));
  }
});

test("only the answer text is sent, never chat history or the system prompt", () => {
  const fn = source.slice(source.indexOf("const speakEleven"), source.indexOf("const speak = async"));
  assertIncludes(fn, "JSON.stringify({ text, model_id:ELEVEN_DEFAULTS.model })", "body must be the text and model only");
  assertExcludes(fn, "SYS_PROMPT", "system prompt must not go to ElevenLabs");
  assertExcludes(fn, "history", "chat history must not go to ElevenLabs");
});

test("any ElevenLabs failure falls back to the device voice", () => {
  const fn = source.slice(source.indexOf("const speak = async"), source.indexOf("const toggleVoice"));
  assert(fn.indexOf("catch (e)") !== -1 && fn.lastIndexOf("speakDevice(text, run)") > fn.indexOf("catch (e)"), "no device-voice fallback after an ElevenLabs error");
});

test("error notices are never read aloud, only real answers", () => {
  assertIncludes(source, "if (voiceOnRef.current) speak(reply);", "cloud answers should be read");
  assertIncludes(source, "if (voiceOnRef.current) speak(text);", "offline answers should be read");
  assertIncludes(source, '!m.ui && !m.streaming && (', "READ button must skip UI notices and half-streamed text");
});

suite("Voice — keys stay private");

test("the ElevenLabs key lives in device storage and is never exported", () => {
  assertIncludes(source, 'localStorage.getItem("taco-elevenlabs-key")', "key should come from device storage");
  const b = JSON.stringify(buildBackup(128342, { oil: { mileage: 125000, date: null } }));
  for (const k of ["apikey", "elevenlabs", "xi-api-key", "taco-voice"]) assertExcludes(b.toLowerCase(), k, "backup leaks voice settings");
});

test("no ElevenLabs key is committed anywhere in the repo", () => {
  const files = execSync("git ls-files -co --exclude-standard", { cwd: ROOT, encoding: "utf8" })
    .split("\n").filter((f) => f && !f.startsWith("node_modules/") && fs.existsSync(path.join(ROOT, f)));
  for (const f of files) {
    const text = fs.readFileSync(path.join(ROOT, f), "utf8");
    assert(!/\bsk_[0-9a-f]{40,}\b/.test(text), "an ElevenLabs-style key is committed in " + f);
  }
});

suite("Voice — build");

test("the committed bundle includes the voice feature", () => {
  for (const marker of ["https://api.elevenlabs.io", "taco-voice-engine", "pound-feet"]) {
    assertIncludes(bundle, marker, "assets/js/app.js is stale; run npm run build");
  }
});
