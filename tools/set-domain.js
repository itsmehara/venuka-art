#!/usr/bin/env node
/* =========================================================================
   Venuka — point the site at its real web address
   -------------------------------------------------------------------------
   Run this ONCE after you know the site's address, then commit the result:

     node tools/set-domain.js https://harakiri.github.io/venuka-website/

   Social previews (WhatsApp, Facebook, X) need the FULL https address of the
   preview image — a relative path shows no picture. Search engines want the
   same for the sitemap. This updates all of it in one go, across every page.

   It is safe to run again if the address ever changes.
   ========================================================================= */
"use strict";

const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

let base = process.argv[2];
if (!base) {
  console.error("\n  Usage: node tools/set-domain.js https://your-site-address/\n");
  console.error("  Examples:");
  console.error("    node tools/set-domain.js https://username.github.io/venuka-website/");
  console.error("    node tools/set-domain.js https://venuka.art/\n");
  process.exit(1);
}
if (!/^https?:\/\//.test(base)) { console.error("  The address must start with https://"); process.exit(1); }
if (!base.endsWith("/")) base += "/";

const htmlFiles = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html")).sort();
let edits = 0;

htmlFiles.forEach((file) => {
  const p = path.join(ROOT, file);
  let s = fs.readFileSync(p, "utf8");
  const before = s;
  const pageUrl = base + (file === "index.html" ? "" : file);

  /* Absolute preview image — matches the relative form or a previous domain. */
  s = s.replace(/(<meta property="og:image" content=")[^"]*(">)/,
                "$1" + base + "assets/img/og-cover.jpg$2");
  s = s.replace(/(<meta name="twitter:image" content=")[^"]*(">)/,
                "$1" + base + "assets/img/og-cover.jpg$2");

  /* og:url and canonical: add them if missing, update them if present. */
  if (/<meta property="og:url"/.test(s)) {
    s = s.replace(/(<meta property="og:url" content=")[^"]*(">)/, "$1" + pageUrl + "$2");
  } else {
    s = s.replace(/(<meta property="og:type"[^>]*>)/, '$1\n  <meta property="og:url" content="' + pageUrl + '">');
  }
  if (/<link rel="canonical"/.test(s)) {
    s = s.replace(/(<link rel="canonical" href=")[^"]*(">)/, "$1" + pageUrl + "$2");
  } else {
    s = s.replace(/(<link rel="icon"[^>]*>)/, '<link rel="canonical" href="' + pageUrl + '">\n  $1');
  }

  /* The head carries a note telling you to do exactly this. Once it is done,
     the note is wrong, so replace it with the address that is now in use. */
  s = s.replace(/<!-- Social preview\.[\s\S]*?-->/,
                "<!-- Social preview. Absolute addresses set by tools/set-domain.js\n       for " + base + " — re-run that script if the address changes. -->");

  if (s !== before) { fs.writeFileSync(p, s); edits++; }
});

/* sitemap.xml */
const smPath = path.join(ROOT, "sitemap.xml");
let sm = fs.readFileSync(smPath, "utf8");
sm = sm.replace(/<loc>https?:\/\/[^<]*?\/([a-z0-9-]*\.html)?<\/loc>/g,
                (m, file) => "<loc>" + base + (file || "") + "</loc>");
sm = sm.replace(/<!--[\s\S]*?-->\n/, "");                 /* drop the placeholder note */
fs.writeFileSync(smPath, sm);

/* robots.txt */
const rbPath = path.join(ROOT, "robots.txt");
let rb = fs.readFileSync(rbPath, "utf8");
rb = rb.replace(/#?\s*Sitemap:.*/g, "Sitemap: " + base + "sitemap.xml");
rb = rb.replace(/# Once this website has its own address.*\n# real address in.*\n/, "");
fs.writeFileSync(rbPath, rb);

console.log("\n  Site address set to: " + base);
console.log("  Updated " + edits + " pages, plus sitemap.xml and robots.txt.");
console.log("  Now run: node tools/check.js   then commit and push.\n");
