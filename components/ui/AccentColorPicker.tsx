'use client';
import { useTheme } from './ThemeProvider';

export default function AccentColorPicker() {
  const { accent, setAccent } = useTheme();
  return (
    <input
      type="color"
      aria-label="Accent color"
      value={accent}
      onChange={e => setAccent(e.target.value)}
      className="w-6 h-6 p-0 border-0 bg-transparent cursor-pointer focus:outline-none"
    />
  );
}
