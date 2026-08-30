# Adding new work to the Venuka website

Everything on this website comes from one file:

```
assets/js/data.js
```

You never have to touch the design, the layout or any page. You add a few lines
to `data.js`, drop a photo into a folder, and the whole website updates itself —
the gallery, the filters, the search, the counts, the "New Creations" page and
the home page all pick it up automatically.

---

## 1. Adding a new drawing

**Step 1 — save the photo.**
Put the photograph into `assets/img/artwork/`. Give it a plain lowercase name
with dashes and no spaces, for example:

```
assets/img/artwork/butterfly-2026.jpg
```

A photo taken straight from a phone is fine. If it is very large (over about
3 MB) it is worth shrinking it first so the page stays fast — around 1600 pixels
wide is plenty.

**Step 2 — add the entry.**
Open `assets/js/data.js`, find `const artworks = [`, and add a block like this
at the top of the list (newest first):

```js
{
  id: "butterfly",
  title: "Butterfly",
  source: "photo",
  image: "assets/img/artwork/butterfly-2026.jpg",
  alt: "Drawing of a butterfly with round purple and orange wings, resting on a green leaf.",
  description: "A butterfly with patterned wings, coloured in purple and orange.",
  categories: ["Nature", "Colour Drawings", "Easy Drawings for Kids"],
  materials: "Colour pencils on paper",
  difficulty: "Easy",
  date: "2026-03-14",
  video: null
},
```

Remember the comma at the end of the block.

**What each line means**

| Field | What to put | Can it be left out? |
|---|---|---|
| `id` | A short unique name, lowercase with dashes | No |
| `title` | What the drawing is called | No |
| `source` | `"photo"` for a real photograph, `"video"` for a still from a video | No |
| `image` | Path to the photo file | Needed when `source` is `"photo"` |
| `alt` | A sentence describing the picture for someone who cannot see it | No — please always write one |
| `description` | One or two friendly sentences shown on the card | No |
| `categories` | One or more from the list below | No |
| `materials` | e.g. `"Crayon on sketchbook paper"` | Yes — use `null` |
| `difficulty` | e.g. `"Easy"` | Yes — use `null` |
| `date` | `"YYYY-MM-DD"`, used to sort newest first | Yes — use `null` |
| `video` | The YouTube video id, if this drawing has one | Yes — use `null` |

**The categories** must be spelled exactly as they appear in `const categories`:

```
Animal Drawings · Birds · Nature · Cartoon and Cute Characters
Pencil Drawings · Colour Drawings · Easy Drawings for Kids · Special Artwork
```

To add a brand-new category, add it to that `categories` list as well and it
appears as a filter button straight away.

**Photo not ready yet?** Leave `image` as `null`. The card shows an honest
"Photo coming soon" panel instead of a picture. Nothing breaks.

---

## 2. Adding a new craft

Put the photo into `assets/img/crafts/`, then add a block to `const crafts = [`:

```js
{
  id: "paper-flower-card",
  title: "Paper Flower Card",
  image: "assets/img/crafts/paper-flower-card.jpg",
  alt: "A folded card with five cut-paper petals glued to the front.",
  description: "A greetings card with a paper flower on the front.",
  materials: ["Coloured paper", "Child-safe scissors", "Glue stick"],
  steps: [
    "Fold the paper in half.",
    "Cut out five petals.",
    "Glue them on to the card."
  ],
  video: null,
  available: true,
  date: "2026-03-14"
},
```

`materials` and `steps` are lists — as many or as few as you like, or leave them
as empty lists `[]` to hide them.

`available: true` shows an **Available on Request** button.
`available: false` shows a **Contact Me** button instead.
Both take the visitor to the contact page with the craft's name already filled in.

While `crafts` is empty, the Arts & Crafts page shows a clear
"photographs coming soon" message rather than pretending to have content.

---

## 3. Adding a new video

Add a block to `const videos = [` at the top of the list:

```js
{
  id: "aBcDeFgHiJk",
  title: "Butterfly Drawing for Kids",
  ytTitle: "🦋 Butterfly drawing for kids! easy and fun 🦋",
  description: "A butterfly with patterned wings, drawn step by step.",
  tags: ["Nature", "Easy"],
  published: "2026-03-14"
},
```

* `id` is the code in the YouTube address. In
  `https://www.youtube.com/watch?v=aBcDeFgHiJk` the id is `aBcDeFgHiJk`.
* `title` is a clear, readable title for the website.
* `ytTitle` is the exact title on YouTube. It is not displayed, but it makes the
  video findable by search.
* `tags` become the filter buttons. Reusing existing tags keeps the list tidy.

**Then save the thumbnail.** Download

```
https://i.ytimg.com/vi/aBcDeFgHiJk/maxresdefault.jpg
```

and save it as `assets/img/video/aBcDeFgHiJk.jpg` — the file name must be the
video id. The website uses this picture instead of loading anything from YouTube,
so the page stays fast and YouTube is only contacted once a visitor presses play.

---

## 4. Changing the wording, contact details or social links

Near the top of `data.js`:

* `const site = { ... }` — the name, tagline, welcome message and channel link.
* `const contact = { ... }` — email, Instagram, Facebook and WhatsApp.

Contact entries start as `null`, which is why the contact page shows
"not published yet" instead of a made-up address. To publish a real one, fill in
both `value` and `href`:

```js
email: {
  label: "Email",
  value: "hello@example.com",
  href: "mailto:hello@example.com",
  icon: "✉️"
},
```

It immediately becomes a real, working link — on the contact page and in the
footer. Do the same for `instagram`, `facebook` and `whatsapp`
(WhatsApp uses `https://wa.me/<country code and number>`).

---

## 5. Making the contact form actually send

Right now `const formEndpoint = null;`, and the form says so honestly instead of
pretending a message went through.

To turn it on, sign up for a form service (Formspree, Basin, Formsubmit and
Netlify Forms all work), then set:

```js
const formEndpoint = "https://formspree.io/f/your-form-id";
```

The form then really submits, shows a real "Message sent" state on success and a
real "That did not go through" state on failure. The yellow note above the form
is in `contact.html` — remove that block once the form works.

---

## 6. Changing the background scene

The moving meadow behind the pages lives in `assets/js/scene.js`. The few things
worth changing are all in the first hundred lines:

```js
var SEASON_SECONDS = 30;   // how long sunny / cloudy / rain / snow each last
var BLEND_SECONDS  = 5;    // how long one season takes to fade into the next
```

Below those, `SEASONS` holds the sky colours and weather for each season,
`WING_COLOURS` holds the butterfly colours, and `FLOWER_COLOURS` the flowers.
They are ordinary colour codes — change one and reload.

Visitors can pause the whole scene with the little weather button in the bottom
corner, and it stays paused for them next time. Anybody whose device is set to
reduce motion sees a still picture instead, automatically.

The scene follows visitors from page to page — the same flowers, butterflies and
weather carry on when they click through — for as long as the browser tab is open.

If a page ever feels too busy, the two numbers to reach for are the panel opacity
values in `assets/css/style.css` (search for `rgba(255, 255, 255, .84)`): lower
means more meadow showing through, higher means more solid.

---

## Switching on the contact form and the visitor counter

Both are off until you paste in one value each. Both live in `assets/js/data.js`.

### Messages into a private Google Sheet

Full step-by-step instructions are in the comment block at the top of
[`tools/google-sheet-form.gs`](tools/google-sheet-form.gs). In short:

1. `sheets.new` → a new private Sheet. **Do not share it with anyone.**
2. Extensions → Apps Script → paste that whole file → Save
3. Deploy → New deployment → **Web app**, Execute as **Me**, access **Anyone**
4. Copy the `/exec` URL it gives you
5. In `data.js`, change `const formEndpoint = null;` to that URL in quotes

Every message then arrives as a row in your Sheet. Only you can read it.

### Counting visitors

1. `dash.cloudflare.com` → Analytics & Logs → Web Analytics → Add a site
2. It shows a snippet containing `"token": "abc123…"` — copy just the token
3. In `data.js`, put it in `const analytics = { cloudflareToken: null };`

No cookies, so no consent banner and nothing pops up at your visitors. You see
page views, popular pages, where people came from and roughly which country.
You never see who they are.

**What is private, and what is not.** The messages and the visitor figures are
private to you. The form's `/exec` address is not — a visitor's browser has to
know where to send the form, so it sits in the page source. That is true of
every website of this kind. It lets someone send you junk; it does not let
anyone read what other people sent. A hidden spam trap on the form and a limit
of 20 messages an hour in the script deal with the junk.

## 7. Checking your change

**Always do this first.** One command, one second, no installing anything:

```bash
node tools/check.js
```

It reads everything you just edited and either says **"All good. Safe to
publish."** or tells you exactly what is wrong and on which line — a missing
comma, a photo that isn't there, a category spelled differently, a drawing
listed twice. GitHub runs the same check and refuses to publish the site if it
fails, so nothing broken can reach the live website.

Then, to look at it:

```bash
python3 -m http.server 4321
```

Open <http://localhost:4321> in a browser.

**If something looks wrong after an edit**

* The page now tells you. Instead of sitting on a loading animation forever, it
  shows a clear *"This part could not be loaded"* panel, and the browser console
  explains exactly why.
* It is almost always a missing comma between two entries, or a missing quote
  mark. Press **F12**, open the **Console** tab, and the error names the line.
* If the page looks unchanged after you edit a file, the browser is showing you
  its cached copy. Hard-refresh: **Cmd+Shift+R** on a Mac, **Ctrl+F5** on Windows.


---

## Where everything else is written down

| Document | What it covers |
|---|---|
| `README.md` | What the site is built with, how to run it, the house rules |
| `DEPLOYMENT.md` | Putting it online, step by step, and what to do if it breaks |
| `STATUS.html` | Plain-language view of what is done and what still needs deciding |
| `REGISTRY.md` | Exact files and line numbers, for a developer |
