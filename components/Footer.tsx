'use client'
import { motion } from 'framer-motion'
import { Github } from 'lucide-react'

export default function Footer() {
  const icons = [
    { href: 'https://github.com/mwwoodworth/myroofgenius-app', Icon: Github },
  ]
  const links = [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/contact', label: 'Contact' },
  ]
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-navbar bg-primary-900 mt-12 rounded-t-2xl py-6 flex flex-col items-center gap-4 backdrop-blur-md"
    >
      <p className="text-white text-sm">©2025 MyRoofGenius • Smart Roofing Solutions</p>
      <nav className="flex gap-6 text-sm text-white">
        {links.map(({ href, label }) => (
          <a key={href} href={href} className="hover:text-accent-pink">
            {label}
          </a>
        ))}
      </nav>
      <div className="flex gap-6">
        {icons.map(({ href, Icon }) => (
          <motion.a
            key={href}
            href={href}
            whileHover={{ scale: 1.2, rotate: 5 }}
            aria-label="GitHub"
            className="text-white hover:text-accent-pink glow-btn animate-ripple rounded-full p-2"
          >
            <Icon className="w-5 h-5" />
          </motion.a>
        ))}
      </div>
    </motion.footer>
  )
}
