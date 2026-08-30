/* Drawings gallery: category filters, search, lightbox. */
(function () {
  "use strict";
  var D = window.VENUKA, UI = window.VenukaUI;

  document.addEventListener("DOMContentLoaded", function () {
    var items = D.artworks.slice().sort(function (a, b) {
      return (b.date || "").localeCompare(a.date || "");
    });

    UI.initCollection({
      grid: "#art-grid",
      filters: "#art-filters",
      search: "#art-search",
      clear: "#art-search-clear",
      count: "#art-count",
      items: items,
      facets: D.categories,
      facetsOf: function (a) { return a.categories || []; },
      searchText: function (a) {
        return [a.title, a.description, a.alt, (a.categories || []).join(" "),
                a.materials || "", a.difficulty || ""].join(" ");
      },
      render: UI.artworkCard,
      gridClass: "grid grid--3",
      nounSingular: "drawing",
      nounPlural: "drawings",
      emptyTitle: "Nothing in this category yet",
      emptyMessage: function (facet, query) {
        if (query) {
          return "No drawing matches that search" +
            (facet !== "All" ? " inside &ldquo;" + UI.esc(facet) + "&rdquo;" : "") +
            ". Try a different word, or clear the search box.";
        }
        return "Venuka has not added anything to &ldquo;" + UI.esc(facet) + "&rdquo; yet. " +
          "This category is ready and waiting &mdash; it will fill up as new work is photographed. " +
          'Meanwhile, <a href="#" data-reset-filters>see all the drawings</a>.';
      }
    });
  });
})();
