# Registry — every asset, component and feature in the Venuka website

**Purpose:** a lookup table, not a narrative. When you want to say "align this better" or
"move that to an admin area", find the item here first — exact file, selector or function,
current status — instead of re-describing it or re-deriving it from the code.

**Companion documents:** `STATUS.html` (same information, plain language, for non-developers)
· `DEPLOYMENT.md` (publishing) · `CONTENT-GUIDE.md` (adding new work).

`STATUS.html` is generated, not written. Its source is `status-data.json`, `TASKS.json` and
`diagrams.py`; rebuild with the status-page skill's `build_status.py` and never hand-edit the
HTML — anything typed into it is lost on the next build. This file is the developer-facing
half of that pair and is maintained by hand, in step with it.

## How to read this

- **Location** — file, plus a CSS id/class, function name or line range inside it.
- **Status** — ✅ Real/Done · 📝 Draft · ⚠️ Placeholder · 🚧 Known gap (same vocabulary as the
  status page, so the two never disagree about the same item).
- **Admin** — 🔧 marks content a non-developer could plausibly edit through a future admin
  panel. Blank means behaviour/logic that stays code.

*Last rescanned: 4 November 2026 — counts read from `data.js`, not remembered.*

---

## 1. Pages

| Name | Location | Status | Admin | Details |
|---|---|---|---|---|
| Home | `index.html` | ✅ | | Hero, welcome ribbon, about teaser, four newest drawings, latest videos. |
| About | `about.html` | ✅ | 🔧 | Five prose sections plus the dad quote. Holds an empty space for a photograph. |
| Drawings gallery | `drawings.html` | ✅ | | Search, eight category chips, count line, full-size view. |
| Sketchbook | `sketchbook.html` | ✅ | | Page-turning view of the same 23 drawings. |
| Videos | `videos.html` | ✅ | | 14 videos, tag chips, search, in-place playback. |
| Arts & crafts | `crafts.html` | 🚧 | | Gallery built, `crafts` array empty, so it renders its empty state. Craft ideas section is real. |
| New creations | `new-creations.html` | ✅ | | Newest drawings and videos, plus a "what this page is waiting for" note. |
| Learn & Create | `learn.html` | ✅ | 🔧 | Six ideas, the method, five colouring tips, six materials. |
| Say hello | `contact.html` | ✅ | | Four fields, consent box, honeypot, live validation. |
| Privacy notice | `privacy.html` | ✅ | 🔧 | Seven headings covering collection, storage, retention, cookies, choices. |
| Not-found | `404.html` | ✅ | | Served by the host for unknown paths. Not counted as a site page by `check.js`. |
| Status page | `STATUS.html` | ✅ | | **Generated.** Excluded from the published site by `build.js` and from the page count by `check.js`'s `INTERNAL_HTML`. |

## 2. The moving scene

Everything here is `assets/js/scene.js` (1,284 lines), drawn to `#scene-canvas` on all 11 pages.

| Name | Location | Status | Admin | Details |
|---|---|---|---|---|
| Season cycle | `SEASONS` (line 56), `updateSeason()` (107) | ✅ | 🔧 | Sunny ☀️, Cloudy ⛅, Rain 🌧️, Snow 🌨️. Nothing reads `SEASONS` directly — everything reads the blended live season, so a crossfade is two seasons mixed by `t`. |
| Sky | `drawSky()` (151), `refreshSky()` (509) | ✅ | | Three-stop gradient, colours interpolated per season. |
| Sun | `drawSun()` (160) | ✅ | | Position, size and colour all season-driven. |
| Clouds | `makeCloud()` (185), `updateClouds()` (206) | ✅ | | Count targets the season; each cloud's shape is generated. |
| Rain and snow | `spawnDrop()` (251), `updateWeather()` (262), `drawWeather()` (302) | ✅ | | `dropCount()` scales with the season's `rain`/`snow` values. |
| Snow depth | `addSnowDepth()` (342), `updateGround()` (347) | ✅ | | Accumulates along the ground and melts back. |
| Flowers | `makeFlower()` (414), `updateFlowers()` (436) | ✅ | | Depth-sorted; `depthScale()` (412) maps depth to 0.62–1.5. |
| Butterflies | `makeButterfly()` (596), `avoidPanels()` (559), `placeInClearSky()` (617) | ✅ | | Steer around text panels, so they never sit over copy being read. |
| Wind and gusts | `updateWind()` (141) | ✅ | | One wind value that flowers, clouds and butterflies all read. |
| Weather badge | `#scene-toggle`, `badge` (1207) | ✅ | 🔧 | Shows the season; the off choice persists via `localStorage`, wrapped in try/catch for private mode (1223–1226). |
| Reduced motion | `prefersReduced` (33) | ✅ | | Honours `prefers-reduced-motion` without being asked twice. |

## 3. Shared across every page

All in `assets/js/site.js` (611 lines) unless noted; exported on `window.VenukaUI` (604).

| Name | Location | Status | Admin | Details |
|---|---|---|---|---|
| Top nav + phone toggle | `initNav()` (434), `.nav-toggle` | ✅ | | Marks the current page. |
| Skip link | `.skip-link` in every page head | ✅ | | Visible on focus. |
| Footer | `.site-footer`, `.footer-nav`, `.footer-social`, `.footer-blurb` | ✅ | 🔧 | |
| Footer email slots | `initFooterContact()` (496), `[data-contact-email]`, `[data-contact-email-enquiry]` | ✅ | 🔧 | HTML ships the null state, so a null address or a failed `data.js` leaves a tidy "not added yet" pill rather than a link to nowhere. Verified both ways. |
| Year | `initYear()` (486) | ✅ | | |
| Lightbox | `Lightbox` (221), `#artwork-lightbox` | ✅ | | `role="dialog"`, Escape closes, figure + details panel + actions. |
| Artwork tiles → lightbox | `initArtworkTiles()` (539) | ✅ | | Delegated, so it survives a re-render; scoped by `[data-lightbox-scope]`. |
| Placeholder | `placeholderMarkup()` (53) | ✅ | | Never substitutes stock art — says what is missing. |
| Broken-image guard | `guardImages()` (66) | ✅ | | Swaps a failed `img[data-guard]` for the placeholder, once. |
| Image resolution | `artworkImage()` (39) | ✅ | | Photo if `source === "photo"`, else the video still, else null. |
| Cards | `artworkCard()` (79), `videoCard()` (112), `craftCard()` (140) | ✅ | | |
| Empty state | `emptyState()` (170) | ✅ | | |
| Loading skeletons | `skeletonGrid()` (179) | ✅ | | |
| Data-failure message | `checkData()` (563) | ✅ | | "This part could not be loaded" instead of a blank gallery. |
| Reveal on scroll | `initReveal()` (468) | ✅ | | |

## 4. Collections and galleries

| Name | Location | Status | Admin | Details |
|---|---|---|---|---|
| Filter + search engine | `initCollection()` (334) | ✅ | | Shared by drawings and videos; builds chips with live counts and an honest empty state. |
| Drawings page wiring | `page-drawings.js` (41 lines), `#art-search`, `#art-filters`, `#art-count`, `#art-grid` | ✅ | | |
| Videos page wiring | `page-videos.js` (37), `#vid-*` ids | ✅ | | Embeds via `youtube-nocookie.com` (`videoEmbedUrl()`, site.js 47). |
| Crafts page wiring | `page-crafts.js` (35), `#craft-grid`, `#craft-ideas` | 🚧 | | Works; nothing to show. |
| Home page wiring | `page-home.js` (33), `#featured-drawings`, `#latest-videos` | ✅ | | |
| New creations wiring | `page-new.js` (29), `#new-artwork`, `#new-videos` | ✅ | | |
| Learn page wiring | `page-learn.js` (40), `#drawing-ideas`, `#colouring-tips` | ✅ | | |
| Sketchbook | `sketchbook.js` (293), `sketchbook.css` (573), `#sketchbook` | ✅ | | Reads `window.VENUKA.artworks` — no second list to keep in step. 900 ms page turn; still version under reduced motion. |

## 5. Content — `assets/js/data.js` (588 lines, `window.VENUKA`)

| Name | Location | Status | Admin | Details |
|---|---|---|---|---|
| Site strings | `site` (21) | ✅ | 🔧 | name, channelName, channelUrl, hashtag `#KidsArtMagic`, tagline, supporting, welcome, dadQuote + attribution, previousSite. |
| Contact email | `emailAddress` (48) | 🚧 | 🔧 | `null`. One const, referenced once; drives the contact page, the footer pill and the footer enquiry link across all pages. |
| Contact channels | `contact` (50) | 📝 | 🔧 | YouTube set; Instagram, Facebook, WhatsApp all `null` with per-channel placeholder text. |
| Form endpoint | `formEndpoint` (66) | ✅ | | Google Apps Script URL. Live and confirmed working. Visible in page source — see decisions. |
| Analytics token | `analytics.cloudflareToken` (85) | 🚧 | 🔧 | `null`. Nothing is requested while it is null. |
| Categories | `categories` (88) | ✅ | 🔧 | 8 labels. All 8 now have drawings — "Special Artwork" has 7, having been empty in August. |
| Videos | `videos` (105) | ✅ | 🔧 | 14. Keys: id, title, ytTitle, description, tags, published. Tags used: Animals 8, Colouring 7, Step by step 6, Easy 5, Birds 4, Cute Characters 4, Nature 1. |
| Artworks | `artworks` (227) | ✅ | 🔧 | 23. Keys: id, title, source, image, alt, description, categories, materials, difficulty, date, video. `source` is `photo` ×10 / `video` ×13. |
| Crafts | `crafts` (537) | 🚧 | 🔧 | `[]`. |
| Drawing ideas | `drawingIdeas` (543) | ✅ | 🔧 | 6. |
| Colouring tips | `colouringTips` (552) | ✅ | 🔧 | 5. |
| Craft ideas | `craftIdeas` (560) | ✅ | 🔧 | 4. |
| Materials list | `materialsList` (567) | ✅ | 🔧 | 6. |
| Encouragements | `encouragements` (576) | ✅ | 🔧 | 4. |

## 6. Contact form

| Name | Location | Status | Admin | Details |
|---|---|---|---|---|
| Fields | `contact.html` `#cf-name`, `#cf-email`, `#cf-subject`, `#cf-message`, `#cf-consent` | ✅ | | Each with its own `-error` element and, for email and message, a `-hint`. |
| Spam trap | `#cf-website`, `.hp-wrap` in `style.css` | ✅ | | Off-screen (not `display:none`, which bots detect), `aria-hidden`, `tabindex="-1"`. Checked before field validation, so a bot is never told which boxes to fix. Verified: honeypot submissions never reach the network. |
| Transport | `page-contact.js` (218 lines) | ✅ | | POSTs JSON as `text/plain;charset=utf-8` — `application/json` would trigger a CORS preflight Apps Script cannot answer. Success is confirmed by parsing the body for `ok:false`, because Apps Script answers HTTP 200 even when it refuses. |
| Receiver | `tools/google-sheet-form.gs` (157) | ✅ | 🔧 | Honeypot check, required-field and email validation, 5,000-char trim, 20/hour rate limit, LockService against concurrent writes, optional email alert. |
| Result message | `#cf-result` | ✅ | | Reports a real success or a real failure; never claims delivery it did not get. |

## 7. Deploy tooling

| Name | Location | Status | Admin | Details |
|---|---|---|---|---|
| Pre-deploy checks | `tools/check.js` | ✅ | | 66 checks, zero dependencies, about a second. Each failure class verified by deliberately breaking it. `INTERNAL_HTML` (line 38) keeps `STATUS.html` out of the page count. |
| Site assembler | `tools/build.js` (113) | ✅ | | Copies the 11 pages, `assets/`, `robots.txt`, `sitemap.xml`, `.nojekyll` into a fresh `dist/`. **Allow-list, not deny-list**: anything new is excluded by default. Refuses to finish if a working document or `index.html` is missing from the result. Verified by serving `dist/` — 56 files, 1.92 MB, every document 404. |
| Web address setter | `tools/set-domain.js` (84) | ✅ | | Rewrites og:image/og:url/canonical across 9 pages + sitemap + robots. Idempotent. **Not yet run for the new address.** |
| Status page source | `status-data.json`, `TASKS.json`, `diagrams.py` | ✅ | 🔧 | 92 items in 15 groups, 5 decisions, 43 sub-tasks across 14 tasks and 4 phases, 2 diagram topics / 3 versions. Built with the status-page skill's `build_status.py`, which validates before writing. |
| Old CI workflow | `.github/workflows/deploy.yml` | 🚧 | | Served the live GitHub Pages site and is proven. Its `deploy` job needs GitHub Pages, which a private repository cannot use for free, so it is **to be deleted**. |
| Cloudflare build | build command on the Pages project | 🚧 | | `node tools/check.js && node tools/build.js`, output `dist`. Not yet connected. |
| Repository | this folder on `master` | 🚧 | | `github.com/itsmehara/venuka-art`. Currently public; to be made private, which is what forces the host change. |
| Web address | GoDaddy DNS + Cloudflare Pages | 🚧 | | Decided: `artbyvenuka.nischayacreativesoft.com`. Verified live 3 Nov: apex has GitHub's four `A` records, `www` CNAMEs to `itsmehara.github.io`, one Google verification TXT, **no MX**, no other subdomains. Nameservers stay at GoDaddy. CNAME goes in **after** the domain is added in Cloudflare, or error 522. |
| Ignore rules | `.gitignore` (109) | ✅ | | OS junk, editor dirs, `_*` drafts, secrets, archives, `dist/`, `notes/`, `originals/`. Underscore rules are per-extension (`_*.html`, `_*.js`…) **not** a bare `_*`, because `assets/img/video/_hIeRYpy_Ak.jpg` is a real thumbnail whose YouTube id starts with an underscore. |
| Jekyll opt-out | `.nojekyll` | ✅ | | Was for GitHub Pages. Harmless and unused on Cloudflare; copied into `dist/` anyway. |

## 8. Assets

| File | Size | Used by | Status | Details |
|---|---|---|---|---|
| `assets/img/artwork/frog-and-duck-2023{,-640,-384}.jpg` | 166 KB + 2 smaller | hero `index.html`, gallery, og-cover source | ✅ | Three widths. Dated 30/08/2023 in her handwriting. |
| `assets/img/artwork/*.webp` × 9 | 732 KB total with the jpgs | gallery, sketchbook | ✅ | a-boat-ride, cute-girl, garden-of-shapes, giraffe-with-leaves, layered-landscape, pink-flowers, rainbow-lake-landscape, rainbow-unicorn, starry-night-with-moon. |
| `assets/img/video/<id>.jpg` × 14 | 904 KB (avg 62 KB) | video cards, and 13 drawings with no photograph | ✅ | Filename **must** equal the YouTube video id. |
| `assets/img/og-cover.jpg` | 146 KB | social previews, all 9 pages | ✅ | 1200×630 centre crop of the frog-and-duck photo. |
| `assets/img/logo.svg` | 0.7 KB | header, footer | ✅ | |
| `assets/img/favicon.svg` | 0.4 KB | browser tab | ✅ | |
| `assets/img/crafts/` | README only | crafts page | 🚧 | Waiting on the first craft photograph. |
| `assets/css/style.css` | 1,006 lines | all pages | ✅ | |
| `assets/css/sketchbook.css` | 573 lines | `sketchbook.html` | ✅ | |

## 9. Known gaps and open decisions

| Item | Where it shows | Status | Details |
|---|---|---|---|
| Photo of Venuka | About page holds a space | 🚧 | Family decision. Private repo does not change it — the website is public either way. |
| School year / board | Omitted from About | 🚧 | On the old Google Site; left out as an identifying detail about a child. |
| Videos missing from the site | `data.js` `videos` | 🚧 | Seven, counted 30 Aug against the channel feed. **Not re-counted since**; the collection has grown from 14 drawings to 23 meanwhile. |
| Craft photographs | `crafts` is `[]` | 🚧 | Page, card component and folder all ready since 30 Aug. |
| Email address | `emailAddress` is `null` | 🚧 | Form + YouTube are the only routes. Both null states verified. |
| Four drawings without a date | `artworks` | 📝 | starry-night-with-moon, rainbow-lake-landscape, pink-flowers, layered-landscape. They sort last under "newest first". |
| Nine drawings without materials | `artworks` | 📝 | Render "Not recorded yet" rather than a guess. |
| 13 drawings with no photograph | `artworks` `source: "video"` | 📝 | Fall back to the video still via `artworkImage()`. Honest, but a photograph would be better. |
| Link previews / sitemap | 9 pages + `sitemap.xml` | 📝 | Still set to the `…github.io/venuka-art/` address. Re-run `set-domain.js` once the subdomain answers. |
| Visitor counting | `analytics.cloudflareToken` | 🚧 | One line. Cookieless, so no consent banner. |
| Instagram / Facebook / WhatsApp | `contact` | 🚧 | Slots exist, each with its own placeholder text. |

## 10. Quick lookup — "I want to say 'change X'"

| If you mean… | Say this instead | Which lands in |
|---|---|---|
| The big drawing on the opening screen | "the hero frame, home page" | `.hero` in `index.html`, `.frame` in `style.css` |
| The green line at the bottom of the first screen | "the welcome ribbon" | `site.welcome` in `data.js` |
| The buttons that narrow the gallery | "the category chips" | `initCollection()`, `site.js:334` |
| The big picture that opens on a click | "the lightbox" | `Lightbox`, `site.js:221` |
| The weather icon, bottom right | "the scene badge" | `#scene-toggle`, `scene.js:1207` |
| The "not added yet" pill in the footer | "the footer email slot" | `initFooterContact()`, `site.js:496` |
| The book that turns pages | "the sketchbook" | `sketchbook.js`, `sketchbook.css` |
| The grey boxes before content appears | "the loading skeletons" | `skeletonGrid()`, `site.js:179` |
| What appears when a link is shared | "the og-cover" | `assets/img/og-cover.jpg`, set by `tools/set-domain.js` |
