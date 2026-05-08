'use client';

import { useEffect, useState } from 'react';
import type { HydroUser } from '../domain/auth.types';
import { getCurrentUser } from '../services/auth.client';

export function useAuthSession() {
  const [user, setUser] = useState<HydroUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const sync = async () => {
      try {
        const current = await getCurrentUser();
        if (mounted) setUser(current);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setReady(true);
      }
    };
    sync();
    window.addEventListener('hydrorivers:auth-changed', sync);
    window.addEventListener('hydrorivers:mock-changed', sync);
    return () => {
      mounted = false;
      window.removeEventListener('hydrorivers:auth-changed', sync);
      window.removeEventListener('hydrorivers:mock-changed', sync);
    };
  }, []);

  return { user, ready };
}
