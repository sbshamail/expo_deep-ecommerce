// Semantic color tokens (mirrors the admin web app's shadcn tokens).
// Never hardcode colors in screens/components — read them via useTheme().colors.

export const lightColors = {
  background: '#ffffff',
  foreground: '#0a0a0a',
  card: '#ffffff',
  muted: '#f4f4f5',
  mutedForeground: '#71717a',
  border: '#e4e4e7',
  primary: '#18181b',
  primaryForeground: '#fafafa',
  destructive: '#dc2626',
  success: '#16a34a',
  warning: '#d97706',
  info: '#2563eb',
} as const;

export type ColorTokens = { [K in keyof typeof lightColors]: string };
export type ColorName = keyof ColorTokens;

export const darkColors: ColorTokens = {
  background: '#09090b',
  foreground: '#fafafa',
  card: '#18181b',
  muted: '#27272a',
  mutedForeground: '#a1a1aa',
  border: '#27272a',
  primary: '#fafafa',
  primaryForeground: '#18181b',
  destructive: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  info: '#60a5fa',
};

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const Radius = { sm: 6, md: 10, lg: 16 } as const;
