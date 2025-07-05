"use client";
import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setPos({
                x: (e.clientX - r.left - r.width / 2) / r.width,
                y: (e.clientY - r.top - r.height / 2) / r.height,
              });
            }}
            style={{ rotateX: pos.y * -10, rotateY: pos.x * 10 }}
            className="relative w-full max-w-lg p-6 glass rounded-xl text-white shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-xl leading-none"
            >
              &times;
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
