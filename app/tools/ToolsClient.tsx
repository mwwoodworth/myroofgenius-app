'use client'
import { Calculator, TrendingUp, DollarSign, Clock, Camera } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Card from '@/components/ui/Card'

export default function ToolsClient() {
  const tools = [
    {
      category: 'Estimation Tools',
      description: 'Precision calculations that protect your margins',
      tools: [
        {
          name: 'Material Calculator Pro',
          description: 'Never under-order or over-spend on materials again',
          features: ['Waste factor calculations', 'Bundle conversion', 'Price volatility warnings'],
          link: '/tools/material-calculator',
          icon: <Calculator className="w-6 h-6" />,
          saveTime: 'Saves 45 min/estimate'
        },
        {
          name: 'Labor Hour Estimator',
          description: 'Accurate crew sizing based on real productivity data',
          features: ['Weather impact factors', 'Crew skill adjustments', 'Overtime calculations'],
          link: '/tools/labor-estimator',
          icon: <Clock className="w-6 h-6" />,
          saveTime: 'Prevents 2-3 day overruns'
        },
        {
          name: 'Photo Analyzer',
          description: 'Instant roof insights from a single photo',
          features: ['Damage detection', 'Pitch calculation', 'Material ID'],
          link: '/tools/photo-analyzer',
          icon: <Camera className="w-6 h-6" />,
          saveTime: 'Get results in seconds'
        }
      ]
    },
    {
      category: 'Financial Protection',
      description: 'Tools that guard your cash flow and margins',
      tools: [
        {
          name: 'Cash Flow Forecaster',
          description: 'See problems 30 days before they hurt',
          features: ['Payment schedule modeling', 'Weather delay impacts', 'Multi-project view'],
          link: '/tools/cash-flow',
          icon: <DollarSign className="w-6 h-6" />,
          saveTime: 'Prevents cash crunches'
        },
        {
          name: 'Change Order Calculator',
          description: 'Price changes fairly while protecting margins',
          features: ['Automatic markup scaling', 'Cumulative impact tracking', 'Client-ready reports'],
          link: '/tools/change-orders',
          icon: <TrendingUp className="w-6 h-6" />,
          saveTime: 'Recovers 8-12% margin'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Professional Tools That Protect Your Business
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Every calculation here was built from hard lessons. These aren&apos;t just tools –
            they&apos;re protection against the mistakes that sink projects.
          </p>
        </div>

        {/* Tools by Category */}
        {tools.map((category, idx) => (
          <div key={idx} className="mb-16">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-3">{category.category}</h2>
              <p className="text-lg text-text-secondary">{category.description}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {category.tools.map((tool, toolIdx) => (
                <ToolCard key={toolIdx} {...tool} />
              ))}
            </div>
          </div>
        ))}

        {/* Integration Section */}
        <div className="bg-secondary/5 rounded-2xl p-8 mt-16">
          <h2 className="text-2xl font-bold mb-4">All Tools Work Together</h2>
          <p className="text-slate-200 mb-6">
            Your calculations flow seamlessly between tools. Estimate materials,
            calculate labor, then see the cash flow impact – all connected, all protected.
          </p>
          <div className="flex flex-wrap gap-4">
            <IntegrationBadge name="Excel Export" />
            <IntegrationBadge name="PDF Reports" />
            <IntegrationBadge name="QuickBooks Sync" />
            <IntegrationBadge name="Mobile Access" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ToolCard({ name, description, features, link, icon, saveTime }) {
  return (
    <Card
      glass
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-cloud-100/30 dark:bg-slate-700/30 backdrop-blur-lg shadow-xl border border-white/20 p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-secondary-700/10 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm font-semibold text-accent-emerald bg-accent-emerald/5 px-3 py-1 rounded-full">
          {saveTime}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-2">{name}</h3>
      <p className="text-text-secondary mb-4">{description}</p>
      <ul className="space-y-2 mb-6">
        {features.map((feature, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center text-sm text-slate-200"
          >
            <span className="text-accent-emerald mr-2">✓</span>
            {feature}
          </motion.li>
        ))}
      </ul>
      <Link href={link} className="block text-center py-2 px-4 bg-secondary-700 text-white rounded-lg hover:bg-secondary-700/80 transition-colors font-semibold">
        Open Tool →
      </Link>
    </Card>
  )
}

function IntegrationBadge({ name }) {
  return (
    <span className="inline-flex items-center px-4 py-2 bg-cloud-100/10 backdrop-blur-lg rounded-lg text-slate-200 font-medium">
      <span className="w-2 h-2 bg-accent-emerald/50 rounded-full mr-2"></span>
      {name}
    </span>
  )
}
