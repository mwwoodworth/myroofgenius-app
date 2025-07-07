'use client'
import Link from 'next/link'
import Image from 'next/image'

export default function ChangeOrders() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div className="max-w-2xl bg-white rounded-xl shadow p-8 text-center">
        <Image
          src="https://images.unsplash.com/photo-1581092613290-7e876675c352?w=800&h=450&fit=crop"
          alt="Change order calculator screenshot"
          width={800}
          height={450}
          className="rounded-lg mb-6"
        />
        <h1 className="text-3xl font-bold mb-4">Change Order Calculator</h1>
        <p className="text-gray-600 mb-6">Price project changes fairly while protecting your margins.</p>
        <div className="space-y-2 mb-6 text-left">
          <p>✓ Automatic markup scaling</p>
          <p>✓ Cumulative impact tracking</p>
          <p>✓ Client-ready reports</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/demo" className="px-6 py-3 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 text-gray-800">Try Demo</Link>
          <Link href="/signup" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Create Free Account</Link>
        </div>
      </div>
    </div>
  )
}
