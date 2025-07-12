"use client";
import { motion } from "framer-motion";

export default function ResultCard({ result }: { result: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-lg bg-white/5 border border-white/20 rounded-[14px] p-4 mt-4 shadow-lg"
    >
      {result}
    </motion.div>
  );
}
