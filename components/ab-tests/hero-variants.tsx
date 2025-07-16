'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useABTest } from '@/lib/ab-testing'
import { Button } from '@/design-system/components/Button'
import { ChevronRight, Play, Star, Users } from 'lucide-react'

// Control variant - Original hero
export function HeroControl() {
  const { trackConversion } = useABTest('landing_page_hero')

  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <motion.div 
              className="sm:text-center lg:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">AI-Powered</span>{' '}
                <span className="block text-blue-600 xl:inline">Roofing Software</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Generate accurate roof estimates, create professional proposals, and streamline your roofing business with our comprehensive platform.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Button 
                    size="lg" 
                    className="w-full flex items-center justify-center"
                    onClick={() => trackConversion('cta_click', 1)}
                  >
                    Get Started
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={() => trackConversion('demo_click', 1)}
                  >
                    Watch Demo
                  </Button>
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}

// Video hero variant
export function HeroVideoVariant() {
  const { trackConversion } = useABTest('landing_page_hero')

  return (
    <div className="relative bg-black overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover opacity-60"
        >
          <source src="/videos/roofing-hero.mp4" type="video/mp4" />
          {/* Fallback image */}
          <img 
            src="/images/hero-bg.jpg" 
            alt="Roofing background"
            className="w-full h-full object-cover"
          />
        </video>
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-10" />
      
      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6">
            <span className="block">Transform Your</span>
            <span className="block text-blue-400">Roofing Business</span>
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-200 leading-8">
            Join thousands of roofing professionals who trust MyRoofGenius to generate precise estimates, create stunning proposals, and grow their business.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
              onClick={() => trackConversion('cta_click', 1)}
            >
              <Play className="mr-2 h-5 w-5" />
              Start Your Free Trial
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg"
              onClick={() => trackConversion('demo_click', 1)}
            >
              Watch Demo
            </Button>
          </div>
          
          {/* Social proof */}
          <div className="mt-12 flex items-center justify-center gap-6 text-gray-300">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              <span>10,000+ contractors</span>
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-400" />
              <span>4.9/5 rating</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Testimonial-focused hero variant
export function HeroTestimonialVariant() {
  const { trackConversion } = useABTest('landing_page_hero')

  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Testimonial */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-700 text-lg mb-6">
                "MyRoofGenius transformed our business. We went from spending hours on estimates to generating professional proposals in minutes. Our close rate increased by 40%!"
              </blockquote>
              <div className="flex items-center">
                <img 
                  src="/images/testimonial-avatar.jpg" 
                  alt="Mike Johnson"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <p className="font-semibold text-gray-900">Mike Johnson</p>
                  <p className="text-gray-600">Owner, Summit Roofing</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Right side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
              <span className="block">Trusted by</span>
              <span className="block text-yellow-300">10,000+ Roofers</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join the fastest-growing community of roofing professionals who use AI to create accurate estimates, professional proposals, and win more jobs.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center text-white">
                <div className="w-2 h-2 bg-yellow-300 rounded-full mr-3" />
                <span>Generate estimates in under 5 minutes</span>
              </div>
              <div className="flex items-center text-white">
                <div className="w-2 h-2 bg-yellow-300 rounded-full mr-3" />
                <span>Professional proposals that win jobs</span>
              </div>
              <div className="flex items-center text-white">
                <div className="w-2 h-2 bg-yellow-300 rounded-full mr-3" />
                <span>Increase close rates by 40%</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8"
                onClick={() => trackConversion('cta_click', 1)}
              >
                Join 10,000+ Roofers
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => trackConversion('demo_click', 1)}
              >
                See How It Works
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Main hero component that chooses variant
export function ABTestHero() {
  const { variant } = useABTest('landing_page_hero')

  switch (variant) {
    case 'video_hero':
      return <HeroVideoVariant />
    case 'testimonial_hero':
      return <HeroTestimonialVariant />
    default:
      return <HeroControl />
  }
}