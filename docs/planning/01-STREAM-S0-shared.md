# STREAM S0 — Shared contracts (Lead · Hour 0–4)

**Goal:** Unblock all parallel work. Nobody waits on UI or Cognee to agree on shapes.

**Owner:** Tech lead (or whoever scaffolds repo first)

---

## Checklist

### Hour 0–0.5
- [ ] Create monorepo folders (see [00-MASTER.md](./00-MASTER.md))
- [ ] `packages/shared/package.json` + `src/types.ts` (copy from below)
- [ ] `packages/shared/src/constants.ts` — lens IDs, demo questions whitelist
- [ ] `services/api/openapi.yaml` stub (mirror [10-API-CONTRACT.md](./10-API-CONTRACT.md))
- [ ] `apps/desktop/src/mocks/handlers.ts` — MSW handlers returning fixture JSON
- [ ] `.env.example` at repo root
- [ ] `.cursor/rules/dear-diary.mdc`
- [ ] Commit to `main`, tag `scaffold-v0`

### Hour 0.5–4
- [ ] Publish fixture JSON files in `packages/shared/fixtures/`:
  - `maya-entry-sample.json`
  - `memory-answer-abandon.json`
  - `lens-view-designer.json`
  - `lens-view-founder.json`
  - `agent-steps-sample.json`
- [ ] Document breaking-change rule: **only S0 changes types; others adapt**

---

## `packages/shared/src/types.ts`

```typescript
export type LensId = "designer" | "founder" | "parent" | "memory-keeper";

export type EntrySource = "voice" | "quick" | "connector" | "seed";

export interface DiaryEntry {
  id: string;
  date: string;
  text: string;
  audioPath?: string;
  source: EntrySource;
  createdAt: string;
}

export interface ExtractedEntity {
  kind: "person" | "project" | "place" | "theme" | "emotion" | "commitment";
  name: string;
  span?: [number, number];
}

export interface IngestResult {
  entryId: string;
  entities: ExtractedEntity[];
  cogneeDatasetId: string;
}

export interface MemoryQuery {
  lens: LensId;
  question: string;
  dateRange?: { from: string; to: string };
}

export type AgentStepName =
  | "parse"
  | "plan"
  | "retrieve"
  | "traverse"
  | "contrast"
  | "synthesize";

export interface AgentStep {
  step: AgentStepName;
  label: string;
  status: "pending" | "running" | "done";
  meta?: Record<string, unknown>;
}

export interface PatternCard {
  id: string;
  title: string;
  body: string;
  severity?: "info" | "warn";
  contrast?: { said: string; showed: string };
}

export interface Citation {
  entryId: string;
  date: string;
  quote: string;
  audioPath?: string;
}

export interface MemoryAnswer {
  narrative: string;
  patternCards: PatternCard[];
  citations: Citation[];
  voiceScript: string;
  agentSteps: AgentStep[];
}

export interface LensItem {
  id: string;
  kind: string;
  title: string;
  subtitle?: string;
  date?: string;
  meta?: Record<string, unknown>;
}

export interface LensViewModel {
  lens: LensId;
  layout: "timeline" | "decisions" | "calendar" | "eras";
  items: LensItem[];
}

export const DEMO_QUESTIONS = [
  "What do I keep trying and abandoning?",
  "Who keeps showing up?",
  "What did I know about Arjun in March?",
] as const;
```

---

## Demo question whitelist (`constants.ts`)

Only these queries need to work flawlessly on stage:

| ID | Lens | Question |
|----|------|----------|
| Q1 | designer | What do I keep trying and abandoning? |
| Q2 | founder | Who keeps showing up? |
| Q3 | memory-keeper | What happened last month I'd forget? |
| Q4 | any | What did I know about Arjun in March? |
| Q5 | — | Live capture (free text ingest) |

---

## MSW handlers (S4 consumes immediately)

Implement in `apps/desktop/src/mocks/handlers.ts`:

| Method | Path | Returns |
|--------|------|---------|
| POST | `/ingest/entry` | `IngestResult` fixture |
| POST | `/query/memory` | `memory-answer-abandon.json` |
| POST | `/query/lens-view` | lens fixture by body.lens |
| GET | `/health` | `{ ok: true }` |
| POST | `/seed/load` | `{ loaded: 30 }` |

Base URL: `http://127.0.0.1:8787`

---

## `.cursor/rules/dear-diary.mdc` (paste)

```markdown
# Dear Diary — RAISE 2026
- Desktop: Tauri 2 + React 19 + Framer Motion + Tailwind
- Sidecar: FastAPI + Cognee local (Kuzu) on port 8787
- Types: packages/shared/src/types.ts is source of truth
- Home screen: capture orb only — NOT a dashboard
- Demo hero: lens switch (layoutId) + abandon pattern + Arjun witness
- Banned: Streamlit, free-chat RAG UI, therapy/personality framing
- API: follow docs/planning/10-API-CONTRACT.md
- When editing UI: prefer layoutId for lens transitions
```

---

## Definition of done (S0)

- [ ] Any stream can import types from `@dear-diary/shared`
- [ ] S4 runs desktop UI against MSW with zero backend
- [ ] OpenAPI stub matches [10-API-CONTRACT.md](./10-API-CONTRACT.md)
- [ ] Lead announces contract freeze at Hour 4 (only bugfix changes after)

---

## Handoff to other streams

| Stream | Unblocked when |
|--------|----------------|
| S1 | types + ingest request shape ready |
| S2 | MemoryQuery + MemoryAnswer types ready |
| S3 | ingest accepts optional audio multipart |
| S4 | MSW + fixtures ready |
| S5 | LensViewModel + DEMO_QUESTIONS ready |
| S6 | Entry JSON schema ready |
