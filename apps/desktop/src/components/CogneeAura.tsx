import { motion } from "framer-motion";

const VERBS = [
  { name: "remember", desc: "Ingest → graph" },
  { name: "recall", desc: "Query → traverse" },
  { name: "improve", desc: "Feedback → memify" },
  { name: "forget", desc: "Prune → reset" },
];

export default function CogneeAura({ active = "recall" }: { active?: string }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-50">
      {VERBS.map((v) => (
        <motion.div
          key={v.name}
          className="glass px-3 py-2 rounded-full flex flex-col items-center min-w-[72px]"
          animate={
            v.name === active
              ? { boxShadow: "0 0 24px rgba(0,197,134,0.35)", scale: 1.05 }
              : { boxShadow: "0 0 0 transparent", scale: 1 }
          }
          transition={{ duration: 0.4 }}
        >
          <span className="cognee-verb">{v.name}()</span>
          <span className="text-[9px] text-[var(--muted)] mt-0.5">{v.desc}</span>
        </motion.div>
      ))}
    </div>
  );
}
