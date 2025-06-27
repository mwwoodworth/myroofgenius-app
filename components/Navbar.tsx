'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from './ui'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const links = [
    { href: '/', label: 'Home' },
    { href: '/fieldapps', label: 'Field Apps' },
    { href: '/tools', label: 'Tools' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/blog', label: 'Blog' },
  ]

  return (
    <>
      <motion.nav className="fixed top-0 w-full flex items-center justify-between px-8 py-4 bg-[rgba(35,35,35,0.75)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.07)] z-50">
        <div className="text-accent text-2xl font-bold">MyRoofGenius</div>
        <div className="hidden md:flex gap-6">
          {links.map(({ href, label }) => (
            <a key={href} href={href} className="hover:text-accent transition">
              {label}
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <>
              {user.user_metadata?.role === 'admin' && (
                <a href="/admin" className="text-sm font-medium hover:text-accent">
                  Admin
                </a>
              )}
              <a href="/dashboard" className="text-sm font-medium hover:text-accent">
                Dashboard
              </a>
              <button onClick={handleSignOut} className="rounded-xl px-5 py-2 border border-accent text-accent hover:bg-accent hover:text-white transition">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="text-sm font-medium hover:text-accent">
                Sign In
              </a>
              <a href="/signup" className="rounded-xl px-5 py-2 bg-accent text-white font-bold shadow-md hover:scale-105 transition">
                Start Free Trial
              </a>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </motion.nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[rgba(35,35,35,0.9)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.07)] fixed top-16 w-full z-40 overflow-hidden"
          >
            {links.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="block px-8 py-4 border-b border-[rgba(255,255,255,0.07)] hover:text-accent"
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
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
                    handleSignOut()
                    setOpen(false)
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
                <a
                  href="/signup"
                  className="block px-8 py-4 border-b border-[rgba(255,255,255,0.07)] hover:text-accent"
                  onClick={() => setOpen(false)}
                >
                  Start Free Trial
                </a>
              </>
            )}
            <div className="p-4">
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
