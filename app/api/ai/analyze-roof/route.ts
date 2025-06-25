import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'file required' }, { status: 400 })
  }

  // Placeholder analysis logic
  const mockResult = {
    squareFeet: 1500,
    damage: 'none',
    confidence: 0.9,
  }

  return NextResponse.json(mockResult)
}
