#!/usr/bin/env node
/**
 * Dependency-free static server for local testing.
 *
 * Service workers require a secure context: https:// or http://localhost.
 * Opening index.html as a file:// URL will NOT register the service worker,
 * so offline behavior cannot be tested that way.
 *
 * Usage:  npm run serve    ->  http://localhost:8600
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT) || 8600;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8",
};

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath === "/") urlPath = "/index.html";

    // Refuse to serve anything outside the project directory.
    const filePath = path.join(ROOT, urlPath);
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("404 Not Found: " + urlPath);
      }
      const headers = {
        "Content-Type": TYPES[path.extname(filePath)] || "application/octet-stream",
      };
      // Mirror the production no-cache policy for the shell entry points.
      if (/\/(index\.html|service-worker\.js|manifest\.webmanifest)$/.test(filePath)) {
        headers["Cache-Control"] = "public, max-age=0, must-revalidate";
      }
      res.writeHead(200, headers);
      res.end(data);
    });
  })
  .listen(PORT, () => {
    console.log("Tacoma World serving at http://localhost:" + PORT);
    console.log("Stop with Ctrl+C. Use this (not file://) to test offline behavior.");
  });
