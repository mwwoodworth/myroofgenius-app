Sprint 06 — Marketplace & AI Recommendations
Objective
Transform the marketplace into an AI-powered recommendation engine that anticipates user needs and surfaces relevant products, services, and contractors based on project context, past behavior, and real-time analysis.
File Targets

pages/marketplace.tsx
components/marketplace/ProductCarousel.tsx (create)
components/marketplace/AIRecommendationEngine.tsx (create)
components/marketplace/ContractorCard.tsx (create)
lib/ai/marketplace-recommender.ts (create)
lib/analytics/user-behavior.ts (create)
app/api/marketplace/recommendations/route.ts (create)
types/marketplace.ts (create)

Step-by-Step Instructions
1. Create Marketplace Types
typescript// types/marketplace.ts
export interface Product {
  id: string;
  name: string;
  category: 'materials' | 'tools' | 'services';
  price: number;
  rating: number;
  compatibilityScore?: number;
  aiRecommendationReason?: string;
  vendor: {
    id: string;
    name: string;
    verified: boolean;
  };
}

export interface Contractor {
  id: string;
  businessName: string;
  specialties: string[];
  rating: number;
  completedProjects: number;
  responseTime: string;
  priceRange: '$' | '$$' | '$$$';
  aiMatchScore?: number;
  aiMatchReasons?: string[];
}

export interface RecommendationContext {
  projectType?: string;
  roofType?: string;
  budget?: number;
  timeline?: string;
  location?: {
    lat: number;
    lng: number;
  };
  userHistory?: {
    viewedProducts: string[];
    savedContractors: string[];
  };
}
2. Build AI Recommendation Engine
typescript// lib/ai/marketplace-recommender.ts
import { Product, Contractor, RecommendationContext } from '@/types/marketplace';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class MarketplaceRecommender {
  async getProductRecommendations(
    context: RecommendationContext,
    limit: number = 12
  ): Promise<Product[]> {
    // Generate embeddings for context
    const contextEmbedding = await this.generateContextEmbedding(context);
    
    // Query vector database for similar products
    const products = await this.queryProductVectors(contextEmbedding, limit);
    
    // Enhance with AI reasoning
    const enhancedProducts = await this.enhanceWithAIReasoning(products, context);
    
    return enhancedProducts;
  }

  async getContractorRecommendations(
    context: RecommendationContext,
    limit: number = 6
  ): Promise<Contractor[]> {
    const prompt = `
      Given this project context:
      - Project Type: ${context.projectType}
      - Roof Type: ${context.roofType}
      - Budget: ${context.budget}
      - Timeline: ${context.timeline}
      - Location: ${context.location?.lat}, ${context.location?.lng}
      
      Score and rank contractors based on:
      1. Specialty match
      2. Geographic proximity
      3. Budget alignment
      4. Availability
      5. Past performance
      
      Return top ${limit} contractor IDs with match scores and reasons.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    // Process and return contractor recommendations
    return this.processContractorRecommendations(response);
  }

  private async generateContextEmbedding(context: RecommendationContext) {
    // Implementation for generating embeddings
  }

  private async queryProductVectors(embedding: number[], limit: number) {
    // Vector similarity search implementation
  }

  private async enhanceWithAIReasoning(products: Product[], context: RecommendationContext) {
    // Add AI-generated reasons for recommendations
  }
}
3. Create Product Carousel Component
tsx// components/marketplace/ProductCarousel.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Product } from '@/types/marketplace';
import GlassPanel from '@/components/ui/GlassPanel';
import { Sparkles, TrendingUp, Shield } from 'lucide-react';

interface ProductCarouselProps {
  products: Product[];
  isLoading?: boolean;
  title?: string;
}

export default function ProductCarousel({ 
  products, 
  isLoading, 
  title = "AI-Recommended Products" 
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay || products.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [autoPlay, products.length]);

  return (
    <div className="relative w-full" onMouseEnter={() => setAutoPlay(false)} onMouseLeave={() => setAutoPlay(true)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-500" />
          {title}
        </h2>
        <div className="flex gap-2">
          {products.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex ? 'bg-blue-500 w-8' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative h-96 overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="glass-panel-loading w-full h-full" />
            </motion.div>
          ) : (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <GlassPanel className="h-full p-6 glass-hover-glow">
                <ProductCard product={products[currentIndex]} />
              </GlassPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 glass-button p-3 rounded-full"
      >
        ←
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % products.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 glass-button p-3 rounded-full"
      >
        →
      </button>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">{product.name}</h3>
          {product.compatibilityScore && (
            <div className="flex items-center gap-1 text-green-500">
              <Shield className="w-4 h-4" />
              <span className="text-sm">{product.compatibilityScore}% Match</span>
            </div>
          )}
        </div>
        
        <p className="text-3xl font-bold mb-4">${product.price.toLocaleString()}</p>
        
        {product.aiRecommendationReason && (
          <div className="bg-blue-500/10 rounded-lg p-4 mb-4">
            <p className="text-sm flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-500 mt-0.5" />
              {product.aiRecommendationReason}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">by</span>
            <span className="font-medium">{product.vendor.name}</span>
            {product.vendor.verified && (
              <Shield className="w-4 h-4 text-green-500" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span className="text-sm">{product.rating}/5</span>
          </div>
        </div>
      </div>

      <button className="w-full mt-6 glass-button-primary py-3 rounded-lg font-medium">
        View Details
      </button>
    </div>
  );
}
4. Create API Route for Recommendations
typescript// app/api/marketplace/recommendations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MarketplaceRecommender } from '@/lib/ai/marketplace-recommender';
import { RecommendationContext } from '@/types/marketplace';

export async function POST(request: NextRequest) {
  try {
    const context: RecommendationContext = await request.json();
    const recommender = new MarketplaceRecommender();

    const [products, contractors] = await Promise.all([
      recommender.getProductRecommendations(context),
      recommender.getContractorRecommendations(context)
    ]);

    return NextResponse.json({
      products,
      contractors,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
5. Update Marketplace Page
tsx// pages/marketplace.tsx
import { useState, useEffect } from 'react';
import ProductCarousel from '@/components/marketplace/ProductCarousel';
import ContractorGrid from '@/components/marketplace/ContractorGrid';
import { useProjectContext } from '@/hooks/useProjectContext';
import GlassPanel from '@/components/ui/GlassPanel';
import { Sparkles, Filter, MapPin } from 'lucide-react';

export default function Marketplace() {
  const { projectContext } = useProjectContext();
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [projectContext]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/marketplace/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectContext)
      });
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            AI-Powered Marketplace
          </h1>
          <p className="text-xl text-gray-300">
            Smart recommendations based on your project needs
          </p>
        </div>

        {/* Context Bar */}
        <GlassPanel className="mb-8 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>{projectContext?.location?.city || 'Set Location'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-green-500" />
                <span>{projectContext?.projectType || 'All Projects'}</span>
              </div>
            </div>
            <button className="glass-button px-4 py-2 rounded-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Refine Recommendations
            </button>
          </div>
        </GlassPanel>

        {/* Product Carousel */}
        <div className="mb-12">
          <ProductCarousel 
            products={recommendations?.products || []} 
            isLoading={isLoading}
          />
        </div>

        {/* Contractor Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-500" />
            Verified Contractors Near You
          </h2>
          <ContractorGrid 
            contractors={recommendations?.contractors || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
Commit Message
feat(marketplace): implemented AI-powered product recommendations and contractor matching with glassmorphic carousel
QA/Acceptance Checklist

 Product carousel auto-rotates with smooth transitions
 AI recommendations update based on project context
 Glassmorphism effects work on all marketplace cards
 Loading states display during recommendation fetching
 Mobile responsive carousel with touch gestures
 Contractor cards show AI match scores and reasons
 All marketplace components pass accessibility audit

AI Execution Block
Codex/Operator Instructions:

Execute all code implementations in exact order provided
Ensure all TypeScript types are properly imported
Set up vector database for product embeddings (Pinecone or similar)
Test recommendation API with various project contexts
Verify carousel animations are smooth on all devices
Deploy and confirm live marketplace shows AI recommendations

Advanced/Optional Enhancements

Add real-time pricing updates via WebSocket
Implement saved searches and recommendation history
Create vendor dashboard for product management
Add AR preview for applicable products
Implement social proof with real-time purchase notifications