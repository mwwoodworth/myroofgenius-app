import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_type, event_data, user_id, session_id } = body
    
    // Get user info from headers
    const userAgent = request.headers.get('user-agent')
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const referrer = request.headers.get('referer')
    
    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Store analytics event
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        user_id,
        session_id,
        event_type,
        event_data,
        page_url: event_data.page_url || request.headers.get('referer'),
        referrer,
        user_agent: userAgent,
        ip_address: ipAddress
      })
    
    if (error) {
      console.error('Analytics error:', error)
      return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
    }
    
    // Also send to Google Analytics if configured
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event_type, event_data)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }
}
