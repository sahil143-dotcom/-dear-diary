import type { LensId, MemoryAnswer, LensViewModel, IngestResult } from "./types";

export const FIXTURE_ABANDON: MemoryAnswer = {
  narrative:
    "Four projects share the same shape. You start strong — energy in the first week, momentum through week two — then something stalls around week three. The roguelike got six mentions but only one real work session. Cursor track is the exception: it kept showing up and actually shipped.",
  patternCards: [
    { id: "abandon-roguelike", title: "Roguelike", body: "Mentioned 6 times. One README commit.", severity: "warn" },
    { id: "abandon-lease", title: "Lease App", body: "Stalled after stakeholder meeting in week 3.", severity: "warn" },
    { id: "abandon-brand", title: "Brand Refresh", body: "Redesigned the same component 4× in 2 weeks.", severity: "info" },
    { id: "abandon-cursor", title: "Cursor Track", body: "Contrast: this one shipped.", severity: "info" },
  ],
  citations: [
    { entryId: "ent_seed_08", date: "2026-06-08", quote: "I'll work on the roguelike this weekend — again." },
    { entryId: "ent_seed_14", date: "2026-06-14", quote: "Scope disagreement on lens switch. Felt stuck on the abandon pattern." },
  ],
  voiceScript: "Four projects. Same shape. You start strong, lose momentum around week three.",
  agentSteps: [
    { step: "parse", label: "Understanding question", status: "done" },
    { step: "plan", label: "Planning graph traversal", status: "done" },
    { step: "retrieve", label: "Fetching project mentions", status: "done" },
    { step: "traverse", label: "Finding abandon patterns", status: "done" },
    { step: "synthesize", label: "Composing answer", status: "done" },
  ],
};

export const FIXTURE_ARJUN: MemoryAnswer = {
  narrative:
    "In March you wrote: \"Arjun is the person who pushed me to ship.\" You haven't mentioned Arjun since March 5th.",
  patternCards: [],
  citations: [
    {
      entryId: "ent_seed_32",
      date: "2026-03-11",
      quote: "Arjun is the person who pushed me to ship. Wrote it down so I don't forget.",
    },
  ],
  voiceScript: "In March you wrote: 'Arjun is the person who pushed me to ship.' You haven't mentioned him since March fifth.",
  agentSteps: [
    { step: "parse", label: "Understanding question", status: "done" },
    { step: "plan", label: "Planning temporal traversal", status: "done" },
    { step: "retrieve", label: "Fetching March entries", status: "done" },
    { step: "traverse", label: "Tracing person cluster", status: "done" },
    { step: "synthesize", label: "Composing witness", status: "done" },
  ],
};

export const FIXTURE_LENS: Record<LensId, LensViewModel> = {
  designer: {
    lens: "designer",
    layout: "timeline",
    items: [
      { id: "p1", kind: "project", title: "Roguelike", subtitle: "Last touched · Jun 24", date: "2026-06-24" },
      { id: "p2", kind: "project", title: "Brand Refresh", subtitle: "4 iterations", date: "2026-06-22" },
      { id: "p3", kind: "project", title: "Cursor Track", subtitle: "Shipped ✓", date: "2026-06-23" },
      { id: "p4", kind: "project", title: "Dear Diary", subtitle: "Active", date: "2026-06-30" },
    ],
  },
  founder: {
    lens: "founder",
    layout: "decisions",
    items: [
      { id: "d1", kind: "decision", title: "Scope disagreement", subtitle: "Lens switch in v1", date: "2026-06-14" },
      { id: "d2", kind: "decision", title: "Ship Friday ×3", subtitle: "Broken commitments", date: "2026-06-20" },
      { id: "d3", kind: "decision", title: "Stakeholder meeting", subtitle: "Lease app stall", date: "2026-06-15" },
    ],
  },
  parent: {
    lens: "parent",
    layout: "calendar",
    items: [
      { id: "f1", kind: "moment", title: "Family dinner", subtitle: "Phone-free", date: "2026-06-20" },
      { id: "f2", kind: "moment", title: "2 moments logged", subtitle: "This week", date: "2026-06-20" },
    ],
  },
  "memory-keeper": {
    lens: "memory-keeper",
    layout: "eras",
    items: [
      { id: "e1", kind: "era", title: "March 2026", subtitle: "Arjun · shipping energy", date: "2026-03" },
      { id: "e2", kind: "era", title: "June 2026", subtitle: "Stuck → hopeful · 30 entries", date: "2026-06" },
    ],
  },
};

export const DEMO_CAPTURE =
  "Today I pitched Dear Diary to the team. We disagreed on scope for the lens switch. I think they were right. Worked on motion for four hours. Felt stuck on the abandon pattern.";

export const FIXTURE_INGEST: IngestResult = {
  entryId: "ent_demo",
  entities: [
    { kind: "person", name: "co-founder" },
    { kind: "project", name: "Dear Diary" },
    { kind: "emotion", name: "stuck" },
  ],
  cogneeDatasetId: "dear-diary-default",
};
