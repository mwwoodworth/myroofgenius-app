"use client";
/** Lightweight starfield using basic div elements. */
export default function Starfield() {
  const stars = Array.from({ length: 80 });
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
      {stars.map((_, i) => (
        <div
          key={i}
          className="absolute w-px h-px bg-white rounded-full opacity-80 animate-star-pulse"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}
