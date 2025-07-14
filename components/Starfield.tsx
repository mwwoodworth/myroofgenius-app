'use client';
import { useEffect, useRef } from "react";

export default function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.1 + 0.2,
      o: Math.random() * 0.5 + 0.5,
      d: Math.random() * 0.25 + 0.03
    }));

    function animate() {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI, false);
        ctx.globalAlpha = s.o;
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "#79FFE1";
        ctx.shadowBlur = 8;
        ctx.fill();
        s.x += s.d;
        if (s.x > width) s.x = 0;
      }
      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 z-0 pointer-events-none w-full h-full"
      style={{ background: "#001A33" }}
      aria-hidden="true"
    />
  );
}
