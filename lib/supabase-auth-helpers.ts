import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { cache } from 'react';

interface CachedSession {
  session: any | null;
  expiresAt: number;
}

let cached: CachedSession | null = null;

export const createServerSupabaseClient = cache(() => {
  const cookieStore = cookies();
  return createServerComponentClient({ cookies: () => cookieStore });
});

export async function getSession() {
  if (cached && cached.expiresAt > Date.now()) {
    return cached.session;
  }

  const supabase = createServerSupabaseClient();

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error fetching session:', error);
      return cached?.session ?? null;
    }

    if (session?.expires_at && session.expires_at * 1000 - Date.now() < 60 * 1000) {
      const refreshRes = await supabase.auth.refreshSession();
      if (!refreshRes.error) {
        cached = { session: refreshRes.data.session, expiresAt: Date.now() + 5 * 60 * 1000 };
        return refreshRes.data.session;
      }
    }

    cached = { session, expiresAt: Date.now() + 5 * 60 * 1000 };
    return session;
  } catch (error) {
    console.error('Error fetching session:', error);
    return cached?.session ?? null;
  }
}

export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}
