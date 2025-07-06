'use client'
import Link from 'next/link'

export default function GetStarted() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-8">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Start Your Free Trial</h1>
        <p className="text-lg text-slate-700 mb-6">Create your account to access professional roofing calculators and templates.</p>
        <Link href="/signup" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Create Account</Link>
        <p className="mt-4 text-sm text-slate-600">Already have an account? <Link href="/login" className="text-blue-600 underline">Sign in</Link></p>
      </div>
    </div>
  )
}
