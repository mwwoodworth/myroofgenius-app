'use client';
import {useCurrency} from '../src/context/CurrencyContext';

export default function CurrencySwitcher() {
  const {currency, setCurrency} = useCurrency();
  const currencies = ['USD', 'EUR'];
  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      className="border rounded px-2 py-1 text-sm"
    >
      {currencies.map(c => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  );
}
