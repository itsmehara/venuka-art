/* =========================================================================
   Venuka — Sketchbook
   -------------------------------------------------------------------------
   Turns the drawings in data.js into an open sketchbook: the drawing on the
   left leaf, its notes on the right leaf, and a sheet of paper that lifts
   from one side and lays itself down on the other. Clicking a drawing opens
   it full size in the site's own lightbox.

   It reads window.VENUKA.artworks. Add a drawing there and it appears here
   too — there is no second list to keep in step.

   The drawings gallery is the real, searchable listing. This is the pretty
   way through, so nothing here is the only route to anything.
   ========================================================================= */
(function () {
  "use strict";

  var UI = window.VenukaUI, D = window.VENUKA;
  if (!UI || !D) return;

  var TURN_MS = 900;                       /* one sheet, all the way over */
  var TURN_EASE = "cubic-bezier(.36, .06, .28, 1)";

  function reduceMotion() {
    return typeof UI.reduceMotion === "function"
      ? UI.reduceMotion()
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function init(root, items) {
    var index = 0, turning = false;

    /* ---- Markup ---------------------------------------------------------- */
    root.innerHTML =
      '<div class="sb-desk">' +
        '<div class="sb-stage">' +
          '<div class="sb-book">' +
            '<div class="sb-leaf sb-leaf--left" data-left></div>' +
            '<div class="sb-leaf sb-leaf--right" data-right></div>' +
            '<div class="sb-spine" aria-hidden="true"></div>' +
            '<div class="sb-sheet" data-sheet aria-hidden="true">' +
              '<div class="sb-face sb-face--front" data-face-front>' +
                '<div class="sb-face-shade"></div></div>' +
              '<div class="sb-face sb-face--back" data-face-back>' +
                '<div class="sb-face-shade"></div></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="sb-tools">' +
        '<div class="sb-tools-side sb-tools-side--start">' +
          '<button type="button" class="sb-tool" data-prev>' +
            '<span aria-hidden="true">&lsaquo;</span> Back</button>' +
        '</div>' +
        '<p class="sb-counter" data-counter></p>' +
        '<div class="sb-tools-side sb-tools-side--end">' +
          '<button type="button" class="sb-tool" data-next>' +
            'Next <span aria-hidden="true">&rsaquo;</span></button>' +
        '</div>' +
      '</div>' +

      '<p class="sb-hint">Turn the pages with the buttons or the arrow keys. ' +
        'Click a drawing to see it full size.</p>' +
      '<p class="visually-hidden" data-announce role="status" aria-live="polite"></p>' +

      '<ol class="sb-index" data-index></ol>';

    var $ = function (sel) { return root.querySelector(sel); };
    var book      = $(".sb-book");
    var leftLeaf  = $("[data-left]");
    var rightLeaf = $("[data-right]");
    var sheet     = $("[data-sheet]");
    var faceFront = $("[data-face-front]");
    var faceBack  = $("[data-face-back]");
    var counter   = $("[data-counter]");
    var announce  = $("[data-announce]");
    var indexList = $("[data-index]");

    indexList.innerHTML = items.map(function (a, i) {
      return '<li><button type="button" data-go="' + i + '">' +
        '<span class="n">' + pad(i + 1) + '</span>' +
        '<span>' + UI.esc(a.title) + "</span></button></li>";
    }).join("");

    /* ---- The two faces of a page ----------------------------------------- */
    function plateHTML(i) {
      var a = items[i];
      if (!a) return "";
      return '<figure class="sb-plate">' +
        '<div class="sb-plate-frame" data-frame>' +
          '<img data-plate src="' + UI.esc(UI.artworkImage(a) || "") + '" ' +
               'alt="' + UI.esc(a.alt || a.title) + '">' +
        '</div>' +
        '<figcaption class="sb-plate-caption">' +
          "<span>Plate " + pad(i + 1) + "</span>" +
          "<span>" + (a.source === "photo" ? "From the sketchbook" : "Still from video") + "</span>" +
        "</figcaption>" +
      "</figure>";
    }

    function metaRow(key, value) {
      var missing = !value;
      return '<li><span class="k">' + UI.esc(key) + '</span><span class="v' +
        (missing ? " is-missing" : "") + '">' +
        UI.esc(missing ? "Not recorded yet" : value) + "</span></li>";
    }

    function notesHTML(i) {
      var a = items[i];
      if (!a) return "";
      return '<div class="sb-notes">' +
        '<p class="sb-notes-kicker">Plate ' + pad(i + 1) + " of " + pad(items.length) + "</p>" +
        "<h3>" + UI.esc(a.title) + "</h3>" +
        '<p class="sb-notes-date">' + UI.esc(UI.formatDate(a.date) || "Date not recorded yet") + "</p>" +
        '<hr class="sb-rule">' +
        (a.description ? '<p class="sb-notes-desc">' + UI.esc(a.description) + "</p>" : "") +
        '<ul class="sb-notes-meta">' +
          metaRow("Materials", a.materials) +
          metaRow("Difficulty", a.difficulty) +
          '<li><span class="k">Picture</span><span class="v">' +
            (a.source === "photo"
              ? "Photograph of the original drawing"
              : "Still frame from Venuka&rsquo;s video") +
          "</span></li>" +
        "</ul>" +
        ((a.categories && a.categories.length)
          ? '<div class="sb-notes-tags">' + a.categories.map(function (c) {
              return "<span>" + UI.esc(c) + "</span>";
            }).join("") + "</div>"
          : "") +
        '<div class="sb-notes-actions">' +
          '<button type="button" class="sb-link" data-open-full>' +
            "See it full size</button>" +
          (a.video
            ? '<a class="sb-link" href="' + UI.esc(UI.videoWatchUrl(a.video)) + '" ' +
              'target="_blank" rel="noopener"><span aria-hidden="true">&#9654;&#65039;</span> ' +
              "Watch it being drawn</a>"
            : "") +
        "</div>" +
      "</div>";
    }

    /* Swapping a leaf re-creates the plate and its glass, so re-bind. */
    function setLeft(i) {
      leftLeaf.innerHTML = plateHTML(i);
      UI.guardImages(leftLeaf);
    }

    function setRight(i) {
      rightLeaf.innerHTML = notesHTML(i);
    }

    function setChrome() {
      var a = items[index];
      counter.textContent = "Plate " + pad(index + 1) + " of " + pad(items.length);
      announce.textContent = "Plate " + (index + 1) + " of " + items.length + ", " + a.title;
      $("[data-prev]").disabled = turning || index === 0;
      $("[data-next]").disabled = turning || index === items.length - 1;
      Array.prototype.forEach.call(indexList.querySelectorAll("button"), function (b, i) {
        if (i === index) b.setAttribute("aria-current", "true");
        else b.removeAttribute("aria-current");
      });
    }

    /* ---- Turning ---------------------------------------------------------- */
    /* One sheet, the way a book actually behaves. Going forward you take the
       right-hand page, sweep it across the spine and lay it down on the left;
       its front is the page you were reading and its back is the drawing you
       are turning to. Going back, the same sheet travels the other way.

       While the sheet is upright, the half it came from already shows the
       page beneath it, and the half it is heading for keeps its old page
       until the sheet covers it. That is why the leaves are swapped at two
       different moments rather than both at the start. */
    function go(to, viaIndex) {
      if (turning) return;
      var next = Math.max(0, Math.min(items.length - 1, to));
      if (next === index) return;
      var forward = next > index;

      if (viaIndex) {
        book.scrollIntoView({ block: "nearest", behavior: reduceMotion() ? "auto" : "smooth" });
      }

      if (reduceMotion() || window.matchMedia("(max-width: 720px)").matches) {
        index = next;
        setLeft(index);
        setRight(index);
        setChrome();
        return;
      }

      var from = index;
      index = next;
      turning = true;
      setChrome();

      /* The sheet's two faces: what you were looking at, and what is coming. */
      if (forward) {
        setFace(faceFront, notesHTML(from), "right");
        setFace(faceBack,  plateHTML(next), "left");
        setRight(next);                    /* revealed as the sheet lifts */
      } else {
        setFace(faceFront, plateHTML(from), "left");
        setFace(faceBack,  notesHTML(next), "right");
        setLeft(next);                     /* revealed as the sheet lifts */
      }

      sheet.classList.add("is-visible", forward ? "from-right" : "from-left");

      var shades = sheet.querySelectorAll(".sb-face-shade");
      var spin = sheet.animate([
        { transform: "rotateY(0deg)" },
        { transform: "rotateY(" + (forward ? -90 : 90) + "deg)", offset: .5 },
        { transform: "rotateY(" + (forward ? -180 : 180) + "deg)" }
      ], { duration: TURN_MS, easing: TURN_EASE, fill: "forwards" });

      /* The face turning away darkens; the one arriving lightens. */
      shades[0].animate([{ opacity: 0 }, { opacity: .5 }],
        { duration: TURN_MS, easing: TURN_EASE, fill: "forwards" });
      shades[1].animate([{ opacity: .5 }, { opacity: 0 }],
        { duration: TURN_MS, easing: TURN_EASE, fill: "forwards" });

      var settled = false;
      var finish = function () {
        if (settled) return;
        settled = true;
        clearTimeout(guard);
        try { spin.cancel(); } catch (err) { /* already gone */ }

        /* The half the sheet has just covered catches up underneath it. */
        if (forward) setLeft(next);
        else setRight(next);

        sheet.classList.remove("is-visible", "from-right", "from-left");
        faceFront.innerHTML = '<div class="sb-face-shade"></div>';
        faceBack.innerHTML  = '<div class="sb-face-shade"></div>';
        turning = false;
        setChrome();
      };
      /* Animations stall in a backgrounded tab. Never strand the book. */
      var guard = setTimeout(finish, TURN_MS + 800);
      spin.finished.then(finish, finish);
    }

    function setFace(face, html, side) {
      face.innerHTML = '<div class="sb-leaf sb-leaf--' + side + '">' + html + "</div>" +
                       '<div class="sb-face-shade"></div>';
      UI.guardImages(face);
    }

    /* ---- Wiring ----------------------------------------------------------- */
    root.addEventListener("click", function (e) {
      var t = e.target;
      if (t.closest("[data-prev]"))  return go(index - 1);
      if (t.closest("[data-next]"))  return go(index + 1);
      if (t.closest("[data-open-full]") || t.closest("[data-frame]")) {
        if (!turning) UI.Lightbox.open(items, index);
        return;
      }
      var jump = t.closest("[data-go]");
      if (jump) return go(Number(jump.getAttribute("data-go")), true);
    });

    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft")  { e.preventDefault(); go(index - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    });

    setLeft(index);
    setRight(index);
    setChrome();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("sketchbook");
    if (!root) return;

    var items = (D.artworks || []).slice().sort(function (a, b) {
      return (b.date || "").localeCompare(a.date || "");
    });

    if (!items.length) {                   /* no drawings, no book */
      root.hidden = true;
      return;
    }

    init(root, items);
  });
})();
