"""Design diagrams for Venuka's status page.

Each topic keeps every version it has ever had. When a decision changes, a new
version goes on the end and the old one stays, greyed out, saying what replaced
it — so the page shows how the thinking moved, not just where it landed.

Exactly one version per topic may be marked "current", and "current" means what
is actually true today — not what has been planned. A plan that has not been
carried out is shown as its own topic ("Where it should live"), so the page
never claims an arrangement is in place before anyone has set it up.

    python3 ~/.claude/skills/project-status-page/scripts/build_status.py \
      --data status-data.json --tasks TASKS.json --diagrams diagrams.py --out STATUS.html
"""
from diagram_kit import svg, box, frame, arrow, note

# --------------------------------------------------------------------------
# 1. How a change reaches the web — what has actually been true, in order
# --------------------------------------------------------------------------

PUBLISH_V1 = svg(
    282,
    box(20, 30, 190, 56, "Your computer", "git push", "n"),
    arrow((210, 58), (250, 58)),
    box(250, 30, 190, 56, "GitHub", "Public repository", "a"),
    arrow((440, 58), (480, 58)),
    box(480, 30, 180, 56, "Checks", "66 must pass", "c"),
    arrow((570, 86), (570, 120)),
    box(400, 120, 260, 56, "GitHub Pages", "publishes the whole folder", "c"),
    arrow((530, 176), (530, 210)),
    box(200, 210, 460, 52, "itsmehara.github.io/venuka-art", "the address people visited", "c"),
    label="A push goes to a public GitHub repository, the checks run, GitHub Pages "
          "publishes the whole folder to a github.io address.",
)

PUBLISH_NOW = svg(
    300,
    box(20, 30, 190, 56, "Your computer", "git push", "n"),
    arrow((210, 58), (250, 58)),
    box(250, 30, 190, 56, "GitHub", "Public repository", "a"),
    arrow((440, 58), (480, 58), dashed=True),
    box(480, 30, 180, 56, "Nothing happens", "no publishing step", "d"),
    note(570, 104, "the workflow was deleted 4 Nov"),
    frame(20, 140, 640, 130, "Still on the web — frozen since 4 Nov"),
    box(45, 182, 270, 60, "itsmehara.github.io", "/venuka-art/ still serving", "c"),
    box(355, 182, 280, 60, "Showing the last deploy", "the assembler's output", "a"),
    label="A push reaches the public GitHub repository and stops there, because the "
          "publishing step was deleted. The old github.io site is still on the web, "
          "frozen on its last deploy.",
)

# --------------------------------------------------------------------------
# 2. Where it should live — the three ways, side by side
# --------------------------------------------------------------------------

OPTIONS_V1 = svg(
    344,
    # ---- 1. stay on GitHub -------------------------------------------
    frame(16, 20, 208, 300, "1 · Stay put"),
    box(30, 56, 180, 46, "Repository", "Public", "d"),
    box(30, 112, 180, 46, "Host", "GitHub Pages", "a"),
    box(30, 168, 180, 46, "Address", "the new subdomain", "c"),
    box(30, 224, 180, 46, "Cost", "Free", "c"),
    note(120, 292, "Notes stay readable"),
    # ---- 2. cloudflare -----------------------------------------------
    frame(236, 20, 208, 300, "2 · Cloudflare"),
    box(250, 56, 180, 46, "Repository", "Private", "c"),
    box(250, 112, 180, 46, "Host", "Cloudflare Pages", "a"),
    box(250, 168, 180, 46, "Address", "the new subdomain", "c"),
    box(250, 224, 180, 46, "Cost", "Free", "c"),
    note(340, 292, "A new account to run"),
    # ---- 3. pay github -----------------------------------------------
    frame(456, 20, 208, 300, "3 · Pay GitHub"),
    box(470, 56, 180, 46, "Repository", "Private", "c"),
    box(470, 112, 180, 46, "Host", "GitHub Pages", "a"),
    box(470, 168, 180, 46, "Address", "the new subdomain", "c"),
    box(470, 224, 180, 46, "Cost", "A few $ a month", "d"),
    note(560, 292, "One service, not two"),
    label="Three ways to host the site, side by side. All three give the same new "
          "subdomain. They differ in whether the repository is private, which host "
          "serves the site, and what it costs.",
)

# --------------------------------------------------------------------------
# 3. How the subdomain reaches the site, whichever host wins
# --------------------------------------------------------------------------

ADDRESS_V1 = svg(
    292,
    frame(20, 20, 640, 150, "GoDaddy — the nameservers stay here either way"),
    box(45, 58, 270, 50, "@   A records", "the company site — leave", "a"),
    box(45, 116, 270, 44, "www   CNAME", "the company site — leave", "a"),
    box(355, 58, 280, 50, "artbyvenuka   CNAME", "the one new record", "c"),
    box(355, 116, 280, 44, "MX", "none — no email to break", "a"),
    arrow((495, 160), (495, 212)),
    box(355, 212, 280, 56, "Whichever host wins", "GitHub Pages or Cloudflare", "c"),
    note(180, 240, "Nothing on the left changes."),
    label="At GoDaddy the company domain keeps its A records, its www record and its "
          "absence of email. One new CNAME for artbyvenuka points at whichever host "
          "is chosen.",
)

# --------------------------------------------------------------------------
# 4. What reaches the web, and what does not
# --------------------------------------------------------------------------

SPLIT_V1 = svg(
    312,
    frame(20, 20, 640, 100, "Everything in the repository"),
    box(45, 52, 275, 50, "The website", "11 pages, pictures, styles", "c"),
    box(360, 52, 275, 50, "The working notes", "status, registry, guides", "d"),
    arrow((182, 102), (182, 145)),
    arrow((497, 102), (497, 145), dashed=True),
    box(60, 145, 245, 52, "The assembler", "copies only the website", "a"),
    box(395, 145, 245, 52, "Left behind", "never copied anywhere", "d"),
    arrow((182, 197), (182, 240)),
    box(60, 240, 245, 52, "On the web", "what visitors see", "c"),
    note(517, 237, "Asking for one by name"),
    note(517, 255, "returns 'not found'"),
    label="The repository holds the website and the working notes. The assembler copies "
          "only the website, which goes on the web; the notes are left behind and return "
          "not-found if anyone asks for them.",
)

TOPICS = [
    {
        "id": "publishing",
        "title": "How a change reaches the web",
        "versions": [
            {
                "v": "v1",
                "date": "30 Aug 2026",
                "time": "18:10 IST",
                "status": "superseded",
                "why": "Written when the site first went live, to show the family that a mistake "
                       "cannot reach the web: the checks sit between the computer and the website, "
                       "and a failure simply means nothing is published.",
                "context": "The repository was public, which is the only way GitHub publishes a "
                           "site for free. The whole folder was published, with the working "
                           "documents deleted in the last seconds before it went out.",
                "changed": "Removed on 4 Nov 2026. It had just published three of the status "
                           "page's own source files to the public web, because it worked by "
                           "deleting a named list of working documents and that list had fallen "
                           "behind the repository. Replaced by v2 — which is to say, by nothing.",
                "built": "Yes — this is how the site was published from 30 Aug to 4 Nov 2026.",
                "svg": PUBLISH_V1,
            },
            {
                "v": "v2",
                "date": "4 Nov 2026",
                "time": "11:45 IST",
                "status": "current",
                "why": "Honesty about where things stand. The publishing step was deleted rather "
                       "than left running, because a step nobody is watching is what put the "
                       "working files on the web in the first place. Until a new host is chosen, "
                       "the safest arrangement is one where nothing can publish at all.",
                "context": "A push still reaches GitHub and is still safely stored there; it "
                           "simply does not go any further. The old github.io site is untouched "
                           "and still serving all eleven pages, frozen on the last deploy — the "
                           "one where the assembler, not a hand-written delete list, decided what "
                           "went out. Every working document on it returns not-found, checked.",
                "built": "Yes — this is what is actually true today, and it is a resting point, "
                         "not a destination. The site cannot be updated while it lasts.",
                "svg": PUBLISH_NOW,
            },
        ],
    },
    {
        "id": "options",
        "title": "Where it should live — the three ways",
        "versions": [
            {
                "v": "v1",
                "date": "6 Nov 2026",
                "time": "10:00 IST",
                "status": "current",
                "why": "Three separate questions had been bundled into one and answered together: "
                       "where the site is hosted, whether the repository is private, and what "
                       "address it has. Only the middle one forces a change of host. The address "
                       "— artbyvenuka.nischayacreativesoft.com — is settled and is available on "
                       "every one of these routes, so it is not what is being decided here.",
                "context": "What is public either way is the website itself: the drawings, her "
                           "first name, the About page. A private repository hides the working "
                           "notes and nothing else. What those notes currently reveal is narrow "
                           "— that a photograph of Venuka exists and was deliberately held back, "
                           "and that her school year was deliberately left off. Not the "
                           "photograph, and not the school year. notes/ and originals/ have "
                           "never been in the repository at all.",
                "built": "No — this is the decision itself, still open as of 6 Nov. Route 2 is "
                          "fully written up in DEPLOYMENT.md and needs no further research; "
                          "route 1 needs the deleted workflow restored; route 3's price should be "
                          "checked before anyone commits to it.",
                "svg": OPTIONS_V1,
            },
        ],
    },
    {
        "id": "address",
        "title": "How the subdomain reaches the site",
        "versions": [
            {
                "v": "v1",
                "date": "6 Nov 2026",
                "time": "10:00 IST",
                "status": "current",
                "why": "The company domain is live and carries Nischaya's own site. The thing "
                       "worth being sure of before touching anything is that giving Venuka a "
                       "subdomain cannot disturb it. This shows exactly which records are added "
                       "and which are not to be touched.",
                "context": "Read live from the public DNS on 6 Nov 2026 rather than taken from "
                           "memory: the bare domain has GitHub's four addresses, www points at "
                           "the same GitHub account, there is one Google verification line, there "
                           "are no email records, and no other subdomain exists. The nameservers "
                           "stay at GoDaddy on every route. One record is added beside the "
                           "existing ones; its target is the only part that depends on which host "
                           "is chosen.",
                "built": "No — the record does not exist yet. Everything shown on the left was "
                         "verified live; only the new CNAME and the host below it are pending.",
                "svg": ADDRESS_V1,
            },
        ],
    },
    {
        "id": "whatships",
        "title": "What reaches the web, and what does not",
        "versions": [
            {
                "v": "v1",
                "date": "4 Nov 2026",
                "time": "10:30 IST",
                "status": "current",
                "why": "Moving host put the family notes at risk. The old publishing step deleted "
                       "them in the seconds before going live; a host that builds straight from "
                       "the repository has no such step, and if it were forgotten the notes about "
                       "Venuka's photograph would go public.",
                "context": "The assembler works from a list of what belongs on the website rather "
                           "than a list of what to exclude. A private note added next month is "
                           "therefore left out by default, instead of needing someone to remember "
                           "it. It refuses to finish if a working document slips through. This "
                           "holds whichever host is chosen, which is why it was worth building "
                           "before the decision rather than after.",
                "built": "Yes — 4 Nov 2026. Checked twice. First by serving the assembled folder "
                         "and asking for each document by name: all returned not-found, and the "
                         "site itself rendered correctly with no errors. Then on the live site "
                         "itself, after the old publishing step had put three working files on "
                         "the public web: once the assembler was doing the publishing, all nine "
                         "documents returned not-found and only the website remained.",
                "svg": SPLIT_V1,
            },
        ],
    },
]
