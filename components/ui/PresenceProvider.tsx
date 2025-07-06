'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';

export interface PresenceUser {
  id: string;
  name?: string;
  avatar_url?: string;
}

const PresenceContext = createContext<PresenceUser[]>([]);

export function PresenceProvider({ room, children }: { room: string; children: ReactNode }) {
  const supabase = createClientComponentClient();
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    let mounted = true;
    let channel: any;

    async function setup() {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      const key = user?.id || crypto.randomUUID();
      channel = supabase.channel(`presence:${room}`, { config: { presence: { key } } });

      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as Record<string, PresenceUser[]>;
        const list = Object.values(state).flat();
        if (mounted) setUsers(list);
      });

      await channel.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: user?.id || key,
            name: user?.user_metadata?.full_name || user?.email || 'Guest',
            avatar_url: user?.user_metadata?.avatar_url || undefined
          });
        }
      });
    }

    setup();
    return () => {
      mounted = false;
      channel?.unsubscribe();
    };
  }, [room, supabase]);

  return <PresenceContext.Provider value={users}>{children}</PresenceContext.Provider>;
}

export const usePresence = () => useContext(PresenceContext);
