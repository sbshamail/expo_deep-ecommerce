import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '@/api/client';
import { useAuth } from '@/providers/auth/AuthProvider';

/**
 * Loads data with the signed-in token and re-loads every time the screen
 * regains focus (so a list is fresh after returning from a form) or when
 * `reloadKey` changes (e.g. a status filter). The first
 * load shows `loading`; later ones keep the old data visible and only flip
 * `refreshing`. A failed load sets `error` but keeps whatever data we had —
 * the screen decides how to show it (never replace the whole screen).
 */
export function useFetch<T>(fetcher: (token: string) => Promise<T>, reloadKey: string | number = '') {
  const { token, signOut } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetcherRef = useRef(fetcher);
  // Updated in an effect (declared before the focus effect below) so `load`
  // always calls the latest fetcher without being re-created for it.
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const load = useCallback(
    async (manual = false) => {
      if (!token) return;
      if (manual) setRefreshing(true);
      try {
        setData(await fetcherRef.current(token));
        setError(null);
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return void signOut();
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, signOut],
  );

  // Re-fetch when the key changes (the focus effect below covers mount/focus).
  const lastKey = useRef(reloadKey);
  useEffect(() => {
    if (lastKey.current === reloadKey) return;
    lastKey.current = reloadKey;
    load();
  }, [reloadKey, load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { data, setData, error, loading, refreshing, reload: () => load(true), silentReload: load };
}
