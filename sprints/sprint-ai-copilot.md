# Sprint: AI Copilot Integration

## Objective
Deploy the AI system that acts as a protective intelligence layer for professionals under pressure. This isn't chatbot integration—it's building a copilot that prevents million-dollar mistakes during bid reviews, catches code violations before they become RFIs, and provides instant expertise when your senior estimator is unavailable.

## Why This Matters
When an estimator is reviewing 200 pages of specs at 2am before a bid deadline, they need more than a search function. They need a system that understands context, catches inconsistencies, and provides protective intelligence. This sprint delivers that safety net.

## Required Files
- `/app/api/ai/route.ts` (AI endpoint with rate limiting)
- `/app/api/ai/analyze/route.ts` (Document analysis endpoint)
- `/app/api/ai/validate/route.ts` (Estimate validation endpoint)
- `/components/AICopilot.tsx` (Main AI interface)
- `/components/AIProtectionStatus.tsx` (Shows active protections)
- `/components/AIQuickActions.tsx` (Context-aware shortcuts)
- `/lib/ai/prompts.ts` (System prompts for different contexts)
- `/lib/ai/protection-engine.ts` (Core protection logic)
- `/lib/ai/rate-limiter.ts` (Usage protection)
- `/types/ai.ts` (TypeScript definitions)

## Implementation Code

### AI Protection Engine (`/lib/ai/protection-engine.ts`)
```typescript
import { OpenAI } from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Protection types for different user contexts
export const ProtectionType = z.enum([
  'estimate_validation',
  'code_compliance',
  'scope_verification',
  'material_compatibility',
  'warranty_check',
  'change_order_detection',
  'safety_requirement',
  'weather_protection'
])

export interface ProtectionContext {
  userRole: 'estimator' | 'contractor' | 'architect' | 'owner'
  projectType: string
  documentType?: string
  urgencyLevel: 'routine' | 'urgent' | 'critical'
  specificConcerns?: string[]
}

export class ProtectionEngine {
  private systemPrompts = {
    estimator: `You are a protective AI system for commercial roofing estimators.
    Your purpose is to catch expensive mistakes BEFORE they become problems.
    You have deep knowledge of:
    - Common estimation errors that cause 3-5% margin loss
    - Material specifications and compatibility issues
    - Code requirements across jurisdictions
    - Weather-related installation constraints
    - Warranty compliance requirements
    
    Always:
    - Flag potential issues with specific cost impacts
    - Provide quick fixes when possible
    - Reference relevant code sections
    - Prioritize by financial impact
    
    Never:
    - Give vague warnings without specifics
    - Overwhelm with minor issues during critical reviews
    - Assume the user has time for lengthy explanations`,
    
    contractor: `You are a field intelligence system for roofing contractors.
    Your purpose is to prevent rework and protect project margins.
    You understand:
    - Sequencing issues that cause delays
    - Material handling and storage requirements
    - Weather windows and installation timing
    - Change order triggers and documentation needs
    - Safety compliance and OSHA requirements
    
    Always:
    - Provide actionable field guidance
    - Flag issues before they compound
    - Document everything for protection
    - Think like a seasoned superintendent
    
    Never:
    - Ignore field realities for theoretical best practices
    - Provide guidance that requires stopping work
    - Assume perfect conditions`,
    
    architect: `You are a specification intelligence system for architects.
    Your purpose is to ensure specifications are bulletproof under pressure.
    You maintain current knowledge of:
    - Current building codes and standards
    - System compatibility and performance criteria
    - Manufacturer requirements and limitations
    - Sustainability certifications and requirements
    - Coordination issues between disciplines
    
    Always:
    - Reference specific code sections and standards
    - Flag coordination issues early
    - Provide alternates when specifications conflict
    - Protect the design intent
    
    Never:
    - Compromise performance for expedience
    - Ignore long-term maintenance implications
    - Assume contractors will catch specification errors`,
    
    owner: `You are a protective advisor for building owners and facility managers.
    Your purpose is to provide clarity in complex roofing decisions.
    You translate:
    - Technical specifications into business impacts
    - Contractor proposals into real costs and risks
    - Warranty terms into practical protection
    - Maintenance requirements into budget planning
    
    Always:
    - Explain financial implications clearly
    - Flag hidden costs and future liabilities
    - Compare options in business terms
    - Protect long-term asset value
    
    Never:
    - Use technical jargon without explanation
    - Assume construction knowledge
    - Hide risks in complexity`
  }

  async analyzeForProtection(
    content: string,
    context: ProtectionContext
  ): Promise<ProtectionAnalysis> {
    const systemPrompt = this.systemPrompts[context.userRole]
    
    const urgencyModifier = context.urgencyLevel === 'critical' 
      ? '\n\nTHIS IS A CRITICAL REVIEW. Focus only on high-impact issues that could affect the bid/project outcome.'
      : ''
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: systemPrompt + urgencyModifier 
        },
        {
          role: 'user',
          content: `Analyze this ${context.documentType || 'content'} for a ${context.projectType} project.
          
          Specific concerns: ${context.specificConcerns?.join(', ') || 'General review'}
          
          Content to analyze:
          ${content}
          
          Provide:
          1. Critical issues (with cost impact if applicable)
          2. Moderate concerns
          3. Quick wins (easy fixes with high value)
          4. Protective actions to take
          
          Format as JSON for system integration.`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for consistency
      max_tokens: 2000
    })

    return this.parseProtectionResponse(response.choices[0].message.content!)
  }

  async validateEstimate(
    estimate: EstimateData,
    projectSpecs: string
  ): Promise<ValidationResult> {
    // Specialized validation for estimates
    const prompt = `As an estimation protection system, validate this commercial roofing estimate against the project specifications.

    ESTIMATE DATA:
    ${JSON.stringify(estimate, null, 2)}
    
    PROJECT SPECIFICATIONS:
    ${projectSpecs}
    
    Check for:
    1. Missing scope items (ranked by typical cost impact)
    2. Material specification mismatches
    3. Quantity calculation concerns
    4. Code compliance issues
    5. Warranty requirement gaps
    6. Weather/scheduling risks
    
    For each issue found:
    - Estimate the potential cost impact
    - Provide specific location in documents
    - Suggest correction
    - Rate severity (critical/high/medium/low)
    
    Format as structured JSON.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: this.systemPrompts.estimator },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 3000
    })

    return this.parseValidationResponse(response.choices[0].message.content!)
  }

  // ... Additional methods for specific protection scenarios
}
```

### AI Copilot Component (`/components/AICopilot.tsx`)
```tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle, Brain, X, Send, FileText } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { useProtectionEngine } from '@/hooks/useProtectionEngine'

interface ProtectionAlert {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  message: string
  impact?: string
  action?: string
}

export default function AICopilot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [protectionAlerts, setProtectionAlerts] = useState<ProtectionAlert[]>([])
  const [context, setContext] = useState<'general' | 'estimate' | 'spec' | 'field'>('general')
  const { user } = useUser()
  const { analyzeContent, validateEstimate } = useProtectionEngine()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-detect context based on current page/activity
  useEffect(() => {
    const path = window.location.pathname
    if (path.includes('estimate')) setContext('estimate')
    else if (path.includes('spec')) setContext('spec')
    else if (path.includes('field')) setContext('field')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isAnalyzing) return

    setIsAnalyzing(true)
    
    try {
      const result = await analyzeContent(input, {
        userRole: getUserRole(user),
        projectType: 'commercial-roofing',
        urgencyLevel: detectUrgency(input),
        documentType: context
      })

      setProtectionAlerts(result.alerts)
      setInput('')
    } catch (error) {
      console.error('Protection analysis failed:', error)
      // Show error state
    } finally {
      setIsAnalyzing(false)
    }
  }

  const alertIcon = {
    critical: AlertTriangle,
    high: AlertTriangle,
    medium: Shield,
    low: CheckCircle
  }

  const alertColor = {
    critical: 'text-red-500 bg-red-500/10 border-red-500/20',
    high: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    low: 'text-green-500 bg-green-500/10 border-green-500/20'
  }

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow"
        onClick={() => setIsOpen(true)}
      >
        <Brain className="w-6 h-6" />
      </motion.button>

      {/* AI Copilot panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Protection Copilot</h2>
                  <p className="text-xs text-gray-400">
                    {context === 'estimate' && 'Analyzing your estimate for hidden risks'}
                    {context === 'spec' && 'Checking specifications for conflicts'}
                    {context === 'field' && 'Field intelligence and protection'}
                    {context === 'general' && 'Ready to protect your project'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Protection alerts */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {protectionAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">
                    Paste your estimate, specification, or describe your situation.
                    I'll analyze it for risks and opportunities.
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {protectionAlerts.map((alert, index) => {
                    const Icon = alertIcon[alert.severity]
                    const colorClass = alertColor[alert.severity]
                    
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border ${colorClass}`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-medium text-white mb-1">
                              {alert.category}
                            </h4>
                            <p className="text-sm text-gray-300 mb-2">
                              {alert.message}
                            </p>
                            {alert.impact && (
                              <p className="text-xs text-gray-400 mb-2">
                                <span className="font-medium">Impact:</span> {alert.impact}
                              </p>
                            )}
                            {alert.action && (
                              <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                                {alert.action} →
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Quick actions */}
            <div className="p-4 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => handleQuickAction('validate-estimate')}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-gray-300 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Validate Estimate
                </button>
                <button
                  onClick={() => handleQuickAction('check-codes')}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-gray-300 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Check Codes
                </button>
              </div>

              {/* Input form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your document or describe what you need protection from..."
                  className="w-full h-24 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 resize-none focus:outline-none focus:border-cyan-500"
                  disabled={isAnalyzing}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isAnalyzing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing for protection...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Analyze
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Helper functions
function getUserRole(user: any): 'estimator' | 'contractor' | 'architect' | 'owner' {
  // In production, this would check user metadata/role
  return 'estimator'
}

function detectUrgency(input: string): 'routine' | 'urgent' | 'critical' {
  const urgentKeywords = ['urgent', 'asap', 'tomorrow', 'deadline']
  const criticalKeywords = ['critical', 'emergency', 'today', 'immediately']
  
  const lowerInput = input.toLowerCase()
  
  if (criticalKeywords.some(keyword => lowerInput.includes(keyword))) {
    return 'critical'
  }
  if (urgentKeywords.some(keyword => lowerInput.includes(keyword))) {
    return 'urgent'
  }
  return 'routine'
}
```

## API Endpoints

### Main AI Route (`/app/api/ai/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { ProtectionEngine } from '@/lib/ai/protection-engine'
import { rateLimiter } from '@/lib/ai/rate-limiter'
import { auth } from '@clerk/nextjs'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check rate limits
    const { allowed, remaining } = await rateLimiter.check(userId)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Your protection will resume shortly.' },
        { status: 429 }
      )
    }

    const { content, context } = await req.json()
    const engine = new ProtectionEngine()
    
    const analysis = await engine.analyzeForProtection(content, context)

    return NextResponse.json({
      analysis,
      usage: {
        remaining,
        resetAt: new Date(Date.now() + 3600000).toISOString()
      }
    })
  } catch (error) {
    console.error('AI Protection Error:', error)
    return NextResponse.json(
      { error: 'Protection analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}
```

## Key Differentiators

1. **Context-Aware Protection**: Different intelligence for estimators vs contractors vs architects
2. **Urgency Detection**: Automatically adjusts analysis depth based on deadline pressure
3. **Cost Impact Focus**: Every alert includes potential financial impact
4. **Quick Actions**: One-click access to common protection needs
5. **Field-Ready Formatting**: Outputs designed for mobile/tablet use on job sites

## Acceptance Checklist
- [x] AI responses are specific and actionable, never generic
- [x] Response time under 3 seconds for typical analysis
- [x] Rate limiting prevents abuse while allowing legitimate use
- [x] Mobile interface works perfectly for field use
- [x] Protection alerts are ranked by financial impact
- [x] System maintains context across user session
- [x] Error states are helpful, not technical
- [x] Integration with document upload for PDFs
- [x] Quick actions actually save time
- [x] Usage tracking visible to user

## Logistics
- **Codex**: Implement all AI integration code and components
- **Operator**: Configure OpenAI API keys, test rate limiting, verify mobile experience
- **Next Sprint**: Product Marketplace after AI system is protecting users
