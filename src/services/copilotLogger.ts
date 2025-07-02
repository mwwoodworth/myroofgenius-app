import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Supabase environment variables not configured');
    }
    client = createClient(url, key);
  }
  return client;
}

export interface CopilotLogEntry {
  session_id: string;
  user_id?: string;
  role: 'user' | 'assistant';
  message: string;
  metadata?: Record<string, unknown>;
}

export async function logCopilotInteraction(entry: CopilotLogEntry): Promise<void> {
  const supabase = getClient();
  try {
    await supabase.from('copilot_logs').insert({
      session_id: entry.session_id,
      user_id: entry.user_id,
      role: entry.role,
      message: entry.message,
      metadata: entry.metadata || {},
    });
  } catch (err) {
    console.error('Copilot log failed', err);
  }
}

export async function getCopilotLogs(sessionId: string) {
  const supabase = getClient();
  const { data } = await supabase
    .from('copilot_logs')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at');
  return data || [];
}
