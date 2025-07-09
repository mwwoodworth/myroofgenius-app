import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

let admin: ReturnType<typeof createClient> | null = null;
function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!admin) {
    admin = createClient(url, key);
  }
  return admin;
}

export async function GET(req: NextRequest) {
  const admin = getAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id');
  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 });
  }
  const { data: profile } = await admin
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', userId)
    .single();
  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { data } = await admin
    .from('copilot_logs')
    .select('id, created_at, session_id, user_id, role, message')
    .order('created_at', { ascending: false })
    .limit(20);
  return NextResponse.json({ logs: data || [] });
}
