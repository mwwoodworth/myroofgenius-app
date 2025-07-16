'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useABTest } from '@/lib/ab-testing'
import { Button } from '@/design-system/components/Button'
import { 
  Calculator, 
  ChevronRight, 
  ChevronLeft, 
  Home,
  Ruler,
  DollarSign,
  FileText,
  Check
} from 'lucide-react'

interface CalculatorData {
  roofType: string
  dimensions: {
    length: number
    width: number
    pitch: number
  }
  materials: {
    shingles: string
    underlayment: string
    extras: string[]
  }
  location: {
    address: string
    zipCode: string
  }
}

// Control variant - Original calculator layout
export function CalculatorControl() {
  const { trackConversion } = useABTest('calculator_layout')
  const [data, setData] = useState<CalculatorData>({
    roofType: 'gable',
    dimensions: {
      length: 0,
      width: 0,
      pitch: 0
    },
    materials: {
      shingles: '',
      underlayment: '',
      extras: []
    },
    location: {
      address: '',
      zipCode: ''
    }
  })

  const handleCalculate = () => {
    trackConversion('calculator_complete', 1)
    // Calculate estimate logic here
  }

  return (
    <div className="bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Free Roofing Calculator
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Get an instant estimate for your roofing project
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roof Type
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => setData({...data, roofType: e.target.value})}
                >
                  <option value="">Select roof type</option>
                  <option value="gable">Gable</option>
                  <option value="hip">Hip</option>
                  <option value="shed">Shed</option>
                  <option value="gambrel">Gambrel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Length (feet)
                </label>
                <input
                  type="number"
                  placeholder="Enter length"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setData({
                    ...data, 
                    dimensions: {...data.dimensions, length: parseInt(e.target.value)}
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width (feet)
                </label>
                <input
                  type="number"
                  placeholder="Enter width"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setData({
                    ...data, 
                    dimensions: {...data.dimensions, width: parseInt(e.target.value)}
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roof Pitch
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => setData({
                    ...data, 
                    dimensions: {...data.dimensions, pitch: parseInt(e.target.value)}
                  })}
                >
                  <option value="">Select pitch</option>
                  <option value="4">4/12</option>
                  <option value="6">6/12</option>
                  <option value="8">8/12</option>
                  <option value="10">10/12</option>
                  <option value="12">12/12</option>
                </select>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shingle Type
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => setData({
                    ...data, 
                    materials: {...data.materials, shingles: e.target.value}
                  })}
                >
                  <option value="">Select shingles</option>
                  <option value="asphalt">Asphalt Shingles</option>
                  <option value="metal">Metal Roofing</option>
                  <option value="tile">Tile Roofing</option>
                  <option value="slate">Slate Roofing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Enter property address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setData({
                    ...data, 
                    location: {...data.location, address: e.target.value}
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  placeholder="Enter ZIP code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setData({
                    ...data, 
                    location: {...data.location, zipCode: e.target.value}
                  })}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Additional Services
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700">Gutters</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700">Chimney Work</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700">Skylights</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button 
              size="lg" 
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleCalculate}
            >
              <Calculator className="mr-2 h-5 w-5" />
              Calculate Estimate
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Wizard variant - Step-by-step calculator
export function CalculatorWizard() {
  const { trackConversion } = useABTest('calculator_layout')
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<CalculatorData>({
    roofType: 'gable',
    dimensions: {
      length: 0,
      width: 0,
      pitch: 0
    },
    materials: {
      shingles: '',
      underlayment: '',
      extras: []
    },
    location: {
      address: '',
      zipCode: ''
    }
  })

  const steps = [
    { number: 1, title: 'Property Info', icon: Home },
    { number: 2, title: 'Dimensions', icon: Ruler },
    { number: 3, title: 'Materials', icon: FileText },
    { number: 4, title: 'Estimate', icon: DollarSign },
  ]

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
      trackConversion('calculator_step_complete', currentStep)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    trackConversion('calculator_complete', 1)
    // Calculate estimate logic here
  }

  return (
    <div className="bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Free Roofing Calculator
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Get an instant estimate in 4 simple steps
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number

              return (
                <div key={step.number} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 
                    ${isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'border-gray-300 text-gray-400'
                    }
                  `}>
                    {isCompleted ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      Step {step.number}
                    </p>
                    <p className={`text-sm ${
                      isActive ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-24 h-0.5 mx-8 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-gray-50 rounded-xl p-8">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Property Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 text-center">
                  Tell us about your property
                </h3>
                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Address
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setData({
                        ...data, 
                        location: {...data.location, address: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      placeholder="Enter ZIP code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setData({
                        ...data, 
                        location: {...data.location, zipCode: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roof Type
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => setData({...data, roofType: e.target.value})}
                    >
                      <option value="">Select roof type</option>
                      <option value="gable">Gable</option>
                      <option value="hip">Hip</option>
                      <option value="shed">Shed</option>
                      <option value="gambrel">Gambrel</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Dimensions */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 text-center">
                  What are your roof dimensions?
                </h3>
                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Length (feet)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter length"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setData({
                        ...data, 
                        dimensions: {...data.dimensions, length: parseInt(e.target.value)}
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Width (feet)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter width"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setData({
                        ...data, 
                        dimensions: {...data.dimensions, width: parseInt(e.target.value)}
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roof Pitch
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => setData({
                        ...data, 
                        dimensions: {...data.dimensions, pitch: parseInt(e.target.value)}
                      })}
                    >
                      <option value="">Select pitch</option>
                      <option value="4">4/12 (Low slope)</option>
                      <option value="6">6/12 (Medium slope)</option>
                      <option value="8">8/12 (High slope)</option>
                      <option value="10">10/12 (Very high slope)</option>
                      <option value="12">12/12 (Steep slope)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Materials */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 text-center">
                  Choose your materials
                </h3>
                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shingle Type
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => setData({
                        ...data, 
                        materials: {...data.materials, shingles: e.target.value}
                      })}
                    >
                      <option value="">Select shingles</option>
                      <option value="asphalt">Asphalt Shingles ($)</option>
                      <option value="metal">Metal Roofing ($$)</option>
                      <option value="tile">Tile Roofing ($$$)</option>
                      <option value="slate">Slate Roofing ($$$$)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Services
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-gray-700">Gutters & Downspouts</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-gray-700">Chimney Work</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-gray-700">Skylights</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-gray-700">Insulation</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Estimate */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 text-center">
                  Your Roofing Estimate
                </h3>
                <div className="max-w-md mx-auto bg-white rounded-lg p-6 shadow-lg">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      $12,500 - $18,750
                    </div>
                    <p className="text-gray-600 mb-4">
                      Estimated project cost
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Materials:</span>
                        <span>$8,000 - $12,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Labor:</span>
                        <span>$4,000 - $6,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Permits:</span>
                        <span>$500 - $750</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Button 
                    size="lg" 
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleComplete}
                  >
                    Get Detailed Proposal
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="flex items-center bg-green-600 hover:bg-green-700 text-white"
              >
                Complete
                <Check className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Main calculator component that chooses variant
export function ABTestCalculator() {
  const { variant } = useABTest('calculator_layout')

  switch (variant) {
    case 'wizard':
      return <CalculatorWizard />
    default:
      return <CalculatorControl />
  }
}