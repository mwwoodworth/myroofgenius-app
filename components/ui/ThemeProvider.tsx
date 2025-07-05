'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light'
interface ThemeCtx {
  theme: Theme
  toggle: () => void
  accent: string
  setAccent: (c: string) => void
}

const ThemeContext = createContext<ThemeCtx>({
  theme: 'dark',
  toggle: () => {},
  accent: '#5e5ce6',
  setAccent: () => {}
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [accent, setAccent] = useState('#5e5ce6');

  useEffect(() => {
    // Load persisted theme from localStorage if available
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) setTheme(stored);
    const acc = localStorage.getItem('accent');
    if (acc) setAccent(acc);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (theme === 'dark') {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
    // persist choice
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const hex = accent.startsWith('#') ? accent.slice(1) : accent;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    document.documentElement.style.setProperty('--accent', `${r} ${g} ${b}`);
    localStorage.setItem('accent', accent);
  }, [accent]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggle: () => setTheme(t => (t === 'dark' ? 'light' : 'dark')),
        accent,
        setAccent
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
