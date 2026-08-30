/* =========================================================================
   Venuka — site content
   -------------------------------------------------------------------------
   THIS IS THE ONLY FILE YOU NEED TO EDIT TO ADD NEW WORK.
   Add a new drawing, craft or video by adding one object to the right list
   below and dropping the photo into assets/img/. Nothing else changes.
   See CONTENT-GUIDE.md for a step-by-step walkthrough.

   Honesty rules used throughout this file:
     * Every image listed here is a real photograph of Venuka's own work, or a
       still frame from one of her own YouTube videos (marked source:'video').
     * Nothing is stock art. Nothing is invented.
     * Fields that are genuinely unknown are left as null. The site then shows
       an honest "not recorded yet" note instead of making something up.
   ========================================================================= */

window.VENUKA = (function () {
  "use strict";

  /* ---- Site identity ---------------------------------------------------- */
  const site = {
    name: "Venuka",
    channelName: "Happy Learning Kids",
    channelUrl: "https://www.youtube.com/@hlearningkids",
    hashtagUrl: "https://www.youtube.com/hashtag/kidsartmagic",
    hashtag: "#KidsArtMagic",
    tagline: "Unleashing Creativity, One Stroke at a Time",
    taglineFull:
      "Unleashing Creativity, One Stroke at a Time: Nurturing Unique Talents in the Heart of Kids",
    supporting:
      "Nurturing unique talents through drawing, colouring, arts, and crafts.",
    welcome: "Happy Learning to all Children and all Visitors!",
    dadQuote:
      "Unleashing Creativity, One Stroke at a Time: Nurturing Unique Talents in the Heart of Kids!",
    dadQuoteAttribution: "~ By My Dad",
    previousSite: "https://sites.google.com/view/venuka/"
  };

  /* ---- Contact details --------------------------------------------------
     Only the YouTube channel is verified. Everything else is deliberately
     null so the site shows a clearly-labelled placeholder instead of a made-up
     address. Fill a value in and it becomes a real, working link.
     ---------------------------------------------------------------------- */
  /* THE contact email address for the whole website. Change it here and it
     changes on the contact page and in the footer of all nine pages at once.
     Set it to null and every place that shows it falls back to a plain
     "not published yet" label instead of a broken link. */
  const emailAddress = null;

  const contact = {
    youtube:   { label: "YouTube — Happy Learning Kids", value: site.channelUrl, href: site.channelUrl, icon: "▶️" },
    email:     { label: "Email",     value: emailAddress,
                 href: emailAddress ? "mailto:" + emailAddress : null,
                 icon: "✉️", placeholder: "Email address not published yet" },
    instagram: { label: "Instagram", value: null, href: null, icon: "📸", placeholder: "Instagram link not published yet" },
    facebook:  { label: "Facebook",  value: null, href: null, icon: "👍", placeholder: "Facebook link not published yet" },
    whatsapp:  { label: "WhatsApp",  value: null, href: null, icon: "💬", placeholder: "WhatsApp number not published yet" }
  };

  /* ---- Where the contact form sends its message -------------------------
     null  = no delivery service configured. The form validates, but tells the
             visitor honestly that it cannot send yet and offers YouTube instead.
     "https://formspree.io/f/xxxxxxx" (or any endpoint that accepts a POST)
             = the form really submits and shows a real success/error state.
     ---------------------------------------------------------------------- */
  const formEndpoint = null;

  /* ---- Visitor counting (optional) --------------------------------------
     Cloudflare Web Analytics. Free, unlimited, and it sets NO cookies, so
     the site needs no consent banner and nothing pops up at the visitor.

     It reports how many people came, which pages they read, where they came
     from and roughly which country they were in. It cannot tell you who they
     were, and it never asks them for anything.

     null = switched off. Nothing is loaded and no request is made.

     To switch it on:
       1. dash.cloudflare.com  ->  Analytics & Logs  ->  Web Analytics
       2. "Add a site", enter the website address
       3. It shows a snippet containing  "token": "abc123..."
       4. Paste just that token between the quotes below.
     You do NOT need to host anything on Cloudflare for this to work.
     ---------------------------------------------------------------------- */
  const analytics = { cloudflareToken: null };

  /* ---- Drawing categories ----------------------------------------------- */
  const categories = [
    "Animal Drawings",
    "Birds",
    "Nature",
    "Cartoon and Cute Characters",
    "Pencil Drawings",
    "Colour Drawings",
    "Easy Drawings for Kids",
    "Special Artwork"
  ];

  /* ---- Videos -----------------------------------------------------------
     All 14 are verified from the Happy Learning Kids channel.
     `ytTitle` is the exact title on YouTube (kept for search).
     `title` is the same video written plainly so it reads well and is easy
     for a screen reader to announce.
     ---------------------------------------------------------------------- */
  const videos = [
    {
      id: "vpdRkmrjQME",
      title: "Adorable Baby Crawling — Drawing and Colouring",
      ytTitle: "Colouring 🍼 Adorable Baby Crawling Drawing Tutorial! 🖍️ Fun and Easy Steps for Kids! 🌈",
      description: "A happy little baby is drawn crawling along, then brought to life with bright pencil colours.",
      tags: ["Colouring", "Cute Characters"],
      published: "2024-01-14"
    },
    {
      id: "_hIeRYpy_Ak",
      title: "Colourful Parrot Drawing for Little Artists",
      ytTitle: "Colorful 🦜 Parrot Drawing Fun for Little Artists! 🦜 🐦",
      description: "A green parrot sits on a branch and gets a rainbow tail. Lots of lovely colours to try.",
      tags: ["Birds", "Colouring"],
      published: "2024-01-13"
    },
    {
      id: "eUXtUUcvgAc",
      title: "Fun and Easy Parrot Drawing Tutorial",
      ytTitle: "🦜 Fun and Easy Parrot 🦜 🐦 Drawing Tutorial for Children!",
      description: "Follow the pencil, line by line, and a friendly parrot appears on the page.",
      tags: ["Birds", "Step by step", "Easy"],
      published: "2024-01-13"
    },
    {
      id: "w0m1FoPlvdk",
      title: "Cute Owl Drawing — Mommy and Baby Owl Duo",
      ytTitle: "🦉 Cute owl  👶 Drawing 🦉 Mommy and Baby Owl Duo🦉 for 🧒 👧🏻 👦🏻 kids 👶🏾👧🏽👶🏼😍",
      description: "Two round owls with big friendly eyes — a mommy owl and her baby, drawn in pencil.",
      tags: ["Birds", "Step by step", "Cute Characters"],
      published: "2024-01-06"
    },
    {
      id: "h5s834e__wI",
      title: "Colouring the Mommy and Baby Owl Duo",
      ytTitle: "Colouring 🦉 Mommy and Baby Owl Duo🦉💀",
      description: "The owl drawing gets its colours — green wings, a patterned chest and big bright eyes.",
      tags: ["Birds", "Colouring"],
      published: "2024-01-06"
    },
    {
      id: "myS6Su3g_PI",
      title: "Sheep, Lambs, Ducks and a Cozy Pen",
      ytTitle: "Drawing and Coloring Fun: 🐑 🎨 Sheep, Lambs, 🐥Ducks 🐤, and a Cozy Pen Adventure for Kids!",
      description: "A whole little farm scene: fluffy sheep, tiny ducklings and a cozy pen to keep them all safe.",
      tags: ["Animals", "Colouring", "Nature"],
      published: "2023-12-31"
    },
    {
      id: "7GJb9uD4XCo",
      title: "Sheep and Lamb Drawing and Colouring Adventure",
      ytTitle: "🎨 Welcome to the Sheep 🐑 and Lamb Drawing and Colouring Adventure for Kids! 🐑🎨",
      description: "Curly, cloud-shaped sheep are surprisingly easy to draw. Here is how they start.",
      tags: ["Animals", "Step by step"],
      published: "2023-12-31"
    },
    {
      id: "50iqvkOpGS8",
      title: "Frogs and Duck Colouring for Kids",
      ytTitle: "frogs 🐸 and duck 🦆 colouring for kids.",
      description: "Two cheerful green frogs and one small yellow duckling, filled in with crayon.",
      tags: ["Animals", "Colouring", "Easy"],
      published: "2023-12-30"
    },
    {
      id: "PmGQqb89b5Y",
      title: "Easy and Cute Mermaid Drawing",
      ytTitle: "How to 🐟 draw a mermaid 🧜‍♀️ easy and cute 🧜 🐠.",
      description: "A sweet little mermaid, drawn slowly in pencil so anyone can follow along.",
      tags: ["Cute Characters", "Step by step", "Easy"],
      published: "2023-12-24"
    },
    {
      id: "IvnqRRfwfTs",
      title: "Cute Snail and Tortoise Drawing",
      ytTitle: "How to draw simple cute 🐌. 🐢. tortoise and simple cute snail 🐌. 🐢. kids or children drawing.",
      description: "A smiling snail with a swirly shell meets a friendly tortoise. Simple shapes, big smiles.",
      tags: ["Animals", "Cute Characters", "Easy"],
      published: "2023-12-09"
    },
    {
      id: "sW4Gm-RLlBU",
      title: "Colouring a Funny Elephant",
      ytTitle: "Colouring Funny Elephant 🐘.",
      description: "A big-eared elephant is coloured in with blues and greens until it looks properly funny.",
      tags: ["Animals", "Colouring"],
      published: "2023-12-03"
    },
    {
      id: "SNWVN0fUDVA",
      title: "Cute and Simple Pig Drawing",
      ytTitle: "How to Draw cute 🐖, 🐷! simple pig drawing. 🐖, 🐷!",
      description: "A round pink pig with a curly tail — one of the easiest drawings to start with.",
      tags: ["Animals", "Step by step", "Easy"],
      published: "2023-11-30"
    },
    {
      id: "oqRJYS_B4co",
      title: "Giraffe Drawing for Kids",
      ytTitle: 'Drawing for kids "giraffe" 🦒.',
      description: "A tall giraffe with orange spots and a very long neck, drawn and coloured step by step.",
      tags: ["Animals", "Colouring"],
      published: "2023-11-25"
    },
    {
      id: "6pHd7EeyPRg",
      title: "Drawing for Kids — Cow",
      ytTitle: 'Drawing for kids "Cow" 🐄.',
      description: "The very first Happy Learning Kids drawing: a patient, patchy cow.",
      tags: ["Animals", "Step by step"],
      published: "2023-11-25"
    }
  ];

  /* ---- Artwork gallery --------------------------------------------------
     source: "photo" = a photograph of the original drawing.
     source: "video" = a still frame from Venuka's own video of that drawing.
                       The site labels these clearly on the card.
     Add a new drawing by copying one block, changing the fields and putting
     the photo in assets/img/artwork/.
     ---------------------------------------------------------------------- */
  const artworks = [
    {
      id: "frog-and-duck",
      title: "Frog and Duck",
      source: "photo",
      image: "assets/img/artwork/frog-and-duck-2023.jpg",
      alt: "Sketchbook page headed 'Frog and duck': two round green frogs with big eyes and waving arms, and a small yellow duckling standing between them, drawn in black outline and filled in with green and yellow crayon.",
      description: "Two happy frogs and one little duckling, drawn and coloured in Venuka's own sketchbook.",
      categories: ["Animal Drawings", "Colour Drawings", "Easy Drawings for Kids"],
      materials: "Crayon on sketchbook paper",
      difficulty: "Easy",
      date: "2023-08-30",
      video: "50iqvkOpGS8"
    },
    {
      id: "baby-crawling",
      title: "Baby Crawling",
      source: "video",
      video: "vpdRkmrjQME",
      alt: "Drawing of a smiling baby crawling forward, wearing a yellow and teal outfit with a pink bow, with dark hair and a small blue cap, coloured with pencils.",
      description: "A cheerful baby crawling across the page, coloured in soft yellows and teal.",
      categories: ["Cartoon and Cute Characters", "Colour Drawings"],
      materials: null,
      difficulty: null,
      date: "2024-01-14"
    },
    {
      id: "parrot-on-a-branch",
      title: "Parrot on a Branch",
      source: "video",
      video: "_hIeRYpy_Ak",
      alt: "Drawing of a green parrot with a red beak and a pink cheek, perched on a brown branch, its long tail striped in green, blue and orange. The word 'Parrot' is written underneath.",
      description: "A bright green parrot with a rainbow tail, sitting on a branch.",
      categories: ["Birds", "Colour Drawings", "Nature"],
      materials: null,
      difficulty: null,
      date: "2024-01-13"
    },
    {
      id: "parrot-outline",
      title: "Parrot — Pencil Outline",
      source: "video",
      video: "eUXtUUcvgAc",
      alt: "A hand holding a red pencil, drawing the pencil outline of a parrot's head and body on a sheet of paper held by a clipboard.",
      description: "The first pencil lines of a parrot, before any colour goes on.",
      categories: ["Birds", "Pencil Drawings", "Easy Drawings for Kids"],
      materials: "Pencil on paper",
      difficulty: "Easy",
      date: "2024-01-13"
    },
    {
      id: "owl-duo-coloured",
      title: "Mommy and Baby Owl Duo — Coloured",
      source: "video",
      video: "h5s834e__wI",
      alt: "Drawing of a large owl with big pink and purple eyes, green wings and an orange scalloped chest, being coloured with a green crayon. A smaller owl outline waits beside it.",
      description: "The owl duo after colouring — green wings, a patterned chest and enormous eyes.",
      categories: ["Birds", "Colour Drawings", "Cartoon and Cute Characters"],
      materials: null,
      difficulty: null,
      date: "2024-01-06"
    },
    {
      id: "owl-duo-outline",
      title: "Mommy and Baby Owl Duo — Pencil",
      source: "video",
      video: "w0m1FoPlvdk",
      alt: "Pencil outline of an owl with a round head, two large round eyes and pointed ear tufts, drawn on a sheet of paper with 'Owl drawing' written by hand underneath.",
      description: "The owls at the pencil stage — just circles, curves and two very big eyes.",
      categories: ["Birds", "Pencil Drawings", "Cartoon and Cute Characters"],
      materials: "Pencil on paper",
      difficulty: null,
      date: "2024-01-06"
    },
    {
      id: "farm-scene",
      title: "Sheep, Lambs, Ducks and a Cozy Pen",
      source: "video",
      video: "myS6Su3g_PI",
      alt: "Drawing of a farm scene: a fluffy pink sheep, a girl in a pink and orange dress, a pen drawn in straight black lines, and two small ducklings on the grass.",
      description: "A whole farm on one page — sheep, ducklings and a cozy pen to keep them safe.",
      categories: ["Animal Drawings", "Birds", "Nature", "Colour Drawings"],
      materials: null,
      difficulty: null,
      date: "2023-12-31"
    },
    {
      id: "sheep-in-the-pen",
      title: "Sheep in the Pen — Pencil",
      source: "video",
      video: "7GJb9uD4XCo",
      alt: "Pencil drawing of two fluffy sheep with cloud-shaped bodies standing inside a simple pen drawn with straight lines.",
      description: "Two curly sheep at the outline stage, waiting for their colours.",
      categories: ["Animal Drawings", "Pencil Drawings", "Nature"],
      materials: "Pencil on paper",
      difficulty: null,
      date: "2023-12-31"
    },
    {
      id: "mermaid",
      title: "Easy and Cute Mermaid",
      source: "video",
      video: "PmGQqb89b5Y",
      alt: "A hand holding a pencil, drawing the round face and hair of a small cartoon mermaid on white paper.",
      description: "A little mermaid taking shape, one gentle pencil line at a time.",
      categories: ["Cartoon and Cute Characters", "Pencil Drawings", "Easy Drawings for Kids"],
      materials: "Pencil on paper",
      difficulty: "Easy",
      date: "2023-12-24"
    },
    {
      id: "snail-and-tortoise",
      title: "Snail and Tortoise",
      source: "video",
      video: "IvnqRRfwfTs",
      alt: "Drawing of a yellow snail with a red spiral shell and a smiling face, next to a green tortoise with a patterned brown shell, both coloured with pencils.",
      description: "A swirly-shelled snail and a friendly tortoise, side by side.",
      categories: ["Animal Drawings", "Cartoon and Cute Characters", "Colour Drawings", "Easy Drawings for Kids"],
      materials: null,
      difficulty: "Easy",
      date: "2023-12-09"
    },
    {
      id: "funny-elephant",
      title: "Funny Elephant",
      source: "video",
      video: "sW4Gm-RLlBU",
      alt: "Drawing of an elephant with very large ears, coloured in blue and green pencil, shown on the video's title card reading 'Cute Elephant'.",
      description: "A big-eared elephant coloured in blues and greens.",
      categories: ["Animal Drawings", "Colour Drawings"],
      materials: null,
      difficulty: null,
      date: "2023-12-03"
    },
    {
      id: "pink-pig",
      title: "Cute and Simple Pig",
      source: "video",
      video: "SNWVN0fUDVA",
      alt: "Drawing of a pink pig seen from the side, with a round snout, two large ears and a curly tail, coloured in pink pencil on white paper.",
      description: "A round pink pig with a curly tail — a lovely one to start with.",
      categories: ["Animal Drawings", "Colour Drawings", "Easy Drawings for Kids"],
      materials: null,
      difficulty: "Easy",
      date: "2023-11-30"
    },
    {
      id: "giraffe",
      title: "Giraffe",
      source: "video",
      video: "oqRJYS_B4co",
      alt: "Drawing of a yellow giraffe with orange-brown spots, small horns and a long neck, coloured with pencils on white paper.",
      description: "A spotty giraffe with a very long neck.",
      categories: ["Animal Drawings", "Colour Drawings", "Easy Drawings for Kids"],
      materials: null,
      difficulty: null,
      date: "2023-11-25"
    },
    {
      id: "cow",
      title: "Cow",
      source: "video",
      video: "6pHd7EeyPRg",
      alt: "Drawing of a cow with a patched body shaded in grey and pink, and orange-brown hooves, drawn on white paper.",
      description: "The very first drawing shared on the channel — a patient, patchy cow.",
      categories: ["Animal Drawings", "Colour Drawings"],
      materials: null,
      difficulty: null,
      date: "2023-11-25"
    }
  ];

  /* ---- Arts and crafts --------------------------------------------------
     Venuka's handmade crafts are still being photographed, so this list is
     empty on purpose. The Arts and Crafts page shows an honest
     "photographs coming soon" state until the first entry is added here.

     To add one, copy this block into the array below, remove the comment
     markers, and put the photo in assets/img/crafts/ :

     {
       id: "paper-flower-card",
       title: "Paper Flower Card",
       image: "assets/img/crafts/paper-flower-card.jpg",   // or null while waiting for the photo
       alt: "Describe the finished craft for someone who cannot see it.",
       description: "One or two friendly sentences about the craft.",
       materials: ["Coloured paper", "Child-safe scissors", "Glue stick"],
       steps: ["Fold the paper in half.", "Cut out five petals.", "Glue them on to the card."],
       video: null,          // a YouTube video id, if there is one
       available: true,      // shows the "Available on Request" button
       date: "2026-01-15"
     }
     ---------------------------------------------------------------------- */
  const crafts = [];

  /* ---- Learn and Create -------------------------------------------------
     Friendly activity ideas written for this website. These are suggestions
     for children to try at home — they are not descriptions of finished work.
     ---------------------------------------------------------------------- */
  const drawingIdeas = [
    { icon: "🐷", title: "Start with a circle", text: "A pig, an owl, a snail, a frog — almost every drawing on this website starts with one round shape. Draw a circle, then add ears, eyes and a tail.", accent: "pink" },
    { icon: "☁️", title: "Sheep are just clouds", text: "Draw a bumpy cloud, add four little legs and a smiling face. That is a whole sheep. Add a smaller cloud and you have a lamb too.", accent: "sky" },
    { icon: "🦜", title: "Give it a rainbow tail", text: "When a drawing feels finished, try one more thing: colour the tail or the wings in stripes. It makes the whole page come alive.", accent: "green" },
    { icon: "🐢", title: "Draw two friends", text: "A snail on its own is nice. A snail next to a tortoise is a story. Try putting two characters on the same page.", accent: "purple" },
    { icon: "✏️", title: "Pencil first, colour later", text: "Draw lightly in pencil so mistakes rub away easily. Only reach for the colours once you are happy with the shape.", accent: "orange" },
    { icon: "🌈", title: "Colour outside real life", text: "A green elephant. A blue cow. Nobody will mind. Choosing surprising colours is one of the most fun parts of drawing.", accent: "sun" }
  ];

  const colouringTips = [
    "Colour in one direction — all your strokes going the same way looks tidy and neat.",
    "Press lightly first, then go over it again if you want a stronger colour.",
    "Leave a tiny white gap next to the outline. It makes the drawing pop.",
    "Two shades of the same colour side by side make things look round.",
    "Colour the background last, so you do not smudge your picture."
  ];

  const craftIdeas = [
    { icon: "✂️", title: "Paper shape animals", text: "Cut circles and triangles from coloured paper and glue them together into an owl, a fish or a cat.", accent: "sky" },
    { icon: "🖐️", title: "Handprint art", text: "Draw around your hand, then turn the fingers into feathers, leaves or a peacock's tail.", accent: "green" },
    { icon: "🎨", title: "Blow painting", text: "Put a drop of watery paint on paper and blow it gently with a straw to make branches and trees.", accent: "purple" },
    { icon: "🧻", title: "Roll animals", text: "An empty kitchen roll becomes an owl, a giraffe or a rocket with a little paper and colour.", accent: "orange" }
  ];

  const materialsList = [
    { icon: "✏️", name: "A pencil and an eraser", note: "The only two things you truly need to begin." },
    { icon: "🖍️", name: "Crayons or colour pencils", note: "Both work beautifully. Crayons are bolder, pencils are neater." },
    { icon: "📓", name: "A plain sketchbook", note: "Unruled paper gives you the whole page to play with." },
    { icon: "🖊️", name: "A black outline pen", note: "Optional. Going over the pencil lines makes a drawing look finished." },
    { icon: "📐", name: "A ruler", note: "Helpful for fences, pens, houses and anything with straight lines." },
    { icon: "✂️", name: "Child-safe scissors and glue", note: "For the craft activities. Always with a grown-up nearby." }
  ];

  const encouragements = [
    "There is no wrong way to draw. Every page you finish makes the next one easier.",
    "If it does not look right, do not rub it out — turn it into something new.",
    "Drawing a little bit every day works better than drawing a lot once a month.",
    "Your drawing does not have to look like anybody else's. That is the whole point."
  ];

  return {
    site, contact, formEndpoint, analytics, categories,
    videos, artworks, crafts,
    drawingIdeas, colouringTips, craftIdeas, materialsList, encouragements
  };
})();
