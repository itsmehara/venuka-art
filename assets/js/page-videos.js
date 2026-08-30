/* Videos page: tag filters, search, click-to-load YouTube players. */
(function () {
  "use strict";
  var D = window.VENUKA, UI = window.VenukaUI;

  document.addEventListener("DOMContentLoaded", function () {
    var tags = [];
    D.videos.forEach(function (v) {
      (v.tags || []).forEach(function (t) { if (tags.indexOf(t) === -1) tags.push(t); });
    });
    tags.sort();

    UI.initCollection({
      grid: "#vid-grid",
      filters: "#vid-filters",
      search: "#vid-search",
      clear: "#vid-search-clear",
      count: "#vid-count",
      items: D.videos,
      facets: tags,
      facetsOf: function (v) { return v.tags || []; },
      searchText: function (v) {
        return [v.title, v.ytTitle, v.description, (v.tags || []).join(" ")].join(" ");
      },
      render: UI.videoCard,
      gridClass: "grid grid--3",
      nounSingular: "video",
      nounPlural: "videos",
      emptyTitle: "No videos match that",
      emptyMessage: function () {
        return '<a href="#" data-reset-filters>Show all the videos again</a>, try another category, ' +
          'or browse everything on the <a href="' + D.site.channelUrl +
          '" target="_blank" rel="noopener">Happy Learning Kids channel</a>.';
      }
    });
  });
})();
