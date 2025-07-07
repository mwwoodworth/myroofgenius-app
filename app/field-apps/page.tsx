'use client'
import { Shield, WifiOff, Camera, FileText, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function FieldAppsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section - Why This Matters */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Field Apps: Your Mobile Command Center
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            When you&apos;re on a roof at 7 AM with a decision to make, you need systems
            that work with one bar of signal and gloves on. Built for real conditions, 
            not ideal ones.
          </p>
        </div>

        {/* What This Protects */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-8 text-center">What Our Field Apps Protect</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <WifiOff className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Lost Work Prevention</h3>
              <p className="text-slate-600">Offline-first architecture. Every photo, note, and measurement saves locally first.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Mistake Prevention</h3>
              <p className="text-slate-600">Real-time validation catches errors before they become expensive problems.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Documentation Shield</h3>
              <p className="text-slate-600">Timestamped, GPS-tagged evidence protects you from disputes.</p>
            </div>
          </div>
        </div>

        {/* Field Apps Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <FieldAppCard
            title="Roof Inspector Pro"
            icon={<Camera className="w-8 h-8" />}
            description="Capture, annotate, and sync inspection data even offline"
            features={[
              'Voice-to-text notes with gloves on',
              'Photo annotation and measurement tools',
              'Automatic weather condition logging',
              'Instant report generation'
            ]}
            status="Download Now"
            downloadLink="/download/roof-inspector"
            color="blue"
          />
          <FieldAppCard
            title="Daily Reporter"
            icon={<FileText className="w-8 h-8" />}
            description="Never lose another day's progress to paperwork"
            features={[
              'One-tap daily report creation',
              'Automatic weather integration',
              'Crew time tracking',
              'Photo documentation with captions'
            ]}
            status="Download Now"
            downloadLink="/download/daily-reporter"
            color="green"
          />
        </div>

        {/* Technical Specifications */}
        <div className="bg-slate-50 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold mb-6">Built for Field Reality</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">Minimum Requirements</h3>
              <ul className="space-y-2 text-slate-600">
                <li>• iOS 14+ or Android 9+</li>
                <li>• 100MB storage for offline data</li>
                <li>• Camera access for documentation</li>
                <li>• Location services for GPS tagging</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Field-Tested Features</h3>
              <ul className="space-y-2 text-slate-600">
                <li>• Works on 2G/Edge connections</li>
                <li>• 7-day offline capability</li>
                <li>• Glove-friendly interface</li>
                <li>• High-contrast mode for bright sun</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldAppCard({ title, icon, description, features, status, downloadLink, color }) {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700'
  }
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 hover:shadow-xl transition-shadow">
      <div className={`w-16 h-16 bg-${color}-100 rounded-full flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-slate-600 mb-6">{description}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span className="text-slate-700">{feature}</span>
          </li>
        ))}
      </ul>
      <Link href={downloadLink} className={`block text-center py-3 px-6 rounded-lg text-white font-semibold transition-colors ${colorClasses[color]}`}>
        {status}
      </Link>
    </div>
  )
}
