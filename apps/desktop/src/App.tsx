import { HeroSection } from "@/components/HeroSection";
import { CogneeMemoryLab, CogneeRecallPanel } from "@/components/CogneeMemoryLab";
import { LensRefractor } from "@/components/LensRefractor";

export default function App() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <HeroSection />
      <CogneeMemoryLab />
      <LensRefractor />
      <CogneeRecallPanel />

      <footer className="relative z-10 py-16 text-center border-t border-border">
        <p
          className="text-2xl tracking-tight mb-2"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Dear Diary<sup className="text-xs">®</sup>
        </p>
        <p className="text-xs text-muted-foreground tracking-widest uppercase">
          Gradium listens · Cognee remembers · Built in Cursor
        </p>
      </footer>
    </main>
  );
}
