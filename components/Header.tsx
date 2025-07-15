'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SearchBar from "./SearchBar";
import GlassButton from "./ui/GlassButton";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring" as const, stiffness: 300 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "glass border-b border-glass-border" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold gradient-text"
            >
              MyRoofGenius
            </motion.div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {['Tools', 'Marketplace', 'Field Apps', 'About'].map((item) => (
              <motion.div key={item} whileHover={{ scale: 1.05 }}>
                <Link
                  href={`/${item.toLowerCase().replace(' ', '-')}`}
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  {item}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <SearchBar />
            <GlassButton size="sm" variant="secondary">
              Sign In
            </GlassButton>
            <GlassButton size="sm" variant="primary">
              Get Started
            </GlassButton>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
