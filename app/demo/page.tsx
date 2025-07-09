'use client'
import { Play, Shield, Clock, DollarSign, Users } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import EmailSignupForm from '../../components/marketing/EmailSignupForm'
import { buildMeta } from '../../lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Demo | MyRoofGenius',
    description: 'Watch demos of our estimation and compliance tools in action.'
  })

export default function DemoPage() {
  const [activeDemo, setActiveDemo] = useState('estimation')

  const demos = {
    estimation: {
      title: 'Estimation Protection',
      video: '/demos/estimation-protection.mp4',
      description: 'See how our system catches the mistakes that cost margins',
      keyPoints: [
        'Automatic material waste calculations',
        'Historical bid comparison warnings',
        'Forgotten item checklists'
      ]
    },
    field: {
      title: 'Field Operations',
      video: '/demos/field-operations.mp4',
      description: 'Watch field teams stay productive even offline',
      keyPoints: [
        'Offline-first data capture',
        'Voice-to-text reporting',
        'Automatic sync when connected'
      ]
    },
    compliance: {
      title: 'Compliance Shield',
      video: '/demos/compliance-shield.mp4',
      description: 'Never miss a code requirement again',
      keyPoints: [
        'Automatic code checking',
        'Submittal verification',
        'Change order compliance'
      ]
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            See Protection in Action
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Watch how MyRoofGenius protects professionals from the failures 
            that derail projects and destroy margins.
          </p>
        </div>
        {/* Demo Selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {Object.entries(demos).map(([key, demo]) => (
            <button
              key={key}
              onClick={() => setActiveDemo(key)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeDemo === key ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-200'
              }`}
            >
              {demo.title}
            </button>
          ))}
        </div>
        {/* Active Demo Display */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
          <div className="aspect-video bg-slate-900 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <Play className="w-10 h-10 text-white ml-1" />
              </button>
            </div>
          </div>
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-3">{demos[activeDemo].title}</h2>
            <p className="text-lg text-slate-600 mb-6">{demos[activeDemo].description}</p>
            <div className="space-y-3">
              {demos[activeDemo].keyPoints.map((point, i) => (
                <div key={i} className="flex items-center">
                  <Shield className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-slate-700">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* ROI Calculator */}
        <div className="bg-blue-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8">Calculate Your Protection Value</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <ROIMetric icon={<Clock className="w-8 h-8" />} label="Time Saved" value="12 hours/week" description="On estimation and reporting" />
            <ROIMetric icon={<DollarSign className="w-8 h-8" />} label="Margin Protected" value="8-12%" description="Through error prevention" />
            <ROIMetric icon={<Users className="w-8 h-8" />} label="Team Efficiency" value="+35%" description="With mobile tools" />
          </div>
          <div className="text-center mt-8">
            <Link href="/get-started" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors">
              Start Your Free Trial →
            </Link>
          </div>
        </div>
        <div className="max-w-md mx-auto mt-12">
          <EmailSignupForm />
        </div>
      </div>
    </div>
  )
}

function ROIMetric({ icon, label, value, description }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <div className="text-3xl font-bold text-blue-900 mb-2">{value}</div>
      <div className="font-semibold text-slate-900 mb-1">{label}</div>
      <div className="text-sm text-slate-600">{description}</div>
    </div>
  )
}
