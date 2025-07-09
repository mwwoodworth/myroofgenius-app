'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedGradient from './ui/AnimatedGradient';
import { Menu, X } from 'lucide-react';
import { ThemeToggle, AccentColorPicker, ProfileDropdown } from './ui';
import LanguageSwitcher from './LanguageSwitcher';
import CurrencySwitcher from './CurrencySwitcher';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const links = [
    { href: '/', label: 'Home' },
    { href: '/fieldapps', label: 'Field Apps' },
    { href: '/tools', label: 'Tools' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/blog', label: 'Blog' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 70 }}
        className="glass-navbar bg-primary-900/90 rounded-2xl shadow-2xl fixed top-0 w-full flex items-center justify-between px-8 py-4 z-50 overflow-hidden"
      >
        <AnimatedGradient />
        <div className="text-accent text-2xl font-bold">MyRoofGenius</div>
        <div className="hidden md:flex gap-6">
          {links.map(({ href, label }) => (
            <motion.a
              key={href}
              href={href}
              whileHover={{ scale: 1.1 }}
              className="hover:text-accent transition"
            >
              {label}
            </motion.a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher />
          <CurrencySwitcher />
          <ThemeToggle />
          <AccentColorPicker />
          {user ? (
            <ProfileDropdown />
          ) : (
            <>
              <a href="/login" className="text-sm font-medium hover:text-accent">
                Sign In
              </a>
              <motion.a
                href="/signup"
                whileHover={{ scale: 1.05 }}
                className="rounded-xl px-5 py-2 bg-accent-emerald hover:bg-accent-emerald/80 text-white font-bold shadow-md transition glow-btn animate-ripple"
              >
                Start Free Trial
              </motion.a>
            </>
          )}
        </div>
        <button className="md:hidden" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </motion.nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[rgba(35,35,35,0.9)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.07)] rounded-b-2xl shadow-2xl fixed top-16 w-full z-40 overflow-hidden"
          >
            <AnimatedGradient />
            {links.map(({ href, label }) => (
              <motion.a
                key={href}
                href={href}
                whileTap={{ scale: 0.95 }}
                className="block px-8 py-4 border-b border-[rgba(255,255,255,0.07)] hover:text-accent"
                onClick={() => setOpen(false)}
              >
                {label}
              </motion.a>
            ))}
            {user?.user_metadata?.role === 'admin' && (
              <a
                href="/admin"
                className="block px-8 py-4 border-b border-[rgba(255,255,255,0.07)] hover:text-accent"
                onClick={() => setOpen(false)}
              >
                Admin
              </a>
            )}
            {user ? (
              <>
                <a
                  href="/dashboard"
                  className="block px-8 py-4 border-b border-[rgba(255,255,255,0.07)] hover:text-accent"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </a>
                <button
                  onClick={() => {
                    handleSignOut();
                    setOpen(false);
                  }}
                  className="block w-full text-left px-8 py-4 border-b border-[rgba(255,255,255,0.07)] hover:text-accent"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="block px-8 py-4 border-b border-[rgba(255,255,255,0.07)] hover:text-accent"
                  onClick={() => setOpen(false)}
                >
                  Sign In
                </a>
                <motion.a
                  href="/signup"
                  whileTap={{ scale: 0.95 }}
                  className="block px-8 py-4 border-b border-[rgba(255,255,255,0.07)] hover:bg-accent-emerald/80 bg-accent-emerald text-white glow-btn animate-ripple"
                  onClick={() => setOpen(false)}
                >
                  Start Free Trial
                </motion.a>
              </>
            )}
            <div className="p-4 space-y-2">
              <LanguageSwitcher />
              <CurrencySwitcher />
              <ThemeToggle />
              <AccentColorPicker />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
