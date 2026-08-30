#!/usr/bin/env node
/* =========================================================================
   Venuka — pre-deploy checks
   -------------------------------------------------------------------------
   Run this before pushing:   node tools/check.js

   It is deliberately dependency-free, so it works on a fresh machine with
   nothing installed but Node. GitHub Actions runs the same file, and refuses
   to publish the site if anything here fails.

   What it catches:
     1. A syntax error anywhere in the JavaScript  (the missing-comma problem)
     2. Content mistakes  — missing titles, unknown categories, duplicate ids
     3. Missing files     — a drawing that points at a photo that isn't there
     4. Broken links      — any local href or src that doesn't resolve
     5. Page structure    — one <h1>, alt text on every image, required tags
     6. Colour contrast   — text that would fail WCAG AA against the scene
   ========================================================================= */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const problems = [];
const warnings = [];
let checks = 0;

const rel = (p) => path.relative(ROOT, p) || p;
function fail(group, msg) { problems.push(group + ": " + msg); }
function warn(group, msg) { warnings.push(group + ": " + msg); }
function ok() { checks++; }
function exists(p) { return fs.existsSync(path.join(ROOT, p)); }

/* STATUS.html and anything starting with an underscore are internal working
   documents, not pages of the website, so they are not held to the page rules. */
const INTERNAL_HTML = new Set(["STATUS.html"]);
const htmlFiles = fs.readdirSync(ROOT)
  .filter((f) => f.endsWith(".html") && !INTERNAL_HTML.has(f) && !f.startsWith("_"))
  .sort();
const jsFiles = fs.readdirSync(path.join(ROOT, "assets/js")).filter((f) => f.endsWith(".js")).sort();

/* ---------- 1. JavaScript syntax ---------------------------------------- */
function checkSyntax() {
  jsFiles.forEach((f) => {
    const p = path.join(ROOT, "assets/js", f);
    const src = fs.readFileSync(p, "utf8");
    try {
      new vm.Script(src, { filename: p });   /* compiles, does not run */
      ok();
    } catch (e) {
      const line = (e.stack.match(/:(\d+)\n/) || [])[1];
      fail("syntax", "assets/js/" + f + (line ? " line " + line : "") + " — " + e.message);
    }
  });
}

/* ---------- 2. Load the content safely ---------------------------------- */
function loadData() {
  const p = path.join(ROOT, "assets/js/data.js");
  const sandbox = { window: {} };
  try {
    vm.createContext(sandbox);
    new vm.Script(fs.readFileSync(p, "utf8"), { filename: p }).runInContext(sandbox, { timeout: 5000 });
  } catch (e) {
    fail("content", "assets/js/data.js could not be read — " + e.message);
    return null;
  }
  const d = sandbox.window.VENUKA;
  if (!d) { fail("content", "data.js ran but did not produce window.VENUKA"); return null; }
  ok();
  return d;
}

/* ---------- 3. Content rules -------------------------------------------- */
function checkContent(D) {
  if (!D) return;
  const cats = new Set(D.categories || []);
  if (!cats.size) fail("content", "no categories defined");

  const seen = new Set();
  (D.artworks || []).forEach((a, i) => {
    const where = 'artwork #' + (i + 1) + ' (' + (a.id || "no id") + ")";
    ["id", "title", "description", "alt", "source"].forEach((k) => {
      if (!a[k] || !String(a[k]).trim()) fail("content", where + " is missing " + k);
    });
    if (seen.has(a.id)) fail("content", where + " has a duplicate id");
    seen.add(a.id);

    if (!Array.isArray(a.categories) || !a.categories.length) {
      fail("content", where + " has no categories");
    } else {
      a.categories.forEach((c) => {
        if (!cats.has(c)) fail("content", where + ' uses unknown category "' + c + '"');
      });
    }
    if (a.source === "photo") {
      if (!a.image) fail("content", where + ' is source:"photo" but has no image');
      else if (!exists(a.image)) fail("files", where + " points at a missing photo — " + a.image);
    } else if (a.source === "video") {
      if (!a.video) fail("content", where + ' is source:"video" but has no video id');
      else if (!exists("assets/img/video/" + a.video + ".jpg")) {
        fail("files", where + " has no thumbnail — expected assets/img/video/" + a.video + ".jpg");
      }
    } else {
      fail("content", where + ' has source "' + a.source + '" (expected "photo" or "video")');
    }
    if (a.date && !/^\d{4}-\d{2}-\d{2}$/.test(a.date)) {
      fail("content", where + ' date "' + a.date + '" should look like 2026-03-14');
    }
    if (a.alt && a.alt.trim().length < 15) warn("content", where + " has very short alt text");
    ok();
  });

  const vseen = new Set();
  (D.videos || []).forEach((v, i) => {
    const where = "video #" + (i + 1) + " (" + (v.id || "no id") + ")";
    ["id", "title", "description"].forEach((k) => {
      if (!v[k] || !String(v[k]).trim()) fail("content", where + " is missing " + k);
    });
    if (v.id && v.id.length !== 11) fail("content", where + " id should be 11 characters");
    if (vseen.has(v.id)) fail("content", where + " is listed twice");
    vseen.add(v.id);
    if (!Array.isArray(v.tags) || !v.tags.length) warn("content", where + " has no tags, so no filter will show it");
    if (v.published && !/^\d{4}-\d{2}-\d{2}$/.test(v.published)) {
      fail("content", where + ' published "' + v.published + '" should look like 2026-03-14');
    }
    if (v.id && !exists("assets/img/video/" + v.id + ".jpg")) {
      fail("files", where + " has no thumbnail — save it as assets/img/video/" + v.id + ".jpg");
    }
    ok();
  });

  (D.crafts || []).forEach((c, i) => {
    const where = "craft #" + (i + 1) + " (" + (c.id || "no id") + ")";
    ["id", "title", "description"].forEach((k) => {
      if (!c[k]) fail("content", where + " is missing " + k);
    });
    if (c.image) {
      if (!exists(c.image)) fail("files", where + " points at a missing photo — " + c.image);
      if (!c.alt || !c.alt.trim()) fail("content", where + " has a photo but no alt text");
    }
    ok();
  });

  if (D.formEndpoint && !/^https:\/\//.test(D.formEndpoint)) {
    fail("content", "formEndpoint should be a full https:// address or null");
  }
}

/* ---------- 4. Local links and page structure --------------------------- */
function checkPages() {
  const REQUIRED = [
    ["skip-link", "a skip-to-content link"],
    ['id="main"', "a <main id=\"main\"> landmark"],
    ['lang="en"', 'lang="en" on <html>'],
    ['name="description"', "a meta description"],
    ['rel="icon"', "a favicon"],
    ["site-footer", "the shared footer"],
    ['id="scene-canvas"', "the background scene canvas"],
    ['id="scene-toggle"', "the scene pause button"],
    ["assets/js/data.js", "the content script"],
    ["assets/js/site.js", "the shared script"],
    ["assets/js/scene.js", "the scene script"]
  ];

  htmlFiles.forEach((f) => {
    const src = fs.readFileSync(path.join(ROOT, f), "utf8");

    const h1 = (src.match(/<h1[\s>]/g) || []).length;
    if (h1 !== 1) fail("structure", f + " has " + h1 + " <h1> tags (needs exactly 1)");

    REQUIRED.forEach(([needle, label]) => {
      if (src.indexOf(needle) === -1) fail("structure", f + " is missing " + label);
    });

    const imgs = src.match(/<img\b[^>]*>/g) || [];
    imgs.forEach((tag) => {
      if (!/\salt\s*=/.test(tag)) fail("a11y", f + " has an <img> with no alt attribute");
    });

    const attrs = src.match(/(?:href|src)="([^"]+)"/g) || [];
    attrs.forEach((m) => {
      const url = m.replace(/^(?:href|src)="/, "").replace(/"$/, "");
      if (/^(https?:|mailto:|#|data:|\/\/)/.test(url)) return;
      const target = url.split("#")[0].split("?")[0];
      if (target && !exists(target)) fail("links", f + " points at a missing file — " + target);
    });

    /* External links should open safely in a new tab. */
    const ext = src.match(/<a\b[^>]*href="https?:[^"]*"[^>]*>/g) || [];
    ext.forEach((tag) => {
      if (/target="_blank"/.test(tag) && !/rel="[^"]*noopener/.test(tag)) {
        fail("security", f + ' has a target="_blank" link without rel="noopener"');
      }
    });
    ok();
  });
}

/* ---------- 5. Colour contrast (WCAG AA) -------------------------------- */
function checkContrast() {
  const hx = (h) => { h = h.replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
  const lum = (c) => {
    const s = c.map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
  };
  const over = (fg, a, bg) => hx(fg).map((v, i) => a * v + (1 - a) * hx(bg)[i]);
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

  /* Anything the scene can put behind a see-through panel. */
  const BEHIND = ["#6fcbf2", "#9fb6cc", "#8ea3bd", "#bcc9dc", "#fff4d6", "#69b85f",
                  "#4f9a5c", "#2f7d3f", "#fdfeff", "#ffc300", "#e8323f", "#a855f7",
                  "#ff4d9d", "#ff6b3d", "#3fb6e8", "#ffffff"];
  const CASES = [
    ["airy panels",  "#1a1526", 0.18, "#fffbf2", 4.5],
    ["sections",     "#2e2740", 0.88, "#fffbf2", 4.5],
    ["cards",        "#2e2740", 0.92, "#ffffff", 4.5],
    ["card body",    "#5b5473", 0.92, "#ffffff", 4.5],
    ["big panels",   "#5b5473", 0.84, "#ffffff", 4.5]
  ];
  CASES.forEach(([label, ink, alpha, veil, need]) => {
    let worst = Infinity, worstBg = "";
    BEHIND.forEach((bg) => {
      const r = ratio(hx(ink), over(veil, alpha, bg));
      if (r < worst) { worst = r; worstBg = bg; }
    });
    if (worst < need) {
      fail("contrast", label + " text is " + worst.toFixed(2) + ":1 over " + worstBg +
                       " (WCAG AA needs " + need + ":1)");
    }
    ok();
  });
}

/* ---------- run ---------------------------------------------------------- */
console.log("\n  Venuka — pre-deploy checks\n  " + "-".repeat(46));
checkSyntax();
const DATA = loadData();
checkContent(DATA);
checkPages();
checkContrast();

if (DATA) {
  console.log("  content   %d drawings, %d videos, %d crafts",
    (DATA.artworks || []).length, (DATA.videos || []).length, (DATA.crafts || []).length);
}
console.log("  pages     %d html, %d scripts", htmlFiles.length, jsFiles.length);
console.log("  checks    %d run", checks);

if (warnings.length) {
  console.log("\n  Worth a look (not blocking):");
  warnings.forEach((w) => console.log("    ~ " + w));
}

if (problems.length) {
  console.log("\n  " + problems.length + " problem" + (problems.length > 1 ? "s" : "") + " found:\n");
  problems.forEach((p) => console.log("    x " + p));
  console.log("\n  The site was NOT published. Fix the above and try again.");
  console.log("  See CONTENT-GUIDE.md if you are not sure what a field should look like.\n");
  process.exit(1);
}

console.log("\n  All good. Safe to publish.\n");
