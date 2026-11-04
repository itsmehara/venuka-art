"""Design diagrams for Venuka's status page.

Each topic keeps every version it has ever had. When a decision changes, a new
version goes on the end and the old one stays, greyed out, saying what replaced
it — so the page shows how the thinking moved, not just where it landed.

    python3 ~/.claude/skills/project-status-page/scripts/build_status.py \
      --data status-data.json --tasks TASKS.json --diagrams diagrams.py --out STATUS.html
"""
from diagram_kit import svg, box, frame, arrow, note

# --------------------------------------------------------------------------
# 1. How a change reaches the web
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

PUBLISH_V2 = svg(
    355,
    box(20, 30, 180, 56, "Your computer", "git push", "n"),
    arrow((200, 58), (240, 58)),
    box(240, 30, 190, 56, "GitHub", "Private repository", "a"),
    arrow((430, 58), (470, 58)),
    box(470, 30, 190, 56, "Cloudflare Pages", "runs the checks", "c"),
    arrow((565, 86), (565, 118)),
    box(430, 118, 230, 56, "Then the assembler", "only the website", "c"),
    arrow((545, 174), (545, 255)),
    frame(20, 215, 640, 120, "GoDaddy — the nameservers stay here"),
    box(45, 255, 270, 60, "nischayacreativesoft.com", "still on GitHub Pages", "a"),
    box(355, 255, 280, 60, "artbyvenuka", "...nischayacreativesoft.com", "c"),
    label="A push goes to a private GitHub repository, Cloudflare Pages runs the checks "
          "and the assembler, and serves the result at a subdomain. The company domain "
          "stays at GoDaddy and keeps pointing at GitHub Pages.",
)

# --------------------------------------------------------------------------
# 2. What reaches the web, and what does not
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
                "changed": "Replaced on 4 Nov 2026 when the repository was made private.",
                "built": "Yes — this is how the site was published from 30 Aug until now.",
                "svg": PUBLISH_V1,
            },
            {
                "v": "v2",
                "date": "4 Nov 2026",
                "time": "11:00 IST",
                "status": "current",
                "why": "The repository is going private so the working notes about Venuka are not "
                       "readable by strangers. GitHub publishes a free site only from a public "
                       "repository, so the host has to change.",
                "context": "Cloudflare Pages is free, has no public-repository condition, and runs "
                           "the same checks as the build command. The company domain is untouched: "
                           "its nameservers stay at GoDaddy and it keeps pointing at GitHub Pages. "
                           "Only one new record is added beside it.",
                "changed": "GitHub Pages gives way to Cloudflare Pages, and the address moves from "
                           "a github.io path to a subdomain of the company domain. The deleting of "
                           "working documents moves out of the publishing step and into the "
                           "assembler, which is the second topic below.",
                "svg": PUBLISH_V2,
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
                       "them in the seconds before going live; Cloudflare has no such step, and if "
                       "it were forgotten the notes about Venuka's photograph would go public.",
                "context": "The assembler works from a list of what belongs on the website rather "
                           "than a list of what to exclude. A private note added next month is "
                           "therefore left out by default, instead of needing someone to remember "
                           "it. It refuses to finish if a working document slips through.",
                "built": "Yes — 4 Nov 2026. Checked by serving the assembled folder and asking for "
                         "each document by name: all returned not-found, and the site itself "
                         "rendered correctly with no errors.",
                "svg": SPLIT_V1,
            },
        ],
    },
]
