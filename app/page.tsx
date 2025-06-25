'use client'
import { motion } from 'framer-motion'
import FeatureCard from '../components/FeatureCard'
import Testimonial from '../components/Testimonial'

export default function Home() {
  return (
    <>
    <main className="min-h-screen pt-32 bg-bg text-text-primary">
      <section className="hero text-center py-24">
        <h1 className="text-5xl font-bold text-accent mb-4 animate-fade-in">Stop Guessing. Start Winning.</h1>
        <p className="text-xl text-text-secondary mb-8">AI-powered intelligence for modern roofers. Generate estimates, automate reports, and win more jobs with next-gen tech.</p>
        <motion.button whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.96 }} className="btn-primary rounded-xl px-8 py-3 bg-accent text-white text-lg font-bold shadow-lg">Start Your Free 14-Day Trial</motion.button>
      </section>
      <section className="features flex flex-col md:flex-row gap-8 justify-center py-16">
        <FeatureCard title="AI Copilot" desc="Your personal estimator, live 24/7." />
        <FeatureCard title="Smart Marketplace" desc="Get AI-driven recommendations for products and parts." />
        <FeatureCard title="Lightning Reports" desc="One click to generate ready-to-send docs." />
      </section>
      <section className="testimonials py-16 bg-bg-card rounded-2xl max-w-3xl mx-auto shadow-lg">
        <h3 className="text-2xl font-semibold text-center mb-6">What Top Roofers Say</h3>
        <Testimonial quote="This platform changed how we bid projects." author="Jane Contractor" />
      </section>
    </main>
    <div className="fixed bottom-0 left-0 w-full bg-bg-card p-4 flex justify-center z-50 md:hidden">
      <button className="btn-primary w-full py-3 rounded-xl text-lg font-bold">Start My Free AI Estimate</button>
    </div>
    </>
  )
}
