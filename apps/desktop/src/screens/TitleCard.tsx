import { motion } from "framer-motion";

interface Props {
  onEnter: () => void;
}

export default function TitleCard({ onEnter }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg-deep)]"
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="text-center px-8"
      >
        <motion.div
          className="w-24 h-24 mx-auto mb-8 rounded-full"
          style={{
            background: "radial-gradient(circle, var(--cognee-glow)44 0%, transparent 70%)",
            boxShadow: "0 0 80px var(--cognee-glow)33",
          }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <h1 className="serif text-5xl md:text-6xl font-light tracking-tight mb-4">
          Dear Diary
        </h1>
        <p className="text-shimmer text-lg md:text-xl mb-2">Your life, queryable.</p>
        <p className="text-[var(--muted)] text-sm max-w-md mx-auto mb-12">
          A memory constellation powered by Cognee — not a notes app. Same graph. Four lenses. Infinite recall.
        </p>
        <motion.button
          onClick={onEnter}
          className="px-8 py-3 rounded-full border border-[var(--cognee-glow)]/50 text-[var(--cognee-glow)] hover:bg-[var(--cognee-glow)]/10 transition"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          Enter the memory field
        </motion.button>
      </motion.div>
      <motion.p
        className="absolute bottom-8 text-[10px] text-[var(--muted)] tracking-widest uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        Gradium listens · Cognee remembers · Gemma connects
      </motion.p>
    </motion.div>
  );
}
