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
  accent: '#5276c5',
  setAccent: () => {}
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  );
  const [accent, setAccent] = useState('#5276c5');

  useEffect(() => {
    // Load persisted theme from localStorage if available
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) {
      setTheme(stored);
    } else {
      setTheme(
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
      );
    }
    const acc = localStorage.getItem('accent');
    if (acc) setAccent(acc);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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
