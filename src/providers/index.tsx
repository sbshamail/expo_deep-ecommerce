import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AuthProvider from './auth/AuthProvider';
import ThemeProvider from './theme/ThemeProvider';

// Single place where every context provider is composed (outermost first).
// New provider? Create providers/<name>/ and add it here — nowhere else.
const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default AppProviders;
