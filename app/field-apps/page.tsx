import { Shield, WifiOff, Camera, FileText, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { buildMeta } from '../../lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Field Apps | MyRoofGenius',
    description: 'Offline-capable mobile tools for crews on site.'
  })

export default function FieldAppsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section - Why This Matters */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary-700/10 rounded-full mb-6">
            <Shield className="w-10 h-10 text-secondary-700" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Field Apps: Your Mobile Command Center
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            When you&apos;re on a roof at 7 AM with a decision to make, you need systems
            that work with one bar of signal and gloves on. Built for real conditions,
            not ideal ones.
          </p>
        </div>

        {/* What This Protects */}
        <div className="bg-cloud-100 dark:bg-slate-700 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-8 text-center">What Our Field Apps Protect</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-emerald/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <WifiOff className="w-8 h-8 text-accent-emerald" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Lost Work Prevention</h3>
              <p className="text-text-secondary">Offline-first architecture. Every photo, note, and measurement saves locally first.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-emerald/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-accent-emerald" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Proof of Work</h3>
              <p className="text-text-secondary">Photos and notes automatically attach to the job record, even without service.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-emerald/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-accent-emerald" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Simplified Reporting</h3>
              <p className="text-text-secondary">Generate clean reports from the field with one tap, gloves on.</p>
            </div>
          </div>
        </div>

        {/* Warning Section */}
        <div className="bg-secondary-700/5 rounded-2xl p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-secondary-700 mx-auto mb-4" />
          <p className="text-lg text-slate-700 mb-6">Data loss from spotty connections costs roofers millions each year. Our offline apps keep your records safe.</p>
          <Link href="/get-started" className="inline-block bg-secondary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-secondary-700/80 transition-colors">Start Protecting Your Jobs</Link>
        </div>
      </div>
    </div>
  )
}
