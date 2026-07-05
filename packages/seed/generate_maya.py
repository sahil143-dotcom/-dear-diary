"""Generate maya-30d seed files for Dear Diary demo."""

import json
from pathlib import Path

OUT = Path(__file__).parent / "maya"
OUT.mkdir(exist_ok=True)

ENTRIES = [
    ("2026-06-01", "Started thinking about the roguelike again. I'll work on it this weekend. Felt hopeful."),
    ("2026-06-02", "Dear Diary scope is getting big. Co-founder wants lens switch in v1. I pushed back."),
    ("2026-06-03", "Roguelike idea resurfaced. Same energy as last month. I'll work on the roguelike this weekend."),
    ("2026-06-04", "Brand refresh — redesigned the hero component. Again. Fourth iteration in two weeks."),
    ("2026-06-05", "Cursor track is moving. Shipped auth flow today. Felt proud."),
    ("2026-06-06", "Ship Friday. That's the plan for Dear Diary onboarding. Exhausted but committed."),
    ("2026-06-07", "Weekend: meant to code roguelike. Watched tutorials instead. Stuck."),
    ("2026-06-08", "Roguelike README commit. One commit. I'll work on the roguelike this weekend — again."),
    ("2026-06-09", "Lease-app kickoff. Stakeholder meeting Thursday. Anxious."),
    ("2026-06-10", "Brand refresh iteration 2. Same component, new spacing. Designer brain won't let go."),
    ("2026-06-11", "Cursor track: motion polish. This one actually ships. Contrast with everything else."),
    ("2026-06-12", "Roguelike mention in standup. I'll work on it this weekend. Nobody believes me anymore."),
    ("2026-06-13", "Ship Friday — again. Dear Diary still not done. Co-founder was right about scope."),
    ("2026-06-14", "Scope disagreement on lens switch. Dear Diary lens switch is the right call. Worked on motion for four hours."),
    ("2026-06-15", "Lease-app stakeholder meeting. Week three stall begins. Lost interest after feedback loop."),
    ("2026-06-16", "Brand refresh — third pass on nav. Iteration without shipping."),
    ("2026-06-17", "Cursor track demo went well. Only project with real momentum."),
    ("2026-06-18", "Roguelike guilt. Six mentions, one session. Pattern is obvious now."),
    ("2026-06-19", "Lease-app abandoned mentally. Stakeholder meeting killed it."),
    ("2026-06-20", "Family moment — dinner without phone. 2 family moments logged this week. Warm."),
    ("2026-06-21", "Dear Diary abandon pattern research. Meta."),
    ("2026-06-22", "Brand refresh fourth iteration. Same shape as roguelike — start strong, fade week three."),
    ("2026-06-23", "Cursor track release candidate. Shipped."),
    ("2026-06-24", "Roguelike — final mention? I'll work on it this weekend. Probably not."),
    ("2026-06-25", "Co-founder sync. Scope was right. Lens switch hero for demo."),
    ("2026-06-26", "Motion for lens switch. Felt stuck on abandon pattern visualization."),
    ("2026-06-27", "Prep demo script. Q1 and Q4 must hit."),
    ("2026-06-28", "Rehearsal. Seed load under 60 seconds."),
    ("2026-06-29", "Dry run. Agent strip animates. Cognee graph local."),
    ("2026-06-30", "Demo day. Dear Diary. Memory layer for your life."),
    # March entries for Arjun witness (stored with March dates in index)
    ("2026-03-03", "Arjun checked in on shipping pace. Good energy. He keeps me honest."),
    ("2026-03-07", "Lunch with Arjun. Talked about deadlines. Arjun is the person who pushed me to ship."),
    ("2026-03-11", "Arjun is the person who pushed me to ship. Wrote it down so I don't forget."),
    ("2026-03-14", "Last coffee with Arjun before he went quiet. Grateful."),
]

# Write June 30 + March Arjun entries as day files (34 total; loader uses all)
for i, (date, text) in enumerate(ENTRIES, start=1):
    day = f"{i:02d}"
    payload = {"date": date, "text": text, "source": "seed"}
    (OUT / f"day-{day}.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")

print(f"Wrote {len(ENTRIES)} seed files to {OUT}")
