/* Home page: featured drawings, latest videos, three activity ideas. */
(function () {
  "use strict";
  var D = window.VENUKA, UI = window.VenukaUI;

  function tile(item, i) {
    var tint = "var(--" + item.accent + "-tint)";
    return '<div class="tile reveal">' +
      '<div class="tile-icon" style="--accent-tint:' + tint + '" aria-hidden="true">' + item.icon + "</div>" +
      "<h3>" + UI.esc(item.title) + "</h3><p>" + UI.esc(item.text) + "</p></div>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var byDate = D.artworks.slice().sort(function (a, b) {
      return (b.date || "").localeCompare(a.date || "");
    });

    var featured = UI.$("#featured-drawings");
    if (featured) {
      featured.innerHTML = byDate.slice(0, 6).map(UI.artworkCard).join("");
      UI.guardImages(featured);
    }

    var latest = UI.$("#latest-videos");
    if (latest) {
      latest.innerHTML = D.videos.slice(0, 3).map(UI.videoCard).join("");
      UI.guardImages(latest);
    }

    var acts = UI.$("#home-activities");
    if (acts) acts.innerHTML = D.drawingIdeas.slice(0, 3).map(tile).join("");
  });
})();
