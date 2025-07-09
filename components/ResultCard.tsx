"use client";
import { motion } from "framer-motion";

export default function ResultCard({ result }: { result: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 mt-4"
    >
      {result}
    </motion.div>
  );
}
