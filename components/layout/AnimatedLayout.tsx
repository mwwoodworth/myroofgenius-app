"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function AnimatedLayout({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-bg/60 backdrop-blur-lg glass rounded-2xl shadow-2xl min-h-screen text-text-primary font-inter"
    >
      {children}
    </motion.div>
  );
}
