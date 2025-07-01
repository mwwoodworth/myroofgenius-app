'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Product } from '../../types/marketplace';
import GlassPanel from '../ui/Card';

interface ProductCarouselProps {
  products: Product[]
  isLoading?: boolean
  title?: string
}

export default function ProductCarousel({
  products,
  isLoading,
  title = 'AI-Recommended Products'
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay || products.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [autoPlay, products.length]);

  return (
    <div className="relative w-full" onMouseEnter={() => setAutoPlay(false)} onMouseLeave={() => setAutoPlay(true)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          {products.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-blue-500 w-4' : 'bg-gray-400'}`}
            />
          ))}
        </div>
      </div>
      <div className="relative h-72 overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" className="absolute inset-0 flex items-center justify-center" />
          ) : (
            <motion.div key={currentIndex} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="absolute inset-0">
              <GlassPanel className="h-full p-6">
                {products[currentIndex]?.name}
              </GlassPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
