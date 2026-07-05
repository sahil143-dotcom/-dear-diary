# Priorities — P0 / P1 / P2

**Rule:** No one builds P1 until all P0 gates pass (G5 at Hour 22).

---

## P0 — Must ship (demo breaks without these)

| ID | Feature | Stream |
|----|---------|--------|
| P0-1 | Shared types + MSW fixtures | S0 |
| P0-2 | Cognee local ingest + cognify | S1 |
| P0-3 | maya-30d seed loader | S1 + S6 |
| P0-4 | Gradium STT + desktop mic capture | S3 |
| P0-5 | Capture orb + day bloom | S4 |
| P0-6 | Memory agent + agent strip | S2 + S4 |
| P0-7 | Lens switch (3–4 lenses, layoutId) | S4 + S5 |
| P0-8 | Q1 abandon pattern + voiceScript | S2 + S5 |
| P0-9 | Q4 Arjun witness + citation | S2 + S5 |
| P0-10 | Gradium TTS for answer | S3 |
| P0-11 | demo-reset script | S6 |
| P0-12 | 90s demo rehearsed 10× | S6 |

---

## P1 — Ship if ahead by Hour 20

| ID | Feature | Stream |
|----|---------|--------|
| P1-1 | Citation audio replay (stored WAV) | S3 |
| P1-2 | improve() mattered/noise | S1 + S4 |
| P1-3 | Q2 who keeps showing up | S5 |
| P1-4 | GitHub connector fixtures + contrast | S1 + S2 |
| P1-5 | Force graph abandon viz | S4 + S5 |
| P1-6 | Gradium voice clone (witness) | S3 |
| P1-7 | Quick capture Cmd+Shift+Space | S4 |
| P1-8 | Parent lens full calendar | S4 + S5 |

---

## P2 — Pitch slides only (do not build)

| Feature | Why skip |
|---------|----------|
| Meeting capture mode | Scope |
| Email forward inbox | Scope |
| Photo + OCR | Image analyzer risk |
| Inner lens | Mental health adjacency |
| Letters to past/future | Scope |
| Calendar OAuth live | OAuth time |
| Cognee Cloud sync | Local is MVP |
| Nemotron multilingual | Stretch slide |
| Gemma on-device edge | Stretch slide |
| Weekly email letter | Scope |
| CLI user-facing product | Dev tool only |

---

## Feature flags

```typescript
// packages/shared/src/flags.ts
export const FLAGS = {
  CONNECTORS: false,
  VOICE_CLONE: false,
  FORCE_GRAPH: false,
  IMPROVE: true,  // P1 but small
} as const;
```

Backend mirror in `services/api/config.py`.
