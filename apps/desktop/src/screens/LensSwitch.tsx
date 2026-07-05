import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LensLayout } from "../components/LensLayouts";
import { queryLensView } from "../lib/api";
import type { LensItem } from "../components/LensLayouts";

const LENSES = [
  { id: "designer", label: "Designer", color: "var(--accent-designer)", desc: "Iterations & projects" },
  { id: "founder", label: "Founder", color: "var(--accent-founder)", desc: "Decisions & people" },
  { id: "parent", label: "Parent", color: "var(--accent-parent)", desc: "Family visibility" },
  { id: "memory-keeper", label: "Memory Keeper", color: "var(--accent-keeper)", desc: "Eras & sensory" },
] as const;

export default function LensObservatory() {
  const [lens, setLens] = useState<(typeof LENSES)[number]["id"]>("designer");
  const [view, setView] = useState<{ layout: string; items: LensItem[] } | null>(null);
  const navigate = useNavigate();
  const current = LENSES.find((l) => l.id === lens)!;

  useEffect(() => {
    queryLensView(lens).then(setView);
  }, [lens]);

  return (
    <div className="min-h-screen py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <motion.h2 layoutId="lens-heading" className="serif text-3xl mb-2">
          Same life. Four lenses.
        </motion.h2>
        <p className="text-[var(--muted)] text-sm">
          One Cognee graph underneath — watch the geometry morph
        </p>
      </motion.div>

      <div className="flex justify-center gap-2 mb-10 flex-wrap">
        {LENSES.map((l) => (
          <button
            key={l.id}
            onClick={() => setLens(l.id)}
            className="px-4 py-2 rounded-full text-sm transition-all duration-300"
            style={{
              background: lens === l.id ? `${l.color}22` : "transparent",
              border: `1px solid ${lens === l.id ? l.color : "rgba(255,255,255,0.1)"}`,
              color: lens === l.id ? l.color : "var(--muted)",
            }}
          >
            {l.label}
          </button>
        ))}
      </div>

      <motion.p
        key={lens}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-xs mb-6"
        style={{ color: current.color }}
      >
        {current.desc}
      </motion.p>

      <AnimatePresence mode="wait">
        <motion.div
          key={lens}
          initial={{ opacity: 0, rotateX: -8 }}
          animate={{ opacity: 1, rotateX: 0 }}
          exit={{ opacity: 0, rotateX: 8 }}
          transition={{ duration: 0.45 }}
          style={{ perspective: 1000 }}
        >
          {view && <LensLayout layout={view.layout} items={view.items} lens={lens} />}
        </motion.div>
      </AnimatePresence>

      <motion.div
        className="flex justify-center gap-4 mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <button
          onClick={() =>
            navigate(`/answer?lens=designer&q=${encodeURIComponent("What do I keep trying and abandoning?")}`)
          }
          className="px-6 py-2.5 rounded-full text-sm border border-[var(--accent-designer)]/50 text-[var(--accent-designer)] hover:bg-[var(--accent-designer)]/10 transition"
        >
          Pattern: What do I abandon?
        </button>
        <button
          onClick={() =>
            navigate(`/answer?lens=memory-keeper&q=${encodeURIComponent("What did I know about Arjun in March?")}`)
          }
          className="px-6 py-2.5 rounded-full text-sm border border-[var(--accent-keeper)]/50 text-[var(--accent-keeper)] hover:bg-[var(--accent-keeper)]/10 transition"
        >
          Witness: Arjun in March
        </button>
      </motion.div>
    </div>
  );
}
