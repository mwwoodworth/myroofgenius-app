'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      if (response.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen">
      {/* Sticky Banner */}
      <div className="bg-blue-600 text-white py-2 text-center text-sm">
        <p>
          Never Miss a Critical Inspection Point Again - 
          <Link href="/resources/inspection-checklist" className="underline ml-1">
            Download our free Commercial Roofing Estimate Checklist
          </Link>
        </p>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Stop Leaving Money on the Roof
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                AI-powered estimation tools, battle-tested templates, and industry expertise that help commercial roofing contractors win more profitable projects.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/marketplace"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition text-center"
                >
                  Browse Tools & Templates
                </Link>
                <Link 
                  href="/resources/cash-flow-forecast"
                  className="bg-white text-gray-900 px-8 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition text-center"
                >
                  Free Cash Flow Tool
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  30-Day Money Back
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Instant Download
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80" 
                alt="Commercial roofing professional using digital tools"
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-blue-600">2,847</span>
                  <span className="text-gray-600">Contractors<br/>Saving Time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              The Hidden Cost Drivers Killing Your Margins
            </h2>
            <p className="text-xl text-gray-600">
              Our research shows commercial roofing projects exceed budgets by 15-35% due to overlooked factors
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-red-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Deck Deterioration</h3>
              <p className="text-gray-600">
                Undetected structural damage increases material costs by 20-30% after tear-off
              </p>
            </div>
            <div className="bg-red-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Code Updates</h3>
              <p className="text-gray-600">
                Mandatory compliance with current building codes adds 5-15% to project costs
              </p>
            </div>
            <div className="bg-red-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">💧</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Hidden Moisture</h3>
              <p className="text-gray-600">
                Wet insulation discovery can increase replacement costs by 30-100%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tools Built by Roofers, For Roofers
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Estimation Accuracy</h3>
              <p className="text-gray-600 text-center">
                AI-powered estimation tools that account for hidden costs, code requirements, and regional pricing variations
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Cash Flow Management</h3>
              <p className="text-gray-600 text-center">
                Project-based financial tools to track progress billing, material costs, and maintain healthy margins
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏗️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Colorado Compliance</h3>
              <p className="text-gray-600 text-center">
                Templates and checklists updated for Colorado's Class 4 impact requirements and snow load calculations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">15-35%</div>
              <p className="text-gray-600">Average cost savings on estimates</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">3.2 hrs</div>
              <p className="text-gray-600">Saved per estimate on average</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <p className="text-gray-600">Customer satisfaction rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Get Free Industry Insights</h2>
          <p className="text-blue-100 mb-8">
            Weekly tips on estimation accuracy, code updates, and profitable project management
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 font-semibold"
            >
              {status === 'loading' ? 'Subscribing...' : 'Get Free Tips'}
            </button>
          </form>
          {status === 'success' && (
            <p className="mt-4 text-white">Check your email for a welcome gift!</p>
          )}
          {status === 'error' && (
            <p className="mt-4 text-red-200">Something went wrong. Please try again.</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">MyRoofGenius</h3>
              <p className="text-sm">
                Smart tools for modern roofing contractors. Built in Colorado, used nationwide.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/marketplace" className="hover:text-white">All Products</Link></li>
                <li><Link href="/marketplace/estimation" className="hover:text-white">Estimation Tools</Link></li>
                <li><Link href="/marketplace/templates" className="hover:text-white">Contract Templates</Link></li>
                <li><Link href="/marketplace/checklists" className="hover:text-white">Inspection Checklists</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/resources/guides" className="hover:text-white">Free Guides</Link></li>
                <li><Link href="/resources/calculator" className="hover:text-white">ROI Calculator</Link></li>
                <li><Link href="/resources/glossary" className="hover:text-white">Industry Glossary</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; 2025 MyRoofGenius. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}