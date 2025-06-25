'use client'
import { motion } from 'framer-motion'

const actions = [
  { label: 'Create Estimate', href: '/estimator' },
  { label: 'Upload Roof Plan', href: '/dashboard' },
  { label: 'View Templates', href: '/marketplace' },
]

export default function HotActions() {
  return (
    <div className="flex gap-3 mb-6">
      {actions.map((a) => (
        <motion.a
          whileHover={{ y: -2 }}
          key={a.href}
          href={a.href}
          className="bg-bg-card px-4 py-2 rounded-lg shadow"
        >
          {a.label}
        </motion.a>
      ))}
    </div>
  )
}
