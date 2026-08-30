/* Arts & Crafts: real crafts when they exist, an honest empty state until then. */
(function () {
  "use strict";
  var D = window.VENUKA, UI = window.VenukaUI;

  function ideaTile(item) {
    return '<div class="tile reveal">' +
      '<div class="tile-icon" style="--accent-tint:var(--' + item.accent + '-tint)" aria-hidden="true">' + item.icon + "</div>" +
      "<h3>" + UI.esc(item.title) + "</h3><p>" + UI.esc(item.text) + "</p></div>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var grid = UI.$("#craft-grid");
    if (grid) {
      if (D.crafts.length) {
        grid.className = "grid grid--3";
        grid.innerHTML = D.crafts.map(UI.craftCard).join("");
        UI.guardImages(grid);
      } else {
        grid.className = "";
        grid.innerHTML = UI.emptyState(
          "Craft photographs coming soon",
          "Venuka&rsquo;s handmade crafts are still being photographed, so there is nothing to " +
          "show here yet. Rather than fill the page with pictures that are not hers, this space " +
          "is being kept empty until the real photographs arrive. " +
          '<br><br>In the meantime, the <a href="drawings.html">drawings gallery</a> is full, ' +
          'and there are <a href="#craft-ideas-section">craft ideas to try at home</a> just below.'
        );
      }
    }

    var ideas = UI.$("#craft-ideas");
    if (ideas) ideas.innerHTML = D.craftIdeas.map(ideaTile).join("");
  });
})();
