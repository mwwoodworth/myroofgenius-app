'use client'
import clsx from 'clsx'
import { motion } from 'framer-motion'

interface Testimonial {
  quote: string
  name: string
  role: string
}

const testimonials: Testimonial[] = [
  {
    quote:
      'MyRoofGenius cut our estimation time in half while improving accuracy.',
    name: 'Sarah Chen',
    role: 'Senior Estimator, ABC Roofing',
  },
  {
    quote:
      "The AI insights help us identify issues before they become problems. We've reduced callbacks by 40%.",
    name: 'Michael Rodriguez',
    role: 'Operations Manager, Premier Roofing Co.',
  },
  {
    quote:
      'Finally, a platform that understands the complexity of commercial roofing. The ROI was immediate.',
    name: 'Jennifer Park',
    role: 'Facility Director, Corporate Properties Inc.',
  },
]

export default function Testimonials({ className = '' }: { className?: string }) {
  return (
    <section className={clsx('py-12', className)}>
      <h2 className="text-3xl font-bold text-center mb-8">What Contractors Say</h2>
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
            className="bg-white rounded-xl shadow p-6"
          >
            <p className="mb-4">&ldquo;{t.quote}&rdquo;</p>
            <p className="font-semibold">{t.name}</p>
            <p className="text-sm text-text-secondary">{t.role}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
