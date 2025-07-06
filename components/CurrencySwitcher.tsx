'use client';
import {useCurrency} from '../src/context/CurrencyContext';
import { motion } from 'framer-motion';

export default function CurrencySwitcher() {
  const {currency, setCurrency} = useCurrency();
  const currencies = ['USD', 'EUR'];
  return (
    <motion.select
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      whileFocus={{ rotateX: -15 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="border rounded px-2 py-1 text-sm bg-bg-card glass-card"
    >
      {currencies.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </motion.select>
  );
}
