import Link from 'next/link'
import { Shield, ArrowRight, Play, CheckCircle } from 'lucide-react'
import { useLocale } from '../src/context/LocaleContext'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const { messages } = useLocale();
  return (
    <section className="relative overflow-hidden bg-slate-900 py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
      <div className="container relative mx-auto px-4 max-w-6xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium text-white">Protecting 12,847 roofing professionals daily</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {messages.home.titleStart}
            <span className="text-blue-400"> {messages.home.titleEmphasis}</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            When you're estimating a $2M project or managing crews across three sites,
            you need more than software. You need a system that catches mistakes before
            they cost you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/get-started" className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors">
              {messages.home.startTrial}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/demo" className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold text-lg hover:bg-white/20 transition-colors">
              <Play className="mr-2 w-5 h-5" />
              {messages.home.watchDemo}
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap gap-8">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-slate-300">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-slate-300">$2.3B Projects Protected</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-slate-300">99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
