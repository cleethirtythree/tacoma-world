/* PWA contract — SOP §14.
 * Verifies install metadata, service-worker caching discipline, and that the
 * offline promise is structurally possible (no CDN in the critical path). */

const fs = require("fs");
const path = require("path");
const { suite, test, assert, assertEqual, assertIncludes, assertExcludes } = require("./harness");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const exists = (p) => fs.existsSync(path.join(ROOT, p));

suite("Manifest");

const manifest = JSON.parse(read("manifest.webmanifest"));

test("has a stable id, name, short_name and description", () => {
  assert(manifest.id, "id missing");
  assert(manifest.name, "name missing");
  assert(manifest.short_name, "short_name missing");
  assert(manifest.description, "description missing");
  assert(manifest.short_name.length <= 12, "short_name should stay short for the home screen");
});

test("start_url and scope agree", () => {
  assertEqual(manifest.start_url, "/", "start_url");
  assertEqual(manifest.scope, "/", "scope");
});

test("is installable: standalone display with theme and background colors", () => {
  assertEqual(manifest.display, "standalone", "display");
  assert(/^#[0-9a-f]{6}$/i.test(manifest.theme_color), "theme_color must be a hex color");
  assert(/^#[0-9a-f]{6}$/i.test(manifest.background_color), "background_color must be a hex color");
});

test("declares 192px, 512px and a maskable icon, and all of them exist on disk", () => {
  const sizes = manifest.icons.map((i) => i.sizes);
  assert(sizes.includes("192x192"), "192x192 icon missing");
  assert(sizes.includes("512x512"), "512x512 icon missing");
  assert(
    manifest.icons.some((i) => String(i.purpose).includes("maskable")),
    "no maskable icon declared"
  );
  for (const icon of manifest.icons) {
    assert(exists(icon.src.replace(/^\//, "")), "icon file missing: " + icon.src);
  }
});

test("every icon is same-origin", () => {
  for (const icon of manifest.icons) {
    assert(icon.src.startsWith("/"), "icon must be same-origin root-relative: " + icon.src);
  }
});

suite("Service worker");

const sw = read("service-worker.js");

test("declares a versioned shell cache", () => {
  const match = sw.match(/SHELL_VERSION\s*=\s*"([^"]+)"/);
  assert(match, "SHELL_VERSION not found");
  assertIncludes(match[1], "tacoma-world-", "cache name should be namespaced to this product");
});

test("does not carry a reference product's cache prefix", () => {
  assertExcludes(sw, "dream-atlas", "Dream Atlas cache prefix leaked into this product");
  assertExcludes(sw, "finpilot", "FinPilot cache prefix leaked into this product");
});

test("refuses to intercept cross-origin requests", () => {
  assertIncludes(sw, "url.origin !== self.location.origin", "cross-origin guard missing");
});

test("never names the Anthropic API in its cache list", () => {
  const shellBlock = sw.slice(sw.indexOf("const SHELL = ["), sw.indexOf("];"));
  assertExcludes(shellBlock, "anthropic", "the API must never be part of the cached shell");
});

test("bypasses stale HTTP cache when installing a new shell version", () => {
  assertIncludes(sw, 'cache: "reload"', "install should fetch fresh bytes");
});

test("deletes only its own older caches on activate", () => {
  assertIncludes(sw, 'startsWith("tacoma-world-")', "activate should scope its cleanup");
  assertIncludes(sw, "caches.delete", "old caches are never removed");
});

test("every cached shell path exists on disk", () => {
  const block = sw.slice(sw.indexOf("const SHELL = ["), sw.indexOf("];") + 2);
  const paths = [...block.matchAll(/"(\/[^"]*)"/g)].map((m) => m[1]);
  assert(paths.length >= 8, "shell list looks too short: " + paths.length);
  for (const p of paths) {
    if (p === "/") continue; // directory root, served as index.html
    assert(exists(p.replace(/^\//, "")), "shell file listed but missing on disk: " + p);
  }
});

suite("Offline contract");

const html = read("index.html");

test("index.html loads no scripts or styles from a CDN", () => {
  const remote = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
  assertEqual(remote.length, 0, "remote asset(s) found: " + remote.join(", "));
});

test("React is served from this origin", () => {
  assertIncludes(html, '/assets/js/react.min.js', "react not local");
  assertIncludes(html, '/assets/js/react-dom.min.js', "react-dom not local");
  assert(exists("assets/js/react.min.js"), "react.min.js missing on disk");
  assert(exists("assets/js/react-dom.min.js"), "react-dom.min.js missing on disk");
});

test("the compiled bundle contains no raw JSX", () => {
  const app = read("assets/js/app.js");
  assertIncludes(app, "React.createElement", "bundle does not look compiled");
  assertExcludes(app, "<div style=", "raw JSX left in the compiled bundle");
});

test("registers the service worker at root scope", () => {
  assertIncludes(html, 'navigator.serviceWorker.register("/service-worker.js")', "registration missing");
});

suite("iOS install metadata");

test("declares apple-touch-icon and standalone capability", () => {
  assertIncludes(html, 'rel="apple-touch-icon"', "apple-touch-icon missing");
  assertIncludes(html, 'name="apple-mobile-web-app-capable" content="yes"', "not installable on iOS");
  assertIncludes(html, 'apple-mobile-web-app-status-bar-style', "status bar style missing");
});

test("viewport handles the notch and avoids focus-zoom", () => {
  assertIncludes(html, "viewport-fit=cover", "safe-area handling requires viewport-fit=cover");
  const css = read("assets/css/tacoma-world.css");
  assertIncludes(css, "env(safe-area-inset-top)", "safe-area inset not applied");
  assertIncludes(css, "font-size: 16px !important", "iOS will zoom on input focus below 16px");
});

suite("Deployment config");

const vercel = JSON.parse(read("vercel.json"));

test("sets a Content-Security-Policy that permits only the Anthropic and ElevenLabs APIs", () => {
  const csp = vercel.headers
    .flatMap((h) => h.headers)
    .find((h) => h.key === "Content-Security-Policy");
  assert(csp, "no CSP configured");
  // Exact set, not a prefix match: adding any other host must be a deliberate contract change.
  const directive = (name) => (csp.value.split(";").map((d) => d.trim().split(/\s+/)).find((d) => d[0] === name) || []).slice(1).sort().join(" ");
  assertEqual(directive("connect-src"), ["'self'", "https://api.anthropic.com", "https://api.elevenlabs.io"].sort().join(" "), "connect-src wrong");
  // ElevenLabs audio plays from an in-memory blob; nothing else may be loaded as media.
  assertEqual(directive("media-src"), ["'self'", "blob:"].sort().join(" "), "media-src wrong");
  assertIncludes(csp.value, "frame-ancestors 'none'", "clickjacking protection missing");
  assertIncludes(csp.value, "object-src 'none'", "object-src should be locked down");
});

test("service worker and shell entry points are not long-cached by the CDN", () => {
  const swHeaders = vercel.headers.find((h) => h.source === "/service-worker.js");
  assert(swHeaders, "no service-worker.js header rule");
  const cc = swHeaders.headers.find((h) => h.key === "Cache-Control");
  assertIncludes(cc.value, "max-age=0", "a cached service worker will strand users on an old build");
});

test("manifest is served with the correct content type", () => {
  const m = vercel.headers.find((h) => h.source === "/manifest.webmanifest");
  assert(m, "no manifest header rule");
  const ct = m.headers.find((h) => h.key === "Content-Type");
  assertEqual(ct.value, "application/manifest+json", "manifest content type");
});
