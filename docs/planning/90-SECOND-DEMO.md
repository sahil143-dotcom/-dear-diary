# 90-second demo script

**Product:** Dear Diary · Desktop · Local Cognee  
**Before stage:** `./scripts/demo-reset.sh`

---

## Beat 1 · 0:00–0:10 — Setup

**Screen:** Title card (OBS or in-app overlay)

```
Dear Diary
Your life, queryable.
```

Cut to app: dark UI, blinking cursor, breathing mic orb.

**Say:** *"This is Dear Diary — a memory layer for your life, not a notes app."*

---

## Beat 2 · 0:10–0:25 — Capture

**Action:** Hold orb. Speak (live or demo WAV):

> "Today I pitched Dear Diary to the team. We disagreed on scope for the lens switch. I think they were right. I worked on motion for four hours. Felt stuck on the abandon pattern."

**Screen:** Transcript appears. Entities highlight (co-founder, Dear Diary, stuck). Day card **blooms**.

**Say:** *"Voice in. Cognee structures it into a graph on my machine."*

---

## Beat 3 · 0:25–0:40 — Lens switch (HERO)

**Action:** Open lens view (30 days pre-seeded). Toggle:

1. **Designer** → horizontal timeline / iteration cards  
2. **Founder** → decision log + people  
3. **Memory-keeper** → era cards  

**Motion:** layoutId morph — same chips slide between geometries.

**Say:** *"Same life. Four lenses. Same graph underneath."*

---

## Beat 4 · 0:40–0:60 — Pattern engine

**Action:** Designer lens → tap *"What do I keep trying and abandoning?"*

**Screen:** Agent strip animates (parse → plan → retrieve → synthesize). Pattern cards appear. Narrative text.

**Action:** Tap TTS or auto-play.

**Voice (Gradium):** *"Four projects. Same shape. You start strong, lose momentum around week three."*

**Say:** *"Multi-step memory agent — not a single RAG call."*

---

## Beat 5 · 0:60–0:80 — Witness

**Action:** Ask: *"What did I know about Arjun in March?"*

**Screen:** Citation card with March quote. Tap citation → audio replay.

**Voice:** *"In March you wrote: 'Arjun is the person who pushed me to ship.' You haven't mentioned him since March fifth."*

---

## Beat 6 · 0:80–0:95 — Close

**Screen:** Back to orb. Cursor blinks.

**Say:** *"Gradium listens. Cognee remembers. Gemma connects the dots. Built in Cursor. Dear Diary."*

---

## If something breaks

| Failure | Fallback |
|---------|----------|
| Mic dead | Dev menu → demo WAV |
| API slow | Pre-cached Q1 answer (still show agent strip) |
| TTS fail | Show narrative on screen; keep talking |
| Cognee crash | Restart sidecar + `demo-reset.sh` (practice this) |

---

## Judge FAQ (10 sec each)

**"Is this just ChatGPT memory?"**  
*Persistent Cognee graph on device, cross-year traversal, lens-specific agents — not a chat session.*

**"Privacy?"**  
*Graph lives locally in Kuzu. Voice goes to Gradium; reasoning to Gemma. No diary text sold.*

**"Basic RAG?"**  
*Watch the agent strip — plan, multiple retrievals, synthesis with citations.*
