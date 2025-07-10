"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import AnimatedGradient from "../ui/AnimatedGradient";

export default function AnimatedLayout({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-black/15 backdrop-blur-md rounded-2xl shadow-2xl min-h-screen text-text-primary font-sans relative overflow-hidden"
    >
      <AnimatedGradient />
      {children}
    </motion.div>
  );
}
