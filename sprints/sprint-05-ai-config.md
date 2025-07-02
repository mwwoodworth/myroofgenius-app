# Sprint 05: Fix AI Model Configuration

## Objective
Correct the misconfigured AI models and implement proper error handling for AI services, including fixing the invalid OpenAI model name and implementing fallback strategies.

## Critical Context for Codex
- **Current Issues**: 
  - OpenAI configured with invalid model 'gpt-4o' (should be 'gpt-4' or 'gpt-4-turbo-preview')
  - Image analysis trying to send images to text-only GPT-4 API
  - Missing error handling causes generic failures
- **Solution**: Fix model names, implement proper vision API, add comprehensive error handling

## Implementation Tasks

### Task 1: Create AI Configuration Module
Create file: `app/lib/ai-config.ts`

```typescript
export const AI_MODELS = {
  OPENAI: {
    CHAT: 'gpt-4-turbo-preview',
    VISION: 'gpt-4-vision-preview',
    FALLBACK: 'gpt-3.5-turbo'
  },
  ANTHROPIC: {
    CHAT: 'claude-3-opus-20240229',
    VISION: 'claude-3-opus-20240229'
  },
  GOOGLE: {
    CHAT: 'gemini-pro',
    VISION: 'gemini-pro-vision'
  }
} as const

export const AI_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GOOGLE: 'google'
} as const

export type AIProvider = typeof AI_PROVIDERS[keyof typeof AI_PROVIDERS]

export function getActiveAIProvider(): AIProvider {
  // Priority order: OpenAI -> Anthropic -> Google
  if (process.env.OPENAI_API_KEY) return AI_PROVIDERS.OPENAI
  if (process.env.ANTHROPIC_API_KEY) return AI_PROVIDERS.ANTHROPIC
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return AI_PROVIDERS.GOOGLE
  
  throw new Error('No AI provider API key configured')
}

export function getAIConfig() {
  const provider = getActiveAIProvider()
  
  return {
    provider,
    models: AI_MODELS[provider.toUpperCase() as keyof typeof AI_MODELS],
    apiKey: getAPIKey(provider)
  }
}

function getAPIKey(provider: AIProvider): string {
  switch (provider) {
    case AI_PROVIDERS.OPENAI:
      return process.env.OPENAI_API_KEY!
    case AI_PROVIDERS.ANTHROPIC:
      return process.env.ANTHROPIC_API_KEY!
    case AI_PROVIDERS.GOOGLE:
      return process.env.GOOGLE_GENERATIVE_AI_API_KEY!
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }
}
```

### Task 2: Create Unified AI Service
Create file: `app/lib/ai-service.ts`

```typescript
import { OpenAI } from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getAIConfig, AI_PROVIDERS } from './ai-config'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface VisionOptions {
  imageBase64: string
  prompt: string
  maxTokens?: number
}

class AIService {
  private openai?: OpenAI
  private anthropic?: Anthropic
  private google?: GoogleGenerativeAI

  constructor() {
    const config = getAIConfig()
    
    switch (config.provider) {
      case AI_PROVIDERS.OPENAI:
        this.openai = new OpenAI({ apiKey: config.apiKey })
        break
      case AI_PROVIDERS.ANTHROPIC:
        this.anthropic = new Anthropic({ apiKey: config.apiKey })
        break
      case AI_PROVIDERS.GOOGLE:
        this.google = new GoogleGenerativeAI(config.apiKey)
        break
    }
  }

  async chat(options: ChatOptions): Promise<string> {
    const config = getAIConfig()
    
    try {
      switch (config.provider) {
        case AI_PROVIDERS.OPENAI:
          return await this.chatWithOpenAI(options)
        case AI_PROVIDERS.ANTHROPIC:
          return await this.chatWithAnthropic(options)
        case AI_PROVIDERS.GOOGLE:
          return await this.chatWithGoogle(options)
        default:
          throw new Error('No AI provider configured')
      }
    } catch (error) {
      console.error('AI chat error:', error)
      throw new Error(`AI service error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async vision(options: VisionOptions): Promise<string> {
    const config = getAIConfig()
    
    try {
      switch (config.provider) {
        case AI_PROVIDERS.OPENAI:
          return await this.visionWithOpenAI(options)
        case AI_PROVIDERS.ANTHROPIC:
          return await this.visionWithAnthropic(options)
        case AI_PROVIDERS.GOOGLE:
          return await this.visionWithGoogle(options)
        default:
          throw new Error('No AI provider configured')
      }
    } catch (error) {
      console.error('AI vision error:', error)
      throw new Error(`AI vision error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async chatWithOpenAI(options: ChatOptions): Promise<string> {
    if (!this.openai) throw new Error('OpenAI not initialized')
    
    const config = getAIConfig()
    const { messages, temperature = 0.7, maxTokens = 500 } = options

    try {
      const completion = await this.openai.chat.completions.create({
        model: config.models.CHAT,
        messages: messages as any,
        temperature,
        max_tokens: maxTokens
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error: any) {
      // Fallback to GPT-3.5 if GPT-4 fails
      if (error?.status === 404 || error?.code === 'model_not_found') {
        console.warn('GPT-4 not available, falling back to GPT-3.5-turbo')
        const completion = await this.openai.chat.completions.create({
          model: config.models.FALLBACK,
          messages: messages as any,
          temperature,
          max_tokens: maxTokens
        })
        return completion.choices[0]?.message?.content || ''
      }
      throw error
    }
  }

  private async chatWithAnthropic(options: ChatOptions): Promise<string> {
    if (!this.anthropic) throw new Error('Anthropic not initialized')
    
    const config = getAIConfig()
    const { messages, temperature = 0.7, maxTokens = 500 } = options

    // Convert messages to Anthropic format
    const systemMessage = messages.find(m => m.role === 'system')?.content || ''
    const conversationMessages = messages.filter(m => m.role !== 'system')

    const response = await this.anthropic.messages.create({
      model: config.models.CHAT,
      system: systemMessage,
      messages: conversationMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      })),
      temperature,
      max_tokens: maxTokens
    })

    return response.content[0]?.text || ''
  }

  private async chatWithGoogle(options: ChatOptions): Promise<string> {
    if (!this.google) throw new Error('Google AI not initialized')
    
    const config = getAIConfig()
    const { messages, temperature = 0.7, maxTokens = 500 } = options

    const model = this.google.getGenerativeModel({ 
      model: config.models.CHAT,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens
      }
    })

    // Convert messages to Google format
    const chat = model.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))
    })

    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    
    return result.response.text()
  }

  private async visionWithOpenAI(options: VisionOptions): Promise<string> {
    if (!this.openai) throw new Error('OpenAI not initialized')
    
    const config = getAIConfig()
    const { imageBase64, prompt, maxTokens = 500 } = options

    const response = await this.openai.chat.completions.create({
      model: config.models.VISION,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: maxTokens
    })

    return response.choices[0]?.message?.content || ''
  }

  private async visionWithAnthropic(options: VisionOptions): Promise<string> {
    if (!this.anthropic) throw new Error('Anthropic not initialized')
    
    const config = getAIConfig()
    const { imageBase64, prompt, maxTokens = 500 } = options

    const response = await this.anthropic.messages.create({
      model: config.models.VISION,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64
              }
            }
          ]
        }
      ],
      max_tokens: maxTokens
    })

    return response.content[0]?.text || ''
  }

  private async visionWithGoogle(options: VisionOptions): Promise<string> {
    if (!this.google) throw new Error('Google AI not initialized')
    
    const config = getAIConfig()
    const { imageBase64, prompt, maxTokens = 500 } = options

    const model = this.google.getGenerativeModel({ 
      model: config.models.VISION,
      generationConfig: {
        maxOutputTokens: maxTokens
      }
    })

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      }
    ])

    return result.response.text()
  }
}

// Export singleton instance
export const aiService = new AIService()
```

### Task 3: Update Copilot Route with AI Service
Update: `app/api/copilot/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase-route-handler'
import { aiService } from '@/lib/ai-service'
import { getAIConfig } from '@/lib/ai-config'

// System prompts remain the same
const SYSTEM_PROMPTS = {
  field: `You are a field technician assistant for MyRoofGenius. Help with on-site roofing inspections, safety protocols, and technical guidance.`,
  pm: `You are a project management assistant for MyRoofGenius. Help with project planning, resource allocation, timeline management, and team coordination.`,
  exec: `You are an executive assistant for MyRoofGenius. Provide strategic insights, market analysis, and high-level business guidance for roofing industry leaders.`
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { message, sessionId, role = 'field' } = await req.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Session management code remains the same...
    let session
    if (sessionId) {
      const { data: existingSession } = await supabase
        .from('copilot_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single()

      if (!existingSession) {
        const { data: newSession } = await supabase
          .from('copilot_sessions')
          .insert({ user_id: user.id, metadata: { role } })
          .select()
          .single()
        session = newSession
      } else {
        session = existingSession
        await supabase
          .from('copilot_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', session.id)
      }
    } else {
      const { data: newSession } = await supabase
        .from('copilot_sessions')
        .insert({ user_id: user.id, metadata: { role } })
        .select()
        .single()
      session = newSession
    }

    // Store user message
    await supabase
      .from('copilot_messages')
      .insert({
        session_id: session.id,
        role: 'user',
        content: message
      })

    // Fetch conversation history
    const { data: messages } = await supabase
      .from('copilot_messages')
      .select('role, content')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })
      .limit(10)

    // Build conversation
    const conversation = [
      { 
        role: 'system' as const, 
        content: SYSTEM_PROMPTS[role as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.field 
      },
      ...(messages || []).slice(-9),
      { role: 'user' as const, content: message }
    ]

    try {
      // Use the unified AI service
      const response = await aiService.chat({
        messages: conversation,
        temperature: 0.7,
        maxTokens: 500
      })

      // Store assistant message
      await supabase
        .from('copilot_messages')
        .insert({
          session_id: session.id,
          role: 'assistant',
          content: response
        })

      // Return response with session ID
      return NextResponse.json({
        message: response,
        sessionId: session.id
      })

    } catch (aiError) {
      console.error('AI service error:', aiError)
      
      // Fallback response
      const fallbackMessage = "I'm experiencing technical difficulties right now. Please try again in a moment, or contact support if the issue persists."
      
      await supabase
        .from('copilot_messages')
        .insert({
          session_id: session.id,
          role: 'assistant',
          content: fallbackMessage
        })

      return NextResponse.json({
        message: fallbackMessage,
        sessionId: session.id,
        error: 'AI service temporarily unavailable'
      })
    }

  } catch (error) {
    console.error('Copilot error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
```

### Task 4: Update Roof Analysis Route
Update: `app/api/analyze-roof/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase-route-handler'
import { aiService } from '@/lib/ai-service'

export const maxDuration = 60

// Analysis prompt for roof images
const ROOF_ANALYSIS_PROMPT = `Analyze this roof image and provide a professional assessment including:

1. Roof Type & Material: Identify the roofing material and system type
2. Condition Assessment: Rate the overall condition (Excellent/Good/Fair/Poor)
3. Visible Issues: List any visible damage, wear, or concerns
4. Estimated Age: Provide an estimated age range based on visible wear
5. Maintenance Recommendations: Suggest immediate and long-term maintenance needs
6. Replacement Timeline: Estimate when replacement might be needed

Format your response in clear sections with headers.`

export async function POST(req: Request) {
  try {
    const supabase = createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const image = formData.get('image') as File
    const address = formData.get('address') as string

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      )
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Validate image size (max 20MB)
    if (buffer.length > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image too large. Maximum size is 20MB.' },
        { status: 400 }
      )
    }

    try {
      // Get Mapbox static image if address provided
      let mapImageUrl = null
      if (address && process.env.MAPBOX_TOKEN) {
        const geocodeResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${process.env.MAPBOX_TOKEN}`
        )
        
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json()
          const [lng, lat] = geocodeData.features[0]?.center || []
          
          if (lng && lat) {
            mapImageUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lng},${lat},18,0/600x400@2x?access_token=${process.env.MAPBOX_TOKEN}`
          }
        }
      }

      // Analyze image with AI
      const analysis = await aiService.vision({
        imageBase64: base64Image,
        prompt: ROOF_ANALYSIS_PROMPT,
        maxTokens: 800
      })

      // Parse the analysis into structured data
      const structuredAnalysis = parseRoofAnalysis(analysis)

      // Store analysis in database
      const { data: savedAnalysis, error: dbError } = await supabase
        .from('roof_analyses')
        .insert({
          user_id: user.id,
          address,
          analysis_data: structuredAnalysis,
          map_image_url: mapImageUrl,
          raw_analysis: analysis
        })
        .select()
        .single()

      if (dbError) {
        console.error('Failed to save analysis:', dbError)
      }

      return NextResponse.json({
        success: true,
        analysis: structuredAnalysis,
        analysisId: savedAnalysis?.id,
        mapUrl: mapImageUrl
      })

    } catch (aiError) {
      console.error('AI analysis error:', aiError)
      
      // Return a structured error response
      return NextResponse.json({
        success: false,
        error: 'Analysis failed',
        details: 'Unable to analyze the image. Please ensure the image clearly shows the roof and try again.',
        fallback: {
          roofType: 'Unable to determine',
          condition: 'Analysis pending',
          issues: ['Manual inspection recommended'],
          recommendations: ['Contact a roofing professional for accurate assessment']
        }
      }, { status: 422 })
    }

  } catch (error) {
    console.error('Roof analysis error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function parseRoofAnalysis(analysis: string): any {
  // Basic parsing to extract key information
  const sections = analysis.split('\n\n')
  const parsed: any = {
    roofType: 'Unknown',
    condition: 'Unknown',
    issues: [],
    age: 'Unknown',
    recommendations: [],
    timeline: 'Unknown'
  }

  sections.forEach(section => {
    const lines = section.split('\n')
    const header = lines[0].toLowerCase()

    if (header.includes('type') || header.includes('material')) {
      parsed.roofType = lines.slice(1).join(' ').trim()
    } else if (header.includes('condition')) {
      parsed.condition = lines.slice(1).join(' ').trim()
    } else if (header.includes('issues')) {
      parsed.issues = lines.slice(1).filter(l => l.trim()).map(l => l.replace(/^[-•*]\s*/, ''))
    } else if (header.includes('age')) {
      parsed.age = lines.slice(1).join(' ').trim()
    } else if (header.includes('recommendations')) {
      parsed.recommendations = lines.slice(1).filter(l => l.trim()).map(l => l.replace(/^[-•*]\s*/, ''))
    } else if (header.includes('timeline') || header.includes('replacement')) {
      parsed.timeline = lines.slice(1).join(' ').trim()
    }
  })

  return parsed
}
```

### Task 5: Update Environment Variables
Update: `.env.example`

```env
# AI Provider API Keys (at least one required)
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
GOOGLE_GENERATIVE_AI_API_KEY=xxxxxxxxxxxxx

# Mapbox for satellite imagery
MAPBOX_TOKEN=pk.xxxxxxxxxxxxx

# Other existing variables...
```

### Task 6: Add AI Provider Dependencies
Update: `package.json` dependencies

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.20.0",
    "@google/generative-ai": "^0.5.0",
    "openai": "^4.38.0"
  }
}
```

Run:
```bash
npm install @anthropic-ai/sdk @google/generative-ai
```

## Verification Steps for Codex

1. **Install new dependencies**:
   ```bash
   npm install @anthropic-ai/sdk @google/generative-ai
   ```

2. **Set up AI provider keys**:
   - Add at least one AI provider key to `.env.local`
   - Verify in Vercel environment variables

3. **Test AI chat functionality**:
   - Open Copilot panel
   - Send a message
   - Verify response is generated without errors
   - Check different personas work correctly

4. **Test image analysis**:
   - Upload a roof image
   - Verify analysis completes successfully
   - Check structured data is returned
   - Confirm fallback error handling works

5. **Test fallback scenarios**:
   - Remove API keys and verify error handling
   - Test with invalid model names
   - Verify graceful degradation

6. **Check logs for errors**:
   ```bash
   # In Vercel dashboard, check function logs for:
   - No "model not found" errors
   - Successful AI API calls
   - Proper error handling messages
   ```

## Notes for Next Sprint
Next, we'll create a comprehensive environment variables validation system (Sprint 06) to ensure all required configuration is present before deployment.