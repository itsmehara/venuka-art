# Registry — every asset, component and feature in the Venuka website

**Purpose:** a lookup table, not a narrative. When you want to say "align this better" or
"move that to an admin area", find the item here first — exact file, selector or function,
current status — instead of re-describing it or re-deriving it from the code.

**Companion documents:** `STATUS.html` (same information, plain language, for non-developers)
· `DEPLOYMENT.md` (publishing) · `CONTENT-GUIDE.md` (adding new work).

## How to read this

- **Location** — file, plus a CSS id/class, function name or line range inside it.
- **Status** — ✅ Real/Done · 📝 Draft · ⚠️ Placeholder · 🚧 Known gap
- **Admin** — 🔧 marks content a non-developer could plausibly edit through a future admin
  panel. Blank means behaviour/logic that stays code.

---

## 1. Pages

| Name | Location | Status | Admin | Details |
|---|---|---|---|---|
| Home | `index.html` (7 sections) | ✅ | | Hero, intro, featured drawings, latest videos, crafts teaser, activities, channel callout. |
| About Venuka | `about.html` (3 sections) | ✅ | 🔧 | Prose is hand-written from her own Google Site wording. |
| Drawings gallery | `drawings.html` | ✅ | | Toolbar + `#art-grid`, rendered by `page-drawings.js`. |
| Arts & Crafts | `crafts.html` | ✅ | | Renders `#craft-grid`; falls back to an empty state while `crafts` is `[]`. |
| Drawing videos | `videos.html` | ✅ | | Toolbar + `#vid-grid`, rendered by `page-videos.js`. |
| Learn & Create | `learn.html` (6 sections) | ✅ | 🔧 | Six list-driven regions, all from `data.js`. |
| New Creations | `new-creations.html` | ✅ | | Date-sorted; no manual ordering. |
| Contact | `contact.html` | 📝 | | Form validated and tested; delivery not configured (`formEndpoint: null`). |
| Not-found | `404.html` | ✅ | | GitHub Pages serves this automatically for unknown paths. |

## 2. Content model — the only file to edit

| Name | Location | Status | Admin | Details |
|---|---|---|---|---|
| Site identity | `data.js:21` `site` | ✅ | 🔧 | Name, tagline, welcome line, channel URL, hashtag. |
| Contact fields | `data.js:44` `contact` | 🚧 | 🔧 | Only `youtube` has an `href`; email/instagram/facebook/whatsapp are `null` by design. |
| Form endpoint | `data.js:58` `formEndpoint` | 🚧 | 🔧 | `null`. Set to an https POST URL to switch the form on. |
| Categories | `data.js:61` `categories` | ✅ | 🔧 | 8 entries. "Special Artwork" is intentionally unused. |
| Videos | `data.js:78` `videos` | ✅ | 🔧 | 14 entries. `ytTitle` is search-only; `title` is what displays. |
| Artworks | `data.js:200` `artworks` | ✅ | 🔧 | 14 entries: 1 `source:"photo"`, 13 `source:"video"`. |
| Crafts | `data.js:393` `crafts` | 🚧 | 🔧 | `[]`. A fully-commented example entry sits directly above it. |
| Learn lists | `data.js:399-437` | ✅ | 🔧 | `drawingIdeas` 6 · `colouringTips` 5 · `craftIdeas` 4 · `materialsList` 6 · `encouragements` 4. |

## 3. Shared components

| Name | Location | Status | Admin | Details |
|---|---|---|---|---|
| Artwork card | `site.js` `artworkCard()` | ✅ | | Image carries the real `alt`; the button adds "Open … in full size". |
| Video card | `site.js` `videoCard()` | ✅ | | Local thumbnail façade; iframe injected only on click. |
| Craft card | `site.js` `craftCard()` | ✅ | | Verified by injecting a demo entry at runtime; unused until `crafts` is filled. |
| Empty / error state | `site.js` `emptyState()` | ✅ | | Shared by every "nothing here" and failure panel. |
| Lightbox | `site.js` `Lightbox` | ✅ | | Focus trap, Esc, ←/→, focus restored on close. |
| Filter + search engine | `site.js` `initCollection()` | ✅ | | Shared by drawings and videos; builds chips with live counts. |
| Content guard | `site.js` `checkData()` | ✅ | | If `data.js` fails to parse, swaps every skeleton for an honest error panel and logs the reason. |
| Hero arrangement | `style.css` §15, `@media (min-width:900px)` | ✅ | | Headline full width, lede left, buttons stacked right. Below 900px it reverts to one column with a button row. |
| Hero headline sizing | `style.css` §15 `.hero h1` | ✅ | | Sized to the room the button column leaves. `.swash` cannot wrap, so an oversized headline would run out through the side of the card — verified clear at 20 widths, 320–1920px. |
| Image fallback | `site.js` `guardImages()` | ✅ | | A broken image becomes a labelled placeholder, never a blank box. |

## 4. Background scene — `assets/js/scene.js` (1,264 lines)

| Name | Location | Status | Admin | Details |
|---|---|---|---|---|
| Season cycle | `SEASONS` array, `updateSeason()` | ✅ | 🔧 | 30 s each, 5 s crossfade. Sky palettes deliberately light so page text keeps contrast. |
| Wind field | `updateWind()` | ✅ | | One shared value driving clouds, rain slant, snow drift and flower lean. |
| Butterfly physics | `updateButterflies()` | ✅ | | Gravity, drag, per-downstroke lift (peak 950 — must stay ≈ π × gravity or they sink), wander, arrival. |
| Wing rendering | `wingPath()`, `drawButterfly()` | ✅ | | Foreshortening via `cos(dihedral)`; floor of 0.38 so wings never vanish. |
| Flower springs | `updateFlowers()` | ✅ | | Spring-damper; torque from wind, resting weight and passing downwash. |
| Downwash | `stirFlowers()` | ✅ | | Why most flowers move, not just the landed-on one. Measured 8/13. |
| Obstacle avoidance | `avoidPanels()`, `refreshSky()` | ✅ | | Only `.art-frame` counts — text panels are 82% transparent so flying behind them is fine. |
| Cross-page continuity | `saveState()`, `loadState()` | ✅ | | `sessionStorage` key `venuka-scene-state`. |
| Pause control | `#scene-toggle`, `updateBadge()` | ✅ | | `localStorage` key `venuka-scene`. |
| Reduced motion | `staticFrame()` | ✅ | | One composed still frame, butterflies placed in clear sky. |

## 5. Deploy tooling

| Name | Location | Status | Admin | Details |
|---|---|---|---|---|
| Pre-deploy checks | `tools/check.js` | ✅ | | 55 checks, zero dependencies. Each failure class verified by deliberately breaking it. |
| Contact email | `data.js` `emailAddress` (one const) | ✅ | ✔ | The single source of truth. Appears literally in exactly one place in the whole codebase. Drives the contact page, the footer pill and the footer enquiry link on all ten pages. |
| Footer email rendering | `site.js` `initFooterContact()` | ✅ | | Upgrades `[data-contact-email]` and `[data-contact-email-enquiry]` slots at boot. The HTML ships the null state, so a null address or a failed `data.js` leaves a tidy "not added yet" pill rather than a link to nowhere. Verified both ways. |
| Contact form receiver | `tools/google-sheet-form.gs` (157 lines) | 📝 | ✔ | Apps Script for a private Google Sheet. Honeypot check, required-field and email validation, 5,000-char trim, 20/hour rate limit, LockService against concurrent writes, optional email alert. Inert until `formEndpoint` is set. |
| Form transport | `page-contact.js` | ✅ | | POSTs JSON as `text/plain;charset=utf-8` — `application/json` would trigger a CORS preflight that Apps Script cannot answer. Delivery is confirmed by parsing the body for `ok:false`, because Apps Script answers HTTP 200 even when it refuses. |
| Spam trap | `contact.html` + `.hp-wrap` in `style.css` | ✅ | | Off-screen (not `display:none`, which bots detect), `aria-hidden`, `tabindex="-1"`. Checked before field validation so a bot is never told which boxes to fix. Verified: honeypot submissions never reach the network. |
| Visitor analytics | `data.js` `analytics`, `site.js` `initAnalytics()` | 📝 | ✔ | Cloudflare Web Analytics, injected only when a token is set. Cookieless, so no consent banner. Nothing is requested at all while the token is null. |
| Web address setter | `tools/set-domain.js` (84 lines) | ✅ | | Rewrites og:image/og:url/canonical across 9 pages + sitemap + robots. Idempotent. |
| Site assembler | `tools/build.js` (113 lines) | ✅ | | Copies the website — 11 pages, `assets/`, `robots.txt`, `sitemap.xml`, `.nojekyll` — into a fresh `dist/`. **Allow-list, not deny-list**: a new private file is left out by default. Mirrors `check.js`'s `INTERNAL_HTML` set and its `_`-prefix rule. Refuses to finish if a working document or `index.html` is missing from the result. Verified by serving `dist/` — 56 files, 1.92 MB, and `STATUS.html`, the `.md` documents and `tools/` all 404. |
| Web address | GoDaddy DNS + Cloudflare Pages | 🚧 | | **Decided: `artbyvenuka.nischayacreativesoft.com` on Cloudflare Pages.** Verified live: the apex carries four GitHub `A` records, `www` CNAMEs to `itsmehara.github.io`, one Google verification TXT, **no MX** and no other subdomains — so the subdomain is additive and the company site is untouched. Nameservers stay at GoDaddy; Cloudflare Pages needs a zone on its own account only for a bare apex, not for a subdomain. Pending: repo→private, Pages off, workflow deleted, Cloudflare project connected, CNAME `artbyvenuka` → `venuka-art.pages.dev` (**after** the domain is added in Cloudflare, or error 522), `set-domain.js` run. Steps in `DEPLOYMENT.md`. |
| CI workflow | `.github/workflows/deploy.yml` | 🚧 | | Served the live GitHub Pages site and is proven, but its `deploy` job needs GitHub Pages, which a private repository cannot use for free. **To be deleted** when the repo goes private; Cloudflare's build command replaces it. |
| Cloudflare build | build command on the Pages project | 🚧 | | `node tools/check.js && node tools/build.js`, output directory `dist`. The checks are the gate — a failing check fails the build, so nothing is published and the live site is untouched. Not yet connected. |
| Ignore rules | `.gitignore` (109 lines) | ✅ | | OS junk, editor dirs, `_*` drafts, secrets, archives, `originals/`. Underscore rules are per-extension (`_*.html`, `_*.js`…) **not** a bare `_*`, because `assets/img/video/_hIeRYpy_Ak.jpg` is a real thumbnail whose YouTube id starts with an underscore. |
| Repository | this folder on `master` | 🚧 | | `https://github.com/itsmehara/venuka-art`, branch `master`. Currently **public**; to be made **private**, which is what forces the move off GitHub Pages. |
| Published file set | `git ls-files` | ✅ | | 54 files after the pre-launch update. Private working notes, editor settings, secrets, and originals remain ignored. First commit `3c6bf46`. |
| Personal-identity scrub | `DEPLOYMENT.md` | ✅ | | Moot once the repository is private and the address is the subdomain: the handle appears in neither. `DEPLOYMENT.md` now uses the real repo and account names, because it is private and `build.js` keeps it off the website. The published `og:url`/`canonical` tags still carry the `…github.io` address until `set-domain.js` is re-run. |
| Jekyll opt-out | `.nojekyll` | ✅ | | Stopped GitHub Pages filtering files. Harmless and unused on Cloudflare Pages; copied into `dist/` anyway. |

## 6. Assets

| File | Size | Used by | Status | Details |
|---|---|---|---|---|
| `assets/img/artwork/frog-and-duck-2023.jpg` | 166 KB | hero `index.html`, gallery | ✅ | The only real artwork photograph. Dated 30/08/2023 in her handwriting. |
| `assets/img/video/<id>.jpg` × 14 | 904 KB total (avg 62 KB) | video cards, 13 gallery tiles | ✅ | Filename **must** equal the YouTube video id. |
| `assets/img/og-cover.jpg` | 146 KB | social previews, all 9 pages | ✅ | 1200×630 centre crop of the frog-and-duck photo. |
| `assets/img/logo.svg` | 0.7 KB | header, footer | ✅ | |
| `assets/img/favicon.svg` | 0.4 KB | browser tab | ✅ | |
| `assets/img/crafts/` | empty | crafts page | 🚧 | Waiting on the first craft photograph. |

## 7. Known gaps and open decisions

| Item | Where it shows | Status | Details |
|---|---|---|---|
| Photo of Venuka | About page holds a space | 🚧 | Family decision. File exists at `~/Desktop/youtube/venuka.png`. |
| School year / board | Omitted from About | 🚧 | On the old Google Site; left out as an identifying detail about a child. |
| 7 videos missing | `data.js` `videos` | 🚧 | Present on the channel feed, absent from the site. Ids in the session notes. |
| Craft photographs | `crafts` is `[]` | 🚧 | Page and card component both ready. |
| Form delivery | `formEndpoint` | ✅ | Connected to the private Google Sheet Apps Script endpoint. |
| Link previews / sitemap | 9 pages + `sitemap.xml` | 📝 | Set to the free GitHub address. Re-run `tools/set-domain.js` when the subdomain is live. |
| Web address | GoDaddy DNS + Cloudflare | 🚧 | `artbyvenuka.nischayacreativesoft.com` on Cloudflare Pages — decided, and free. Five steps pending, in order — see `DEPLOYMENT.md`. |
| Repository visibility | GitHub settings | 🚧 | Going private. Kills the current `…github.io/venuka-art/` address; send anyone who has it the new one. |
| "Special Artwork" | Gallery filter | 🚧 | Intentionally empty; shows an honest empty state. |
| Materials / difficulty | 9 of 14 drawings | 📝 | Blank fields render "Not recorded yet" rather than a guess. |

## 8. Quick lookup — "I want to say 'change X'"

| If you mean… | Say this instead | Which lands in |
|---|---|---|
| The big headline on the front page | "the hero panel" | `.hero-copy`, `index.html` |
| The welcome line resting on the grass | "the welcome row" | `.hero-welcome-row`, `index.html` |
| The see-through boxes over the meadow | "the airy panels" | `.hero-copy`, `.callout`, `.section--sky/--sun`, `style.css` §15 |
| The little weather button, bottom right | "the scene toggle" | `#scene-toggle`, `style.css` |
| The coloured buttons above the gallery | "the category chips" | `.chip`, built in `initCollection()` |
| The big picture view when you click a drawing | "the lightbox" | `Lightbox` in `site.js` |
| The corner circle / triangle / square shapes | "the deco layer" | `.deco-layer`, `.deco--circle` etc. |
| The strip of grass and flowers | "the meadow" | `drawGround()`, `drawFlower()` in `scene.js` |
| The loading placeholders | "the skeletons" | `.skeleton-grid`, `skeletonGrid()` |
| The "photo coming soon" box | "the placeholder state" | `placeholderMarkup()` in `site.js` |

---

*Snapshot taken 30 August 2026 (repository set up, ignore rules written). This file is not continuously synced — refresh it alongside
`STATUS.html` whenever the project changes materially.*
