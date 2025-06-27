# Sprint 02 — AI Copilot Implementation

## Objective
Deploy a persistent AI Copilot that protects users from costly estimation errors and specification mistakes. This is not a chatbot — it's a protective intelligence layer that anticipates needs, catches errors before they compound, and guides users through complex decisions.

## Why This Matters
Every roofing project has hidden failure points. An experienced estimator might catch 80% of them. The AI Copilot catches the remaining 20% that turn profitable jobs into losses. It's the difference between software that works and software that protects.

## File Targets
- `components/ai/AICopilot.tsx` (new)
- `components/ai/CopilotProvider.tsx` (new)
- `lib/ai/copilot-engine.ts` (new)
- `lib/ai/prompt-templates.ts` (new)
- `app/api/copilot/route.ts` (new)
- `pages/_app.tsx`
- `pages/dashboard.tsx`
- `pages/estimator.tsx`
- `hooks/useAICopilot.ts` (new)
- `types/copilot.ts` (new)

## Step-by-Step Instructions

### 1. Define Copilot Types and Context
Establish the protective intelligence framework:

```typescript
// types/copilot.ts
export interface CopilotContext {
  user: {
    role: 'estimator' | 'contractor' | 'architect' | 'owner'
    experience: 'beginner' | 'intermediate' | 'expert'
    currentProject?: {
      type: string
      value: number
      sqft: number
      complexity: 'simple' | 'moderate' | 'complex'
    }
  }
  page: string
  activeTask?: string
  recentActions: Array<{
    action: string
    timestamp: Date
    result?: 'success' | 'warning' | 'error'
  }>
}

export interface CopilotSuggestion {
  id: string
  type: 'warning' | 'tip' | 'validation' | 'next-step'
  priority: 'high' | 'medium' | 'low'
  message: string
  action?: {
    label: string
    handler: () => void
  }
  context: string[]
}

export interface CopilotState {
  isActive: boolean
  isMinimized: boolean
  suggestions: CopilotSuggestion[]
  isThinking: boolean
  lastInteraction: Date | null
}
```

### 2. Build the Copilot Engine
Create the protective logic that monitors user actions:

```typescript
// lib/ai/copilot-engine.ts
import { CopilotContext, CopilotSuggestion } from '@/types/copilot'
import { promptTemplates } from './prompt-templates'

export class CopilotEngine {
  private context: CopilotContext
  private apiKey: string
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.context = this.getDefaultContext()
  }
  
  private getDefaultContext(): CopilotContext {
    return {
      user: {
        role: 'estimator',
        experience: 'intermediate'
      },
      page: '/',
      recentActions: []
    }
  }
  
  updateContext(updates: Partial<CopilotContext>) {
    this.context = { ...this.context, ...updates }
    this.analyzeForRisks()
  }
  
  private async analyzeForRisks() {
    // Protective checks based on context
    const risks = []
    
    if (this.context.user.currentProject) {
      const { value, sqft } = this.context.user.currentProject
      const pricePerSqft = value / sqft
      
      // Protect against pricing errors
      if (pricePerSqft < 4.5) {
        risks.push({
          type: 'warning',
          priority: 'high',
          message: 'Price per sq ft seems low. Industry average is $4.50-8.50. This could lead to margin loss.'
        })
      }
      
      if (pricePerSqft > 12) {
        risks.push({
          type: 'warning',
          priority: 'medium',
          message: 'Price per sq ft is above typical range. Ensure all premium features are documented.'
        })
      }
    }
    
    // Check for incomplete specifications
    if (this.context.page === 'estimator') {
      const recentEstimateActions = this.context.recentActions.filter(
        a => a.action.includes('estimate')
      )
      
      if (recentEstimateActions.length > 0 && !recentEstimateActions.some(a => a.action.includes('warranty'))) {
        risks.push({
          type: 'tip',
          priority: 'medium',
          message: 'Remember to specify warranty terms. Unclear warranties cause 23% of disputes.'
        })
      }
    }
    
    return risks
  }
  
  async getSuggestions(): Promise<CopilotSuggestion[]> {
    const risks = await this.analyzeForRisks()
    const contextualTips = await this.getContextualTips()
    
    return [...risks, ...contextualTips]
      .map((s, index) => ({
        ...s,
        id: `suggestion-${Date.now()}-${index}`,
        context: [this.context.page, this.context.activeTask || '']
      }))
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
  }
  
  private async getContextualTips(): Promise<Partial<CopilotSuggestion>[]> {
    // AI-powered contextual suggestions
    const prompt = promptTemplates.contextualAssistance(this.context)
    
    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context: this.context })
      })
      
      if (!response.ok) throw new Error('Copilot API error')
      
      const { suggestions } = await response.json()
      return suggestions
    } catch (error) {
      console.error('Copilot suggestion error:', error)
      return []
    }
  }
  
  recordAction(action: string, result?: 'success' | 'warning' | 'error') {
    this.context.recentActions.push({
      action,
      timestamp: new Date(),
      result
    })
    
    // Keep only last 20 actions
    if (this.context.recentActions.length > 20) {
      this.context.recentActions.shift()
    }
    
    this.analyzeForRisks()
  }
}
```

### 3. Create Prompt Templates
Build protective prompts that guide the AI:

```typescript
// lib/ai/prompt-templates.ts
import { CopilotContext } from '@/types/copilot'

export const promptTemplates = {
  contextualAssistance: (context: CopilotContext) => `
You are a protective AI assistant for roofing professionals. Your role is to prevent costly mistakes and guide users to successful project outcomes.

Current Context:
- User Role: ${context.user.role}
- Experience Level: ${context.user.experience}
- Current Page: ${context.page}
- Active Task: ${context.activeTask || 'none'}
${context.user.currentProject ? `
- Project Type: ${context.user.currentProject.type}
- Project Value: $${context.user.currentProject.value}
- Square Footage: ${context.user.currentProject.sqft}
- Complexity: ${context.user.currentProject.complexity}
` : ''}

Recent Actions:
${context.recentActions.map(a => `- ${a.action} (${a.result || 'pending'})`).join('\n')}

Based on this context, provide 2-3 protective suggestions that:
1. Prevent common mistakes for this user type and experience level
2. Highlight risks specific to their current task
3. Suggest next best actions

Format as JSON array with type (warning/tip/validation/next-step), priority (high/medium/low), and message.

Focus on protecting the user from:
- Pricing errors that erode margins
- Specification gaps that cause disputes
- Compliance issues that delay projects
- Communication failures that damage relationships
`,

  errorPrevention: (errorType: string, context: any) => `
Analyze this ${errorType} error in a roofing project context:
${JSON.stringify(context, null, 2)}

Provide:
1. Root cause (technical but accessible)
2. Business impact if uncorrected
3. Specific fix steps
4. Prevention method for future

Keep response under 150 words. Be direct and protective.
`
}
```

### 4. Build the Copilot UI Component
Create the persistent protective interface:

```tsx
// components/ai/AICopilot.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Lightbulb, CheckCircle, ChevronRight, X, Minimize2, Maximize2 } from 'lucide-react'
import { useAICopilot } from '@/hooks/useAICopilot'
import GlassPanel from '@/components/ui/GlassPanel'
import Button from '@/components/ui/Button'

export default function AICopilot() {
  const { state, suggestions, minimize, maximize, dismiss } = useAICopilot()
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null)
  
  if (!state.isActive) return null
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />
      case 'tip': return <Lightbulb className="w-5 h-5 text-blue-500" />
      case 'validation': return <CheckCircle className="w-5 h-5 text-green-500" />
      default: return <ChevronRight className="w-5 h-5 text-gray-500" />
    }
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500'
      case 'medium': return 'border-l-4 border-amber-500'
      default: return 'border-l-4 border-blue-500'
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className={`fixed bottom-6 right-6 z-50 ${
        state.isMinimized ? 'w-auto' : 'w-96 max-w-[calc(100vw-3rem)]'
      }`}
    >
      <GlassPanel 
        variant="elevated" 
        glow 
        protective
        className="relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h3 className="font-semibold text-sm">AI Copilot</h3>
            {state.isThinking && (
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="glass"
              onClick={() => state.isMinimized ? maximize() : minimize()}
              className="p-1"
            >
              {state.isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="glass"
              onClick={dismiss}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <AnimatePresence mode="wait">
          {!state.isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {suggestions.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Monitoring your work. I'll alert you to any risks or opportunities.
                </p>
              ) : (
                suggestions.map((suggestion) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 ${getPriorityColor(suggestion.priority)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getIcon(suggestion.type)}
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 dark:text-gray-200">
                          {suggestion.message}
                        </p>
                        {suggestion.action && (
                          <Button
                            size="sm"
                            variant="glass"
                            onClick={suggestion.action.handler}
                            className="mt-2"
                          >
                            {suggestion.action.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              
              {/* Status */}
              <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                Protecting your {state.suggestions.length} active decisions
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassPanel>
    </motion.div>
  )
}
```

### 5. Create Copilot Provider
Wrap the app with protective intelligence:

```tsx
// components/ai/CopilotProvider.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CopilotEngine } from '@/lib/ai/copilot-engine'
import { CopilotState, CopilotContext, CopilotSuggestion } from '@/types/copilot'
import { useRouter } from 'next/router'

interface CopilotContextValue {
  state: CopilotState
  suggestions: CopilotSuggestion[]
  engine: CopilotEngine | null
  updateContext: (updates: Partial<CopilotContext>) => void
  minimize: () => void
  maximize: () => void
  dismiss: () => void
}

const CopilotContext = createContext<CopilotContextValue | undefined>(undefined)

export function CopilotProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [engine, setEngine] = useState<CopilotEngine | null>(null)
  const [state, setState] = useState<CopilotState>({
    isActive: true,
    isMinimized: false,
    suggestions: [],
    isThinking: false,
    lastInteraction: null
  })
  
  // Initialize engine
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_AI_COPILOT_ENABLED === 'true') {
      const copilotEngine = new CopilotEngine(process.env.NEXT_PUBLIC_CLAUDE_API_KEY!)
      setEngine(copilotEngine)
    }
  }, [])
  
  // Update context on route change
  useEffect(() => {
    if (engine) {
      engine.updateContext({ page: router.pathname })
      refreshSuggestions()
    }
  }, [router.pathname, engine])
  
  const refreshSuggestions = async () => {
    if (!engine) return
    
    setState(prev => ({ ...prev, isThinking: true }))
    
    try {
      const newSuggestions = await engine.getSuggestions()
      setState(prev => ({
        ...prev,
        suggestions: newSuggestions,
        isThinking: false,
        lastInteraction: new Date()
      }))
    } catch (error) {
      console.error('Failed to get suggestions:', error)
      setState(prev => ({ ...prev, isThinking: false }))
    }
  }
  
  const updateContext = (updates: Partial<CopilotContext>) => {
    if (engine) {
      engine.updateContext(updates)
      refreshSuggestions()
    }
  }
  
  const minimize = () => setState(prev => ({ ...prev, isMinimized: true }))
  const maximize = () => setState(prev => ({ ...prev, isMinimized: false }))
  const dismiss = () => setState(prev => ({ ...prev, isActive: false }))
  
  return (
    <CopilotContext.Provider value={{
      state,
      suggestions: state.suggestions,
      engine,
      updateContext,
      minimize,
      maximize,
      dismiss
    }}>
      {children}
    </CopilotContext.Provider>
  )
}

export const useAICopilot = () => {
  const context = useContext(CopilotContext)
  if (!context) {
    throw new Error('useAICopilot must be used within CopilotProvider')
  }
  return context
}
```

### 6. Create API Route
Handle AI requests with protection:

```typescript
// app/api/copilot/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Anthropic } from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY!
})

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json()
    
    // Validate request
    if (!prompt || !context) {
      return NextResponse.json(
        { error: 'Missing prompt or context' },
        { status: 400 }
      )
    }
    
    // Get AI suggestions
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 500,
      temperature: 0.3, // Low temperature for consistent protective advice
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
    
    // Parse and validate suggestions
    const suggestions = JSON.parse(response.content[0].text)
    
    // Ensure suggestions follow safety guidelines
    const validatedSuggestions = suggestions.filter((s: any) => 
      s.type && s.priority && s.message && s.message.length < 200
    )
    
    return NextResponse.json({ suggestions: validatedSuggestions })
  } catch (error) {
    console.error('Copilot API error:', error)
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    )
  }
}
```

### 7. Integrate into App
Add the protective layer to your application:

```tsx
// pages/_app.tsx
import { CopilotProvider } from '@/components/ai/CopilotProvider'
import AICopilot from '@/components/ai/AICopilot'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CopilotProvider>
      <Component {...pageProps} />
      <AICopilot />
    </CopilotProvider>
  )
}
```

## Commit Message
```
feat(ai): implemented protective AI Copilot system

- Built CopilotEngine with risk detection and contextual awareness
- Created persistent UI that monitors user actions
- Implemented real-time suggestion system for error prevention
- Added Claude integration for intelligent assistance
- Protects users from pricing errors, spec gaps, and compliance issues
```

## QA/Acceptance Checklist
- [ ] Copilot appears in bottom-right on all pages
- [ ] Green pulse indicator shows active monitoring
- [ ] Suggestions appear within 2 seconds of risky actions
- [ ] High-priority warnings appear at top of suggestion list
- [ ] Minimize/maximize functionality works smoothly
- [ ] API calls complete within 1.5 seconds
- [ ] Error states handled gracefully
- [ ] Mobile view positions copilot appropriately
- [ ] Feature flag `AI_COPILOT_ENABLED` controls visibility

## AI Execution Block

### Codex/Operator Instructions:
1. Create all type definitions in `types/copilot.ts`
2. Implement CopilotEngine class with protective logic
3. Create prompt templates focused on error prevention
4. Build AICopilot UI component with glass styling
5. Implement CopilotProvider with context management
6. Create API route with Claude integration
7. Wrap app with provider and add copilot component
8. Test with sample project data to trigger suggestions
9. Verify protective warnings appear for edge cases
10. Commit with provided message and deploy

**Operator Validation**: Create a test estimate with $3/sqft pricing. Copilot should immediately warn about margin risk. Test warranty specification flow - copilot should remind about warranty terms if skipped.

## Advanced/Optional Enhancements

### Voice Alerts for Critical Warnings
```typescript
// Add to high-priority suggestions
if (suggestion.priority === 'high') {
  const utterance = new SpeechSynthesisUtterance(suggestion.message)
  utterance.rate = 0.9
  window.speechSynthesis.speak(utterance)
}
```

### Learning System
```typescript
// Track which suggestions users act on
const trackSuggestionEngagement = (suggestionId: string, action: 'accepted' | 'dismissed') => {
  analytics.track('copilot_suggestion_engagement', {
    suggestionId,
    action,
    suggestionType: suggestion.type,
    userRole: context.user.role
  })
}
```

### Project-Specific Intelligence
```typescript
// Load project history for deeper insights
const projectHistory = await loadProjectHistory(projectId)
const similarProjects = findSimilarProjects(currentProject, projectHistory)

// Generate insights based on past performance
const historicalRisks = analyzeHistoricalRisks(similarProjects)
```

---

**Reference**: See [QUANTUM_LEAP_CONTEXT.md](/docs/QUANTUM_LEAP_CONTEXT.md) for AI integration standards and protective design principles.