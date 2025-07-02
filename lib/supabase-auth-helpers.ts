import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { cache } from 'react';

export const createServerSupabaseClient = cache(() => {
  const cookieStore = cookies();
  return createServerComponentClient({ cookies: () => cookieStore });
});

export async function getSession() {
  const supabase = createServerSupabaseClient();
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}
