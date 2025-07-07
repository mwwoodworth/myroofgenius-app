import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

async function verifyAdmin() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: true };
  const { data: profile } = await supabase.from('user_profiles').select('is_admin').eq('user_id', user.id).single();
  if (!profile?.is_admin) return { error: true };
  return {};
}

export async function GET() {
  const check = await verifyAdmin();
  if (check.error) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Supabase environment variables not configured');
    }
    const admin = createClient(url, key);
    const [{ data: profiles }, { data: userList }] = await Promise.all([
      admin.from('user_profiles').select('user_id, full_name, company_name, is_admin'),
      admin.auth.admin.listUsers()
    ]);
  const emailMap: Record<string, string> = {};
  if (userList?.users) {
    for (const u of userList.users) {
      emailMap[u.id] = u.email ?? '';
    }
  }
  interface Profile {
    user_id: string;
    full_name?: string | null;
    company_name?: string | null;
    is_admin: boolean;
  }

  const combined = (profiles || []).map((p: Profile) => ({
    user_id: p.user_id,
    full_name: p.full_name || '',
    company_name: p.company_name || '',
    email: emailMap[p.user_id] || '',
    is_admin: p.is_admin
  }));
    return NextResponse.json({ users: combined });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const check = await verifyAdmin();
  if (check.error) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const body = await request.json();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Supabase environment variables not configured');
    }
    const admin = createClient(url, key);
    await admin.from('user_profiles').update({ is_admin: body.is_admin }).eq('user_id', body.user_id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
