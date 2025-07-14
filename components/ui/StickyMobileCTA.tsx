import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * StickyMobileCTA
 * Renders a sticky call-to‑action bar on mobile (<768px) with two primary buttons.
 */
const StickyMobileCTA: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => setIsMobile(window.innerWidth < 768);
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  if (!isMobile) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-between px-4 py-3 space-x-3 md:hidden"
      >
        <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white rounded-md py-2 font-semibold transition-colors">
          Get Estimate
        </button>
        <button className="flex-1 bg-secondary-600 hover:bg-secondary-700 text-white rounded-md py-2 font-semibold transition-colors">
          Call Now
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default StickyMobileCTA;
