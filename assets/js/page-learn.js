/* Learn & Create: ideas, tips, materials, craft ideas, encouragements. */
(function () {
  "use strict";
  var D = window.VENUKA, UI = window.VenukaUI;

  function tile(item) {
    return '<div class="tile reveal">' +
      '<div class="tile-icon" style="--accent-tint:var(--' + item.accent + '-tint)" aria-hidden="true">' + item.icon + "</div>" +
      "<h3>" + UI.esc(item.title) + "</h3><p>" + UI.esc(item.text) + "</p></div>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var ideas = UI.$("#drawing-ideas");
    if (ideas) ideas.innerHTML = D.drawingIdeas.map(tile).join("");

    var crafts = UI.$("#craft-ideas");
    if (crafts) crafts.innerHTML = D.craftIdeas.map(tile).join("");

    var tips = UI.$("#colouring-tips");
    if (tips) tips.innerHTML = D.colouringTips.map(function (t) {
      return "<li>" + UI.esc(t) + "</li>";
    }).join("");

    var mats = UI.$("#materials-list");
    if (mats) mats.innerHTML = D.materialsList.map(function (m) {
      return '<li><div class="contact-item">' +
        '<span class="ci-icon" aria-hidden="true">' + m.icon + "</span>" +
        '<span><span class="ci-label">' + UI.esc(m.name) + "</span>" +
        '<span class="ci-value">' + UI.esc(m.note) + "</span></span></div></li>";
    }).join("");

    var enc = UI.$("#encouragements");
    if (enc) enc.innerHTML = D.encouragements.map(function (t, i) {
      var colours = ["var(--pink)", "var(--sky)", "var(--green)", "var(--purple)"];
      return '<p class="callout reveal" style="border-color:' + colours[i % colours.length] +
        ';font-family:var(--font-display);font-size:var(--step-1);color:var(--ink);text-align:center">' +
        UI.esc(t) + "</p>";
    }).join("");
  });
})();
