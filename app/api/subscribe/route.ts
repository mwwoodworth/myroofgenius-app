import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: process.env.CONVERTKIT_API_KEY,
          email,
        }),
      }
    )

    if (!response.ok) {
      throw new Error('ConvertKit API error')
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Subscription failed' },
      { status: 500 }
    )
  }
}
