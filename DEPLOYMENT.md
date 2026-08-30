# Putting the Venuka website online

Everything you need to go live, in order. Written to be followed straight
through — about 20 minutes start to finish.

---

## 1. The one decision to make first: public or private?

This decides everything else, so settle it before you start.

**GitHub Pages on a free personal account can only publish from a _public_
repository.** Publishing from a private repo needs GitHub Pro (paid). And even
on Pro, only the *source code* is hidden — the website itself is still public
either way. There is no free way to have both a private repo and a GitHub Pages
site.

| | Public repo + GitHub Pages | Private repo + GitHub Pro | Private repo + Cloudflare Pages |
|---|---|---|---|
| Cost | **Free** | ~$4/month | **Free** |
| Source code visible to anyone? | Yes | No | No |
| The website itself | Public | Public | Public |
| Automatic checks before publishing | Ready to go | Ready to go | Set build command to `node tools/check.js` |
| Accounts needed | GitHub | GitHub + card | GitHub + Cloudflare |
| Setup time | ~15 min | ~15 min | ~25 min |

### Recommended: public repo + GitHub Pages

Nothing in this project needs hiding:

* There are **no passwords, keys or addresses** in the code — every contact
  field is deliberately empty (`null`).
* The drawings and videos are **already public** on the Happy Learning Kids
  YouTube channel and on the old Google Site.
* Your git email is already GitHub's private `@users.noreply.github.com`
  address, so your real email will **not** appear in the commit history.

Pick the private route only if you would rather people could not read the code.
It changes nothing a visitor sees.

---

## 2. Before you push — the parent checklist

Once the repo is public, it is public permanently (git keeps history, and
GitHub is scraped constantly). Five minutes now saves regret later.

- [ ] **The photo of Venuka.** Still deliberately left out. If you add it, it is
      public forever. This is the one worth sleeping on.
- [ ] **Her school year and board.** The old Google Site listed her school year and board. Left out here on
      purpose — identifying details about a child. Decide before going live, not after.
- [ ] **Turn off Issues, Wiki and Discussions** on the repo (Settings → General
      → Features). Otherwise strangers get a comment box on a child's website.
- [ ] **Check the contact page.** It currently publishes only the YouTube
      channel. If you add an email or WhatsApp number to `data.js`, that number
      is then public and scrapeable. A separate address kept for this is wiser
      than your personal one.
- [ ] **Accept that the drawings become downloadable.** Anyone can right-click
      and save them. They already can on YouTube, so this changes little — but
      it should be a decision, not a surprise.

---

## 3. Getting it live

### Step 1 — its own repository ✅ already done

This folder sits *inside* `~/dev/claude_code`, which is a git repo holding your
other projects. Venuka's site must not be part of that one. It already isn't:

* this folder is now **its own git repository**, on the `main` branch
  (`main` matters — the deploy workflow only publishes from `main`)
* the parent repo has been told to ignore it, so a `git add .` up there can
  never sweep Venuka's site into your personal repo

Nothing to do. To see it for yourself:

```bash
cd ~/dev/claude_code/venuka_art_and_crafts && git log --oneline
```

*Optional — if you would rather it did not live inside another project's folder
at all, move it out. Everything keeps working; the repository travels with it:*

```bash
mv ~/dev/claude_code/venuka_art_and_crafts ~/dev/venuka-website
```

### Step 2 — the checks, and the first commit ✅ already done

The first commit is made. Before **every** push from now on, run the checks:

```bash
node tools/check.js
```

It must say **"All good. Safe to publish."** If it doesn't, it names exactly
what is wrong and on which line. Fix that before pushing.

#### What is in the repository, and what is not

`.gitignore` decides this. 51 files are included — the nine pages, the styles,
the scripts, the images, the checks and the documentation. Left out are things
that belong only to this computer: `.DS_Store` files, editor settings, drafts
you name starting with an underscore (`_draft.html`), and anything holding a
password or key.

To see exactly what would go up, at any time:

```bash
git ls-files
```

> **One thing to know about your name.** Your commits are signed with your
> GitHub email, so on a public repository your username is visible in the
> commit history — that is true of any repo you own, and normal. What has been
> kept out is any mention of your *personal site address* in Venuka's files.

### Step 3 — create the repository

**First, clear up a common confusion.** GitHub has two completely separate
things, and they are easy to mix up:

| | Limit |
|---|---|
| **Accounts** (your login) | One free personal account per person — you already have yours. |
| **Websites** you can host from it | **Unlimited.** One per repository, and repositories are unlimited. |

So from your single account you can host **as many public websites as you like**
— yours, Venuka's, a friend's, a dozen more. There is no limit and no cost:

```
your-username.github.io                    <- your personal site  (only ONE of these)
your-username.github.io/venuka-website/    <- Venuka's
your-username.github.io/friends-site/      <- someone else's
your-username.github.io/anything-else/     <- and so on
```

Only that first root-level address is limited to one. Everything else is a
"project site" and there is no cap.

**Once you attach a custom domain, the address changes completely** and your
username disappears from it:

```
venuka.art        -> the venuka-website repository
friendsite.com    -> the friends-site repository
```

Visitors never see `your-username.github.io` at all.

#### So which route?

**Route A — one repository under your own account. Simplest.**

Choose this if you are buying a domain. The domain hides the GitHub address
entirely, so nothing needs separating.

* github.com → **New repository**
* Name: `venuka-website` · Visibility: **Public** · do not add a README

```bash
git remote add origin https://github.com/your-username/venuka-website.git
git push -u origin main
```

**Route B — a free Organization. Separate address, no domain needed.**

Choose this if you want a clean short address *without* buying a domain, so that
Venuka's site is not at `your-username.github.io/...`.

An organization is free, allows unlimited public repositories, includes Pages,
and gets **its own** root-level address — so it does not use up the one attached
to your personal account.

* github.com → profile menu → **Your organizations** → **New organization** → **Free**
* Then create the repository *inside it*, named exactly `<org>.github.io`

Names that were free when checked:

| Organization | Address you get |
|---|---|
| `venukaart` | `https://venukaart.github.io/` |
| `venuka-art` | `https://venuka-art.github.io/` |
| `hlearningkids` | `https://hlearningkids.github.io/` — matches her YouTube handle |
| `kidsartmagic` | `https://kidsartmagic.github.io/` — matches her hashtag |

(`venuka` and `happylearningkids` are taken by other GitHub users.)

```bash
git remote add origin https://github.com/venukaart/venukaart.github.io.git
git push -u origin main
```

> Either route can have a custom domain later, and you can move a repository
> between your account and an organization at any time without losing anything.

#### One thing neither route changes

Your **commits** carry your name and GitHub username in the repository history,
whichever route you pick. That is honest — you are the author — and most people
leave it alone.

If you would rather the history not point back at your profile, set a different
identity for this one repository, before your first commit:

```bash
git config user.name "Happy Learning Kids"
git config user.email "hlk@example.invalid"
```

It affects only this folder; your other projects keep your normal identity.

> **A quiet advantage of Route B:** when Venuka is older, an organization
> transfers to her own GitHub account in a couple of clicks, history and site
> included. A repository inside your personal account is more awkward to hand over.

### Step 4 — turn on GitHub Pages

Repo → **Settings** → **Pages** → under **Build and deployment**, set
**Source** to **GitHub Actions**.

That is all. The workflow already in `.github/workflows/deploy.yml` takes over.
Watch it run under the **Actions** tab. First publish takes 1–2 minutes.

Your address will be:

```
https://venukaart.github.io/
```

(If you named the repo something else, it will be
`https://venukaart.github.io/that-repo-name/` instead — both work, the first is
just shorter.)

### Step 5 — tell the site its own address

Link previews in WhatsApp and Facebook need the **full** address of the preview
image; a relative path shows no picture at all. One command fixes all nine
pages, the sitemap and robots.txt:

```bash
node tools/set-domain.js https://venukaart.github.io/
node tools/check.js
git add . && git commit -m "Set the site address" && git push
```

Skip this and the site works fine — but sharing a link on WhatsApp shows a bare
link instead of Venuka's frog-and-duck drawing.

### Step 6 — check it over

Open the live address and confirm:

- [ ] The meadow scene is moving and butterflies are flying
- [ ] Drawings gallery loads; filters, search and full-size view work
- [ ] A video plays when you press play
- [ ] Open it on a phone
- [ ] Paste the link into a WhatsApp message to yourself — the drawing should
      appear in the preview
- [ ] Visit a wrong address on purpose, e.g. `…/nope.html`,
      and check the friendly "This page went off the page" screen appears

---

## 4. What the automatic checks do

Every push runs `tools/check.js` **before** publishing. If anything fails, the
publish step never runs and the live site stays exactly as it was. GitHub emails
you what broke.

It runs 53 checks in about a second:

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

**Run it yourself before pushing** — it is the same command, and it is instant:

```bash
node tools/check.js
```

Nothing to install. It uses only Node, which you already have.

---

## 5. Publishing a change, day to day

```bash
# 1. add the drawing/craft/video to assets/js/data.js and drop the image in
node tools/check.js                       # 2. make sure it is happy
git add .
git commit -m "Add butterfly drawing"     # 3. describe what you added
git push                                  # 4. live in about a minute
```

That is the whole loop. See **CONTENT-GUIDE.md** for what to write in `data.js`.

---

## 6. If something goes wrong

**The checks failed, so nothing published.** Good — that is the system working.
Read the message, fix it, push again. The live site was never touched.

**Something bad got published anyway.** Undo the last commit and push:

```bash
git revert HEAD
git push
```

The site rebuilds from the previous good state in about a minute.

**The site looks unchanged after a push.** Your browser is showing its cached
copy. Hard-refresh: **Cmd+Shift+R** (Mac) or **Ctrl+F5** (Windows).

**The Actions tab shows a red X.** Click into the run — the failing step shows
the exact error. It is nearly always `data.js`.

---

## 7. A custom domain (optional, later)

If you ever buy something like `venuka.art`:

1. Repo → Settings → Pages → **Custom domain** → enter it → Save.
2. At your domain registrar, add these DNS records:
   - Four `A` records for `@` → `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - One `CNAME` for `www` → `venukaart.github.io`
3. Wait for DNS (minutes to a few hours), then tick **Enforce HTTPS**.
4. Re-run `node tools/set-domain.js https://venuka.art/`, commit, push.

GitHub issues the HTTPS certificate free and renews it automatically.

---

## 8. Limits and cost

Free, and not close to any limit:

| Limit | Allowed | This site |
|---|---|---|
| Published site size | 1 GB | 1.5 MB |
| Bandwidth | 100 GB/month (soft) | ~1.5 MB per visitor |
| Builds | 10/hour (soft) | A few per week |
| Actions minutes | Unlimited on public repos | ~30 seconds per push |

At 1.5 MB per visit, 100 GB/month is roughly **65,000 visits a month** before
anyone at GitHub would even notice.

---

## 9. Quick troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Gallery shows "This part could not be loaded" | `data.js` has a typo | `node tools/check.js` names the line |
| Page loads but has no styling | Wrong repo path | Check Pages source is **GitHub Actions** |
| Images missing | Filename case | GitHub is case-sensitive; `Cow.jpg` ≠ `cow.jpg` |
| WhatsApp link shows no picture | Step 5 not done | Run `tools/set-domain.js` |
| Video won't play | Video is private/removed on YouTube | Check it plays on YouTube |
| Changes not showing | Browser cache | Cmd+Shift+R |

---

## 10. If you choose the private route instead

**Cloudflare Pages** (free, works with a private repo):

1. Push to a **private** GitHub repo as in Step 1–3 above.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Authorise GitHub and pick the repo.
4. Build settings:
   - Framework preset: **None**
   - Build command: `node tools/check.js`
   - Build output directory: `/`
5. Deploy. You get `venuka-website.pages.dev`, with the same check-before-publish
   safety because the build command *is* the check.

Delete `.github/workflows/deploy.yml` if you go this way — you do not need both.
