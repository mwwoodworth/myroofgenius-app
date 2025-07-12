"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Button from "../Button";
import Link from "next/link";

interface Tool {
  id: string;
  name: string;
  image: string;
  cta: string;
  href: string;
}

const tools: Tool[] = [
  {
    id: "estimator",
    name: "AI Estimator",
    image:
      "https://images.unsplash.com/photo-1581091215367-59ab8eebc106?auto=format&w=800",
    cta: "Try Demo",
    href: "/estimator",
  },
  {
    id: "materials",
    name: "Material Calculator",
    image:
      "https://images.unsplash.com/photo-1590944451268-38cb8f7bfc4e?auto=format&w=800",
    cta: "View Tool",
    href: "/marketplace",
  },
  {
    id: "templates",
    name: "Contract Templates",
    image:
      "https://images.unsplash.com/photo-1559027615-5db1c128aa84?auto=format&w=800",
    cta: "Buy Now",
    href: "/marketplace",
  },
];

export default function FeaturedToolsCarousel() {
  const [index, setIndex] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % tools.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative overflow-hidden">
      <div className="flex justify-center mb-4 gap-2">
        {tools.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-2 h-2 rounded-full ${i === index ? "bg-secondary-700 w-3" : "bg-gray-300"}`}
          />
        ))}
      </div>
      <div className="relative h-64 rounded-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setTilt({
                x: ((e.clientY - r.top - r.height / 2) / r.height) * -10,
                y: ((e.clientX - r.left - r.width / 2) / r.width) * 10,
              });
            }}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            style={{ rotateX: tilt.x, rotateY: tilt.y }}
            className="absolute inset-0 glass-card backdrop-blur-lg bg-cloud-100/30 dark:bg-slate-700/30 rounded-2xl shadow-2xl"
          >
            <Image
              src={tools[index].image}
              alt={tools[index].name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center text-center p-4">
              <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
                {tools[index].name}
              </h3>
              <Link href={tools[index].href}>
                <Button className="px-6 py-3">{tools[index].cta}</Button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
