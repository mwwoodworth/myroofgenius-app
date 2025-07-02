'use client'
import { Calculator, FileSpreadsheet, Layers, TrendingUp, DollarSign, Clock } from 'lucide-react'
import Link from 'next/link'

export default function ToolsPage() {
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Professional Tools That Protect Your Business
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Every calculation here was built from hard lessons. These aren't just tools – 
            they're protection against the mistakes that sink projects.
          </p>
        </div>

        {/* Tools by Category */}
        {tools.map((category, idx) => (
          <div key={idx} className="mb-16">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">{category.category}</h2>
              <p className="text-lg text-slate-600">{category.description}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {category.tools.map((tool, toolIdx) => (
                <ToolCard key={toolIdx} {...tool} />
              ))}
            </div>
          </div>
        ))}

        {/* Integration Section */}
        <div className="bg-blue-50 rounded-2xl p-8 mt-16">
          <h2 className="text-2xl font-bold mb-4">All Tools Work Together</h2>
          <p className="text-slate-700 mb-6">
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
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
          {saveTime}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-2">{name}</h3>
      <p className="text-slate-600 mb-4">{description}</p>
      <ul className="space-y-2 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center text-sm text-slate-700">
            <span className="text-green-500 mr-2">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <Link href={link} className="block text-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
        Open Tool →
      </Link>
    </div>
  )
}

function IntegrationBadge({ name }) {
  return (
    <span className="inline-flex items-center px-4 py-2 bg-white rounded-lg text-slate-700 font-medium">
      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
      {name}
    </span>
  )
}
