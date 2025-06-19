import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../context/ThemeContext';

export default function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header className="bg-[#202940] dark:bg-gray-800 text-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">
          MyRoofGenius
        </Link>
        <div className="flex items-center space-x-4">
          <nav className="space-x-4 hidden md:block">
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            <Link to="/services" className="hover:text-white">
              Services
            </Link>
            <Link to="/about" className="hover:text-white">
              About
            </Link>
            <Link to="/contact" className="hover:text-white">
              Contact
            </Link>
          </nav>
          <motion.button
            key={theme}
            onClick={toggleTheme}
            className="p-1 rounded hover:bg-gray-700"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
