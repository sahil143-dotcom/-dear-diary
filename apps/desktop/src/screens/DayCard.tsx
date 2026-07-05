import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

const COLORS: Record<string, string> = {
  person: "var(--entity-person)",
  project: "var(--entity-project)",
  emotion: "var(--entity-emotion)",
  commitment: "var(--entity-theme)",
};

export default function DayCard() {
  const { state } = useLocation() as {
    state?: { text?: string; entities?: Array<{ kind: string; name: string }> };
  };
  const navigate = useNavigate();
  const text = state?.text ?? "";
  const entities = state?.entities ?? [];
  const today = new Date().toISOString().slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
    >
      <motion.p
        className="serif text-[var(--muted)] text-lg mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {today}
      </motion.p>

      {/* Floating entity orbs */}
      <div className="flex flex-wrap gap-3 justify-center mb-8 max-w-lg">
        {entities.map((e, i) => (
          <motion.span
            key={`${e.kind}-${e.name}`}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.15, type: "spring" }}
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              color: COLORS[e.kind] ?? "var(--text)",
              background: `${COLORS[e.kind] ?? "#fff"}18`,
              border: `1px solid ${COLORS[e.kind] ?? "#fff"}44`,
            }}
          >
            {e.name}
          </motion.span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 80, delay: 0.3 }}
        className="max-w-2xl w-full p-8 rounded-2xl glass"
      >
        <p className="text-xl leading-relaxed serif">{text}</p>
      </motion.div>

      <motion.div
        className="flex gap-4 mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <button
          onClick={() => navigate("/lenses")}
          className="px-6 py-2.5 rounded-full bg-[var(--accent-designer)]/20 text-[var(--accent-designer)] border border-[var(--accent-designer)]/40 text-sm hover:bg-[var(--accent-designer)]/30 transition"
        >
          View through lenses →
        </button>
        <button
          onClick={() => navigate("/ask")}
          className="px-6 py-2.5 rounded-full text-[var(--muted)] border border-white/10 text-sm hover:text-white transition"
        >
          Ask a question
        </button>
      </motion.div>
    </motion.div>
  );
}
