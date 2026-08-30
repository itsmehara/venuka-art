/* =========================================================================
   Venuka — shared behaviour and reusable card components.
   Plain JavaScript, no libraries, no build step.
   ========================================================================= */
(function () {
  "use strict";

  const DATA = window.VENUKA || {};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- small helpers --------------------------------------------- */
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  function formatDate(iso) {
    if (!iso) return null;
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return null;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  /* Accent colour rotation so a grid of cards looks cheerful, not uniform. */
  const ACCENTS = ["var(--sky)", "var(--pink)", "var(--sun)", "var(--green)", "var(--purple)", "var(--orange)"];
  const accentAt = (i) => ACCENTS[i % ACCENTS.length];

  const TAG_CLASSES = ["", "tag--pink", "tag--sun", "tag--green", "tag--purple", "tag--orange"];
  const tagClassFor = (label) => {
    let h = 0;
    for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) >>> 0;
    return TAG_CLASSES[h % TAG_CLASSES.length];
  };

  /* Where an artwork's picture lives: a real photo, or a still from its video. */
  function artworkImage(a) {
    if (a.source === "photo" && a.image) return a.image;
    if (a.video) return "assets/img/video/" + a.video + ".jpg";
    return null;
  }

  function videoThumb(id) { return "assets/img/video/" + id + ".jpg"; }
  function videoWatchUrl(id) { return "https://www.youtube.com/watch?v=" + id; }
  function videoEmbedUrl(id) {
    return "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&modestbranding=1";
  }

  /* A clearly-labelled placeholder, used whenever a real photo is missing
     or fails to load. We never substitute stock art. */
  function placeholderMarkup(line, sub) {
    return (
      '<div class="media media--placeholder">' +
        '<div>' +
          '<span class="ph-emoji" aria-hidden="true">🖼️</span>' +
          '<span class="ph-text">' + esc(line || "Photo coming soon") + '</span><br>' +
          '<span class="ph-sub">' + esc(sub || "This artwork has not been photographed yet.") + '</span>' +
        '</div>' +
      '</div>'
    );
  }

  /* Swap a broken image for the honest placeholder instead of a blank box. */
  function guardImages(root) {
    $$("img[data-guard]", root).forEach((img) => {
      img.addEventListener("error", function () {
        const box = img.closest(".media");
        if (box) box.outerHTML = placeholderMarkup("Photo unavailable", "The image for this item could not be loaded.");
      }, { once: true });
    });
  }

  /* =======================================================================
     Reusable cards
     ===================================================================== */

  function artworkCard(a, i) {
    const src = artworkImage(a);
    const isStill = a.source === "video";
    /* The picture carries its own written description. The button's accessible
       name is that description followed by what activating it does, so a screen
       reader hears the artwork itself and not just "open in full size". */
    const media = src
      ? '<span class="media">' +
          '<img src="' + esc(src) + '" alt="' + esc(a.alt || a.title) + '" ' +
              'loading="lazy" decoding="async" width="1280" height="960" data-guard>' +
          (isStill ? '<span class="media-badge"><span aria-hidden="true">🎬</span> Still from video</span>' : '') +
          '<span class="zoom-hint" aria-hidden="true">' + iconZoom() + '</span>' +
        '</span>'
      : placeholderMarkup();

    const tags = (a.categories || []).slice(0, 2)
      .map((c) => '<span class="tag ' + tagClassFor(c) + '">' + esc(c) + '</span>').join("");

    return (
      '<article class="card" style="--accent:' + accentAt(i) + '">' +
        '<button type="button" class="art-tile" data-artwork="' + esc(a.id) + '">' +
          media +
          '<span class="visually-hidden">Open &ldquo;' + esc(a.title) + '&rdquo; in full size</span>' +
        '</button>' +
        '<div class="card-body">' +
          '<h3 class="card-title">' + esc(a.title) + '</h3>' +
          '<p class="card-desc">' + esc(a.description || "") + '</p>' +
          '<div class="card-foot"><div class="tag-row">' + tags + '</div></div>' +
        '</div>' +
      '</article>'
    );
  }

  function videoCard(v, i) {
    const tags = (v.tags || []).map((t) => '<span class="tag ' + tagClassFor(t) + '">' + esc(t) + '</span>').join("");
    const when = formatDate(v.published);
    return (
      '<article class="card" style="--accent:' + accentAt(i) + '">' +
        '<div class="media media--wide" data-video-slot="' + esc(v.id) + '">' +
          '<button type="button" class="video-facade" data-play="' + esc(v.id) + '" ' +
                  'data-title="' + esc(v.title) + '" ' +
                  'aria-label="Play video: ' + esc(v.title) + ' (opens the YouTube player on this page)">' +
            '<img src="' + esc(videoThumb(v.id)) + '" alt="" loading="lazy" decoding="async" width="1280" height="720" data-guard>' +
            '<span class="play-btn" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>' +
          '</button>' +
        '</div>' +
        '<div class="card-body">' +
          '<h3 class="card-title">' + esc(v.title) + '</h3>' +
          '<p class="card-desc">' + esc(v.description) + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
          '<div class="card-foot">' +
            '<a class="btn btn--yt btn--sm" href="' + esc(videoWatchUrl(v.id)) + '" target="_blank" rel="noopener">' +
              iconYouTube() + 'Watch on YouTube<span class="visually-hidden"> — ' + esc(v.title) + ' (opens in a new tab)</span>' +
            '</a>' +
            (when ? '<span class="card-desc" style="margin-left:auto">' + esc(when) + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function craftCard(c, i) {
    const media = c.image
      ? '<span class="media"><img src="' + esc(c.image) + '" alt="' + esc(c.alt || c.title) +
        '" loading="lazy" decoding="async" data-guard></span>'
      : placeholderMarkup("Photo coming soon", "This craft is waiting to be photographed.");

    const mats = (c.materials || []).length
      ? '<div><strong>Materials:</strong> <span class="card-desc">' + esc(c.materials.join(", ")) + '</span></div>' : "";
    const steps = (c.steps || []).length
      ? '<div><strong>How to make it</strong><ol class="steps">' +
        c.steps.map((s) => "<li>" + esc(s) + "</li>").join("") + "</ol></div>" : "";
    const vid = c.video
      ? '<a class="btn btn--yt btn--sm" href="' + esc(videoWatchUrl(c.video)) + '" target="_blank" rel="noopener">' +
        iconYouTube() + "Watch the video</a>" : "";
    const req = c.available
      ? '<a class="btn btn--green btn--sm" href="contact.html?about=' + encodeURIComponent(c.title) + '">Available on Request</a>'
      : '<a class="btn btn--ghost btn--sm" href="contact.html?about=' + encodeURIComponent(c.title) + '">Contact Me</a>';

    return (
      '<article class="card" style="--accent:' + accentAt(i) + '">' + media +
        '<div class="card-body">' +
          '<h3 class="card-title">' + esc(c.title) + '</h3>' +
          '<p class="card-desc">' + esc(c.description || "") + '</p>' +
          mats + steps +
          '<div class="card-foot">' + vid + req + '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function emptyState(title, message, kind) {
    return (
      '<div class="state' + (kind ? " state--" + kind : "") + '" role="status">' +
        '<span class="state-emoji" aria-hidden="true">' + (kind === "error" ? "🎈" : "🎨") + "</span>" +
        "<h3>" + esc(title) + "</h3><p>" + message + "</p>" +
      "</div>"
    );
  }

  function skeletonGrid(n) {
    let out = '<div class="skeleton-grid" aria-hidden="true">';
    for (let i = 0; i < (n || 6); i++) {
      out += '<div class="skeleton"><div class="skeleton-media"></div><div class="skeleton-line"></div><div class="skeleton-line"></div></div>';
    }
    return out + "</div>";
  }

  /* ---------- inline icons ---------------------------------------------- */
  function iconYouTube() {
    return '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M23 12s0-3.9-.5-5.7c-.3-1-1-1.8-2-2.1C18.7 3.6 12 3.6 12 3.6s-6.7 0-8.5.6c-1 .3-1.7 1.1-2 2.1C1 8.1 1 12 1 12s0 3.9.5 5.7c.3 1 1 1.8 2 2.1 1.8.6 8.5.6 8.5.6s6.7 0 8.5-.6c1-.3 1.7-1.1 2-2.1.5-1.8.5-5.7.5-5.7ZM9.8 15.4V8.6l5.7 3.4-5.7 3.4Z"/></svg>';
  }
  function iconZoom() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' +
      '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21M10.5 7.5v6M7.5 10.5h6"/></svg>';
  }

  /* =======================================================================
     Video facade — the real YouTube player only loads when asked for.
     Keeps the page fast and stops YouTube setting cookies before a click.
     ===================================================================== */
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-play]");
    if (!btn) return;
    const id = btn.getAttribute("data-play");
    const title = btn.getAttribute("data-title") || "Video";
    const slot = btn.closest("[data-video-slot]");
    if (!slot) return;
    slot.classList.remove("media", "media--wide");
    slot.classList.add("video-embed");
    slot.innerHTML =
      '<iframe src="' + esc(videoEmbedUrl(id)) + '" title="' + esc(title) + ' — Happy Learning Kids on YouTube" ' +
      'loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
      'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
    const frame = slot.querySelector("iframe");
    if (frame) frame.focus();
  });

  /* =======================================================================
     Lightbox — full-size artwork with its details
     ===================================================================== */
  const Lightbox = (function () {
    let list = [], index = 0, lastFocus = null, node = null;

    function build() {
      node = document.createElement("div");
      node.className = "lightbox";
      node.id = "artwork-lightbox";
      node.setAttribute("role", "dialog");
      node.setAttribute("aria-modal", "true");
      node.setAttribute("aria-labelledby", "lb-title");
      node.innerHTML =
        '<div class="lightbox-dialog">' +
          '<figure class="lightbox-figure" style="margin:0">' +
            '<button type="button" class="lb-close" aria-label="Close">✕</button>' +
            '<button type="button" class="lb-nav lb-prev" aria-label="Previous artwork">‹</button>' +
            '<img id="lb-img" src="" alt="">' +
            '<button type="button" class="lb-nav lb-next" aria-label="Next artwork">›</button>' +
            '<span class="lb-counter" id="lb-counter"></span>' +
          "</figure>" +
          '<div class="lightbox-panel">' +
            '<h2 id="lb-title"></h2>' +
            '<p class="lb-desc" id="lb-desc"></p>' +
            '<div class="tag-row" id="lb-tags"></div>' +
            '<ul class="lb-meta" id="lb-meta"></ul>' +
            '<div class="lightbox-actions" id="lb-actions"></div>' +
          "</div>" +
        "</div>";
      document.body.appendChild(node);

      $(".lb-close", node).addEventListener("click", close);
      $(".lb-prev", node).addEventListener("click", () => step(-1));
      $(".lb-next", node).addEventListener("click", () => step(1));
      node.addEventListener("click", (e) => { if (e.target === node) close(); });
      node.addEventListener("keydown", onKey);
    }

    function metaRow(key, value) {
      const missing = !value;
      return '<li><span class="k">' + esc(key) + '</span><span class="v' + (missing ? " is-missing" : "") + '">' +
        esc(missing ? "Not recorded yet" : value) + "</span></li>";
    }

    function render() {
      const a = list[index];
      if (!a) return;
      const src = artworkImage(a);
      const img = $("#lb-img", node);
      img.src = src || "";
      img.alt = a.alt || a.title;
      $("#lb-title", node).textContent = a.title;
      $("#lb-desc", node).textContent = a.description || "";
      $("#lb-counter", node).textContent = (index + 1) + " of " + list.length;
      $("#lb-tags", node).innerHTML = (a.categories || [])
        .map((c) => '<span class="tag ' + tagClassFor(c) + '">' + esc(c) + "</span>").join("");
      $("#lb-meta", node).innerHTML =
        metaRow("Materials", a.materials) +
        metaRow("Difficulty", a.difficulty) +
        metaRow("Created", formatDate(a.date)) +
        '<li><span class="k">Picture</span><span class="v">' +
          (a.source === "photo" ? "Photograph of the original drawing" : "Still frame from Venuka's video") +
        "</span></li>";
      $("#lb-actions", node).innerHTML = a.video
        ? '<a class="btn btn--yt btn--sm" href="' + esc(videoWatchUrl(a.video)) + '" target="_blank" rel="noopener">' +
          iconYouTube() + "Watch this being drawn</a>"
        : "";
      const nav = list.length > 1;
      $(".lb-prev", node).hidden = !nav;
      $(".lb-next", node).hidden = !nav;
    }

    function step(dir) {
      if (!list.length) return;
      index = (index + dir + list.length) % list.length;
      render();
    }

    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key === "ArrowLeft")  { e.preventDefault(); step(-1); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); step(1);  return; }
      if (e.key !== "Tab") return;
      const focusables = $$("button:not([hidden]), a[href]", node);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function open(items, startIndex) {
      if (!node) build();
      list = items || [];
      index = Math.max(0, startIndex || 0);
      lastFocus = document.activeElement;
      render();
      node.classList.add("is-open");
      document.body.classList.add("lb-open");
      $(".lb-close", node).focus();
    }

    function close() {
      if (!node) return;
      node.classList.remove("is-open");
      document.body.classList.remove("lb-open");
      $("#lb-img", node).src = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    return { open, close };
  })();

  /* =======================================================================
     Filter + search engine, shared by the Drawings and Videos pages
     ===================================================================== */
  function initCollection(opts) {
    const grid    = $(opts.grid);
    const chipBox = $(opts.filters);
    const input   = opts.search ? $(opts.search) : null;
    const clearBtn = opts.clear ? $(opts.clear) : null;
    const counter = opts.count ? $(opts.count) : null;
    if (!grid) return;

    const items = opts.items || [];
    let active = "All";
    let query = "";

    /* Build the filter chips, each showing how many items it holds. */
    if (chipBox) {
      const counts = { All: items.length };
      opts.facets.forEach((f) => {
        counts[f] = items.filter((it) => opts.facetsOf(it).indexOf(f) !== -1).length;
      });
      chipBox.innerHTML = ["All"].concat(opts.facets).map((f) =>
        '<button type="button" class="chip" data-facet="' + esc(f) + '" aria-pressed="' + (f === "All") + '">' +
          esc(f) + ' <span class="chip-count">' + counts[f] + "</span></button>"
      ).join("");
      chipBox.addEventListener("click", (e) => {
        const chip = e.target.closest("[data-facet]");
        if (!chip) return;
        active = chip.getAttribute("data-facet");
        $$("[data-facet]", chipBox).forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
        apply();
      });
    }

    if (input) {
      let t;
      input.addEventListener("input", () => {
        clearTimeout(t);
        if (clearBtn) clearBtn.classList.toggle("is-visible", input.value.length > 0);
        t = setTimeout(() => { query = input.value.trim().toLowerCase(); apply(); }, 160);
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && input.value) { input.value = ""; query = ""; if (clearBtn) clearBtn.classList.remove("is-visible"); apply(); }
      });
    }
    if (clearBtn && input) {
      clearBtn.addEventListener("click", () => {
        input.value = ""; query = ""; clearBtn.classList.remove("is-visible"); apply(); input.focus();
      });
    }

    function apply() {
      let out = items;
      if (active !== "All") out = out.filter((it) => opts.facetsOf(it).indexOf(active) !== -1);
      if (query) out = out.filter((it) => opts.searchText(it).toLowerCase().indexOf(query) !== -1);

      if (!out.length) {
        grid.className = "";
        grid.innerHTML = emptyState(
          opts.emptyTitle || "Nothing here just yet",
          opts.emptyMessage
            ? opts.emptyMessage(active, query)
            : "Try another category, or clear the search box to see everything again."
        );
      } else {
        grid.className = opts.gridClass || "grid grid--3";
        grid.innerHTML = out.map(opts.render).join("");
        guardImages(grid);
      }

      if (counter) {
        const n = out.length;
        counter.textContent =
          n + (n === 1 ? " " + opts.nounSingular : " " + opts.nounPlural) +
          (active !== "All" ? " in “" + active + "”" : "") +
          (query ? " matching “" + input.value.trim() + "”" : "");
      }
      if (opts.onRender) opts.onRender(out);
    }

    /* "Show everything again" inside an empty state clears the filter and the
       search box in place, rather than reloading the whole page. */
    grid.addEventListener("click", (e) => {
      const reset = e.target.closest("[data-reset-filters]");
      if (!reset) return;
      e.preventDefault();
      active = "All";
      query = "";
      if (input) input.value = "";
      if (clearBtn) clearBtn.classList.remove("is-visible");
      if (chipBox) $$("[data-facet]", chipBox).forEach((c) => c.setAttribute("aria-pressed", String(c.getAttribute("data-facet") === "All")));
      apply();
      const firstChip = chipBox && $('[data-facet="All"]', chipBox);
      if (firstChip) firstChip.focus();
    });

    apply();
    return { apply: apply, current: () => items };
  }

  /* =======================================================================
     Page furniture
     ===================================================================== */
  function initNav() {
    const toggle = $(".nav-toggle");
    const nav = $("#site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        nav.classList.toggle("is-open", !open);
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && nav.classList.contains("is-open")) {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.focus();
        }
      });
      document.addEventListener("click", (e) => {
        if (!nav.classList.contains("is-open")) return;
        if (nav.contains(e.target) || toggle.contains(e.target)) return;
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    }

    /* Mark the current page in the menu. */
    let here = location.pathname.split("/").pop() || "index.html";
    $$("#site-nav a, .footer-nav a").forEach((a) => {
      const target = a.getAttribute("href");
      if (target === here) {
        if (a.closest("#site-nav")) a.setAttribute("aria-current", "page");
      }
    });
  }

  function initReveal() {
    const els = $$(".reveal");
    if (!els.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) return;   /* stays visible */

    document.documentElement.classList.add("reveal-ready");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.02 });
    els.forEach((el) => io.observe(el));

    /* Safety net: if anything stops the observer firing (a background tab that
       never paints, an odd browser), show everything rather than leave it blank. */
    setTimeout(() => { $$(".reveal:not(.is-in)").forEach((el) => el.classList.add("is-in")); }, 2500);
  }

  function initYear() {
    $$("[data-year]").forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  }

  /* Cloudflare Web Analytics, loaded only if a token is set in data.js.
     Cookieless, so there is no consent banner and nothing to dismiss. With no
     token nothing is requested at all — no third party learns the visitor was
     here. The script is added last and deferred so it never delays the page. */
  function initAnalytics() {
    const token = DATA && DATA.analytics && DATA.analytics.cloudflareToken;
    if (!token) return;
    if (document.querySelector("[data-cf-beacon]")) return;
    const s = document.createElement("script");
    s.defer = true;
    s.src = "https://static.cloudflareinsights.com/beacon.min.js";
    s.setAttribute("data-cf-beacon", JSON.stringify({ token: token }));
    document.body.appendChild(s);
  }

  /* Artwork tiles open the lightbox. Delegated so it works after re-render. */
  function initArtworkTiles() {
    document.addEventListener("click", function (e) {
      const tile = e.target.closest("[data-artwork]");
      if (!tile) return;
      const id = tile.getAttribute("data-artwork");
      const scope = tile.closest("[data-lightbox-scope]") || document;
      const ids = $$("[data-artwork]", scope).map((t) => t.getAttribute("data-artwork"));
      const set = ids.map((x) => (DATA.artworks || []).find((a) => a.id === x)).filter(Boolean);
      const idx = set.findIndex((a) => a.id === id);
      Lightbox.open(set, idx < 0 ? 0 : idx);
    });
  }

  /* If data.js fails to parse — nearly always a missing comma or quote mark
     after someone adds a drawing — every list on the page would otherwise sit
     on its loading skeleton forever with no explanation. Visitors get an honest
     message; whoever is editing gets the real reason in the console. */
  var DATA_REGIONS = [
    "#art-grid", "#vid-grid", "#craft-grid", "#featured-drawings", "#latest-videos",
    "#home-activities", "#new-artwork", "#new-videos", "#drawing-ideas",
    "#craft-ideas", "#colouring-tips", "#materials-list", "#encouragements",
    "#contact-links"
  ];

  function checkData() {
    if (DATA && DATA.artworks && DATA.videos && DATA.site) return true;

    if (window.console && console.error) {
      console.error(
        "Venuka: assets/js/data.js did not load, so nothing content-driven can be shown.\n" +
        "This is almost always a small typo in that file — a missing comma between two\n" +
        "entries, or a missing quote mark. Look just above for the SyntaxError; it names\n" +
        "the line. See CONTENT-GUIDE.md for the shape each entry should have."
      );
    }

    DATA_REGIONS.forEach(function (sel) {
      var el = $(sel);
      if (!el) return;
      el.className = "";
      el.innerHTML = emptyState(
        "This part could not be loaded",
        "Something went wrong reading the website&rsquo;s content, so the drawings and " +
        "videos cannot be shown right now. Everything is still safe on " +
        '<a href="' + esc((DATA.site && DATA.site.channelUrl) || "https://www.youtube.com/@hlearningkids") +
        '" target="_blank" rel="noopener">Venuka&rsquo;s YouTube channel</a>.',
        "error"
      );
    });
    $$(".result-count").forEach(function (el) { el.textContent = ""; });
    return false;
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initReveal();
    initYear();
    initArtworkTiles();
    guardImages(document);
    checkData();
    initAnalytics();
  });

  /* Public surface used by the per-page scripts. */
  window.VenukaUI = {
    esc, $, $$, formatDate, accentAt, tagClassFor,
    artworkImage, videoThumb, videoWatchUrl,
    artworkCard, videoCard, craftCard,
    emptyState, skeletonGrid, placeholderMarkup, guardImages,
    initCollection, Lightbox, iconYouTube, reduceMotion
  };
})();
