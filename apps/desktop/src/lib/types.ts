export type LensId = "designer" | "founder" | "parent" | "memory-keeper";

export interface PatternCard {
  id: string;
  title: string;
  body: string;
  severity?: "info" | "warn";
}

export interface Citation {
  entryId: string;
  date: string;
  quote: string;
}

export interface AgentStep {
  step: string;
  label: string;
  status: "pending" | "running" | "done";
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
}

export interface LensViewModel {
  lens: LensId;
  layout: "timeline" | "decisions" | "calendar" | "eras";
  items: LensItem[];
}

export interface ExtractedEntity {
  kind: string;
  name: string;
}

export interface IngestResult {
  entryId: string;
  entities: ExtractedEntity[];
  cogneeDatasetId: string;
}
