# STREAM S6 — Seed data & Demo ops (Hour 4–30)

**Goal:** Bulletproof maya-30d dataset + demo script + reset + backup video.

**Owner:** PM / anyone not blocked on critical path; whole team reviews seed facts

**Folders:** `packages/seed/maya/`, `scripts/`, `docs/demo/`

---

## Task list

### S6-01 · Hour 4–12 — Write Maya entries
- [ ] 30 JSON files: `packages/seed/maya/day-01.json` … `day-30.json`
- [ ] Schema per file:

```json
{
  "date": "2026-06-01",
  "text": "Full diary entry prose...",
  "source": "seed",
  "entitiesHint": {
    "people": ["Arjun"],
    "projects": ["roguelike", "Dear Diary"],
    "emotions": ["stuck"]
  }
}
```

- [ ] Spread entries across June 2026 (or consistent month)
- [ ] Validate against [06-STREAM-S5](./06-STREAM-S5-lenses-patterns.md) narrative requirements

### S6-02 · Hour 12–14 — Seed loader
- [ ] `packages/cli/src/seed-maya.ts` OR Python `scripts/seed_maya.py`
- [ ] Calls `POST http://127.0.0.1:8787/seed/load { profile: "maya-30d" }`
- [ ] Idempotent: wipe + reload

### S6-03 · Hour 14 — demo-reset.sh

```bash
#!/usr/bin/env bash
set -e
echo "Resetting Dear Diary demo..."
curl -X POST http://127.0.0.1:8787/seed/load \
  -H "Content-Type: application/json" \
  -d '{"profile":"maya-30d"}'
echo "Done. Loaded maya-30d."
```

### S6-04 · Hour 14–16 — Beat 2 live script
Store exact live capture text (presenter reads):

> "Today I pitched Dear Diary to the team. We disagreed on scope for the lens switch. I think they were right. Worked on motion for four hours. Felt stuck on the abandon pattern."

### S6-05 · Hour 16 — Pre-record fallbacks
- [ ] `packages/seed/audio/demo-capture.wav`
- [ ] `packages/seed/audio/abandon-answer.mp3` (TTS backup)

### S6-06 · Hour 26–30 — Rehearsal
- [ ] [90-SECOND-DEMO.md](./90-SECOND-DEMO.md) — literal script
- [ ] 10 dry runs on demo laptop
- [ ] OBS 1080p backup recording
- [ ] Devpost copy draft

---

## Maya narrative spine (writer checklist)

### Projects (abandon demo)
- [ ] `roguelike` — mentioned days 1,3,5,8,12,19 — 1 fake "worked on it" entry only
- [ ] `lease-app` — abandoned week 3 after stakeholder mention
- [ ] `brand-refresh` — 4 iteration mentions (designer lens)
- [ ] `cursor-track` — active, many entries (contrast: this one shipped)

### People
- [ ] **Arjun** — March days 3,7,11,14 with quote *"Arjun is the person who pushed me to ship"*
- [ ] **Sarita** — Jan-heavy mentions in seed metadata for Q2 optional
- [ ] **Co-founder** — scope disagreement entries

### Commitments
- [ ] "Ship Friday" on days 6, 13, 20 — no ship entries follow

### Emotions
- [ ] Vary: stuck, proud, exhausted, hopeful — no "happiness score"

---

## Connector fixtures (P1)

`packages/seed/connectors/github.json`:

```json
{
  "events": [
    { "date": "2026-06-08", "repo": "roguelike", "commits": 1, "message": "update README" },
    { "date": "2026-06-14", "repo": "dear-diary", "commits": 12, "message": "lens switch" }
  ]
}
```

---

## Demo day checklist

**T-60 min**
- [ ] `./scripts/demo-reset.sh`
- [ ] Sidecar running, `GET /health` ok
- [ ] Desktop app opens to orb
- [ ] Mic permission granted
- [ ] Volume up for TTS
- [ ] Do Not Disturb on

**T-5 min**
- [ ] Seed loaded
- [ ] One dry run Q1 + lens switch

**Backup**
- [ ] USB with backup `.mp4`
- [ ] Dev menu: load demo WAV

---

## Definition of done

- [ ] Reset → demo-ready in < 60 seconds
- [ ] Q1 and Q4 answers deterministic from seed
- [ ] Team agrees on single presenter script
