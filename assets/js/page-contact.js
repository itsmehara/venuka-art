/* Contact page: honest form handling plus the contact link list.

   The form never pretends. If VENUKA.formEndpoint is null there is no delivery
   service connected, so a valid submission says exactly that and points the
   visitor at the YouTube channel instead. Set formEndpoint in data.js to a real
   POST endpoint (Formspree, Basin, Netlify Forms, Google Apps Script, ...) and
   the same form starts really sending, with a real success and error state.     */
(function () {
  "use strict";
  var D = window.VENUKA, UI = window.VenukaUI;

  var ORDER = ["youtube", "email", "instagram", "facebook", "whatsapp"];

  function renderContactLinks() {
    var list = UI.$("#contact-links");
    if (!list) return;
    list.innerHTML = ORDER.map(function (key) {
      var c = D.contact[key];
      if (!c) return "";
      var inner =
        '<span class="ci-icon" aria-hidden="true">' + c.icon + "</span>" +
        '<span><span class="ci-label">' + UI.esc(c.label) + "</span>";
      if (c.href) {
        inner += '<span class="ci-value">' + UI.esc(c.value) + "</span></span>";
        return '<li><a class="contact-item" href="' + UI.esc(c.href) + '" target="_blank" rel="noopener">' +
          inner + '<span class="visually-hidden"> (opens in a new tab)</span></a></li>';
      }
      inner += '<span class="ci-value is-placeholder">' + UI.esc(c.placeholder || "Not published yet") +
        "</span></span>";
      return '<li><div class="contact-item">' + inner + "</div></li>";
    }).join("");
  }

  var FIELDS = [
    { id: "cf-name",    label: "your name" },
    { id: "cf-email",   label: "your email address" },
    { id: "cf-subject", label: "a subject" },
    { id: "cf-message", label: "a message" }
  ];

  function setError(input, message) {
    var box = UI.$("#" + input.id + "-error");
    if (box) box.textContent = message || "";
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
    return !message;
  }

  function validateField(input) {
    var v = input.value.trim();
    if (!v) {
      var f = FIELDS.filter(function (x) { return x.id === input.id; })[0];
      return setError(input, "Please enter " + (f ? f.label : "this") + ".");
    }
    if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      return setError(input, "That does not look like an email address. Check it and try again.");
    }
    if (input.id === "cf-message" && v.length < 10) {
      return setError(input, "Please write a little more — at least a full sentence.");
    }
    return setError(input, "");
  }

  function result(kind, title, html) {
    var box = UI.$("#cf-result");
    if (!box) return;
    box.innerHTML =
      '<div class="state state--' + kind + '">' +
        '<span class="state-emoji" aria-hidden="true">' +
          (kind === "ok" ? "🎉" : kind === "error" ? "📭" : "✉️") + "</span>" +
        "<h3>" + title + "</h3><p>" + html + "</p></div>";
    box.querySelector(".state").scrollIntoView({
      behavior: UI.reduceMotion ? "auto" : "smooth", block: "nearest"
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderContactLinks();

    var form = UI.$("#contact-form");
    if (!form) return;
    var submit = UI.$("#cf-submit");
    var inputs = FIELDS.map(function (f) { return UI.$("#" + f.id); }).filter(Boolean);

    /* A craft card can link here with ?about=Paper%20Flower%20Card */
    try {
      var about = new URLSearchParams(location.search).get("about");
      var subject = UI.$("#cf-subject");
      if (about && subject) subject.value = "About: " + about;
    } catch (e) { /* older browser: no prefill, no harm */ }

    inputs.forEach(function (input) {
      input.addEventListener("blur", function () { if (input.value.trim()) validateField(input); });
      input.addEventListener("input", function () {
        if (input.getAttribute("aria-invalid") === "true") validateField(input);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      UI.$("#cf-result").innerHTML = "";

      var ok = true, firstBad = null;
      inputs.forEach(function (input) {
        var good = validateField(input);
        if (!good && !firstBad) firstBad = input;
        ok = ok && good;
      });

      if (!ok) {
        result("error", "Almost there",
          "A few boxes still need attention — they are marked above.");
        if (firstBad) firstBad.focus();
        return;
      }

      /* No delivery service configured: say so plainly. */
      if (!D.formEndpoint) {
        result("error", "This form cannot send yet",
          "Your message has <strong>not</strong> been sent, and nothing has been saved. " +
          "A contact-form delivery service still needs to be connected to this website " +
          "before messages can arrive.<br><br>Until then, the quickest way to reach Venuka " +
          'is a comment on the <a href="' + D.site.channelUrl + '" target="_blank" rel="noopener">' +
          "Happy Learning Kids YouTube channel</a>.");
        return;
      }

      /* A real endpoint is configured: really send it. */
      submit.disabled = true;
      var original = submit.textContent;
      submit.textContent = "Sending…";
      result("info", "Sending your message", "One moment please.");

      fetch(D.formEndpoint, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          name: UI.$("#cf-name").value.trim(),
          email: UI.$("#cf-email").value.trim(),
          subject: UI.$("#cf-subject").value.trim(),
          message: UI.$("#cf-message").value.trim()
        })
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        result("ok", "Message sent — thank you!",
          "It is on its way to Venuka. You should get a reply at the email address you gave.");
      }).catch(function () {
        result("error", "That did not go through",
          "Your message could not be sent just now, and nothing was lost — the text is still " +
          "in the boxes above, so you can try again in a moment. If it keeps failing, please " +
          'comment on the <a href="' + D.site.channelUrl + '" target="_blank" rel="noopener">' +
          "Happy Learning Kids channel</a> instead.");
      }).then(function () {
        submit.disabled = false;
        submit.textContent = original;
      });
    });
  });
})();
