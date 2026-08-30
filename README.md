# Venuka — Happy Learning Kids

> Unleashing Creativity, One Stroke at a Time:
> Nurturing Unique Talents in the Heart of Kids

A website for Venuka's drawings, colouring, arts, crafts and children's
drawing-learning videos. It replaces the original Google Site at
<https://sites.google.com/view/venuka/> and keeps its wording, its spirit and its
link to the **Happy Learning Kids** YouTube channel:
<https://www.youtube.com/@hlearningkids>

---

## The tech stack, in plain words

**There isn't much of one, and that is the point.**

| What | Which | Why this choice |
|---|---|---|
| Pages | Plain HTML | Open any `.html` file and you can read it. No framework to learn or keep updated. |
| Styling | One CSS file | `assets/css/style.css`. All colours and spacing defined once at the top. |
| Behaviour | Plain JavaScript | No jQuery, no React, no libraries at all. Nothing to install, nothing to go out of date. |
| Content | One data file | `assets/js/data.js`. Add a drawing here and every page updates itself. |
| Background scene | HTML canvas | The seasonal meadow, ~1,250 lines, written from scratch. |
| Checks | Node | `tools/check.js`. Uses only what Node ships with. |
| Hosting | GitHub Pages | Free, HTTPS included, publishes automatically when you push. |
| Automation | GitHub Actions | Runs the checks, and only publishes if they pass. |

**Zero dependencies.** There is no `package.json`, no `node_modules`, nothing to
`npm install`. That is deliberate: a website that a family keeps for years
should still work in five years without anyone updating anything. Nothing here
can rot, because there is nothing here to rot.

**Total size:** about 1.5 MB, most of it Venuka's artwork.

```
index.html                   Home
about.html                   About Venuka
drawings.html                Drawings gallery — search, category filters, lightbox
crafts.html                  Arts & Crafts
videos.html                  All 14 drawing videos — search, filters, click-to-play
learn.html                   Learn & Create — ideas, steps, materials
new-creations.html           Latest artwork and videos, newest first
contact.html                 Contact form and links
404.html                     Friendly not-found page

assets/css/style.css         The whole design system
assets/js/data.js            ← ALL THE CONTENT LIVES HERE
assets/js/site.js            Shared behaviour and the reusable card components
assets/js/scene.js           The seasonal meadow behind every page
assets/js/page-*.js          One small script per page
assets/img/artwork/          Photographs of original drawings
assets/img/video/            Video thumbnails, named after the YouTube video id
assets/img/crafts/           Craft photographs (empty until the crafts are shot)

tools/check.js               The pre-publish checks — run this before pushing
tools/set-domain.js          Fills in the real web address once you have one
.github/workflows/deploy.yml Runs the checks, publishes only if they pass

robots.txt, sitemap.xml      For search engines
.nojekyll                    Tells GitHub Pages to serve the files untouched
.gitignore                   What stays on your computer and never goes online

README.md                    This file
CONTENT-GUIDE.md             How to add a drawing, craft or video
DEPLOYMENT.md                How to put it online
STATUS.html                  What's done, what's pending — open it in a browser
REGISTRY.md                  Exact files and line numbers, for a developer
```

## Running it on your own machine

```bash
python3 -m http.server 4321
```

Then open <http://localhost:4321>. That is it — no install step.

Any static server works. Opening the files directly with `file://` mostly works
too, apart from a couple of browser quirks.

## Checking your work before you publish

```bash
node tools/check.js
```

53 checks in about a second: JavaScript typos (it names the exact line), missing
photos, unknown categories, duplicate entries, broken links, missing alt text
and colour contrast. **If this says "All good", it is safe to push.**

GitHub runs the same command on every push and refuses to publish if it fails,
so a stray comma can never take the live site down.

## Basic guidelines

A few house rules that keep this site pleasant to own:

1. **Content goes in `data.js`. Nothing else.** Adding a drawing should never
   mean touching HTML or CSS. If it does, something needs fixing.
2. **Run `node tools/check.js` before every push.** It takes a second.
3. **Never invent content.** No stock photos passed off as Venuka's work, no
   made-up contact details, no fake reviews. If something is missing, the site
   says so honestly — that is a feature, not a gap to be filled.
4. **Every image needs alt text.** A sentence describing the picture for someone
   who cannot see it. The checks will refuse to publish without it.
5. **Keep the reading sections readable.** The moving scene is lovely behind
   headings and short text; it should stay off long paragraphs.
6. **Small commits with plain messages.** "Add butterfly drawing" beats
   "updates". It makes undoing one thing easy.
7. **When in doubt, leave it out.** This is a child's website. Less personal
   information is always the safer call.

## Publishing it

**Full step-by-step instructions are in [DEPLOYMENT.md](DEPLOYMENT.md)** —
including the public-versus-private decision, the parent checklist, custom
domains and what to do if something breaks.

Short version: it is a folder of static files, so it runs anywhere — GitHub
Pages, Cloudflare Pages, Netlify, Vercel, or ordinary shared hosting. A
`.nojekyll` file is included so GitHub Pages serves it untouched.

**Two things to change once the site has its own web address:**

1. In every `.html` file, `og:image` points at `assets/img/og-cover.jpg`.
   Change it to the full `https://…/assets/img/og-cover.jpg` so link previews
   work in WhatsApp, Facebook and X.
2. In `sitemap.xml` and `robots.txt`, replace
   `https://your-domain-here.example/` with the real address.

## What goes online, and what stays on your computer

This folder is its own git repository, kept separate from your other projects.
`.gitignore` is the file that decides what is published.

**Published — 51 files.** The nine pages, the styles, the scripts, the images,
the checks, the deploy workflow and this documentation. Everything the website
needs to run.

**Never published.** Things that belong only to this machine:

| Left out | Why |
|---|---|
| `.DS_Store`, `._*`, `Thumbs.db` | Junk your computer creates by itself |
| `.vscode/`, `.idea/`, `.claude/` | Your editor and tool settings |
| `_draft.html`, `_notes.txt`, `scratch/` | Anything you name starting with an underscore is treated as a private draft |
| `.env`, `*.pem`, `*.key`, `secrets.*` | Passwords and keys. There are none today — this is a seatbelt |
| `originals/` | Full-size camera files. Put big originals here; only the resized copies in `assets/img/` go online |
| `*.zip`, `*.log`, `*.bak` | Downloads and leftovers |

To see the exact list of what would be published, at any time:

```bash
git ls-files
```

> **A note on `_hIeRYpy_Ak.jpg`.** One real video thumbnail is named starting
> with an underscore, because that YouTube video's id does. The underscore
> rules in `.gitignore` are deliberately written narrowly (`_*.html`, `_*.js`
> and so on) rather than a plain `_*`, so that file is not swept away by
> accident. If you ever widen that rule, a video thumbnail goes missing.

## Adding new drawings, crafts and videos

See **[CONTENT-GUIDE.md](CONTENT-GUIDE.md)**. Short version: add an entry to
`assets/js/data.js`, drop the photo in `assets/img/`, done. Many more drawings and
crafts are still to be photographed, and the gallery is built to absorb them
without any redesign.

---

## The living background

Behind every page is a meadow that changes with the weather. It runs on one
`<canvas>` in `assets/js/scene.js` — about 900 lines, no libraries.

**The seasons.** Sunny, cloudy, rain, snow, then back to sunny. Each lasts
**30 seconds** with a 5-second crossfade, so a full cycle is two minutes. The sun
tracks slowly across the sky over the whole cycle. Snow settles into drifts along
the ground and melts once the sun comes back.

**The physics is purpose-built, not a library.** A rigid-body engine like
Matter.js is the wrong shape for this: butterflies want forces, drag and steering
behaviours, and flowers want spring-dampers. Both are about 200 lines here, and
they look better than a collision solver would.

* **Butterflies** are driven by gravity, air resistance, wind, and a lift impulse
  applied on each wing *downstroke*. That last part is why the flight bobs — the
  rise and fall is generated by the wingbeat, not painted on with a sine wave.
  They wander using a steering behaviour, mostly drifting left to right, and use
  an arrival force to settle on a flower rather than jabbing at it.
* **Wings** flap in three dimensions: the drawn width of each wing is the cosine
  of its dihedral angle, so it foreshortens through the stroke the way a real
  wing does. The far wing is shaded a little darker.
* **Flowers** are spring-damped stalks reacting to three things: the wind, the
  weight of a butterfly resting on them, and the **downwash of any butterfly
  flying close by**. So a flower dips when one lands, springs back when it pushes
  off, and nods whenever one passes — the meadow is reacting constantly, not only
  at the moment of a landing.
* **Coming and going.** A butterfly rests 3–7 seconds in fair weather, then takes
  off again. New ones fly in from the edges over the first minute or so, and the
  cast slowly changes colour as they come and go.
* **Proportion.** Every flower and butterfly is placed on a depth layer, and a
  butterfly only chooses a flower in its own size band. As it settles it eases to
  the exact width of that bloom, so it never looks like a giant on a daisy.
* **Weather.** Butterflies shelter when it rains or snows: they head for a flower,
  fold their wings and wait — hopping to a neighbouring bloom now and then rather
  than sitting stone-still — until the sun returns. Rain slants with the wind and
  splashes when it lands. Snow builds into drifts along the ground and melts once
  the sun is back.
* **On a phone**, the hero panel covers the meadow, so a landing would happen out
  of sight. There the butterflies wait on the wing instead — hovering in one spot
  in the strip of open sky — rather than disappearing behind the text.

**It carries across pages.** Each page is a separate document, so without help the
meadow would be rebuilt on every click. The scene saves itself to `sessionStorage`
and restores on the next page, so the same flowers, the same butterflies and the
same weather carry straight on. It lasts as long as the tab does.

**It never gets in the way of reading.**

* Every sky palette is deliberately kept light, and every piece of text was
  contrast-checked against all four season skies — and against grass, snow, a
  dark stem and the hottest bloom in the meadow.

  Transparency runs at three levels on purpose:

  | Level | Where | Why |
  |---|---|---|
  | ~82% see-through | Hero panel, page titles, callouts, feature bands | Short, large text. The meadow runs right behind the words. |
  | ~16% see-through | Toolbars, contact form, empty states, tiles | Big roomy panels can afford to be open. |
  | ~8% see-through | Artwork and video cards, reading sections | The drawings, and any text you sit and read, stay on paper. |

  Text on the see-through blocks uses `--ink-strong`, a deeper near-black that
  clears AA over anything the scene can put behind it — the worst case measured
  is **4.89:1** (over a dark green stem) against a 4.5 requirement. Small purple
  kickers get their own paper chip rather than being lightened.
* On a wide screen the content floats as a column, leaving the scene visible down
  both sides while you read.
* `prefers-reduced-motion` stops the animation and leaves a composed still frame
  — never a blank box.
* The loop stops when the tab is hidden, and repaints the instant it comes back.
* Particle counts scale with the viewport, and the scene quietly reduces them if
  frames start running long.
* Nothing is blurred. Butterflies and flowers are flat fills with dark outlines
  so they stay crisp at any size.
* A small weather badge in the corner names the current season and **pauses the
  whole scene** on click. The choice is remembered.

**Tuning it** — all near the top of `assets/js/scene.js`:

| What | Where |
|---|---|
| How long each season lasts | `SEASON_SECONDS` (default 30) |
| Crossfade length | `BLEND_SECONDS` (default 5) |
| Sky colours, wind, cloud count per season | the `SEASONS` array |
| Butterfly wing colours | `WING_COLOURS` |
| Flower colours | `FLOWER_COLOURS` |
| How many of each | `populate()` |

To remove the scene from a page entirely, delete its `<canvas id="scene-canvas">`,
its `<button id="scene-toggle">` and the `scene.js` `<script>` tag.

---

## What is real on this site, and what is waiting

Nothing here is invented or borrowed. That was a hard rule while building it.

**Real and verified**

* The tagline, welcome message, the "~ By My Dad" quote and the
  "~ Yours Venuka" paragraph are taken word-for-word from Venuka's own
  Google Site.
* All 14 YouTube videos, their ids, their titles and their publication dates
  were checked directly against the Happy Learning Kids channel.
* **Frog and Duck** is a photograph of the real sketchbook page, dated
  30 August 2023 in Venuka's own handwriting. It came from the original site.
* The other 13 gallery pictures are still frames from Venuka's own videos.
  Every one of them is labelled **"Still from video"** on the card and again in
  the full-size view, so nobody is misled about what they are looking at.
  They can be replaced with proper photographs at any time.

**Deliberately empty, clearly labelled**

| Where | Why |
|---|---|
| Arts & Crafts gallery | No craft has been photographed yet. The page says so plainly. |
| "Pencil Drawings" / "Special Artwork" filters | Shows an honest empty state rather than padding the category. |
| Email, Instagram, Facebook, WhatsApp | No real addresses were supplied, so none were invented. |
| Contact form delivery | No form service is connected. A valid submission says the message was **not** sent and points at YouTube instead. |
| Printable activities | Announced as coming, with nothing pretending to be downloadable. |

**Two things left out on purpose — please confirm**

1. *A photograph of Venuka.* One exists on this machine but publishing a
   photograph of a child is the family's decision, not a build decision, so the
   About page has a space kept for it instead.
2. *Her school year and board.* The old Google Site listed these under
   "Education". They were left off here because they are identifying details
   about a child. Say the word and they can go back in.

Neither of these is required by anything on the site.

---

## Accessibility and performance notes

* Semantic HTML, one `<h1>` per page, real landmarks, skip link on every page.
* Every artwork image has a written `alt` description of what it shows.
* Full keyboard support: menu, filters, search, and the lightbox
  (`←` `→` to move, `Esc` to close, focus trapped inside, focus restored on close).
* Visible focus rings everywhere; colours checked for contrast against the cream
  background.
* `prefers-reduced-motion` turns off every animation, float and transition.
* YouTube players are **not** loaded until a visitor presses play, and then they
  load from `youtube-nocookie.com`. Until then, only local thumbnails are used —
  nothing is requested from Google.
* Images are lazy-loaded with width and height set, so nothing jumps as it loads.
* If an image fails to load, the card falls back to a labelled placeholder rather
  than a blank box.
* Content is visible by default; the scroll-reveal animation only hides things
  once JavaScript has confirmed it can show them again.

## The four documents

| Document | Read it when |
|---|---|
| **README.md** (this) | You want to know what it is and how to run it |
| **[CONTENT-GUIDE.md](CONTENT-GUIDE.md)** | You are adding a drawing, craft or video |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | You are putting it online, or something broke |
| **STATUS.html** | You want the plain-language picture of what is done — open it in a browser |
| **REGISTRY.md** | You need the exact file and line for something |

## Licence and credit

All drawings, photographs and videos are Venuka's own work.
Please do not reuse the artwork without the family's permission.
