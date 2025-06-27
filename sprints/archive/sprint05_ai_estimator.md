# Sprint 05 — AI Estimator Implementation

## Objective
Deploy an AI-powered estimation system that protects contractors from the three profit killers: underbidding (leaving money on the table), overbidding (losing the job), and scope creep (doing work for free). This isn't a calculator with AI branding — it's a protective intelligence system that catches the hidden costs experienced estimators miss 15% of the time.

## Why This Matters
The difference between a 15% margin and a 5% loss often comes down to a single overlooked line item. A missed valley that needs lead-coated copper. An access issue requiring a crane. A substrate condition that doubles tear-off time. The AI Estimator doesn't just calculate — it protects your margins by thinking like a 30-year veteran who's seen every surprise a roof can hide.

## What This Protects
- **Contractors** from margin erosion through missed scope items
- **Estimators** from reputation damage due to major misses
- **Sales teams** from quoting prices they can't deliver on
- **Customers** from surprise change orders and budget overruns
- **Operations** from unprofitable jobs that drain resources

## File Targets
- `components/estimator/AIEstimator.tsx` (new)
- `components/estimator/PhotoAnalyzer.tsx` (new)
- `components/estimator/CostBreakdown.tsx` (new)
- `components/estimator/RiskAssessment.tsx` (new)
- `lib/ai/estimation-engine.ts` (new)
- `lib/ai/vision-analyzer.ts` (new)
- `lib/ai/cost-calculator.ts` (new)
- `lib/ai/risk-detector.ts` (new)
- `pages/estimator.tsx` (update)
- `app/api/estimator/analyze/route.ts` (new)
- `hooks/useAIEstimator.ts` (new)
- `types/estimator.ts` (new)

## Step-by-Step Instructions

### 1. Define Estimator Types and Protection Framework
Establish the comprehensive estimation structure:

```typescript
// types/estimator.ts
export interface EstimationProject {
  id: string
  name: string
  customer: Customer
  property: Property
  roofData: RoofData
  photos: ProjectPhoto[]
  estimate: Estimate
  risks: RiskAssessment
  status: 'draft' | 'analyzing' | 'review' | 'approved' | 'sent'
  createdAt: Date
  updatedAt: Date
}

export interface RoofData {
  totalArea: number // sq ft
  roofType: 'flat' | 'low-slope' | 'steep-slope'
  sections: RoofSection[]
  predominantMaterial: RoofingMaterial
  age: number // years
  layers: number
  condition: RoofCondition
  complexity: ComplexityScore
}

export interface RoofSection {
  id: string
  area: number
  pitch: string // "4:12", "flat", etc.
  material: RoofingMaterial
  condition: {
    overall: 1 | 2 | 3 | 4 | 5 // 1=failing, 5=excellent
    issues: ConditionIssue[]
  }
  features: RoofFeature[]
  edges: {
    eave: number
    rake: number
    ridge: number
    hip: number
    valley: number
    stepFlashing: number
    headwall: number
    sidewall: number
  }
  penetrations: Penetration[]
  access: AccessCondition
}

export interface RoofingMaterial {
  type: 'asphalt-shingle' | 'metal' | 'tile' | 'modified-bitumen' | 'tpo' | 'epdm' | 'built-up' | 'other'
  subType?: string // "architectural", "3-tab", "standing-seam", etc.
  manufacturer?: string
  color?: string
  warranty?: number // years
}

export interface ConditionIssue {
  type: 'leak' | 'damage' | 'wear' | 'installation-defect' | 'storm-damage' | 'structural'
  severity: 'minor' | 'moderate' | 'severe'
  location: string
  description: string
  photoEvidence: string[] // photo IDs
  repairUrgency: 'immediate' | 'soon' | 'planned' | 'monitor'
}

export interface RoofFeature {
  type: 'chimney' | 'skylight' | 'vent' | 'solar' | 'hvac' | 'satellite' | 'other'
  quantity: number
  condition: 'good' | 'fair' | 'poor'
  specialRequirements?: string
}

export interface ComplexityScore {
  overall: number // 1-10
  factors: {
    pitch: number
    cutUp: number // # of facets/planes
    accessibility: number
    height: number
    obstacles: number
  }
  narrative: string
}

export interface Estimate {
  id: string
  projectId: string
  version: number
  subtotal: number
  overhead: number
  profit: number
  tax: number
  total: number
  costBreakdown: CostLineItem[]
  alternates: AlternateOption[]
  protections: ProtectionItem[]
  assumptions: string[]
  exclusions: string[]
  warranty: WarrantyTerms
  validUntil: Date
}

export interface CostLineItem {
  id: string
  category: 'material' | 'labor' | 'equipment' | 'disposal' | 'permit' | 'other'
  description: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  margin: number
  notes?: string
  riskAdjustment?: number // percentage
}

export interface RiskAssessment {
  overallScore: number // 0-100, higher = more risk
  categories: {
    technical: RiskCategory
    weather: RiskCategory
    access: RiskCategory
    structural: RiskCategory
    regulatory: RiskCategory
    financial: RiskCategory
  }
  recommendations: RiskMitigation[]
  potentialCostImpact: {
    bestCase: number
    likely: number
    worstCase: number
  }
}

export interface RiskCategory {
  score: number // 0-100
  factors: RiskFactor[]
}

export interface RiskFactor {
  name: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  probability: number // 0-1
  impact: string
  mitigation?: string
}

export interface RiskMitigation {
  risk: string
  action: string
  cost: number
  priority: 'immediate' | 'recommended' | 'optional'
}

export interface ProjectPhoto {
  id: string
  url: string
  thumbnail: string
  type: 'overview' | 'detail' | 'damage' | 'access' | 'equipment'
  analysis?: PhotoAnalysis
  annotations: PhotoAnnotation[]
  metadata: {
    timestamp: Date
    location?: { lat: number; lng: number }
    compass?: number // degrees
    device?: string
  }
}

export interface PhotoAnalysis {
  roofArea?: number
  materialType?: string
  damageDetected: DetectedDamage[]
  safetyHazards: string[]
  accessIssues: string[]
  confidence: number
}

export interface DetectedDamage {
  type: string
  severity: 'minor' | 'moderate' | 'severe'
  location: { x: number; y: number; width: number; height: number } // normalized 0-1
  confidence: number
}

export interface PhotoAnnotation {
  id: string
  text: string
  position: { x: number; y: number }
  createdBy: string
  createdAt: Date
}
```

### 2. Build the AI Estimation Engine
Create the protective calculation system:

```typescript
// lib/ai/estimation-engine.ts
import { EstimationProject, RoofData, Estimate, CostLineItem } from '@/types/estimator'
import { VisionAnalyzer } from './vision-analyzer'
import { CostCalculator } from './cost-calculator'
import { RiskDetector } from './risk-detector'

export class EstimationEngine {
  private visionAnalyzer: VisionAnalyzer
  private costCalculator: CostCalculator
  private riskDetector: RiskDetector
  
  constructor() {
    this.visionAnalyzer = new VisionAnalyzer()
    this.costCalculator = new CostCalculator()
    this.riskDetector = new RiskDetector()
  }
  
  async generateEstimate(project: EstimationProject): Promise<Estimate> {
    // Step 1: Analyze photos for additional data
    const photoInsights = await this.analyzeProjectPhotos(project.photos)
    
    // Step 2: Merge photo insights with provided roof data
    const enrichedRoofData = this.enrichRoofData(project.roofData, photoInsights)
    
    // Step 3: Detect all risks and hidden costs
    const risks = await this.riskDetector.assessProject(enrichedRoofData, project)
    
    // Step 4: Calculate base costs
    const baseCosts = await this.costCalculator.calculateCosts(enrichedRoofData, project.property)
    
    // Step 5: Apply risk adjustments
    const adjustedCosts = this.applyRiskAdjustments(baseCosts, risks)
    
    // Step 6: Add protective items often missed
    const protectiveCosts = this.addProtectiveItems(enrichedRoofData, risks)
    
    // Step 7: Calculate totals with appropriate margins
    const estimate = this.finalizeEstimate(adjustedCosts, protectiveCosts, project)
    
    return estimate
  }
  
  private async analyzeProjectPhotos(photos: ProjectPhoto[]): Promise<PhotoInsights> {
    const insights: PhotoInsights = {
      detectedIssues: [],
      materialConfidence: 0,
      measurementAdjustments: {},
      hiddenComplexity: []
    }
    
    for (const photo of photos) {
      if (!photo.analysis) {
        photo.analysis = await this.visionAnalyzer.analyzePhoto(photo)
      }
      
      // Aggregate damage findings
      insights.detectedIssues.push(...photo.analysis.damageDetected)
      
      // Look for complexity indicators
      if (photo.analysis.safetyHazards.length > 0) {
        insights.hiddenComplexity.push({
          type: 'safety',
          description: photo.analysis.safetyHazards.join(', '),
          costImpact: 0.15 // 15% increase
        })
      }
      
      if (photo.analysis.accessIssues.length > 0) {
        insights.hiddenComplexity.push({
          type: 'access',
          description: photo.analysis.accessIssues.join(', '),
          costImpact: 0.20 // 20% increase for access issues
        })
      }
    }
    
    return insights
  }
  
  private enrichRoofData(roofData: RoofData, photoInsights: PhotoInsights): RoofData {
    const enriched = { ...roofData }
    
    // Adjust measurements based on photo analysis
    if (photoInsights.measurementAdjustments.areaIncrease) {
      enriched.totalArea *= (1 + photoInsights.measurementAdjustments.areaIncrease)
    }
    
    // Update condition based on detected damage
    const severeIssues = photoInsights.detectedIssues.filter(d => d.severity === 'severe')
    if (severeIssues.length > 3) {
      enriched.condition = 'poor'
    }
    
    // Increase complexity score for hidden factors
    if (photoInsights.hiddenComplexity.length > 0) {
      const complexityIncrease = photoInsights.hiddenComplexity.reduce(
        (sum, item) => sum + item.costImpact, 0
      )
      enriched.complexity.overall = Math.min(10, enriched.complexity.overall * (1 + complexityIncrease))
    }
    
    return enriched
  }
  
  private applyRiskAdjustments(
    baseCosts: CostLineItem[], 
    risks: RiskAssessment
  ): CostLineItem[] {
    return baseCosts.map(item => {
      let riskMultiplier = 1
      
      // Apply risk adjustments by category
      if (item.category === 'labor') {
        // High complexity increases labor
        riskMultiplier += (risks.categories.technical.score / 100) * 0.25
        
        // Access issues increase labor time
        riskMultiplier += (risks.categories.access.score / 100) * 0.20
      }
      
      if (item.category === 'material') {
        // Add waste factor for complex roofs
        riskMultiplier += (risks.categories.technical.score / 100) * 0.10
        
        // Weather risk may require premium materials
        if (risks.categories.weather.score > 70) {
          riskMultiplier += 0.05
        }
      }
      
      return {
        ...item,
        unitCost: item.unitCost * riskMultiplier,
        totalCost: item.totalCost * riskMultiplier,
        riskAdjustment: (riskMultiplier - 1) * 100,
        notes: item.notes + ` (Risk adj: +${((riskMultiplier - 1) * 100).toFixed(1)}%)`
      }
    })
  }
  
  private addProtectiveItems(roofData: RoofData, risks: RiskAssessment): CostLineItem[] {
    const protectiveItems: CostLineItem[] = []
    
    // Always add these protective items that are commonly missed
    
    // 1. Unforeseen Deck Repair Allowance
    protectiveItems.push({
      id: `protect-deck-${Date.now()}`,
      category: 'material',
      description: 'Deck Repair Allowance (10% of deck area)',
      quantity: roofData.totalArea * 0.10,
      unit: 'sq ft',
      unitCost: 3.50,
      totalCost: roofData.totalArea * 0.10 * 3.50,
      margin: 0.25,
      notes: 'Protective allowance for hidden deck damage discovered during tear-off'
    })
    
    // 2. Dumpster Overage Protection
    const estimatedDebris = (roofData.layers * roofData.totalArea) / 300 // squares
    const dumpsterCount = Math.ceil(estimatedDebris / 20) // 20 square dumpster
    
    protectiveItems.push({
      id: `protect-dumpster-${Date.now()}`,
      category: 'disposal',
      description: 'Additional Dumpster Capacity Reserve',
      quantity: 1,
      unit: 'allowance',
      unitCost: 450,
      totalCost: 450,
      margin: 0.20,
      notes: 'Protection against weight overage fees and additional hauls'
    })
    
    // 3. Weather Delay Protection
    if (risks.categories.weather.score > 60) {
      protectiveItems.push({
        id: `protect-weather-${Date.now()}`,
        category: 'labor',
        description: 'Weather Delay Labor Protection (2 days)',
        quantity: 16, // 2 days * 8 hours
        unit: 'hours',
        unitCost: 75,
        totalCost: 16 * 75,
        margin: 0.15,
        notes: 'Covers crew standby time for weather delays'
      })
    }
    
    // 4. Access Equipment Contingency
    if (roofData.complexity.factors.height > 6 || roofData.complexity.factors.accessibility > 6) {
      protectiveItems.push({
        id: `protect-access-${Date.now()}`,
        category: 'equipment',
        description: 'Special Access Equipment Reserve',
        quantity: 1,
        unit: 'allowance',
        unitCost: 1200,
        totalCost: 1200,
        margin: 0.20,
        notes: 'Boom lift or scaffolding if ladder access proves insufficient'
      })
    }
    
    // 5. Premium Material Upcharge Protection
    protectiveItems.push({
      id: `protect-material-${Date.now()}`,
      category: 'material',
      description: 'Material Price Fluctuation Protection (5%)',
      quantity: 1,
      unit: 'allowance',
      unitCost: roofData.totalArea * 4.50 * 0.05, // 5% of material cost
      totalCost: roofData.totalArea * 4.50 * 0.05,
      margin: 0.10,
      notes: 'Protects against price increases between estimate and execution'
    })
    
    return protectiveItems
  }
  
  private finalizeEstimate(
    adjustedCosts: CostLineItem[], 
    protectiveCosts: CostLineItem[],
    project: EstimationProject
  ): Estimate {
    const allCosts = [...adjustedCosts, ...protectiveCosts]
    
    // Calculate subtotal
    const subtotal = allCosts.reduce((sum, item) => sum + item.totalCost, 0)
    
    // Apply appropriate margins based on risk
    const riskScore = project.risks.overallScore
    const baseOverheadPercent = 0.10 // 10% base
    const baseProfitPercent = 0.15 // 15% base
    
    // Increase margins for higher risk projects
    const overheadPercent = baseOverheadPercent + (riskScore / 1000) // +0-10% based on risk
    const profitPercent = baseProfitPercent + (riskScore / 500) // +0-20% based on risk
    
    const overhead = subtotal * overheadPercent
    const profit = subtotal * profitPercent
    const taxRate = 0.0875 // 8.75% sales tax
    const tax = (subtotal + overhead + profit) * taxRate
    
    const total = subtotal + overhead + profit + tax
    
    // Add protective assumptions and exclusions
    const assumptions = [
      'Quote based on single-layer tear-off. Additional layers add $1.00/sq ft',
      'Normal working hours (7 AM - 5 PM weekdays). Premium rates apply outside these hours',
      'Ground-level material delivery access available within 50 feet of building',
      'All penetrations and flashings in photo are included. Hidden items extra',
      'Existing ventilation is code-compliant. Upgrades billed separately if required',
      'Substrate is structurally sound. Structural repairs billed T&M if needed'
    ]
    
    const exclusions = [
      'Structural repairs beyond normal decking replacement',
      'Hazardous material abatement (asbestos, lead paint)',
      'Electrical work for rooftop equipment',
      'Interior repairs from existing leaks',
      'Permits beyond standard roofing permit',
      'After-hours or weekend work unless specified'
    ]
    
    return {
      id: `estimate-${project.id}-v1`,
      projectId: project.id,
      version: 1,
      subtotal,
      overhead,
      profit,
      tax,
      total,
      costBreakdown: allCosts,
      alternates: this.generateAlternates(project, allCosts),
      protections: protectiveCosts.map(item => ({
        description: item.description,
        value: item.totalCost,
        included: true
      })),
      assumptions,
      exclusions,
      warranty: {
        workmanship: 10, // years
        material: 30, // years
        coverage: 'Complete system warranty including flashings and penetrations'
      },
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  }
  
  private generateAlternates(project: EstimationProject, baseCosts: CostLineItem[]): AlternateOption[] {
    const alternates: AlternateOption[] = []
    
    // Premium material upgrade
    const materialCost = baseCosts.filter(c => c.category === 'material')
      .reduce((sum, item) => sum + item.totalCost, 0)
    
    alternates.push({
      id: 'alt-premium-material',
      description: 'Upgrade to 50-year architectural shingles',
      priceImpact: materialCost * 0.25,
      benefits: [
        '50-year manufacturer warranty vs 30-year',
        'Enhanced wind resistance (130 mph vs 110 mph)',
        'Improved aesthetic with dimensional appearance',
        'Potential insurance premium reduction'
      ]
    })
    
    // Enhanced warranty
    alternates.push({
      id: 'alt-enhanced-warranty',
      description: 'Platinum Protection Plan - 15-year workmanship warranty',
      priceImpact: project.roofData.totalArea * 0.75,
      benefits: [
        '15-year workmanship warranty vs 10-year',
        'Annual inspections included for 5 years',
        'Priority emergency response',
        'Transferable to new owner'
      ]
    })
    
    // Preventive items
    if (!baseCosts.some(c => c.description.includes('gutter'))) {
      alternates.push({
        id: 'alt-gutter-replacement',
        description: 'Complete gutter and downspout replacement',
        priceImpact: (project.roofData.sections[0]?.edges.eave || 200) * 12,
        benefits: [
          'Ensures proper drainage for new roof',
          'Prevents foundation water damage',
          'Includes 5-year warranty on gutters',
          'Color-matched to new roof'
        ]
      })
    }
    
    return alternates
  }
}

interface PhotoInsights {
  detectedIssues: DetectedDamage[]
  materialConfidence: number
  measurementAdjustments: {
    areaIncrease?: number
  }
  hiddenComplexity: Array<{
    type: string
    description: string
    costImpact: number
  }>
}

interface AlternateOption {
  id: string
  description: string
  priceImpact: number
  benefits: string[]
}

interface ProtectionItem {
  description: string
  value: number
  included: boolean
}

interface WarrantyTerms {
  workmanship: number
  material: number
  coverage: string
}

interface Customer {
  name: string
  email: string
  phone: string
  address: string
}

interface Property {
  address: string
  type: 'commercial' | 'residential' | 'industrial' | 'institutional'
  yearBuilt: number
  stories: number
  occupancy: string
}

interface Penetration {
  type: string
  size: string
  condition: string
}

interface AccessCondition {
  rating: 'easy' | 'moderate' | 'difficult'
  notes: string
}
```

### 3. Build the Vision Analyzer
Create the protective photo analysis system:

```typescript
// lib/ai/vision-analyzer.ts
import { ProjectPhoto, PhotoAnalysis, DetectedDamage } from '@/types/estimator'

export class VisionAnalyzer {
  private apiKey: string
  private modelVersion: string = 'gpt-4-vision-preview'
  
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY!
  }
  
  async analyzePhoto(photo: ProjectPhoto): Promise<PhotoAnalysis> {
    try {
      const analysis = await this.callVisionAPI(photo)
      const structuredAnalysis = this.parseVisionResponse(analysis)
      
      // Add protective intelligence
      const enhancedAnalysis = this.enhanceWithProtectiveInsights(structuredAnalysis, photo)
      
      return enhancedAnalysis
    } catch (error) {
      console.error('Vision analysis error:', error)
      
      // Return safe defaults that protect the estimate
      return {
        roofArea: undefined,
        materialType: 'unknown',
        damageDetected: [{
          type: 'inspection-required',
          severity: 'moderate',
          location: { x: 0.5, y: 0.5, width: 1, height: 1 },
          confidence: 0.5
        }],
        safetyHazards: ['Unable to fully assess - field verification required'],
        accessIssues: ['Photo analysis incomplete - verify access on site'],
        confidence: 0.3
      }
    }
  }
  
  private async callVisionAPI(photo: ProjectPhoto): Promise<string> {
    const prompt = `You are an expert roofing estimator with 30 years of experience. Analyze this roof photo and identify:

1. Visible damage (missing shingles, holes, rust, ponding water, etc.)
2. Material type and approximate age
3. Safety hazards (steep pitch, obstacles, weak areas)
4. Access challenges (height, obstacles, power lines)
5. Hidden cost factors that might not be obvious

For each issue found, specify:
- Type and severity (minor/moderate/severe)
- Location in the image
- Potential cost impact

Be thorough and protective - it's better to over-identify issues than miss something that could hurt profitability.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.modelVersion,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: photo.url } }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3 // Lower temperature for consistency
      })
    })
    
    if (!response.ok) {
      throw new Error(`Vision API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.choices[0].message.content
  }
  
  private parseVisionResponse(response: string): PhotoAnalysis {
    // Parse the AI response into structured data
    // This is simplified - in production you'd use more robust parsing
    
    const analysis: PhotoAnalysis = {
      materialType: 'asphalt-shingle', // Would extract from response
      damageDetected: [],
      safetyHazards: [],
      accessIssues: [],
      confidence: 0.8
    }
    
    // Extract damage patterns
    const damagePatterns = [
      { pattern: /missing shingles?/i, type: 'missing-material', severity: 'moderate' },
      { pattern: /hole|puncture/i, type: 'penetration', severity: 'severe' },
      { pattern: /rust|corrosion/i, type: 'corrosion', severity: 'moderate' },
      { pattern: /ponding|standing water/i, type: 'drainage', severity: 'severe' },
      { pattern: /crack|split/i, type: 'structural', severity: 'moderate' },
      { pattern: /moss|algae|vegetation/i, type: 'biological', severity: 'minor' },
      { pattern: /lifted|curled/i, type: 'wind-damage', severity: 'moderate' }
    ]
    
    damagePatterns.forEach(({ pattern, type, severity }) => {
      if (pattern.test(response)) {
        analysis.damageDetected.push({
          type,
          severity: severity as 'minor' | 'moderate' | 'severe',
          location: { x: 0.5, y: 0.5, width: 0.2, height: 0.2 }, // Would be extracted
          confidence: 0.85
        })
      }
    })
    
    // Extract safety hazards
    if (/steep|pitch|slope/i.test(response)) {
      analysis.safetyHazards.push('Steep pitch requires safety equipment and experienced crew')
    }
    if (/power line|electrical/i.test(response)) {
      analysis.safetyHazards.push('Power lines nearby - requires safety clearance')
    }
    if (/weak|soft|spongy/i.test(response)) {
      analysis.safetyHazards.push('Potential structural weakness - use caution')
    }
    
    // Extract access issues
    if (/narrow|restricted/i.test(response)) {
      analysis.accessIssues.push('Restricted access may require special equipment')
    }
    if (/height|stories|tall/i.test(response)) {
      analysis.accessIssues.push('Significant height requires extended reach equipment')
    }
    
    return analysis
  }
  
  private enhanceWithProtectiveInsights(
    analysis: PhotoAnalysis, 
    photo: ProjectPhoto
  ): PhotoAnalysis {
    // Add protective insights that AI might miss but experience teaches
    
    // If we see one issue, there are usually more
    if (analysis.damageDetected.length > 0) {
      analysis.damageDetected.push({
        type: 'hidden-damage',
        severity: 'moderate',
        location: { x: 0, y: 0, width: 1, height: 1 },
        confidence: 0.7
      })
    }
    
    // Time of year affects everything
    const month = new Date().getMonth()
    if (month >= 10 || month <= 2) { // Winter months
      analysis.safetyHazards.push('Winter conditions - factor in weather delays and ice hazards')
    }
    
    // Multiple layers are common but not always visible
    if (photo.type === 'detail' && /thick|built-up|multiple/i.test(analysis.materialType || '')) {
      analysis.accessIssues.push('Possible multiple roof layers - increases tear-off cost by 40%')
    }
    
    return analysis
  }
}
```

### 4. Build the AI Estimator Component
Create the protective estimation interface:

```tsx
// components/estimator/AIEstimator.tsx
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, Camera, AlertCircle, CheckCircle, 
  DollarSign, Shield, FileText, Send, Plus
} from 'lucide-react'
import { useAIEstimator } from '@/hooks/useAIEstimator'
import GlassPanel from '@/components/ui/GlassPanel'
import Button from '@/components/ui/Button'
import PhotoAnalyzer from './PhotoAnalyzer'
import CostBreakdown from './CostBreakdown'
import RiskAssessment from './RiskAssessment'
import { EstimationProject } from '@/types/estimator'

export default function AIEstimator() {
  const {
    project,
    loading,
    analyzing,
    createProject,
    uploadPhotos,
    analyzeProject,
    generateEstimate,
    saveEstimate,
    sendEstimate
  } = useAIEstimator()
  
  const [activeTab, setActiveTab] = useState<'photos' | 'analysis' | 'estimate' | 'risks'>('photos')
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([])
  
  const handlePhotoUpload = useCallback(async (files: FileList) => {
    const photoFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    )
    
    setSelectedPhotos(prev => [...prev, ...photoFiles])
    
    if (project) {
      await uploadPhotos(project.id, photoFiles)
    }
  }, [project, uploadPhotos])
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handlePhotoUpload(e.dataTransfer.files)
  }, [handlePhotoUpload])
  
  const handleAnalyze = async () => {
    if (!project || project.photos.length === 0) return
    
    await analyzeProject(project.id)
    setActiveTab('analysis')
  }
  
  const handleGenerateEstimate = async () => {
    if (!project) return
    
    await generateEstimate(project.id)
    setActiveTab('estimate')
  }
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Estimation System</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Protective intelligence that catches hidden costs and protects your margins
        </p>
      </div>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { id: 'photos', label: 'Upload Photos', icon: Camera },
            { id: 'analysis', label: 'AI Analysis', icon: Shield },
            { id: 'estimate', label: 'Cost Estimate', icon: DollarSign },
            { id: 'risks', label: 'Risk Assessment', icon: AlertCircle }
          ].map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => setActiveTab(step.id as any)}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                  activeTab === step.id 
                    ? 'bg-blue-500 text-white scale-110' 
                    : project?.status === 'analyzing' && index > 0
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500'
                    : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
                disabled={!project || (project.status === 'draft' && index > 0)}
              >
                <step.icon className="w-6 h-6" />
              </button>
              {index < 3 && (
                <div className={`flex-1 h-1 mx-2 rounded ${
                  index === 0 && project?.photos.length > 0 ? 'bg-blue-500' :
                  index === 1 && project?.status !== 'draft' ? 'bg-blue-500' :
                  index === 2 && project?.estimate ? 'bg-blue-500' :
                  'bg-gray-300 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'photos' && (
          <motion.div
            key="photos"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassPanel className="p-8" glow>
              {/* Project Info */}
              {!project ? (
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">Start New Estimate</h3>
                  <Button
                    size="lg"
                    variant="primary"
                    onClick={() => createProject({
                      name: `Estimate ${new Date().toLocaleDateString()}`,
                      customer: { name: '', email: '', phone: '', address: '' },
                      property: { 
                        address: '', 
                        type: 'residential', 
                        yearBuilt: 2000, 
                        stories: 1,
                        occupancy: 'single-family'
                      }
                    })}
                    glow
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Project
                  </Button>
                </div>
              ) : (
                <>
                  {/* Photo Upload Area */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors"
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">
                      Drop roof photos here or click to upload
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Include overview shots, damage areas, and access points
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload">
                      <Button as="span" variant="primary" className="cursor-pointer">
                        Select Photos
                      </Button>
                    </label>
                  </div>
                  
                  {/* Uploaded Photos Grid */}
                  {project.photos.length > 0 && (
                    <div className="mt-8">
                      <h4 className="font-semibold mb-4">
                        Uploaded Photos ({project.photos.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {project.photos.map((photo) => (
                          <div key={photo.id} className="relative group">
                            <img
                              src={photo.thumbnail}
                              alt="Roof photo"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            {photo.analysis && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              </div>
                            )}
                            {photo.analysis?.damageDetected.length > 0 && (
                              <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                {photo.analysis.damageDetected.length} issues
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Analyze Button */}
                      <div className="mt-8 text-center">
                        <Button
                          size="lg"
                          variant="primary"
                          onClick={handleAnalyze}
                          disabled={analyzing}
                          glow
                        >
                          {analyzing ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                              Analyzing Photos...
                            </>
                          ) : (
                            <>
                              <Shield className="w-5 h-5 mr-2" />
                              Analyze with AI
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </GlassPanel>
          </motion.div>
        )}
        
        {activeTab === 'analysis' && project && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <PhotoAnalyzer
              project={project}
              onComplete={() => setActiveTab('estimate')}
            />
          </motion.div>
        )}
        
        {activeTab === 'estimate' && project?.estimate && (
          <motion.div
            key="estimate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CostBreakdown
              estimate={project.estimate}
              onApprove={() => saveEstimate(project.id)}
              onSend={() => sendEstimate(project.id)}
            />
          </motion.div>
        )}
        
        {activeTab === 'risks' && project?.risks && (
          <motion.div
            key="risks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <RiskAssessment
              risks={project.risks}
              onMitigate={(mitigation) => console.log('Mitigate:', mitigation)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Protection Notice */}
      <div className="mt-8">
        <GlassPanel className="p-4 bg-blue-50 dark:bg-blue-900/20" protective>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                Margin Protection Active
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                Our AI analyzes photos for hidden costs, adds protective allowances for common surprises, 
                and adjusts pricing based on risk factors. This protects your profitability while 
                ensuring competitive, accurate estimates.
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}
```

### 5. Create Cost Breakdown Component
Build the detailed cost presentation:

```tsx
// components/estimator/CostBreakdown.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, Shield, FileText, Send, Download, 
  ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react'
import { Estimate, CostLineItem } from '@/types/estimator'
import GlassPanel from '@/components/ui/GlassPanel'
import Button from '@/components/ui/Button'

interface CostBreakdownProps {
  estimate: Estimate
  onApprove: () => void
  onSend: () => void
}

export default function CostBreakdown({ estimate, onApprove, onSend }: CostBreakdownProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['material'])
  const [showAlternates, setShowAlternates] = useState(false)
  
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }
  
  const groupedCosts = estimate.costBreakdown.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, CostLineItem[]>)
  
  const categoryTotals = Object.entries(groupedCosts).map(([category, items]) => ({
    category,
    total: items.reduce((sum, item) => sum + item.totalCost, 0),
    count: items.length
  }))
  
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <GlassPanel variant="elevated" glow className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Cost Estimate</h2>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400">
              Protected Pricing
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Subtotal</p>
            <p className="text-2xl font-bold">${estimate.subtotal.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Overhead</p>
            <p className="text-2xl font-bold">${estimate.overhead.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Profit</p>
            <p className="text-2xl font-bold">${estimate.profit.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              ${estimate.total.toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="primary" onClick={onApprove} className="flex-1" glow>
            <FileText className="w-4 h-4 mr-2" />
            Approve Estimate
          </Button>
          <Button variant="primary" onClick={onSend} className="flex-1">
            <Send className="w-4 h-4 mr-2" />
            Send to Customer
          </Button>
          <Button variant="glass">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </GlassPanel>
      
      {/* Detailed Breakdown */}
      <GlassPanel className="p-6">
        <h3 className="text-lg font-semibold mb-4">Detailed Cost Breakdown</h3>
        
        <div className="space-y-3">
          {categoryTotals.map(({ category, total, count }) => (
            <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium capitalize">{category}</span>
                  <span className="text-sm text-gray-500">({count} items)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">${total.toLocaleString()}</span>
                  {expandedCategories.includes(category) ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>
              
              {expandedCategories.includes(category) && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  {groupedCosts[category].map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.description}</p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} {item.unit} @ ${item.unitCost}/{item.unit}
                        </p>
                        {item.riskAdjustment && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            <AlertCircle className="w-3 h-3 inline mr-1" />
                            Risk adjustment: +{item.riskAdjustment.toFixed(1)}%
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.totalCost.toLocaleString()}</p>
                        {item.margin > 0 && (
                          <p className="text-xs text-gray-500">
                            {(item.margin * 100).toFixed(0)}% margin
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </GlassPanel>
      
      {/* Protective Items */}
      {estimate.protections.length > 0 && (
        <GlassPanel className="p-6" protective>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold">Margin Protection Items</h3>
          </div>
          
          <div className="space-y-2">
            {estimate.protections.map((protection, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm">{protection.description}</span>
                </div>
                <span className="font-medium text-green-700 dark:text-green-300">
                  ${protection.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
            These protective allowances cover common hidden costs and protect your profit margins
          </p>
        </GlassPanel>
      )}
      
      {/* Alternates */}
      <GlassPanel className="p-6">
        <button
          onClick={() => setShowAlternates(!showAlternates)}
          className="flex items-center justify-between w-full mb-4"
        >
          <h3 className="text-lg font-semibold">Alternate Options</h3>
          {showAlternates ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
        
        {showAlternates && (
          <div className="space-y-3">
            {estimate.alternates.map((alternate) => (
              <div
                key={alternate.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{alternate.description}</h4>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    +${alternate.priceImpact.toLocaleString()}
                  </span>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {alternate.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </GlassPanel>
      
      {/* Terms & Conditions */}
      <GlassPanel className="p-6">
        <h3 className="text-lg font-semibold mb-4">Terms & Conditions</h3>
        
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Assumptions</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              {estimate.assumptions.map((assumption, i) => (
                <li key={i}>• {assumption}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Exclusions</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              {estimate.exclusions.map((exclusion, i) => (
                <li key={i}>• {exclusion}</li>
              ))}
            </ul>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              This estimate is valid until {new Date(estimate.validUntil).toLocaleDateString()}.
              Prices subject to change based on material availability and market conditions.
            </p>
          </div>
        </div>
      </GlassPanel>
    </div>
  )
}
```

### 6. Create the AI Estimator Hook
Manage estimation state and operations:

```tsx
// hooks/useAIEstimator.ts
import { useState, useCallback } from 'react'
import { EstimationProject, Estimate, RiskAssessment } from '@/types/estimator'
import { EstimationEngine } from '@/lib/ai/estimation-engine'

export function useAIEstimator() {
  const [project, setProject] = useState<EstimationProject | null>(null)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const createProject = useCallback(async (projectData: Partial<EstimationProject>) => {
    try {
      setLoading(true)
      
      const newProject: EstimationProject = {
        id: `project-${Date.now()}`,
        name: projectData.name || 'New Estimate',
        customer: projectData.customer || {
          name: '',
          email: '',
          phone: '',
          address: ''
        },
        property: projectData.property || {
          address: '',
          type: 'residential',
          yearBuilt: 2000,
          stories: 1,
          occupancy: 'single-family'
        },
        roofData: {
          totalArea: 0,
          roofType: 'steep-slope',
          sections: [],
          predominantMaterial: {
            type: 'asphalt-shingle',
            subType: 'architectural'
          },
          age: 15,
          layers: 1,
          condition: 'fair',
          complexity: {
            overall: 5,
            factors: {
              pitch: 5,
              cutUp: 5,
              accessibility: 5,
              height: 5,
              obstacles: 5
            },
            narrative: 'Standard complexity residential roof'
          }
        },
        photos: [],
        estimate: null as any,
        risks: null as any,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // Save to API
      const response = await fetch('/api/estimator/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      })
      
      if (!response.ok) throw new Error('Failed to create project')
      
      const savedProject = await response.json()
      setProject(savedProject)
      
      return savedProject
    } catch (err) {
      console.error('Project creation error:', err)
      setError('Failed to create project')
      return null
    } finally {
      setLoading(false)
    }
  }, [])
  
  const uploadPhotos = useCallback(async (projectId: string, files: File[]) => {
    if (!project) return
    
    try {
      setLoading(true)
      
      // Upload photos
      const formData = new FormData()
      files.forEach(file => formData.append('photos', file))
      
      const response = await fetch(`/api/estimator/projects/${projectId}/photos`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) throw new Error('Failed to upload photos')
      
      const uploadedPhotos = await response.json()
      
      // Update project
      setProject(prev => prev ? {
        ...prev,
        photos: [...prev.photos, ...uploadedPhotos],
        updatedAt: new Date()
      } : null)
      
      return uploadedPhotos
    } catch (err) {
      console.error('Photo upload error:', err)
      setError('Failed to upload photos')
      return []
    } finally {
      setLoading(false)
    }
  }, [project])
  
  const analyzeProject = useCallback(async (projectId: string) => {
    if (!project) return
    
    try {
      setAnalyzing(true)
      setProject(prev => prev ? { ...prev, status: 'analyzing' } : null)
      
      // Call AI analysis
      const response = await fetch(`/api/estimator/projects/${projectId}/analyze`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to analyze project')
      
      const analysis = await response.json()
      
      // Update project with analysis results
      setProject(prev => prev ? {
        ...prev,
        roofData: analysis.roofData,
        risks: analysis.risks,
        status: 'review',
        updatedAt: new Date()
      } : null)
      
      return analysis
    } catch (err) {
      console.error('Analysis error:', err)
      setError('Failed to analyze project')
      return null
    } finally {
      setAnalyzing(false)
    }
  }, [project])
  
  const generateEstimate = useCallback(async (projectId: string) => {
    if (!project) return
    
    try {
      setLoading(true)
      
      // Generate estimate
      const engine = new EstimationEngine()
      const estimate = await engine.generateEstimate(project)
      
      // Save estimate
      const response = await fetch(`/api/estimator/projects/${projectId}/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estimate)
      })
      
      if (!response.ok) throw new Error('Failed to save estimate')
      
      const savedEstimate = await response.json()
      
      // Update project
      setProject(prev => prev ? {
        ...prev,
        estimate: savedEstimate,
        status: 'approved',
        updatedAt: new Date()
      } : null)
      
      return savedEstimate
    } catch (err) {
      console.error('Estimate generation error:', err)
      setError('Failed to generate estimate')
      return null
    } finally {
      setLoading(false)
    }
  }, [project])
  
  const saveEstimate = useCallback(async (projectId: string) => {
    // Save/approve estimate logic
    console.log('Saving estimate:', projectId)
  }, [])
  
  const sendEstimate = useCallback(async (projectId: string) => {
    if (!project?.estimate) return
    
    try {
      setLoading(true)
      
      // Send estimate to customer
      const response = await fetch(`/api/estimator/projects/${projectId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: project.customer.email,
          estimate: project.estimate
        })
      })
      
      if (!response.ok) throw new Error('Failed to send estimate')
      
      // Update status
      setProject(prev => prev ? {
        ...prev,
        status: 'sent',
        updatedAt: new Date()
      } : null)
      
      return true
    } catch (err) {
      console.error('Send estimate error:', err)
      setError('Failed to send estimate')
      return false
    } finally {
      setLoading(false)
    }
  }, [project])
  
  return {
    project,
    loading,
    analyzing,
    error,
    createProject,
    uploadPhotos,
    analyzeProject,
    generateEstimate,
    saveEstimate,
    sendEstimate
  }
}
```

## Commit Message
```
feat(estimator): implemented protective AI estimation system

- Built EstimationEngine with comprehensive cost calculation and risk detection
- Created VisionAnalyzer for photo-based damage and issue detection
- Implemented AIEstimator component with complete estimation workflow
- Added CostBreakdown with detailed pricing and protection items
- Protects contractors from hidden costs and margin erosion
```

## QA/Acceptance Checklist
- [ ] Photo upload accepts multiple images with drag-and-drop
- [ ] AI analysis identifies visible damage and safety hazards
- [ ] Cost breakdown includes all standard categories and line items
- [ ] Protective items automatically added (deck repair, weather, etc.)
- [ ] Risk adjustments applied to labor and materials appropriately
- [ ] Alternates section shows upgrade options with clear benefits
- [ ] Estimate includes proper assumptions and exclusions
- [ ] PDF generation creates professional estimate document
- [ ] Email sending delivers estimate with branded template
- [ ] Feature flag `NEXT_PUBLIC_ESTIMATOR_ENABLED` controls visibility

## AI Execution Block

### Codex/Operator Instructions:
1. Create all type definitions in `types/estimator.ts`
2. Implement EstimationEngine with full calculation logic
3. Build VisionAnalyzer with OpenAI Vision API integration
4. Create AIEstimator component with photo upload workflow
5. Implement CostBreakdown with expandable categories
6. Create RiskAssessment component (if time permits)
7. Build API routes for project and estimate management
8. Create useAIEstimator hook with all operations
9. Test with sample roof photos (various conditions)
10. Verify protective items appear in all estimates
11. Commit with provided message and deploy

**Operator Validation**: Upload 3 photos of a residential roof with visible damage. Confirm AI identifies issues and generates estimate with protective allowances. Check that subtotal includes risk adjustments. Verify deck repair allowance appears in protective items. Test estimate PDF download.

## Advanced/Optional Enhancements

### Historical Learning
```typescript
// Learn from past estimates
const historicalAdjustment = async (project: EstimationProject) => {
  const similarProjects = await findSimilarProjects(project)
  const actualVsEstimated = analyzeCostVariance(similarProjects)
  
  return {
    laborAdjustment: actualVsEstimated.labor.avgVariance,
    materialAdjustment: actualVsEstimated.material.avgVariance,
    confidenceScore: similarProjects.length / 10
  }
}
```

### Weather Integration
```typescript
// Factor in weather windows
const weatherImpact = async (project: EstimationProject) => {
  const forecast = await getExtendedForecast(project.property.address)
  const workableDays = forecast.filter(day => 
    day.precipitation < 0.1 && day.windSpeed < 25
  )
  
  return {
    delayRisk: 1 - (workableDays.length / forecast.length),
    seasonalPricing: getSeasonalMultiplier(new Date())
  }
}
```

### 3D Measurement Integration
```typescript
// Connect to AR viewer measurements
const integrateARMeasurements = async (projectId: string, modelId: string) => {
  const arModel = await loadRoofModel(modelId)
  const measurements = extractMeasurements(arModel)
  
  return updateProjectMeasurements(projectId, {
    totalArea: measurements.totalArea,
    edgeLengths: measurements.edges,
    complexity: calculateComplexityFrom3D(arModel)
  })
}
```

---

**Reference**: See [QUANTUM_LEAP_CONTEXT.md](/docs/QUANTUM_LEAP_CONTEXT.md) for AI integration standards and estimation protection principles.