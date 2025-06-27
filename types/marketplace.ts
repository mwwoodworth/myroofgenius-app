export interface Product {
  id: string
  name: string
  category: 'materials' | 'tools' | 'services'
  price: number
  rating: number
  compatibilityScore?: number
  aiRecommendationReason?: string
  vendor: {
    id: string
    name: string
    verified: boolean
  }
}

export interface Contractor {
  id: string
  businessName: string
  specialties: string[]
  rating: number
  completedProjects: number
  responseTime: string
  priceRange: '$' | '$$' | '$$$'
  aiMatchScore?: number
  aiMatchReasons?: string[]
}

export interface RecommendationContext {
  projectType?: string
  roofType?: string
  budget?: number
  timeline?: string
  location?: {
    lat: number
    lng: number
  }
  userHistory?: {
    viewedProducts: string[]
    savedContractors: string[]
  }
}
