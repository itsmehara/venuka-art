/**
 * ============================================================================
 *  Venuka website — contact form receiver
 *
 *  Copy ALL of this into a Google Apps Script attached to a Google Sheet.
 *  Each message the website sends is added as a new row in that Sheet.
 *  The Sheet is private to you. Nobody who visits the website can read it.
 *
 *  ── SETUP, ONCE ──────────────────────────────────────────────────────────
 *
 *  1. Go to sheets.new  →  a new blank Sheet.
 *     Name it something like "Venuka website — messages".
 *     Leave it private. Do NOT use File → Share → Anyone with the link.
 *
 *  2. In that Sheet:  Extensions → Apps Script.
 *     Delete whatever is in the editor. Paste this entire file. Save.
 *
 *  3. If you want an email for every message, put your address on the
 *     NOTIFY line below. Leave it as "" for no emails.
 *
 *  4. Click  Deploy → New deployment.
 *       Type            : Web app          (click the gear if you don't see it)
 *       Description     : Venuka contact form
 *       Execute as      : Me
 *       Who has access  : Anyone            ← must be "Anyone", not "Anyone with
 *                                             a Google account". The website's
 *                                             visitors are not signed in.
 *     Click Deploy. Google asks you to authorise it — that is normal, it is
 *     your own script writing to your own Sheet. Accept.
 *
 *  5. Copy the Web app URL. It looks like:
 *       https://script.google.com/macros/s/AKfycb..................../exec
 *
 *  6. Open  assets/js/data.js  and change this one line:
 *       const formEndpoint = null;
 *     to:
 *       const formEndpoint = "https://script.google.com/macros/s/.../exec";
 *
 *     Then:  node tools/check.js   and push. The form is live.
 *
 *  ── IF YOU EVER EDIT THIS SCRIPT ─────────────────────────────────────────
 *  Deploy → Manage deployments → pencil icon → Version: New version → Deploy.
 *  Editing alone does nothing until you deploy a new version. The URL stays
 *  the same, so data.js does not need changing again.
 *
 *  ── WHAT IS PRIVATE AND WHAT IS NOT ──────────────────────────────────────
 *  Private : every message, every name, every email address. They live in
 *            your Sheet and only you can open it.
 *  Public  : the /exec URL above, because the visitor's browser must know
 *            where to send the form. That is true of every website of this
 *            kind. It lets someone send you junk; it does not let anyone
 *            read what other people sent. The spam trap on the website plus
 *            the checks below deal with the junk.
 * ============================================================================
 */

/* Put your email here to be told about each message. "" means no emails. */
var NOTIFY = "";

/* Refuse more than this many messages per hour, in total. Stops a script
   from filling your Sheet with thousands of rows overnight. */
var MAX_PER_HOUR = 20;


function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    /* Two submissions arriving together must not write to the same row. */
    lock.waitLock(20000);

    var data = JSON.parse(e.postData.contents);

    /* The website's hidden spam trap. A real person cannot see or reach that
       box, so if it has anything in it the message came from a script.
       Answer 200 so whoever sent it learns nothing, and write nothing down. */
    if (data.website) {
      return json({ ok: true });
    }

    /* Every field is required, and the email must at least look like one. */
    var name    = clean(data.name, 100);
    var email   = clean(data.email, 254);
    var subject = clean(data.subject, 200);
    var message = clean(data.message, 5000);

    if (!name || !email || !subject || !message) {
      return json({ ok: false, error: "Please fill in every box." }, 400);
    }
    if (data.consent !== true) {
      return json({ ok: false, error: "Privacy agreement is required." }, 400);
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ ok: false, error: "That email address does not look right." }, 400);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    /* Write the column titles once, the first time a message arrives. */
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Received", "Name", "Email", "Subject", "Message", "Consent"]);
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    /* Rate limit: count rows written in the last hour. */
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var look = Math.min(MAX_PER_HOUR, lastRow - 1);
      var recent = sheet.getRange(lastRow - look + 1, 1, look, 1).getValues();
      var hourAgo = new Date(Date.now() - 3600 * 1000);
      var inLastHour = recent.filter(function (r) {
        return r[0] instanceof Date && r[0] > hourAgo;
      }).length;
      if (inLastHour >= MAX_PER_HOUR) {
        return json({ ok: false, error: "Too many messages just now. Please try later." }, 429);
      }
    }

    /* Prefix formula-like values so visitor text can never execute as a
       spreadsheet formula when the owner opens the Sheet. */
    sheet.appendRow([
      new Date(), safeCell(name), safeCell(email), safeCell(subject),
      safeCell(message), "Privacy notice accepted"
    ]);

    if (NOTIFY) {
      MailApp.sendEmail({
        to: NOTIFY,
        subject: "Venuka website — message from " + oneLine(name),
        replyTo: email,
        body: name + " <" + email + "> wrote:\n\n" +
              "Subject: " + subject + "\n\n" + message + "\n\n" +
              "— sent from the contact form on Venuka's website"
      });
    }

    return json({ ok: true });

  } catch (err) {
    console.error(err);
    return json({ ok: false, error: "The message could not be saved just now." }, 500);
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}


function clean(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}


function safeCell(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}


function oneLine(value) {
  return String(value).replace(/[\r\n]+/g, " ").slice(0, 100);
}


/* Opening the /exec URL in a browser lands here. Say nothing useful — this
   address is public, and there is no reason to describe what sits behind it. */
function doGet() {
  return json({ ok: true });
}


function json(obj, status) {
  /* Apps Script cannot set an HTTP status code on a web app response, so the
     status argument is accepted for readability and ignored. The website
     treats any non-{ok:true} answer as a failure and says so to the visitor. */
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
