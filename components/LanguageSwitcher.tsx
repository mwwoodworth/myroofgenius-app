'use client';
import {useLocale} from '../src/context/LocaleContext';
import { motion } from 'framer-motion';

export default function LanguageSwitcher() {
  const { locale, setLocale, messages } = useLocale();
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120 }}
      className="flex items-center space-x-2 text-sm"
    >
      <span>{messages.language}:</span>
      {['en', 'es'].map((l) => (
        <motion.button
          key={l}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLocale(l)}
          className={`px-2 py-1 rounded ${
            locale === l ? 'bg-blue-600 text-white' : 'bg-gray-100'
          }`}
        >
          {l.toUpperCase()}
        </motion.button>
      ))}
    </motion.div>
  );
}
