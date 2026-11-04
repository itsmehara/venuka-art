# Putting the Venuka website online

Everything you need to go live, in order. Written to be followed straight
through.

> **This document is never published.** `tools/build.js` copies only the
> website into `dist/`, and `dist/` is what the host serves. This file, along
> with `STATUS.html` and the files it is built from (`status-data.json`,
> `TASKS.json`, `diagrams.py`), `REGISTRY.md`, `CONTENT-GUIDE.md`, `README.md`
> and `notes/`, stays in the repository and off the web. Verified: they return
> 404 on the built site.

---

## 1. The two decisions, already made

### The repository is **private**

Not because anything in it is dangerous — there are no passwords or keys, and
every contact field is deliberately `null` — but because the working notes in
it discuss a child: whether to publish her photograph, whether to name her
school year. Those are family conversations, and they do not belong in a
window strangers can read.

That choice rules out free GitHub Pages. GitHub Pages publishes from a private
repository only on a **paid** plan (GitHub Pro, about $4 a month); on a free
account the repository must be public. So the host changes.

### The host is **Cloudflare Pages**

| | GitHub Pages | GitHub Pro | **Cloudflare Pages** |
|---|---|---|---|
| Private repository | ✗ | ✓ | **✓** |
| Cost | Free | ~$4/month | **Free** |
| Runs the checks before publishing | ✓ | ✓ | **✓** (it *is* the build command) |
| Custom subdomain, DNS staying at GoDaddy | ✓ | ✓ | **✓** |
| Free HTTPS certificate | ✓ | ✓ | **✓** |

Cloudflare Pages is free, has no public-repository condition, and reaches India
quickly. Nothing is lost by moving.

### The address is **artbyvenuka.nischayacreativesoft.com**

A subdomain of the company domain. It costs nothing — GoDaddy does not charge
for DNS records — and it does not disturb `nischayacreativesoft.com` itself,
which stays exactly where it is, on GitHub Pages. The apex and the subdomain
are independent records; they can live on different hosts and never meet.

**The nameservers stay at GoDaddy.** Cloudflare Pages does not need the domain
moved to Cloudflare in order to serve a *subdomain* of it — one CNAME record at
GoDaddy is enough. Moving nameservers would mean touching the live company
site, and there is no reason to.

---

## 2. Before you go live — the parent checklist

- [ ] **The photo of Venuka.** Still deliberately left out. If you add it, the
      *website* is public even though the repository is not — so it is public
      forever. This is the one worth sleeping on.
- [ ] **Her school year and board.** The old Google Site listed both. Left out
      here on purpose — identifying details about a child.
- [ ] **Turn off Issues, Wiki and Discussions** on the repo (Settings → General
      → Features). A private repo makes this less urgent, but do it anyway in
      case it is ever made public.
- [ ] **The contact page** publishes only the YouTube channel plus the form. If
      you add an email or WhatsApp number to `data.js`, it becomes public and
      scrapeable. A separate address kept for this is wiser than your personal
      one.
- [ ] **Accept that the drawings become downloadable.** Anyone can right-click
      and save them. They already can on YouTube, so this changes little — but
      it should be a decision, not a surprise.

---

## 3. Making the repository private

The site is currently public at `https://itsmehara.github.io/venuka-art/`.

**Already done — the publishing workflow is deleted.** `.github/` is gone from
the repository, so no push can put anything on the web any more. The live site
is frozen on its last deploy: it keeps serving the eleven pages exactly as they
are, and will go on doing so until GitHub Pages is switched off below. Nothing
you commit between now and Cloudflare will change it, which is the point — the
only thing that publishes from here on is Cloudflare, once you connect it.

Two things left, and they are yours to click.

**1. Flip the repository to private.**
`venuka-art` → Settings → General → scroll to **Danger Zone** → *Change
repository visibility* → **Private**.

**2. Switch GitHub Pages off**, so no stale public copy is left behind.
Settings → Pages → **Source: None**. On a free account the publish would stop
working anyway once the repo is private, but leaving it half-on is untidy and
confusing later.

You can do these now or at the moment Cloudflare goes live. Doing them now
takes the old address down a little early; doing them after means the two
addresses overlap for a while, both serving the same site. Neither is wrong.

> **One thing to know.** The old `itsmehara.github.io/venuka-art/` address will
> stop working. If you have already shared that link with anyone, send them the
> new one when it is live.

---

## 4. Connecting Cloudflare Pages

A Cloudflare account is free and takes a minute to make.

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**.
2. Authorise the Cloudflare GitHub App. When it asks which repositories,
   choose **Only select repositories** and pick `venuka-art` alone — not "All
   repositories". Cloudflare then has read access to this one repo and nothing
   else of yours.
3. Pick `venuka-art`, production branch **`master`**.
4. Build settings:

   | Field | Value |
   |---|---|
   | Framework preset | **None** |
   | Build command | `node tools/check.js && node tools/build.js` |
   | Build output directory | `dist` |

5. **Save and Deploy.**

You get a free address immediately — `venuka-art.pages.dev` — which keeps
working forever alongside the custom domain. Open it and check the site loads.

### Why that build command matters

`tools/check.js` runs the 66 content checks. If a comma is missing in
`data.js`, the command fails, the deploy never happens, and the live site stays
exactly as it was — the same safety the GitHub workflow gave you. That workflow
is deleted now, so this build command is the only place the checks still run.
If you ever change it, keep `node tools/check.js &&` on the front.

`tools/build.js` then copies **only the website** into `dist/`: the eleven
pages, `assets/`, `robots.txt`, `sitemap.xml`. Everything else — this file,
`STATUS.html`, `REGISTRY.md`, `CONTENT-GUIDE.md`, `README.md`, `notes/`,
`tools/` — is left behind. It allows a short list rather than excluding one, so
a private note added next month is left out by default rather than needing to
be remembered.

Run both yourself any time:

```bash
node tools/check.js && node tools/build.js
```

---

## 5. Pointing the subdomain at it

**Order matters here.** Add the domain in Cloudflare *first*. A CNAME created
before Cloudflare knows about the domain resolves to a Cloudflare address that
has not been told what to serve, and visitors get **error 522** until it
catches up.

**1. In Cloudflare.** Your Pages project → **Custom domains** → *Set up a
domain* → type `artbyvenuka.nischayacreativesoft.com` → Continue. Cloudflare
sees the domain is not on this account and shows you the CNAME to create.

**2. At GoDaddy.** Domains → `nischayacreativesoft.com` → **DNS** → Add record:

| Type | Name | Value | TTL |
|---|---|---|---|
| CNAME | `artbyvenuka` | `venuka-art.pages.dev` | 1 hour |

No `https://`, no trailing dot, no trailing slash. **Leave the `@` and `www`
records alone** — those are the company site, on GitHub Pages, and must not
change. Current records, for reference, so you can see nothing else is touched:

```
@      A      185.199.108.153 / .109.153 / .110.153 / .111.153   <- company site
www    CNAME  itsmehara.github.io                                 <- company site
@      TXT    google-site-verification=...                        <- leave alone
```

**3. Wait.** Cloudflare verifies the record and issues the HTTPS certificate —
usually a few minutes, occasionally an hour. The Custom domains panel shows
**Active** when it is done.

**4. Tell the site its own address**, so WhatsApp previews, the sitemap and the
canonical links point at the new home:

```bash
node tools/set-domain.js https://artbyvenuka.nischayacreativesoft.com/
node tools/check.js && node tools/build.js
git add . && git commit -m "Move to artbyvenuka.nischayacreativesoft.com" && git push
```

The push triggers a Cloudflare build, and about a minute later the site is on
its real address.

> **If you ever delete the Pages project**, delete the GoDaddy CNAME in the
> same sitting. A CNAME left pointing at a Cloudflare project that no longer
> exists can be claimed by someone else — a subdomain of your company domain
> serving a stranger's content. It takes ten seconds and prevents something
> genuinely unpleasant.

---

## 6. Check it over

Open `https://artbyvenuka.nischayacreativesoft.com/` and confirm:

- [ ] The meadow scene is moving and butterflies are flying
- [ ] Drawings gallery loads; filters, search and full-size view work
- [ ] A video plays when you press play
- [ ] Open it on a phone
- [ ] Paste the link into a WhatsApp message to yourself — Venuka's
      frog-and-duck drawing should appear in the preview
- [ ] Visit a wrong address on purpose, e.g. `…/nope.html` — the friendly
      "This page went off the page" screen should appear
- [ ] `https://artbyvenuka.nischayacreativesoft.com/STATUS.html` returns **404**
      — the working documents are not on the web
- [ ] `https://nischayacreativesoft.com/` still loads, unchanged

---

## 7. What the automatic checks do

Every push runs `tools/check.js` **before** the site is assembled. If anything
fails, the build stops, nothing is published, and the live site stays exactly
as it was. Cloudflare shows the failure in the project's Deployments tab and
emails you.

It runs 66 checks in about a second:

| Catches | Example |
|---|---|
| JavaScript typos | A missing comma in `data.js` — names the exact line |
| Content mistakes | A drawing with no title, or a category spelled wrong |
| Missing files | A drawing pointing at a photo that isn't there |
| Missing thumbnails | A video with no matching image in `assets/img/video/` |
| Duplicate entries | The same drawing or video listed twice |
| Broken links | Any page link that goes nowhere |
| Page structure | A page missing its heading, description or favicon |
| Accessibility | An image with no alt text |
| Colour contrast | Text that would fail WCAG AA against the moving scene |

**Run it yourself before pushing** — same command, instant:

```bash
node tools/check.js && node tools/build.js
```

Nothing to install. It uses only Node, which you already have.

---

## 8. Publishing a change, day to day

```bash
# 1. add the drawing/craft/video to assets/js/data.js and drop the image in
node tools/check.js && node tools/build.js    # 2. make sure it is happy
git add .
git commit -m "Add butterfly drawing"         # 3. describe what you added
git push                                      # 4. live in about a minute
```

That is the whole loop. See **CONTENT-GUIDE.md** for what to write in
`data.js`.

---

## 9. If something goes wrong

**The checks failed, so nothing published.** Good — that is the system working.
Read the message, fix it, push again. The live site was never touched.

**Something bad got published anyway.** Either revert and push:

```bash
git revert HEAD
git push
```

…or, faster, use Cloudflare's own rollback: project → **Deployments** → find
the last good one → **Rollback to this deployment**. It is instant and needs no
rebuild.

**The site looks unchanged after a push.** Your browser is showing its cached
copy. Hard-refresh: **Cmd+Shift+R** (Mac) or **Ctrl+F5** (Windows).

**The deployment shows a red X.** Click into it — the build log shows the exact
error. It is nearly always `data.js`.

---

## 10. Limits and cost

Free, and not close to any limit:

| Cloudflare Pages free plan | Allowed | This site |
|---|---|---|
| Files per site | 20,000 | 56 |
| Size of any one file | 25 MB | 166 KB |
| Builds | 500 per month | A few per week |
| Build time | 20 minutes each | About 30 seconds |
| Requests / bandwidth | No charge, no stated cap | — |

Plus: GoDaddy charges nothing for the DNS record, and the HTTPS certificate is
free and renews itself.

### Free visitor counting, while you are there

`data.js` already has the hook: `analytics: { cloudflareToken: null }`. You are
now in the Cloudflare dashboard anyway — **Web Analytics** → add your site →
copy the token into that one line. It is cookieless, so it needs no consent
banner, and nothing is requested at all while the token is `null`.

---

## 11. Quick troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| **Error 522** on the subdomain | CNAME added before the domain was added in Cloudflare | Add it in Cloudflare's Custom domains panel; it resolves itself within minutes |
| Certificate warning / "not secure" | Certificate not issued yet | Wait — Custom domains shows **Active** when ready |
| Gallery shows "This part could not be loaded" | `data.js` has a typo | `node tools/check.js` names the line |
| Page loads but has no styling | Build output directory wrong | It must be `dist`, not `/` |
| A working document is reachable on the site | `build.js` not in the build command | Build command must be `node tools/check.js && node tools/build.js` |
| Images missing | Filename case | Linux is case-sensitive; `Cow.jpg` ≠ `cow.jpg` |
| WhatsApp link shows no picture | `set-domain.js` not run for this address | Section 5, step 4 |
| Video won't play | Video is private/removed on YouTube | Check it plays on YouTube |
| Changes not showing | Browser cache | Cmd+Shift+R |

---

## 12. The address itself — what you are accepting

The subdomain is free, fits cleanly beside the company site, and can be changed
later. Worth knowing what it costs in other ways:

* **It is long.** 37 characters, awkward to read out or write on a school form.
  `venuka.nischayacreativesoft.com` is six shorter if you prefer it.
* **It reads as a company project** rather than as Venuka's own site. That may
  be exactly what you want.
* **It is tied to the company domain.** If that domain lapses or moves, this
  address goes with it, and it cannot follow Venuka to her own account when she
  is older.
* **Search engines treat a subdomain as a separate site**, so it inherits none
  of the company domain's standing. Irrelevant at this size.

Moving to a dedicated domain later is the same steps with a different name.
For an apex domain such as `venuka.art`, the domain must be a **zone on your
Cloudflare account** — a CNAME at GoDaddy is not enough for a bare apex, so
that one would mean moving the nameservers. A subdomain never does.

Links already shared on WhatsApp would die in a move, so leave a one-line
redirect page at the old address if you ever do it.
