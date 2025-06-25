import { NextRequest, NextResponse } from 'next/server'

interface AnalysisResult {
  squareFeet: number
  damage: string
  confidence: number
  bbox?: [number, number, number, number]
}

async function analyzeWithOpenAI(file: File): Promise<AnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    // Fallback to mock when API key is missing
    return { squareFeet: 1500, damage: 'unknown', confidence: 0.5 }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = buffer.toString('base64')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                'Estimate the roof area in square feet and any visible damage. Respond strictly in JSON with fields squareFeet, damage, confidence and optional bbox [x,y,width,height].',
            },
            {
              type: 'image_url',
              image_url: `data:${file.type};base64,${base64}`,
            },
          ],
        },
      ],
      max_tokens: 200,
    }),
  })

  if (!res.ok) {
    throw new Error('Vision API error')
  }

  const data = await res.json()
  const text: string = data.choices?.[0]?.message?.content || '{}'

  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('no json')
    const json = JSON.parse(match[0])
    return json
  } catch (e) {
    throw new Error('parse failed')
  }
}

async function analyze(file: File): Promise<AnalysisResult> {
  if (process.env.EDGE_AI_MODE === 'true') {
    // TODO: swap in local TensorRT/Jetson inference
    return { squareFeet: 1500, damage: 'none', confidence: 0.9 }
  }
  return analyzeWithOpenAI(file)
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const address = formData.get('address') as string | null

  if (!file && !address) {
    return NextResponse.json(
      { error: 'file or address required' },
      { status: 400 }
    )
  }

  if (address && !file) {
    // TODO: fetch satellite image based on address
    return NextResponse.json(
      { error: 'address lookup not implemented' },
      { status: 501 }
    )
  }

  try {
    const result = await analyze(file!)
    return NextResponse.json(result)
  } catch (e) {
    console.error('analysis failed', e)
    return NextResponse.json({ error: 'analysis failed' }, { status: 500 })
  }
}
