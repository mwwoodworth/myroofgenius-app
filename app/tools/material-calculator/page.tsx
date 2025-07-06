'use client'
import Link from 'next/link'
import Image from 'next/image'

export default function MaterialCalculator() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div className="max-w-2xl bg-white rounded-xl shadow p-8 text-center">
        <Image
          src="https://images.unsplash.com/photo-1581093458791-9c2ca846fb74?w=800&h=450&fit=crop"
          alt="Material calculator screenshot"
          width={800}
          height={450}
          className="rounded-lg mb-6"
        />
        <h1 className="text-3xl font-bold mb-4">Material Calculator Pro</h1>
        <p className="text-gray-600 mb-6">Upload your roof measurements and get precise material lists with waste factors applied.</p>
        <div className="space-y-2 mb-6 text-left">
          <p>✓ Waste factor calculations</p>
          <p>✓ Bundle conversions</p>
          <p>✓ Price volatility warnings</p>
        </div>
        <Link href="/signup" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Create Free Account</Link>
      </div>
    </div>
  )
}
