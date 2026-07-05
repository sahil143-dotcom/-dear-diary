# STREAM S2 — Memory Agent / LLM (Python · Hour 2–20)

**Goal:** Multi-step memory agent (not single RAG call) using Gemma @ Crusoe + Cognee search results.

**Owner:** ML / backend person  
**Folder:** `services/api/agent/`  
**Depends on:** S0 schemas, S1 search wrappers (stub OK until H8)

---

## Environment

```bash
CRUSOE_API_KEY=
CRUSOE_BASE_URL=          # from Crusoe Managed Inference docs
CRUSOE_MODEL=gemma-4-31b-it   # or 12b if latency better
VULTR_INFERENCE_KEY=      # fallback only
```

---

## Agent loop (implement exactly)

```
parse → plan → retrieve* → traverse → contrast? → synthesize
```

Each step emits an `AgentStep` for the UI strip.

---

## Task list

### S2-01 · Hour 2–4 — LLM client
- [ ] `llm/crusoe.py` — `complete(prompt, json_mode=False)`
- [ ] Ping test script: `python -m agent.test_llm`
- [ ] Fallback flag: `USE_VULTR=1`

### S2-02 · Hour 4–6 — Entity extraction (ingest assist)
- [ ] Prompt: extract people, projects, places, themes, emotions, commitments → JSON
- [ ] Called from S1 ingest pipeline (optional if cognify enough)
- [ ] Used for UI highlight colors on day bloom

### S2-03 · Hour 6–10 — Memory agent core
- [ ] `agent/memory_query(query: MemoryQuery) -> MemoryAnswer`
- [ ] **parse:** classify intent (pattern | person | era | abandon)
- [ ] **plan:** JSON plan with 2–4 retrieval hops
- [ ] **retrieve:** call S1 `search_for_lens` per hop
- [ ] **traverse:** merge clusters, dedupe citations
- [ ] **contrast:** (P1) compare commitments vs connector events
- [ ] **synthesize:** narrative + patternCards + voiceScript + citations

### S2-04 · Hour 10–12 — Lens prompt packs
- [ ] `prompts/designer.md`
- [ ] `prompts/founder.md`
- [ ] `prompts/parent.md`
- [ ] `prompts/keeper.md`

Each file: tone rules, forbidden therapy language, output JSON schema.

### S2-05 · Hour 12–14 — Whitelist query handlers
Hardcode optimized paths for demo questions:

| Question | Handler |
|----------|---------|
| abandon | `handlers/abandon.py` — 4 projects, week-3 pattern |
| people | `handlers/people.py` — rank mentions, temporal gaps |
| arjun | `handlers/witness.py` — March entries, last mention date |
| era | `handlers/era.py` — memory-keeper month card |

**Hackathon secret:** whitelist handlers can pre-compute from seed for zero-latency demo; agent strip still animates real steps.

### S2-06 · Hour 14–16 — Lens view assembler
- [ ] `POST /query/lens-view` — returns `LensViewModel` for UI switch
- [ ] Same underlying search, different item mapping per lens

### S2-07 · Hour 16–20 — Streaming steps (optional)
- [ ] SSE or chunked JSON for agent steps if UI wants live updates
- [ ] Else return full `MemoryAnswer` with all steps `done`

---

## Output JSON schema (synthesize step)

```json
{
  "narrative": "string",
  "patternCards": [
    { "id": "abandon-1", "title": "...", "body": "...", "severity": "warn" }
  ],
  "citations": [
    { "entryId": "...", "date": "2025-03-12", "quote": "...", "audioPath": null }
  ],
  "voiceScript": "Four projects. Same shape..."
}
```

---

## Prompt guardrails

**Never output:**
- Therapy advice (“you should consider…”)
- Personality labels (MBTI, enneagram)
- Medical interpretation
- “You are happiest when…” → use “entries mention energy most when…”

**Always:**
- Cite entry dates
- Use observational language
- Separate said vs showed when connector data exists

---

## Routes (wire in S1)

| Method | Path | Handler |
|--------|------|---------|
| POST | `/query/memory` | `memory_query()` |
| POST | `/query/lens-view` | `lens_view()` |

---

## Integration gates

| Gate | S2 delivers |
|------|-------------|
| G2 (H8) | Hardcoded `MemoryAnswer` for Q1 |
| G3 (H12) | Real Cognee retrieval for Q1 + Q4 |
| G5 (H22) | All whitelist questions < 8s p95 |

---

## Definition of done

- [ ] Agent strip shows 5–6 steps on every query
- [ ] Q1 abandon answer mentions 4 projects + week three
- [ ] Q4 witness quotes March Arjun line from seed
- [ ] voiceScript passed to S3 `/voice/speak`
