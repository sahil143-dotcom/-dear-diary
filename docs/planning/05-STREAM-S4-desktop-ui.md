# STREAM S4 — Desktop UI (Tauri + React + Framer Motion · Hour 0–28)

**Goal:** Full-bleed dark desktop app. Home = orb. Demo hero = lens switch + answer theatre.

**Owner:** Frontend person  
**Folder:** `apps/desktop/`

---

## Stack

- Tauri 2
- React 19 + TypeScript
- Tailwind CSS
- Framer Motion (`layoutId`, `AnimatePresence`)
- MSW until Gate G5 (Hour 22)
- API client: `fetch('http://127.0.0.1:8787/...')`

---

## Design tokens

```css
/* theme — apps/desktop/src/styles/theme.css */
--bg: #0a0a0b;
--surface: #141416;
--text: #f5f0e8;
--muted: #8a8580;
--accent-designer: #7eb8da;
--accent-founder: #d4a853;
--accent-parent: #c9a0a0;
--accent-keeper: #a8b5a0;
--entity-person: #6ba3ff;
--entity-project: #6bcf7f;
--entity-theme: #e8c547;
--entity-emotion: #e87070;
```

Typography: serif for dates (`font-family: 'Lora', Georgia`), sans for UI.

---

## Screen map

| Route | Component | Priority |
|-------|-----------|----------|
| `/` | `CaptureOrb` | P0 home |
| `/day/:date` | `DayCard` | P0 bloom |
| `/ask` | `LensDoors` | P0 |
| `/answer` | `AnswerTheatre` | P0 demo |
| `/settings/sources` | `ConnectorSources` | P1 |

**No** `/dashboard`, **no** `/graph` as home.

---

## Task list

### S4-01 · Hour 0–2 — Scaffold
- [ ] `npm create tauri-app` — React + TS
- [ ] Tailwind + Framer Motion
- [ ] MSW setup in dev
- [ ] Dark full-bleed layout shell

### S4-02 · Hour 2–4 — Capture orb (Beat 2 start)
- [ ] `CaptureOrb.tsx` — pulsing mic, hold to record
- [ ] Integrate S3 `useMicCapture` when ready; fake transcript until then
- [ ] Blinking cursor empty state (F6.2)

### S4-03 · Hour 4–8 — Day bloom (F6.3)
- [ ] `DayCard.tsx` — spring entrance
- [ ] Entity highlights in transcript (colors from S0 types)
- [ ] Staggered motion for people/projects/themes

### S4-04 · Hour 8–10 — Agent strip
- [ ] `AgentStrip.tsx` — horizontal steps
- [ ] Animate pending → running → done
- [ ] Hook to `/query/memory` response.agentSteps

### S4-05 · Hour 10–12 — Lens doors
- [ ] `LensDoors.tsx` — 4 doors with lens accent colors
- [ ] Template question chips (whitelist only)
- [ ] Navigate to `/answer?lens=designer&q=...`

### S4-06 · Hour 12–17 — Lens switch (F3.6 · DEMO HERO)
- [ ] `LensSwitch.tsx` — segmented control or toggle row
- [ ] Four layout components sharing `items: LensItem[]`:
  - `DesignerTimeline` — horizontal cards
  - `FounderDecisions` — decision log list
  - `ParentCalendar` — month grid highlights
  - `KeeperEras` — era cards + dominant emotion
- [ ] **Framer `layoutId`** on shared nodes (person chips, project titles, dates)
- [ ] `AnimatePresence mode="wait"` between layouts
- [ ] Load via `POST /query/lens-view` with 30d seed range

**Use fixture JSON until backend ready.**

### S4-07 · Hour 12–14 — Answer theatre
- [ ] `AnswerTheatre.tsx`
- [ ] Narrative prose block
- [ ] `PatternCard` components
- [ ] `CitationList` — tap → S3 replay
- [ ] Play button for full voiceScript

### S4-08 · Hour 17–20 — Improve + polish
- [ ] "This mattered" / "Noise" buttons → `POST /improve`
- [ ] Loading skeletons
- [ ] Error toasts

### S4-09 · Hour 22 — MSW off
- [ ] `VITE_USE_MSW=false` → real API
- [ ] End-to-end test script

### S4-10 · Hour 22–28 — Demo polish
- [ ] Title card component for OBS recording
- [ ] Cursor-as-pen subtle pulse on capture (F6.1)
- [ ] 1080p-friendly spacing for projector

---

## Lens switch implementation notes

```tsx
// Shared layoutId examples
<motion.span layoutId={`person-${item.id}`} />
<motion.div layoutId={`project-${item.id}`} />
<motion.h3 layoutId="lens-heading" />
```

Choreography target: **Designer → Founder → Memory-keeper** in 15s on stage (skip Parent if tight).

---

## API client

```typescript
// apps/desktop/src/lib/api.ts
const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8787";

export async function queryMemory(q: MemoryQuery): Promise<MemoryAnswer> {
  const res = await fetch(`${BASE}/query/memory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(q),
  });
  return res.json();
}
```

---

## Integration gates

| Gate | S4 delivers |
|------|-------------|
| G1 (H4) | Orb + fake bloom |
| G2 (H8) | Real ingest UI |
| G4 (H17) | Lens switch on fixtures |
| G5 (H22) | Full path on real API |
| G6 (H26) | Pixel polish pass |

---

## Definition of done

- [ ] Home is only orb (no sidebar stats)
- [ ] Lens switch visibly morphs layout (not just tab swap)
- [ ] Demo script Beats 2–5 runnable from UI alone
- [ ] Works at 1280×800 minimum
