import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { queryLensView } from "@/lib/api";
import type { LensViewModel } from "@/lib/types";

const LENSES = [
  { id: "designer" as const, label: "Designer", color: "#7eb8da" },
  { id: "founder" as const, label: "Founder", color: "#d4a853" },
  { id: "parent" as const, label: "Parent", color: "#c9a0a0" },
  { id: "memory-keeper" as const, label: "Memory Keeper", color: "#a8b5a0" },
];

export function LensRefractor() {
  const [lens, setLens] = useState<(typeof LENSES)[number]["id"]>("designer");
  const [view, setView] = useState<LensViewModel | null>(null);

  useEffect(() => {
    queryLensView(lens).then(setView);
  }, [lens]);

  const current = LENSES.find((l) => l.id === lens)!;

  return (
    <section id="lenses" className="relative z-10 py-32 px-6 bg-background/95">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">Same graph · Four geometries</p>
          <h2
            className="text-4xl md:text-6xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Refraction lenses
          </h2>
          <p className="text-muted-foreground mt-4">
            Cognee holds one memory graph. Each lens runs a different recall strategy — INSIGHTS, SUMMARIES, RAG, CHUNKS.
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {LENSES.map((l) => (
            <button
              key={l.id}
              onClick={() => setLens(l.id)}
              className="liquid-glass rounded-full px-5 py-2 text-sm transition-all"
              style={{
                color: lens === l.id ? l.color : undefined,
                borderColor: lens === l.id ? l.color : undefined,
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={lens}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="liquid-glass rounded-2xl p-8 min-h-[240px]"
          >
            {view?.items.map((item, i) => (
              <motion.div
                key={item.id}
                layoutId={`lens-node-${item.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0"
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: current.color }}
                />
                <div className="flex-1">
                  <motion.h3 layoutId={`lens-title-${item.id}`} className="font-medium">
                    {item.title}
                  </motion.h3>
                  <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                </div>
                <span className="text-xs text-muted-foreground serif">{item.date}</span>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
