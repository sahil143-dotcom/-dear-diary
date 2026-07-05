import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const DOORS = [
  {
    id: "designer",
    label: "Designer",
    color: "var(--accent-designer)",
    q: "What do I keep trying and abandoning?",
    glyph: "◇",
  },
  {
    id: "founder",
    label: "Founder",
    color: "var(--accent-founder)",
    q: "Who keeps showing up?",
    glyph: "△",
  },
  {
    id: "memory-keeper",
    label: "Memory Keeper",
    color: "var(--accent-keeper)",
    q: "What did I know about Arjun in March?",
    glyph: "○",
  },
  {
    id: "parent",
    label: "Parent",
    color: "var(--accent-parent)",
    q: "What happened last month I'd forget?",
    glyph: "□",
  },
];

export default function LensDoors() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="serif text-2xl mb-2 text-center"
      >
        Choose your lens
      </motion.h2>
      <p className="text-[var(--muted)] text-sm mb-12 text-center">
        Whitelisted demo questions — multi-step memory agent, not single RAG
      </p>

      <div className="grid gap-4 md:grid-cols-2 max-w-2xl w-full">
        {DOORS.map((d, i) => (
          <motion.button
            key={d.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(`/answer?lens=${d.id}&q=${encodeURIComponent(d.q)}`)}
            className="group text-left p-6 rounded-2xl glass hover:scale-[1.02] transition-transform duration-300"
            style={{ borderLeft: `3px solid ${d.color}` }}
          >
            <span className="text-2xl opacity-50" style={{ color: d.color }}>
              {d.glyph}
            </span>
            <h3 className="font-semibold mt-2" style={{ color: d.color }}>
              {d.label}
            </h3>
            <p className="text-sm text-[var(--muted)] mt-2 group-hover:text-[var(--text)] transition">
              {d.q}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
