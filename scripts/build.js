#!/usr/bin/env node
/**
 * Tacoma World build step.
 *
 * Compiles src/app.jsx -> assets/js/app.js.
 *
 * Why a build step exists at all: the app is React, and the browser cannot run
 * JSX. The previous version compiled JSX in the browser with Babel from a CDN,
 * which meant no network = blank screen. Compiling ahead of time is what makes
 * the offline contract possible.
 *
 * The compiled output IS committed, so Vercel needs no build command and the
 * repo stays deployable by anyone who clones it.
 *
 * Usage:  npm install && npm run build
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src", "app.jsx");
const OUT = path.join(ROOT, "assets", "js", "app.js");

let babel;
try {
  babel = require("@babel/core");
} catch (e) {
  console.error(
    "\n@babel/core is not installed.\n" +
      "Run `npm install` in this directory first, then `npm run build`.\n"
  );
  process.exit(1);
}

if (!fs.existsSync(SRC)) {
  console.error("Source not found: " + SRC);
  process.exit(1);
}

const source = fs.readFileSync(SRC, "utf8");

const result = babel.transformSync(source, {
  presets: [["@babel/preset-react", { runtime: "classic" }]],
  filename: SRC,
  compact: false,
  comments: false,
});

if (!result || typeof result.code !== "string") {
  console.error("Babel produced no output.");
  process.exit(1);
}

const banner =
  "/* GENERATED FILE — do not edit.\n" +
  " * Built from src/app.jsx by scripts/build.js (`npm run build`).\n" +
  " * Edits here are lost on the next build. Change src/app.jsx instead.\n" +
  " */\n";

fs.writeFileSync(OUT, banner + result.code, "utf8");

console.log("built " + path.relative(ROOT, SRC) + " -> " + path.relative(ROOT, OUT));
console.log(result.code.length + " bytes");
console.log(
  "\nReminder: bump SHELL_VERSION in service-worker.js so installed phones pick this up."
);
