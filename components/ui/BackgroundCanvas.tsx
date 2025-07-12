'use client';
import { useRef, useEffect } from 'react';
import clsx from 'clsx';

export default function BackgroundCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const shapes = Array.from({ length: 25 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 20 + Math.random() * 40,
      depth: 0.02 + Math.random() * 0.08,
      type: Math.random() > 0.5 ? 'triangle' : 'hex',
    }));

    let pointer = { x: width / 2, y: height / 2 };
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      shapes.forEach((s) => {
        ctx.save();
        const dx = (pointer.x - width / 2) * s.depth;
        const dy = (pointer.y - height / 2) * s.depth;
        ctx.translate(s.x + dx, s.y + dy);
        ctx.beginPath();
        if (s.type === 'triangle') {
          const r = s.size / 2;
          ctx.moveTo(0, -r);
          ctx.lineTo(-r, r);
          ctx.lineTo(r, r);
        } else {
          const r = s.size / 2;
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
          }
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      });
    };
    const onMove = (e: MouseEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove);
    let raf: number;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    loop();
    const onResize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <canvas ref={ref} className={clsx('absolute inset-0 -z-10', className)} />;
}
