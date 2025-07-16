'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useABTest } from '@/lib/ab-testing'
import { Button } from '@/design-system/components/Button'
import { Check, X, Star, Zap, Shield, Users } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: 29,
    description: 'Perfect for small roofing contractors',
    features: [
      'Up to 50 estimates per month',
      'Basic proposal templates',
      'Email support',
      'Mobile app access',
      'Basic analytics',
    ],
    limitations: [
      'No API access',
      'Limited integrations',
      'Basic templates only',
    ],
    popular: false,
  },
  {
    name: 'Professional',
    price: 79,
    description: 'For growing roofing businesses',
    features: [
      'Unlimited estimates',
      'Advanced proposal templates',
      'Priority support',
      'Advanced analytics',
      'Team collaboration',
      'Custom branding',
      'API access',
      'CRM integration',
    ],
    limitations: [
      'Limited custom templates',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 199,
    description: 'For large roofing companies',
    features: [
      'Everything in Professional',
      'Custom templates',
      'White-label solution',
      'Dedicated support',
      'Advanced integrations',
      'Multi-location support',
      'Custom reporting',
      'Training sessions',
    ],
    limitations: [],
    popular: false,
  },
]

// Control variant - Original pricing layout
export function PricingControl() {
  const { trackConversion } = useABTest('pricing_page_layout')

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Choose the plan that's right for your business
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-2 text-gray-600">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                  onClick={() => trackConversion('plan_select', plan.price)}
                >
                  Choose {plan.name}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Feature comparison variant
export function PricingFeatureComparison() {
  const { trackConversion } = useABTest('pricing_page_layout')

  const features = [
    {
      name: 'Monthly Estimates',
      starter: '50',
      professional: 'Unlimited',
      enterprise: 'Unlimited',
    },
    {
      name: 'Proposal Templates',
      starter: 'Basic',
      professional: 'Advanced',
      enterprise: 'Custom',
    },
    {
      name: 'Support',
      starter: 'Email',
      professional: 'Priority',
      enterprise: 'Dedicated',
    },
    {
      name: 'Mobile App',
      starter: true,
      professional: true,
      enterprise: true,
    },
    {
      name: 'Analytics',
      starter: 'Basic',
      professional: 'Advanced',
      enterprise: 'Custom Reports',
    },
    {
      name: 'Team Collaboration',
      starter: false,
      professional: true,
      enterprise: true,
    },
    {
      name: 'Custom Branding',
      starter: false,
      professional: true,
      enterprise: true,
    },
    {
      name: 'API Access',
      starter: false,
      professional: true,
      enterprise: true,
    },
    {
      name: 'CRM Integration',
      starter: false,
      professional: true,
      enterprise: true,
    },
    {
      name: 'White-label',
      starter: false,
      professional: false,
      enterprise: true,
    },
    {
      name: 'Multi-location',
      starter: false,
      professional: false,
      enterprise: true,
    },
    {
      name: 'Training Sessions',
      starter: false,
      professional: false,
      enterprise: true,
    },
  ]

  const renderFeatureValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-green-500 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-gray-400 mx-auto" />
      )
    }
    return <span className="text-gray-900">{value}</span>
  }

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Compare Plans & Features
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Find the perfect plan for your roofing business
          </p>
        </div>

        {/* Plan headers */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900">Features</h3>
          </div>
          {plans.map((plan) => (
            <div key={plan.name} className="p-4 text-center">
              <div className={`rounded-lg p-6 ${
                plan.popular ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
              }`}>
                {plan.popular && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="mt-2 text-gray-600 text-sm">{plan.description}</p>
                <Button
                  className={`mt-4 w-full ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  } text-white`}
                  onClick={() => trackConversion('plan_select', plan.price)}
                >
                  Choose {plan.name}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Feature comparison table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {features.map((feature, index) => (
              <div key={feature.name} className="grid grid-cols-4 gap-4 p-4 hover:bg-gray-50">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">{feature.name}</span>
                </div>
                <div className="text-center">
                  {renderFeatureValue(feature.starter)}
                </div>
                <div className="text-center">
                  {renderFeatureValue(feature.professional)}
                </div>
                <div className="text-center">
                  {renderFeatureValue(feature.enterprise)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">30-Day Money Back</h4>
            <p className="text-gray-600">Not satisfied? Get a full refund within 30 days.</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">10,000+ Contractors</h4>
            <p className="text-gray-600">Join thousands of successful roofing professionals.</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Instant Setup</h4>
            <p className="text-gray-600">Start creating estimates in under 5 minutes.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main pricing component that chooses variant
export function ABTestPricing() {
  const { variant } = useABTest('pricing_page_layout')

  switch (variant) {
    case 'feature_comparison':
      return <PricingFeatureComparison />
    default:
      return <PricingControl />
  }
}