# STREAM S5 — Lenses & Pattern engine (Python + fixtures · Hour 8–24)

**Goal:** Lens-specific view models, pattern query logic, demo whitelist — bridge S1 search and S4 UI.

**Owner:** Can split between S2 and frontend; one person owns coherence  
**Folders:** `services/api/lenses/`, `packages/shared/fixtures/lens/`

---

## Lens → layout mapping

| Lens | Cognee search | UI layout | Voice tone |
|------|---------------|-----------|------------|
| designer | INSIGHTS | timeline | design mentor, calm |
| founder | SUMMARIES | decisions | cofounder direct |
| parent | RAG + family boost | calendar | warm, not guilt-tripping |
| memory-keeper | CHUNKS + time sort | eras | memory-keeper, sensory |

---

## Task list

### S5-01 · Hour 8–10 — Template map
- [ ] `lenses/templates.yaml` — per lens: 3 question templates + keyword boosts
- [ ] Export constants to match S0 `DEMO_QUESTIONS`

### S5-02 · Hour 10–12 — Lens view builder
- [ ] `build_lens_view(lens, date_range) -> LensViewModel`
- [ ] Map Cognee results → `LensItem[]`
- [ ] Designer: projects sorted by lastTouched
- [ ] Founder: people + decision snippets
- [ ] Parent: family-tagged entries on calendar grid
- [ ] Keeper: group by month, pick dominant emotion word

### S5-03 · Hour 12–14 — Pattern F4.1 abandon
- [ ] Detect projects with: many mentions, low follow-through, status abandoned
- [ ] Root cause tags: `week_three_stall`, `scope_creep`, `lost_interest`
- [ ] Output `PatternCard[]` + optional graph nodes for P1 viz
- [ ] **Must hit on maya-30d seed:** 4 abandoned projects, week-3 stall narrative

### S5-04 · Hour 13–15 — Pattern F4.2 people
- [ ] Rank people by mention frequency
- [ ] Temporal gap: high frequency then silence (Arjun: hot March, quiet after Mar 5)
- [ ] Output for founder lens + witness handler

### S5-05 · Hour 14–16 — Witness F5.3
- [ ] Parser: "What did I know about {person} in {month}?"
- [ ] Retrieve all entries for person in range
- [ ] Synthesize brief + top citation (March Arjun quote)
- [ ] voiceScript: *"In March you wrote: '...' You haven't mentioned them since."*

### S5-06 · Hour 16–18 — Fixture JSON for S4
- [ ] `packages/shared/fixtures/lens/designer.json`
- [ ] `packages/shared/fixtures/lens/founder.json`
- [ ] `packages/shared/fixtures/lens/keeper.json`
- [ ] `packages/shared/fixtures/memory-answer-abandon.json`
- [ ] `packages/shared/fixtures/memory-answer-arjun.json`

### S5-07 · P1 — Force graph data (Hour 18–20)
- [ ] JSON graph for abandon cluster viz
- [ ] S4 can skip if pattern cards enough for demo

---

## Maya seed narrative requirements (coordinate S6)

Seed **must** contain these facts or demo fails:

| Thread | Required in seed |
|--------|------------------|
| Abandon | 4 project names, repeated "I'll work on it this weekend", no follow-up |
| Week 3 | At least 2 entries mention stakeholder meeting before stall |
| Arjun | Multiple March entries; quote *"pushed me to ship"*; zero mentions after Mar 5 |
| Commitments | 3× "ship Friday" broken |
| Designer | Same component redesigned 4× in 2 weeks (optional beat) |

---

## Whitelist routing

```python
# lenses/router.py
WHITELIST = {
    "what do i keep trying and abandoning": abandon_handler,
    "who keeps showing up": people_handler,
    "what did i know about arjun in march": witness_handler,
}
```

Normalize: lowercase, strip punctuation before lookup.

---

## Parent lens guardrails

- Show gaps as **visibility**, not guilt: *"2 family moments logged this week"* not *"bad parent"*
- Avoid mental-health-adjacent scoring

---

## Integration gates

| Gate | S5 delivers |
|------|-------------|
| G3 (H12) | Fixtures for all demo answers |
| G4 (H17) | Lens views from real Cognee on seed |
| G5 (H22) | Whitelist 100% hit rate |

---

## Definition of done

- [ ] All 4 lens views return non-empty items from maya-30d
- [ ] Q1, Q2, Q4 answers match seed facts exactly
- [ ] S4 lens switch uses same `items` shape across lenses
