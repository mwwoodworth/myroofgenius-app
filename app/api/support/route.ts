import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { message } = await request.json();
  if (!message) {
    return NextResponse.json({ error: 'message required' }, { status: 400 });
  }
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  await supabase.from('support_messages').insert({ user_id: user.id, message });
  return NextResponse.json({ success: true });
}
