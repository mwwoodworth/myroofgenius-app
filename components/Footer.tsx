'use client'
import { motion } from 'framer-motion'
import { Github } from 'lucide-react'

export default function Footer() {
  const icons = [
    { href: 'https://github.com/mwwoodworth/myroofgenius-app', Icon: Github },
  ]
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-navbar mt-12 rounded-t-2xl py-6 flex justify-center gap-6 backdrop-blur-md"
    >
      {icons.map(({ href, Icon }) => (
        <motion.a
          key={href}
          href={href}
          whileHover={{ scale: 1.2, rotate: 5 }}
          className="text-white hover:text-accent glow-btn animate-ripple rounded-full p-2"
        >
          <Icon className="w-5 h-5" />
        </motion.a>
      ))}
    </motion.footer>
  )
}
