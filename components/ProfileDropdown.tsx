'use client'
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';
import { ChevronDown } from 'lucide-react';
import { useRole, type Role } from './ui/RoleProvider';
import LazyImage from './ui/LazyImage';

export default function ProfileDropdown() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const { role, setRole } = useRole();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    `https://avatars.dicebear.com/api/initials/${encodeURIComponent(
      user?.email || 'U'
    )}.svg`;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 focus:outline-none"
        aria-label="User menu"
      >
        <LazyImage
          src={avatarUrl}
          alt="avatar"
          width={32}
          height={32}
          className="w-8 h-8 rounded-full border"
        />
        <ChevronDown className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 rounded-[14px] border border-white/20 bg-bg-card backdrop-blur-lg p-3 z-50 space-y-2"
          >
          <select
            className="w-full rounded-md bg-bg-card border border-gray-700 p-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value="pm">Project Manager</option>
            <option value="exec">Executive</option>
            <option value="field">Field</option>
          </select>
          <a href="/dashboard" className="block px-2 py-1 rounded hover:bg-accent hover:text-white text-sm">
            Dashboard
          </a>
          {user?.user_metadata?.role === 'admin' && (
            <a href="/admin" className="block px-2 py-1 rounded hover:bg-accent hover:text-white text-sm">
              Admin
            </a>
          )}
          <button
            onClick={handleSignOut}
            className="w-full text-left px-2 py-1 rounded hover:bg-accent hover:text-white text-sm"
          >
            Sign Out
          </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
