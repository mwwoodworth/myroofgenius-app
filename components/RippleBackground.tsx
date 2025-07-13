"use client";
import { useRef, useState } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function RippleBackground() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const idRef = useRef(0);

  const addRipple = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = idRef.current++;
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute block rounded-full bg-[var(--color-primary)] opacity-40 animate-ripple"
          style={{ left: r.x, top: r.y }}
        />
      ))}
      <style jsx>{`
        @keyframes ripple {
          from {
            opacity: 0.4;
            transform: scale(0);
          }
          to {
            opacity: 0;
            transform: scale(4);
          }
        }
        .animate-ripple {
          width: 20vmax;
          height: 20vmax;
          position: absolute;
          animation: ripple 0.6s ease-out forwards;
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-auto" onPointerDown={addRipple} />
    </div>
  );
}
