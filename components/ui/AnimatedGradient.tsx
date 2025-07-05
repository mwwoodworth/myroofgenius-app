'use client';
import { motion } from 'framer-motion';

export default function AnimatedGradient() {
  return (
    <motion.div
      className="absolute inset-0 -z-10 bg-gradient-animated"
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
    />
  );
}
