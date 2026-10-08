/* Cyberdeck contract.
 *
 * The deck is used when there is no internet. Everything it needs must be on the
 * Pi, reachable only from the Pi, and must come back by itself after a reboot.
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { suite, test, assert, assertEqual, assertIncludes } = require("./harness");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const setup = read("deck/setup.sh");
const kiosk = read("deck/kiosk.sh");

suite("Cyberdeck — scripts");

test("every deck script parses (bash -n)", () => {
  for (const f of ["deck/setup.sh", "deck/kiosk.sh", "deck/update.sh"]) {
    const r = spawnSync("bash", ["-n", path.join(ROOT, f)], { encoding: "utf8" });
    if (r.error && r.error.code === "ENOENT") return; // no bash on this machine
    assertEqual(r.status, 0, f + " has a syntax error: " + r.stderr);
  }
});

test("setup refuses hardware that can't run a local model", () => {
  assertIncludes(setup, '[ "$ARCH" = "aarch64" ] || die', "64-bit check missing");
});

test("the model server and the app server listen on this machine only", () => {
  assertIncludes(setup, 'OLLAMA_HOST=127.0.0.1:11434', "Ollama must bind loopback");
  assertIncludes(setup, "Environment=HOST=127.0.0.1", "app server must bind loopback");
});

test("the model server accepts the app's origin", () => {
  assertIncludes(setup, "OLLAMA_ORIGINS=http://127.0.0.1:${PORT}", "OLLAMA_ORIGINS must include the app");
});

test("the kiosk boots into offline AI on a loopback address", () => {
  assertIncludes(kiosk, "http://127.0.0.1:${PORT}/?ai=local&endpoint=http://127.0.0.1:11434", "kiosk URL wrong");
  assertIncludes(kiosk, "--kiosk", "not launched in kiosk mode");
});

suite("Cyberdeck — local server");

// Start scripts/serve.js on a spare port, probe it, stop it. Runs in a child so this suite stays synchronous.
const probe = spawnSync(process.execPath, ["-e", `
  const { spawn } = require("child_process"); const http = require("http");
  const port = 20000 + Math.floor(Math.random() * 20000);
  const srv = spawn(process.execPath, [${JSON.stringify(path.join(ROOT, "scripts", "serve.js"))}],
    { env: { ...process.env, HOST: "127.0.0.1", PORT: String(port) } });
  const get = (p) => new Promise((res) => http.get({ host: "127.0.0.1", port, path: p }, (r) => { r.resume(); res(r.statusCode); }).on("error", () => res(0)));
  (async () => {
    let up = 0; for (let i = 0; i < 50 && !up; i++) { up = await get("/"); if (!up) await new Promise((r) => setTimeout(r, 100)); }
    const out = { root: up, git: await get("/.git/config"), env: await get("/.env"), sneaky: await get("/assets/%2e%2e/.git/HEAD") };
    srv.kill(); console.log(JSON.stringify(out));
  })();
`], { encoding: "utf8", timeout: 15000 });
let served = null;
try { served = JSON.parse(probe.stdout.trim()); } catch (e) { served = null; }

test("serves the app", () => {
  assert(served, "serve.js did not start: " + (probe.stderr || probe.stdout));
  assertEqual(served.root, 200, "GET /");
});

test("never serves .git, .env or other dotfiles", () => {
  assert(served, "serve.js did not start");
  assertEqual(served.git, 404, "/.git/config");
  assertEqual(served.env, 404, "/.env");
  assert(served.sneaky === 404 || served.sneaky === 403, "encoded traversal to .git returned " + served.sneaky);
});
