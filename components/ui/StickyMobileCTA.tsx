'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function StickyMobileCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const update = () => setShow(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-0 inset-x-0 z-50 bg-primary text-white flex items-center justify-around px-4 py-3 md:hidden shadow-xl"
        >
          <Link
            href="/estimate"
            className="bg-white text-primary rounded-full px-5 py-2 font-bold mr-2"
          >
            Start Estimate
          </Link>
          <a
            href="tel:1234567890"
            className="bg-white text-primary rounded-full px-5 py-2 font-bold"
          >
            Call Now
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
