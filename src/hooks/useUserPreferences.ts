import React from 'react';

export type UserPreferences = Record<string, any>;

interface UseUserPreferencesReturn {
  prefs: UserPreferences;
  setPref: (key: string, value: any) => Promise<void>;
  setPrefs: (batch: Record<string, any>) => Promise<void>;
  loaded: boolean;
}

export function useUserPreferences(userId: number | null | undefined): UseUserPreferencesReturn {
  const [prefs, setPrefs] = React.useState<UserPreferences>({});
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!userId) { setLoaded(true); return; }
    fetch(`/api/user-preferences?userId=${userId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setPrefs(d.preferences || {});
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [userId]);

  const setPref = React.useCallback(async (key: string, value: any) => {
    if (!userId) return;
    setPrefs(prev => ({ ...prev, [key]: value }));
    try {
      await fetch('/api/user-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, key, value }),
      });
    } catch { /* silently ignore — optimistic update already applied */ }
  }, [userId]);

  const setBatch = React.useCallback(async (batch: Record<string, any>) => {
    if (!userId) return;
    setPrefs(prev => ({ ...prev, ...batch }));
    try {
      await fetch('/api/user-preferences/batch', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, preferences: batch }),
      });
    } catch { /* silently ignore */ }
  }, [userId]);

  return { prefs, setPref, setPrefs: setBatch, loaded };
}
