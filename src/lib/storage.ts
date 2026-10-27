import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Thin wrapper so the rest of the app never touches expo-secure-store directly.
// expo-secure-store has no web implementation, so web falls back to localStorage
// (fine for development in the browser; native always uses the keychain/keystore).
const web = Platform.OS === 'web';

export const storage = {
  get: async (key: string): Promise<string | null> => {
    try {
      return web ? localStorage.getItem(key) : await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  set: async (key: string, value: string): Promise<void> => {
    if (web) localStorage.setItem(key, value);
    else await SecureStore.setItemAsync(key, value);
  },
  remove: async (key: string): Promise<void> => {
    try {
      if (web) localStorage.removeItem(key);
      else await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};
