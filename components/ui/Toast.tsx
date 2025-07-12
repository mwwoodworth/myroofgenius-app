"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { useConfetti } from "../../hooks/use-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";
interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

const ToastCtx = createContext<{
  show: (message: string, type?: ToastType) => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const triggerConfetti = useConfetti();
  const show = (message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(
      () => setToasts((t) => t.filter((toast) => toast.id !== id)),
      3000,
    );
    if (type === "success") triggerConfetti();
  };
  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 right-6 space-y-2 z-50">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass text-white shadow-[0px_8px_32px_rgba(0,0,0,0.1)]"
            >
              {t.type === "success" && (
                <CheckCircle className="w-4 h-4 text-accent-emerald/60" />
              )}
              {t.type === "error" && (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              {t.type === "info" && <Info className="w-4 h-4 text-secondary-700/60" />}
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.show;
};
