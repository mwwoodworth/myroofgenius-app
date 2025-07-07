'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import ToolDemoModal from '../../../components/marketing/ToolDemoModal'

export default function LaborEstimator() {
  const [showDemo, setShowDemo] = useState(false)
  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div className="max-w-2xl bg-white rounded-xl shadow p-8 text-center">
        <Image
          src="https://images.unsplash.com/photo-1596075781084-bd077eef0722?w=800&h=450&fit=crop"
          alt="Labor estimator screenshot"
          width={800}
          height={450}
          className="rounded-lg mb-6"
        />
        <h1 className="text-3xl font-bold mb-4">Labor Hour Estimator</h1>
        <p className="text-gray-600 mb-6">Calculate accurate crew sizes based on real productivity data.</p>
        <div className="space-y-2 mb-6 text-left">
          <p>✓ Weather impact factors</p>
          <p>✓ Crew skill adjustments</p>
          <p>✓ Overtime calculations</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => setShowDemo(true)} className="px-6 py-3 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 text-gray-800">Try Demo</button>
          <Link href="/signup" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Create Free Account</Link>
        </div>
        <ToolDemoModal open={showDemo} onClose={() => setShowDemo(false)} title="Labor Hour Estimator" />
      </div>
    </div>
  )
}
