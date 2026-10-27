import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { STORAGE_KEYS } from '@/constants/config';
import { ColorTokens, darkColors, lightColors } from '@/constants/theme';
import { storage } from '@/lib/storage';

// 'system' follows the OS; 'light' / 'dark' are explicit user overrides.
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  /** Resolved scheme after applying 'system'. */
  scheme: 'light' | 'dark';
  colors: ColorTokens;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
};

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    storage.get(STORAGE_KEYS.theme).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') setModeState(saved);
    });
  }, []);

  const scheme = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    storage.set(STORAGE_KEYS.theme, next).catch(() => {});
  }, []);

  const toggleMode = useCallback(
    () => setMode(scheme === 'dark' ? 'light' : 'dark'),
    [scheme, setMode],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      scheme,
      colors: scheme === 'dark' ? darkColors : lightColors,
      setMode,
      toggleMode,
    }),
    [mode, scheme, setMode, toggleMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      {/* Keeps expo-router's own navigator chrome in sync with our scheme */}
      <NavThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        {children}
      </NavThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
