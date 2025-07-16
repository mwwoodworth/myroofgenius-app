import dynamic from 'next/dynamic'
import React, { ComponentType } from 'react'

// Skeleton loaders for dynamic imports
const Loading3D = () => React.createElement(
  'div',
  { className: 'h-64 w-full bg-gray-800/50 animate-pulse rounded-xl flex items-center justify-center' },
  React.createElement('p', { className: 'text-gray-400' }, 'Loading 3D view...')
)

const LoadingChart = () => React.createElement(
  'div',
  { className: 'h-64 w-full bg-gray-800/50 animate-pulse rounded-xl' }
)

const LoadingSpinner = () => React.createElement(
  'div',
  { className: 'flex items-center justify-center p-8' },
  React.createElement('div', { className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-primary' })
)

// Dynamic imports for heavy components
export const Dashboard3D = dynamic(() => import('@/components/Dashboard3D'), {
  loading: () => React.createElement(Loading3D),
  ssr: false
})

export const Hero3D = dynamic(() => import('@/components/ui/Hero3D'), {
  loading: () => React.createElement(Loading3D),
  ssr: false
})

export const EstimatorAR = dynamic(() => import('@/components/EstimatorAR'), {
  loading: () => React.createElement(Loading3D),
  ssr: false
})

export const AdminDashboard = dynamic(() => import('@/components/AdminDashboard'), {
  loading: () => React.createElement(LoadingSpinner),
  ssr: false
})

export const EmptyState = dynamic(() => import('@/components/EmptyState'), {
  loading: () => React.createElement('div', { className: 'text-center py-8 text-gray-400' }, 'Loading...'),
  ssr: false
})

export const AIRecommendationEngine = dynamic(
  () => import('@/components/marketplace/AIRecommendationEngine'),
  {
    loading: () => React.createElement('div', { className: 'text-center py-4 text-gray-400' }, 'Loading recommendations...'),
    ssr: false
  }
)

// For client components that need to check authentication
export const withDynamicAuth = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  LoadingComponent: ComponentType = LoadingSpinner
) => {
  return dynamic(importFunc, {
    loading: () => React.createElement(LoadingComponent),
    ssr: false
  })
}