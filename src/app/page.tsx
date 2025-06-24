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
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Roofing Solutions for Modern Contractors
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered tools, professional templates, and industry expertise to transform your roofing business.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/marketplace"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Browse Marketplace
            </Link>
            <Link 
              href="/dashboard"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Succeed
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Estimation</h3>
              <p className="text-gray-600">
                AI-powered tools to create accurate estimates in minutes, not hours.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional Templates</h3>
              <p className="text-gray-600">
                Industry-specific templates for contracts, proposals, and reports.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
              <p className="text-gray-600">
                Get instant answers to technical questions and business challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-600 mb-8">
            Get the latest roofing industry insights and exclusive offers.
          </p>
          <form onSubmit={handleSubscribe} className="flex max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-blue-600 text-white px-6 py-2 rounded-r-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          {status === 'success' && (
            <p className="mt-4 text-green-600">Thanks for subscribing!</p>
          )}
          {status === 'error' && (
            <p className="mt-4 text-red-600">Something went wrong. Please try again.</p>
          )}
        </div>
      </section>
    </main>
  )
}
