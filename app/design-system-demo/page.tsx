'use client'

import { useState } from 'react'
import { Button } from '@/design-system/components/Button'
import { Card } from '@/design-system/components/Card'
import { Progress } from '@/design-system/components/Progress'
import { useToast } from '@/design-system/components/Toast'
import { useHapticFeedback } from '@/design-system/components/hooks/useHapticFeedback'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import { 
  Sparkles, 
  Zap, 
  Heart, 
  Star, 
  Rocket,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info
} from 'lucide-react'

export default function DesignSystemDemo() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [progress, setProgress] = useState(65)
  const { addToast } = useToast()
  const { trigger, isSupported } = useHapticFeedback()

  const showToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    const toasts = {
      success: {
        type: 'success' as const,
        title: 'Success!',
        description: 'Your action was completed successfully.',
        action: {
          label: 'View Details',
          onClick: () => console.log('View details clicked'),
        },
      },
      error: {
        type: 'error' as const,
        title: 'Error occurred',
        description: 'Something went wrong. Please try again.',
      },
      warning: {
        type: 'warning' as const,
        title: 'Warning',
        description: 'Please check your input and try again.',
      },
      info: {
        type: 'info' as const,
        title: 'Information',
        description: 'Here\'s some helpful information for you.',
      },
    }

    addToast(toasts[type])
    trigger(type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'success')
  }

  const testHaptic = (pattern: 'light' | 'medium' | 'heavy') => {
    trigger(pattern)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          MyRoofGenius Design System
        </h1>
        <p className="text-gray-400 text-lg">
          Interactive components with microinteractions and accessibility features
        </p>
      </div>

      <div className="grid gap-8">
        {/* Button Variants */}
        <Card variant="glass">
          <h2 className="text-2xl font-semibold text-white mb-6">Button Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="primary" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Primary
            </Button>
            <Button variant="secondary" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Secondary
            </Button>
            <Button variant="ghost" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Ghost
            </Button>
            <Button variant="destructive" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Destructive
            </Button>
            <Button variant="glass" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Glass
            </Button>
            <Button variant="primary" loading>
              Loading...
            </Button>
          </div>
        </Card>

        {/* Button Sizes */}
        <Card variant="default">
          <h2 className="text-2xl font-semibold text-white mb-6">Button Sizes</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button size="sm" variant="primary">Small</Button>
            <Button size="md" variant="primary">Medium</Button>
            <Button size="lg" variant="primary">Large</Button>
          </div>
        </Card>

        {/* Card Variants */}
        <Card variant="glass">
          <h2 className="text-2xl font-semibold text-white mb-6">Card Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card variant="default">
              <h3 className="font-semibold text-white mb-2">Default Card</h3>
              <p className="text-gray-400">Standard card with dark background</p>
            </Card>
            <Card variant="glass">
              <h3 className="font-semibold text-white mb-2">Glass Card</h3>
              <p className="text-gray-400">Transparent card with backdrop blur</p>
            </Card>
            <Card variant="interactive" hover>
              <h3 className="font-semibold text-white mb-2">Interactive Card</h3>
              <p className="text-gray-400">Hover me for interaction effects</p>
            </Card>
            <Card variant="elevated">
              <h3 className="font-semibold text-white mb-2">Elevated Card</h3>
              <p className="text-gray-400">Card with enhanced shadow</p>
            </Card>
          </div>
        </Card>

        {/* Progress Components */}
        <Card variant="default">
          <h2 className="text-2xl font-semibold text-white mb-6">Progress Indicators</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Progress
              </label>
              <Progress value={progress} showValue animated />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Material Calculator
              </label>
              <Progress value={85} className="h-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estimate Complete
              </label>
              <Progress value={42} className="h-1" />
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => setProgress(Math.max(0, progress - 10))}
              >
                Decrease
              </Button>
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => setProgress(Math.min(100, progress + 10))}
              >
                Increase
              </Button>
            </div>
          </div>
        </Card>

        {/* Toast Notifications */}
        <Card variant="glass">
          <h2 className="text-2xl font-semibold text-white mb-6">Toast Notifications</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="secondary" 
              onClick={() => showToast('success')}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Success
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => showToast('error')}
              className="flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Error
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => showToast('warning')}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Warning
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => showToast('info')}
              className="flex items-center gap-2"
            >
              <Info className="w-4 h-4" />
              Info
            </Button>
          </div>
        </Card>

        {/* Haptic Feedback */}
        {isSupported && (
          <Card variant="default">
            <h2 className="text-2xl font-semibold text-white mb-6">Haptic Feedback</h2>
            <div className="grid grid-cols-3 gap-4">
              <Button 
                variant="ghost" 
                onClick={() => testHaptic('light')}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Light
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => testHaptic('medium')}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Medium
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => testHaptic('heavy')}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Heavy
              </Button>
            </div>
          </Card>
        )}

        {/* Onboarding Flow */}
        <Card variant="elevated">
          <h2 className="text-2xl font-semibold text-white mb-6">Onboarding Flow</h2>
          <div className="text-center">
            <p className="text-gray-400 mb-6">
              Experience the multi-step onboarding process with progress tracking and animations
            </p>
            <Button 
              variant="primary" 
              onClick={() => setShowOnboarding(true)}
              className="flex items-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              Start Onboarding
            </Button>
          </div>
        </Card>

        {/* Accessibility Note */}
        <Card variant="glass">
          <h2 className="text-2xl font-semibold text-white mb-4">Accessibility Features</h2>
          <div className="space-y-4 text-gray-300">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Floating Accessibility Panel:</strong> Click the settings icon in the bottom-right corner to access theme switching, reduced motion, and other accessibility options.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Haptic Feedback:</strong> All interactive elements provide tactile feedback on supported devices.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Focus Management:</strong> All components have proper focus indicators and keyboard navigation.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Reduced Motion:</strong> Animations respect user's motion preferences.
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingFlow
          onComplete={() => {
            setShowOnboarding(false)
            addToast({
              type: 'success',
              title: 'Welcome to MyRoofGenius!',
              description: 'You\'re all set up and ready to start building.',
            })
          }}
          onSkip={() => setShowOnboarding(false)}
        />
      )}
    </div>
  )
}