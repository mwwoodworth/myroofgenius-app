# Claude AI Integration Implementation

## Objective
Replace the stubbed Claude API call in the onboarding flow with a real integration to analyze imported data per persona and generate actual AI-powered insights for the dashboard.

## Prerequisites
- Claude API key available in `process.env.CLAUDE_API_KEY`
- Anthropic SDK installed: `npm install @anthropic-ai/sdk`
- Persona prompt files in `/prompts` directory

## Implementation Steps

### 1. Update pages/api/onboarding/run.ts

```typescript
import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs/promises'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'

const ALLOWED_PERSONAS = ['Estimator', 'Architect', 'Building Owner', 'Contractor']
const MAX_DATA_SIZE = 10 * 1024 * 1024

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { persona, data } = req.body as { persona: string; data: any }
    
    // Validate persona
    if (!ALLOWED_PERSONAS.includes(persona)) {
      return res.status(400).json({ error: 'Invalid persona', allowed: ALLOWED_PERSONAS })
    }
    
    // Validate data size
    const dataSize = JSON.stringify(data).length
    if (dataSize > MAX_DATA_SIZE) {
      return res.status(413).json({ error: 'Data too large', maxSize: MAX_DATA_SIZE })
    }
    
    // Load persona-specific prompt
    const promptFileName = `${persona.toLowerCase().replace(' ', '')}Prompt.json`
    const filePath = path.join(process.cwd(), 'prompts', promptFileName)
    let promptJson: any
    
    try {
      const promptContent = await fs.readFile(filePath, 'utf8')
      promptJson = JSON.parse(promptContent)
    } catch (err) {
      console.error('Failed to load prompt for', persona, err)
      return res.status(500).json({ 
        error: 'Configuration error', 
        details: 'Unable to load persona configuration' 
      })
    }

    // Initialize Claude client
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error('Claude API key not configured')
    }

    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    })

    // Prepare the prompt with user data
    const systemPrompt = promptJson.systemPrompt || `You are an AI assistant helping a ${persona} in the roofing industry.`
    const userPrompt = `${promptJson.userPromptTemplate || 'Analyze the following data:'}\n\n${JSON.stringify(data)}`

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    })

    // Extract the analysis from Claude's response
    const analysis = message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'Analysis completed'

    // Parse structured data if Claude returns JSON
    let structuredAnalysis = {}
    try {
      // Attempt to extract JSON from the response if present
      const jsonMatch = analysis.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        structuredAnalysis = JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      // If not JSON, use the raw text
      structuredAnalysis = { summary: analysis }
    }

    // Return the analysis results
    return res.status(200).json({
      ok: true,
      persona,
      dataProcessed: dataSize,
      timestamp: new Date().toISOString(),
      analysis: structuredAnalysis,
      rawAnalysis: analysis
    })

  } catch (err: any) {
    console.error('Onboarding error:', err)
    return res.status(500).json({ 
      error: 'Processing failed', 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    })
  }
}
```

### 2. Update Frontend to Handle AI Response

Update the onboarding completion handler to process the AI analysis:

```typescript
// In your onboarding completion component
const handleOnboardingComplete = async (response: any) => {
  if (response.analysis) {
    // Store analysis in user profile or session
    await updateUserProfile({
      onboardingAnalysis: response.analysis,
      onboardingCompleted: true,
      persona: response.persona
    })
    
    // Redirect to dashboard with AI insights
    router.push('/dashboard?showInsights=true')
  }
}
```

### 3. Create Persona Prompt Templates

Create prompt files for each persona in `/prompts`:

```json
// prompts/estimatorPrompt.json
{
  "systemPrompt": "You are an AI assistant specializing in roofing cost estimation. Analyze the provided project data and generate actionable insights for accurate estimates.",
  "userPromptTemplate": "Analyze this roofing project data and provide: 1) Key cost drivers, 2) Risk factors, 3) Recommended pricing strategy, 4) Material quantity estimates. Data:",
  "responseFormat": "json"
}
```

## Testing

1. Test with sample data for each persona:
```bash
curl -X POST http://localhost:3000/api/onboarding/run \
  -H "Content-Type: application/json" \
  -d '{
    "persona": "Estimator",
    "data": {
      "projectType": "commercial",
      "squareFootage": 15000,
      "roofType": "flat",
      "condition": "poor"
    }
  }'
```

2. Verify response includes actual AI analysis
3. Check dashboard displays AI-generated insights