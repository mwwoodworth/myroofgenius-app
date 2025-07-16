'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { abTesting, ABTestConfig } from '@/lib/ab-testing'
import { Button } from '@/design-system/components/Button'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  Target, 
  Eye,
  RotateCcw,
  Play,
  Pause,
  Settings
} from 'lucide-react'

interface TestStats {
  testName: string
  totalParticipants: number
  conversionRate: number
  variants: Array<{
    name: string
    participants: number
    conversions: number
    conversionRate: number
    color: string
  }>
  isSignificant: boolean
  confidenceLevel: number
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export function ABTestDashboard() {
  const [activeTests, setActiveTests] = useState<ABTestConfig[]>([])
  const [testStats, setTestStats] = useState<TestStats[]>([])
  const [selectedTest, setSelectedTest] = useState<string>('')

  useEffect(() => {
    // Load active tests
    const tests = abTesting.getActiveTests()
    setActiveTests(tests)
    
    // Generate mock stats for demonstration
    const mockStats: TestStats[] = tests.map(test => ({
      testName: test.name,
      totalParticipants: Math.floor(Math.random() * 1000) + 500,
      conversionRate: Math.random() * 0.3 + 0.1,
      variants: test.variants.map((variant, index) => ({
        name: variant.name,
        participants: Math.floor(Math.random() * 300) + 100,
        conversions: Math.floor(Math.random() * 50) + 10,
        conversionRate: Math.random() * 0.3 + 0.1,
        color: COLORS[index % COLORS.length]
      })),
      isSignificant: Math.random() > 0.5,
      confidenceLevel: Math.random() * 20 + 80
    }))
    
    setTestStats(mockStats)
  }, [])

  const handleToggleTest = (testName: string) => {
    // Toggle test active/inactive
    console.log(`Toggling test: ${testName}`)
  }

  const handleResetTest = (testName: string) => {
    // Reset test data
    console.log(`Resetting test: ${testName}`)
  }

  const handleForceVariant = (testName: string, variant: string) => {
    abTesting.forceVariant(testName, variant)
  }

  const selectedTestStats = testStats.find(stat => stat.testName === selectedTest)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">A/B Testing Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor and manage your A/B tests</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 shadow-lg"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Tests</p>
                <p className="text-2xl font-bold text-gray-900">{activeTests.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-6 shadow-lg"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900">
                  {testStats.reduce((sum, stat) => sum + stat.totalParticipants, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-6 shadow-lg"
          >
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {((testStats.reduce((sum, stat) => sum + stat.conversionRate, 0) / testStats.length) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg p-6 shadow-lg"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Significant Tests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {testStats.filter(stat => stat.isSignificant).length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Test List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Test Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Tests</h3>
              <div className="space-y-4">
                {activeTests.map((test) => {
                  const stats = testStats.find(s => s.testName === test.name)
                  const isSelected = selectedTest === test.name
                  
                  return (
                    <div
                      key={test.name}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTest(test.name)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{test.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                          {stats && (
                            <div className="mt-2 flex items-center space-x-4 text-sm">
                              <span className="text-gray-600">
                                {stats.totalParticipants} participants
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                stats.isSignificant 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {stats.isSignificant ? 'Significant' : 'Not Significant'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleTest(test.name)
                            }}
                          >
                            {test.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleResetTest(test.name)
                            }}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Test Details */}
          <div className="lg:col-span-2">
            {selectedTestStats ? (
              <div className="space-y-6">
                {/* Test Overview */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedTestStats.testName}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedTestStats.isSignificant 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedTestStats.confidenceLevel.toFixed(1)}% Confidence
                      </span>
                      <Button variant="secondary" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedTestStats.totalParticipants.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Total Participants</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {(selectedTestStats.conversionRate * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">Overall Conversion</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedTestStats.variants.length}
                      </p>
                      <p className="text-sm text-gray-600">Variants</p>
                    </div>
                  </div>

                  {/* Variant Performance */}
                  <div className="space-y-4">
                    {selectedTestStats.variants.map((variant, index) => (
                      <div key={variant.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: variant.color }}
                          />
                          <div>
                            <p className="font-medium text-gray-900">{variant.name}</p>
                            <p className="text-sm text-gray-600">
                              {variant.participants} participants • {variant.conversions} conversions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {(variant.conversionRate * 100).toFixed(1)}%
                          </p>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleForceVariant(selectedTestStats.testName, variant.name)}
                          >
                            Force
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Conversion Rate Chart */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Conversion Rates
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={selectedTestStats.variants}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${((value as number) * 100).toFixed(1)}%`} />
                        <Bar dataKey="conversionRate" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Participant Distribution */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Participant Distribution
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={selectedTestStats.variants}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="participants"
                        >
                          {selectedTestStats.variants.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Test
                </h3>
                <p className="text-gray-600">
                  Choose an A/B test from the list to view detailed analytics
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Quick stats component for sidebar
export function ABTestQuickStats() {
  const [stats, setStats] = useState({
    activeTests: 0,
    totalParticipants: 0,
    avgConversionRate: 0,
    significantTests: 0
  })

  useEffect(() => {
    const tests = abTesting.getActiveTests()
    setStats({
      activeTests: tests.length,
      totalParticipants: Math.floor(Math.random() * 5000) + 2000,
      avgConversionRate: Math.random() * 0.2 + 0.1,
      significantTests: Math.floor(tests.length / 2)
    })
  }, [])

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">A/B Test Overview</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Active Tests:</span>
          <span className="font-medium">{stats.activeTests}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Participants:</span>
          <span className="font-medium">{stats.totalParticipants.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Avg Conversion:</span>
          <span className="font-medium">{(stats.avgConversionRate * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Significant:</span>
          <span className="font-medium">{stats.significantTests}</span>
        </div>
      </div>
    </div>
  )
}