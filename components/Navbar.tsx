'use client'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import ThemeToggle from './ui/ThemeToggle'
import Button from './ui/Button'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const links = [
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/account', label: 'Account' },
  ]

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-background/80 border-b">
      <nav className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-bold">MyRoofGenius</Link>
        <div className="hidden lg:flex space-x-6">
          {links.map(({ href, label }) => (
            <motion.div key={href} whileHover={{ y: -2 }}>
              <Link href={href} className="hover:text-accent">
                {label}
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/marketplace" className="hidden lg:block">
            <Button size="sm">Explore</Button>
          </Link>
          <ThemeToggle />
          <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-background border-b px-4"
          >
            {links.map(({ href, label }) => (
              <Link key={href} href={href} className="block py-2" onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
