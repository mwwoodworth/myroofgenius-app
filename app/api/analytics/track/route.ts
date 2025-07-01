import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface AnalyticsBody {
  event_type: string;
  event_data: Record<string, unknown>;
  user_id?: string;
  session_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyticsBody;
    const { event_type, event_data, user_id, session_id } = body;

    // Get user info from headers
    const userAgent = request.headers.get('user-agent');
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const referrer = request.headers.get('referer');

  // Initialize Supabase
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase environment variables not configured');
  }
  const supabase = createClient(url, key);

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
      });

  if (error) {
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }

    // Also send to Google Analytics if configured
  if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && typeof window !== 'undefined') {
    const win = window as unknown as { gtag?: (name: string, data?: unknown) => void };
    win.gtag?.('event', event_type, event_data);
  }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}
