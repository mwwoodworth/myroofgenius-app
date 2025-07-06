'use client'
import Link from 'next/link'

export default function CashFlow() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div className="max-w-2xl bg-white rounded-xl shadow p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Cash Flow Forecaster</h1>
        <p className="text-gray-600 mb-6">Predict payment schedules and spot cash crunches 30 days in advance.</p>
        <div className="space-y-2 mb-6 text-left">
          <p>✓ Payment schedule modeling</p>
          <p>✓ Weather delay impacts</p>
          <p>✓ Multi-project view</p>
        </div>
        <Link href="/signup" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Create Free Account</Link>
      </div>
    </div>
  )
}
