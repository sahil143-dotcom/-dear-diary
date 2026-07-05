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
