'use client'

import React from 'react'
import { useABTest } from '@/lib/ab-testing'
import { Button } from '@/design-system/components/Button'
import { ChevronRight, Calculator, Calendar, Zap } from 'lucide-react'

interface CTAButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}

export function ABTestCTAButton({ variant = 'primary', size = 'md', className, onClick }: CTAButtonProps) {
  const { variant: ctaVariant, trackConversion } = useABTest('cta_button_text')

  const handleClick = () => {
    trackConversion('cta_click', 1)
    onClick?.()
  }

  const getButtonConfig = () => {
    switch (ctaVariant) {
      case 'try_free':
        return {
          text: 'Try Free',
          icon: <Zap className="ml-2 h-4 w-4" />,
          className: 'bg-green-600 hover:bg-green-700 text-white'
        }
      case 'start_estimate':
        return {
          text: 'Start Estimate',
          icon: <Calculator className="ml-2 h-4 w-4" />,
          className: 'bg-blue-600 hover:bg-blue-700 text-white'
        }
      case 'book_demo':
        return {
          text: 'Book Demo',
          icon: <Calendar className="ml-2 h-4 w-4" />,
          className: 'bg-purple-600 hover:bg-purple-700 text-white'
        }
      default: // control
        return {
          text: 'Get Started',
          icon: <ChevronRight className="ml-2 h-4 w-4" />,
          className: 'bg-blue-600 hover:bg-blue-700 text-white'
        }
    }
  }

  const config = getButtonConfig()

  return (
    <Button
      variant={variant}
      size={size}
      className={`${config.className} ${className}`}
      onClick={handleClick}
    >
      {config.text}
      {config.icon}
    </Button>
  )
}

// Specialized CTA components for different contexts
export function HeroCTAButton(props: Omit<CTAButtonProps, 'variant'>) {
  return <ABTestCTAButton variant="primary" size="lg" {...props} />
}

export function NavCTAButton(props: Omit<CTAButtonProps, 'variant' | 'size'>) {
  return <ABTestCTAButton variant="primary" size="sm" {...props} />
}

export function SectionCTAButton(props: CTAButtonProps) {
  return <ABTestCTAButton {...props} />
}

// CTA section with A/B testing
export function ABTestCTASection() {
  const { variant: ctaVariant, trackConversion } = useABTest('cta_button_text')

  const getSecondaryAction = () => {
    switch (ctaVariant) {
      case 'try_free':
        return { text: 'View Pricing', action: 'pricing_click' }
      case 'start_estimate':
        return { text: 'See Examples', action: 'examples_click' }
      case 'book_demo':
        return { text: 'Watch Video', action: 'video_click' }
      default:
        return { text: 'Learn More', action: 'learn_more_click' }
    }
  }

  const secondaryAction = getSecondaryAction()

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Ready to Transform Your Roofing Business?
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Join thousands of contractors who trust MyRoofGenius
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <ABTestCTAButton 
              size="lg"
              className="px-8 py-4 text-lg"
            />
            <Button
              variant="secondary"
              size="lg"
              className="px-8 py-4 text-lg"
              onClick={() => trackConversion(secondaryAction.action, 1)}
            >
              {secondaryAction.text}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Floating CTA for mobile
export function FloatingCTA() {
  const { variant: ctaVariant, trackConversion } = useABTest('cta_button_text')

  const getFloatingText = () => {
    switch (ctaVariant) {
      case 'try_free':
        return 'Try Free Now'
      case 'start_estimate':
        return 'Start Estimate'
      case 'book_demo':
        return 'Book Demo'
      default:
        return 'Get Started'
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold shadow-lg"
        onClick={() => trackConversion('floating_cta_click', 1)}
      >
        {getFloatingText()}
      </Button>
    </div>
  )
}

// Pricing page CTA with A/B testing
export function PricingCTA({ planName, planPrice }: { planName: string; planPrice: string }) {
  const { variant: ctaVariant, trackConversion } = useABTest('cta_button_text')

  const getPricingCTA = () => {
    switch (ctaVariant) {
      case 'try_free':
        return { text: 'Start Free Trial', color: 'bg-green-600 hover:bg-green-700' }
      case 'start_estimate':
        return { text: 'Start Estimating', color: 'bg-blue-600 hover:bg-blue-700' }
      case 'book_demo':
        return { text: 'Book Demo', color: 'bg-purple-600 hover:bg-purple-700' }
      default:
        return { text: 'Choose Plan', color: 'bg-blue-600 hover:bg-blue-700' }
    }
  }

  const config = getPricingCTA()

  return (
    <Button
      className={`w-full ${config.color} text-white py-3 font-semibold`}
      onClick={() => trackConversion('pricing_plan_click', parseFloat(planPrice))}
    >
      {config.text}
    </Button>
  )
}

// Exit intent CTA
export function ExitIntentCTA() {
  const { variant: ctaVariant, trackConversion } = useABTest('cta_button_text')

  const getExitIntentCTA = () => {
    switch (ctaVariant) {
      case 'try_free':
        return {
          headline: 'Wait! Try MyRoofGenius Free',
          subheadline: 'Start your free trial before you leave',
          buttonText: 'Start Free Trial',
          color: 'bg-green-600 hover:bg-green-700'
        }
      case 'start_estimate':
        return {
          headline: 'Before You Go...',
          subheadline: 'Create your first estimate in under 5 minutes',
          buttonText: 'Start Estimate',
          color: 'bg-blue-600 hover:bg-blue-700'
        }
      case 'book_demo':
        return {
          headline: 'See MyRoofGenius in Action',
          subheadline: 'Book a personalized demo before you leave',
          buttonText: 'Book Demo',
          color: 'bg-purple-600 hover:bg-purple-700'
        }
      default:
        return {
          headline: 'Don\'t Miss Out!',
          subheadline: 'Join thousands of successful contractors',
          buttonText: 'Get Started',
          color: 'bg-blue-600 hover:bg-blue-700'
        }
    }
  }

  const config = getExitIntentCTA()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {config.headline}
        </h3>
        <p className="text-gray-600 mb-6">
          {config.subheadline}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            className={`${config.color} text-white px-6 py-3 font-semibold`}
            onClick={() => trackConversion('exit_intent_cta_click', 1)}
          >
            {config.buttonText}
          </Button>
          <Button
            variant="secondary"
            onClick={() => trackConversion('exit_intent_close', 1)}
          >
            No Thanks
          </Button>
        </div>
      </div>
    </div>
  )
}