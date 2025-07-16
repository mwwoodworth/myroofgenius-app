'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/design-system/components/Button'
import { Card } from '@/design-system/components/Card'
import { Progress } from '@/design-system/components/Progress'
import { useHapticFeedback } from '@/design-system/components/hooks/useHapticFeedback'
import { 
  User, 
  Building, 
  Calculator, 
  Smartphone, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  X
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  content: React.ReactNode
  optional?: boolean
}

interface OnboardingFlowProps {
  onComplete: () => void
  onSkip: () => void
}

export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [userData, setUserData] = useState({
    name: '',
    company: '',
    role: '',
    experience: '',
    interests: [] as string[],
    notifications: true,
  })
  
  const { trigger } = useHapticFeedback()

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to MyRoofGenius',
      description: 'Let\'s get you set up with the most powerful roofing software',
      icon: CheckCircle,
      content: <WelcomeStep userData={userData} setUserData={setUserData} />,
    },
    {
      id: 'profile',
      title: 'Tell us about yourself',
      description: 'Help us customize your experience',
      icon: User,
      content: <ProfileStep userData={userData} setUserData={setUserData} />,
    },
    {
      id: 'company',
      title: 'Company Information',
      description: 'Set up your company profile',
      icon: Building,
      content: <CompanyStep userData={userData} setUserData={setUserData} />,
      optional: true,
    },
    {
      id: 'tools',
      title: 'Choose Your Tools',
      description: 'Select the tools most relevant to your work',
      icon: Calculator,
      content: <ToolsStep userData={userData} setUserData={setUserData} />,
    },
    {
      id: 'mobile',
      title: 'Mobile Setup',
      description: 'Optimize for field work',
      icon: Smartphone,
      content: <MobileStep userData={userData} setUserData={setUserData} />,
      optional: true,
    },
  ]

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps([...completedSteps, currentStepData.id])
      setCurrentStep(currentStep + 1)
      trigger('light')
    } else {
      onComplete()
      trigger('success')
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      trigger('light')
    }
  }

  const skipStep = () => {
    if (currentStepData.optional) {
      nextStep()
    } else {
      onSkip()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl"
      >
        <Card variant="glass" className="relative">
          {/* Close Button */}
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Skip onboarding"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm text-gray-400">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <currentStepData.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {currentStepData.title}
                  </h2>
                  <p className="text-gray-400">
                    {currentStepData.description}
                  </p>
                </div>
              </div>

              <div className="min-h-[200px]">
                {currentStepData.content}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStepData.optional && (
                <Button
                  variant="ghost"
                  onClick={skipStep}
                >
                  Skip
                </Button>
              )}
              
              <Button
                variant="primary"
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

// Step Components
function WelcomeStep({ userData, setUserData }: any) {
  return (
    <div className="text-center space-y-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center"
      >
        <CheckCircle className="w-10 h-10 text-white" />
      </motion.div>
      
      <h3 className="text-lg font-semibold text-white">
        Welcome to the future of roofing software
      </h3>
      
      <p className="text-gray-400 max-w-md mx-auto">
        MyRoofGenius combines AI-powered tools, mobile optimization, and comprehensive project management to streamline your roofing business.
      </p>
      
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <h4 className="font-medium text-white mb-2">AI-Powered</h4>
          <p className="text-sm text-gray-400">Smart calculations and recommendations</p>
        </div>
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <h4 className="font-medium text-white mb-2">Mobile-First</h4>
          <p className="text-sm text-gray-400">Perfect for field work</p>
        </div>
      </div>
    </div>
  )
}

function ProfileStep({ userData, setUserData }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Your Name
        </label>
        <input
          type="text"
          value={userData.name}
          onChange={(e) => setUserData({ ...userData, name: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter your full name"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Your Role
        </label>
        <select
          value={userData.role}
          onChange={(e) => setUserData({ ...userData, role: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select your role</option>
          <option value="contractor">Contractor</option>
          <option value="estimator">Estimator</option>
          <option value="project-manager">Project Manager</option>
          <option value="business-owner">Business Owner</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Experience Level
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['Beginner', 'Intermediate', 'Expert'].map((level) => (
            <button
              key={level}
              onClick={() => setUserData({ ...userData, experience: level })}
              className={`p-2 rounded-lg border transition-colors ${
                userData.experience === level
                  ? 'border-primary bg-primary/20 text-primary'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function CompanyStep({ userData, setUserData }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Company Name
        </label>
        <input
          type="text"
          value={userData.company}
          onChange={(e) => setUserData({ ...userData, company: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter your company name"
        />
      </div>
      
      <p className="text-sm text-gray-400">
        This helps us customize invoices, reports, and branding for your business.
      </p>
    </div>
  )
}

function ToolsStep({ userData, setUserData }: any) {
  const tools = [
    { id: 'estimator', name: 'Cost Estimator', description: 'Calculate project costs' },
    { id: 'calculator', name: 'Material Calculator', description: 'Determine material needs' },
    { id: 'analyzer', name: 'Photo Analyzer', description: 'AI-powered damage detection' },
    { id: 'templates', name: 'Report Templates', description: 'Professional reports' },
    { id: 'mobile', name: 'Mobile Tools', description: 'Field-ready apps' },
    { id: 'marketplace', name: 'Marketplace', description: 'Browse tools and templates' },
  ]

  const toggleTool = (toolId: string) => {
    const interests = userData.interests.includes(toolId)
      ? userData.interests.filter((id: string) => id !== toolId)
      : [...userData.interests, toolId]
    setUserData({ ...userData, interests })
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-400">
        Select the tools you're most interested in. You can always change this later.
      </p>
      
      <div className="grid grid-cols-2 gap-3">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => toggleTool(tool.id)}
            className={`p-3 rounded-lg border text-left transition-colors ${
              userData.interests.includes(tool.id)
                ? 'border-primary bg-primary/20 text-primary'
                : 'border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            <div className="font-medium">{tool.name}</div>
            <div className="text-sm opacity-80">{tool.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function MobileStep({ userData, setUserData }: any) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <Smartphone className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Mobile Optimization
        </h3>
        <p className="text-gray-400">
          Install MyRoofGenius as a mobile app for the best field experience
        </p>
      </div>
      
      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={userData.notifications}
            onChange={(e) => setUserData({ ...userData, notifications: e.target.checked })}
            className="w-4 h-4 text-primary bg-gray-800 border-gray-700 rounded focus:ring-primary"
          />
          <span className="text-white">Enable push notifications</span>
        </label>
        
        <p className="text-sm text-gray-400 ml-7">
          Get notified about project updates, weather alerts, and important reminders
        </p>
      </div>
    </div>
  )
}