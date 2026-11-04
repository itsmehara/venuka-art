#!/usr/bin/env node
/* =========================================================================
   Venuka — assemble the publishable site in dist/
   -------------------------------------------------------------------------
   Run it after the checks:   node tools/check.js && node tools/build.js

   Why this exists. The repository holds two different things: the website,
   and the working documents written for you — STATUS.html, REGISTRY.md,
   DEPLOYMENT.md, CONTENT-GUIDE.md, README.md, notes/. Those must never be
   reachable on the web; some of them discuss a child's photograph.

   The old GitHub Actions workflow deleted them in the seconds before
   publishing. A host that builds straight from the repository — Cloudflare
   Pages — has no such step, so the same job is done here: copy the site, and
   only the site, into a fresh dist/ folder. dist/ is what gets published.

   It works by ALLOWING a short list rather than by excluding one. A private
   note dropped into the folder next month is therefore left out by default,
   which is the safe way round. Add a new page and it is picked up
   automatically, because pages are the one thing that grows.
   ========================================================================= */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

/* Same rule as tools/check.js: these look like pages but are not. */
const INTERNAL_HTML = new Set(["STATUS.html"]);

/* Loose files at the top level that belong to the website. */
const ROOT_EXTRAS = ["robots.txt", "sitemap.xml", ".nojekyll"];

/* Whole folders that belong to the website, copied as they are. */
const SITE_DIRS = ["assets"];

/* Never copied, wherever they turn up. */
const skip = (name) =>
  (name.startsWith(".") && name !== ".nojekyll") ||
  name.startsWith("_") ||
  name === ".DS_Store";

let files = 0;
let bytes = 0;

function copyFile(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  files++;
  bytes += fs.statSync(from).size;
}

function copyDir(from, to) {
  fs.readdirSync(from, { withFileTypes: true }).forEach((entry) => {
    if (skip(entry.name)) return;
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else copyFile(src, dst);
  });
}

/* ---- start from empty, so a deleted page really disappears ------------- */
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

/* ---- the pages --------------------------------------------------------- */
const pages = fs
  .readdirSync(ROOT)
  .filter((f) => f.endsWith(".html") && !INTERNAL_HTML.has(f) && !f.startsWith("_"))
  .sort();

pages.forEach((f) => copyFile(path.join(ROOT, f), path.join(DIST, f)));

/* ---- robots, sitemap, the Jekyll opt-out ------------------------------- */
ROOT_EXTRAS.forEach((f) => {
  const src = path.join(ROOT, f);
  if (fs.existsSync(src)) copyFile(src, path.join(DIST, f));
});

/* ---- styles, scripts, photographs ------------------------------------- */
SITE_DIRS.forEach((d) => {
  const src = path.join(ROOT, d);
  if (fs.existsSync(src)) copyDir(src, path.join(DIST, d));
});

/* ---- the last line of defence ------------------------------------------
   If one of the working documents has somehow reached dist/, stop here and
   say so rather than letting it be published. */
const MUST_NOT_SHIP = [
  "STATUS.html", "REGISTRY.md", "DEPLOYMENT.md",
  "CONTENT-GUIDE.md", "README.md", "LICENSE", "notes", "tools", ".github",
];
const leaked = MUST_NOT_SHIP.filter((f) => fs.existsSync(path.join(DIST, f)));

if (!pages.includes("index.html")) {
  console.error("\n  x No index.html was copied — dist/ would have no home page.\n");
  process.exit(1);
}
if (leaked.length) {
  console.error("\n  x These are working documents and must not be published:");
  leaked.forEach((f) => console.error("      dist/" + f));
  console.error("\n  The site was NOT assembled. Fix tools/build.js and try again.\n");
  process.exit(1);
}

console.log("\n  Site assembled in dist/");
console.log("  pages     %d", pages.length);
console.log("  files     %d  (%s)", files, (bytes / 1024 / 1024).toFixed(2) + " MB");
console.log("  left out  STATUS.html, the .md documents, notes/, tools/, .github/");
console.log("\n  Publish dist/ — never the folder above it.\n");
