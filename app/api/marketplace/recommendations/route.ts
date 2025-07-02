import { NextRequest, NextResponse } from 'next/server';
import { MarketplaceRecommender } from '../../../../lib/ai/marketplace-recommender';
import { RecommendationContext } from '../../../../types/marketplace';

export async function POST(request: NextRequest) {
  try {
    const context: RecommendationContext = await request.json();
    const recommender = new MarketplaceRecommender();
    const [products, contractors] = await Promise.all([
      recommender.getProductRecommendations(context),
      recommender.getContractorRecommendations(context)
    ]);
    return NextResponse.json({ products, contractors, generatedAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    console.error(`[Recommendations] API error: ${message}`);
    return NextResponse.json({ error: 'Unable to complete request. Please refresh and try again.' }, { status: 500 });
  }
}
