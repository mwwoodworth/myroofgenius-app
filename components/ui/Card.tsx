"use client";
import { motion, type HTMLMotionProps } from "framer-motion";
import clsx from "clsx";

interface CardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
  glass?: boolean;
}

export default function Card({
  hover = true,
  glass = false,
  className,
  ...props
}: CardProps) {
  const motionProps = hover
    ? {
        whileHover: {
          y: -4,
          rotateX: 5,
          rotateY: -5,
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          transition: { type: "spring" as const, stiffness: 200, damping: 15 },
        },
        whileTap: { scale: 0.97 },
        style: { perspective: 1000 },
      }
    : {};
  return (
    <motion.div
      {...motionProps}
      className={clsx(
        "rounded-2xl p-6 min-h-[48px]",
        glass
          ? "backdrop-blur-lg bg-white/5 border border-white/20 rounded-[14px] transition-transform hover:scale-105 hover:border-accent shadow-xl"
          : "bg-bg-card",
        className,
      )}
      {...props}
    />
  );
}
