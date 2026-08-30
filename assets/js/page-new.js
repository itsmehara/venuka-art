/* New Creations: everything sorted newest first. */
(function () {
  "use strict";
  var D = window.VENUKA, UI = window.VenukaUI;

  document.addEventListener("DOMContentLoaded", function () {
    var art = D.artworks.slice().sort(function (a, b) {
      return (b.date || "").localeCompare(a.date || "");
    });

    var grid = UI.$("#new-artwork");
    if (grid) {
      if (art.length) {
        grid.innerHTML = art.slice(0, 8).map(UI.artworkCard).join("");
        UI.guardImages(grid);
      } else {
        grid.className = "";
        grid.innerHTML = UI.emptyState("No drawings yet",
          "New artwork will appear here as soon as it is added.");
      }
    }

    var vids = UI.$("#new-videos");
    if (vids) {
      vids.innerHTML = D.videos.slice(0, 6).map(UI.videoCard).join("");
      UI.guardImages(vids);
    }
  });
})();
