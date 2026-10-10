'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// Shared in-memory presence state across all components in the tab
let globalCount: number = 42;
const listeners = new Set<(count: number) => void>();
let isSubscribed = false;
let globalChannel: any = null;

export function useOnlineUsers(baseline: number = 42) {
  const [count, setCount] = useState<number>(() => globalCount || baseline);

  useEffect(() => {
    listeners.add(setCount);

    if (!isSubscribed) {
      isSubscribed = true;
      const supabase = createClient();

      const clientId =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('stranger_presence_id') ||
            (() => {
              const id = 'user_' + Math.random().toString(36).substring(2, 9);
              try {
                sessionStorage.setItem('stranger_presence_id', id);
              } catch {}
              return id;
            })()
          : 'guest';

      globalChannel = supabase.channel('online-presence', {
        config: {
          presence: {
            key: clientId,
          },
        },
      });

      const updateCount = () => {
        if (!globalChannel) return;
        const presenceState = globalChannel.presenceState();
        const activeCount = Object.keys(presenceState).length;
        const total = Math.max(activeCount + baseline, baseline);
        globalCount = total;
        listeners.forEach((listener) => listener(total));
      };

      globalChannel
        .on('presence', { event: 'sync' }, updateCount)
        .on('presence', { event: 'join' }, updateCount)
        .on('presence', { event: 'leave' }, updateCount)
        .subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            try {
              await globalChannel.track({
                online_at: new Date().toISOString(),
              });
            } catch {}
          }
        });
    }

    return () => {
      listeners.delete(setCount);
    };
  }, [baseline]);

  return count;
}
