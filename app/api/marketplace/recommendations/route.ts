import { NextRequest, NextResponse } from 'next/server'
import { MarketplaceRecommender } from '../../../../lib/ai/marketplace-recommender'
import { RecommendationContext } from '../../../../types/marketplace'

export async function POST(request: NextRequest) {
  try {
    const context: RecommendationContext = await request.json()
    const recommender = new MarketplaceRecommender()
    const [products, contractors] = await Promise.all([
      recommender.getProductRecommendations(context),
      recommender.getContractorRecommendations(context)
    ])
    return NextResponse.json({ products, contractors, generatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('Recommendation error:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}
