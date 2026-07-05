import type { LensId } from "./types";

export const LENS_LABELS: Record<LensId, string> = {
  designer: "Designer",
  founder: "Founder",
  parent: "Parent",
  "memory-keeper": "Memory Keeper",
};

export const LENS_LAYOUTS: Record<LensId, "timeline" | "decisions" | "calendar" | "eras"> = {
  designer: "timeline",
  founder: "decisions",
  parent: "calendar",
  "memory-keeper": "eras",
};

export const DEMO_WHITELIST: Array<{ id: string; lens: LensId | "any"; question: string }> = [
  { id: "Q1", lens: "designer", question: "What do I keep trying and abandoning?" },
  { id: "Q2", lens: "founder", question: "Who keeps showing up?" },
  { id: "Q3", lens: "memory-keeper", question: "What happened last month I'd forget?" },
  { id: "Q4", lens: "any", question: "What did I know about Arjun in March?" },
];

export const API_BASE = "http://127.0.0.1:8787";
