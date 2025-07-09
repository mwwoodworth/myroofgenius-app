'use client'
import Link from 'next/link'
import { Shield, ArrowRight, Play, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
const MotionLink = motion(Link)
import { AnimatedGradient, Hero3D, HeroHeadline, Skeleton } from '../components/ui'
import { Suspense } from 'react'
import dynamicImport from 'next/dynamic'
import EmailSignupForm from '../components/marketing/EmailSignupForm'
const FeaturedToolsCarousel = dynamicImport(
  () => import('../components/marketing/FeaturedToolsCarousel'),
  { ssr: false, loading: () => <div>Loading...</div> }
)
const Testimonials = dynamicImport(
  () => import('../components/marketing/Testimonials'),
  { ssr: false, loading: () => <div>Loading...</div> }
)
import ActiveUsersBadge from '../components/marketing/ActiveUsersBadge'
import { useLocale } from '../src/context/LocaleContext'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const { messages } = useLocale();
  return (
    <>
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden bg-brand-gradient dark:bg-brand-gradient-alt py-24 backdrop-blur-lg rounded-2xl shadow-2xl">
      <AnimatedGradient />
      <div className="absolute top-6 right-6">
        <ActiveUsersBadge />
      </div>
      <div className="container relative mx-auto px-4 max-w-6xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-white/30 backdrop-blur-lg rounded-full shadow-2xl px-4 py-2 mb-8">
            <Shield className="w-5 h-5 text-accent-emerald" />
            <span className="text-sm font-medium text-white">Trusted by 2,800+ contractors</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            <HeroHeadline texts={["Protect every project.", "Grow every margin."]} className="text-accent-pink" />
          </motion.h1>
          <ul className="text-slate-300 mb-8 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent-emerald" />
              Instant AI estimates
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent-emerald" />
              Error-proof templates
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent-emerald" />
              Mobile field tools
            </li>
          </ul>
          <Hero3D />
          <div className="my-8">
            <Suspense fallback={<Skeleton />}>
              <FeaturedToolsCarousel />
            </Suspense>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <MotionLink
              href="/get-started"
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center justify-center px-8 py-4 bg-accent-emerald hover:bg-accent-emerald/80 text-white rounded-2xl shadow-2xl font-semibold text-lg transition-colors glow-btn animate-ripple"
            >
              {messages.home.startTrial}
              <ArrowRight className="ml-2 w-5 h-5" />
            </MotionLink>
            <MotionLink
              href="/demo"
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center justify-center px-8 py-4 border border-accent-emerald text-accent-emerald rounded-2xl shadow-2xl font-semibold text-lg transition-colors"
            >
              <Play className="mr-2 w-5 h-5" />
              {messages.home.watchDemo}
            </MotionLink>
          </div>
          <div className="mt-12 flex flex-wrap gap-8">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-accent-emerald" />
              <span className="text-slate-300">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-accent-emerald" />
              <span className="text-slate-300">$2.3B Projects Protected</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-accent-emerald" />
              <span className="text-slate-300">99.9% Uptime</span>
            </div>
          </div>
      <div className="mt-12 max-w-md">
        <EmailSignupForm />
      </div>
    </div>
  </div>
  </motion.section>
  <Suspense fallback={<Skeleton />}>
    <Testimonials className="bg-gray-50" />
  </Suspense>
  </>
  )
}
