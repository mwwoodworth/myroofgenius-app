"use client";
/** Lightweight starfield using basic div elements. */
import { useRef, useState } from "react";

export default function Starfield() {
  const stars = Array.from({ length: 80 });
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const idRef = useRef(0);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = idRef.current++;
    setSparkles((s) => [...s, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => {
      setSparkles((s) => s.filter((sp) => sp.id !== id));
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden bg-black"
      onPointerMove={handlePointerMove}
    >
      {stars.map((_, i) => (
        <div
          key={i}
          className="absolute w-px h-px rounded-full opacity-80 animate-star-pulse bg-[var(--color-primary)]"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}
      {sparkles.map((sp) => (
        <div
          key={sp.id}
          className="pointer-events-none absolute w-1 h-1 rounded-full bg-[var(--color-primary)] animate-sparkle"
          style={{ left: sp.x, top: sp.y }}
        />
      ))}
      <style jsx>{`
        @keyframes sparkle {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(3);
          }
        }
        .animate-sparkle {
          animation: sparkle 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
