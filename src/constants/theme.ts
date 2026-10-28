// Semantic color tokens (mirrors the admin web app's shadcn tokens).
// Never hardcode colors in screens/components — read them via useTheme().colors.

export const lightColors = {
  background: "#ffffff",
  foreground: "#0a0a0a",
  card: "#ffffff",
  muted: "#f5f5f5",
  mutedForeground: "#737373",
  border: "#e5e5e5",
  primary: "#c6005b",
  primaryForeground: "#fdf2f8",
  destructive: "#dc2626",
  success: "#16a34a",
  warning: "#d97706",
  info: "#2563eb",
} as const;

export type ColorTokens = { [K in keyof typeof lightColors]: string };
export type ColorName = keyof ColorTokens;

export const darkColors: ColorTokens = {
  background: "#0a0a0a",
  foreground: "#fafafa",
  card: "#171717",
  muted: "#262626",
  mutedForeground: "#a1a1aa",
  border: "#ffffff26",
  primary: "#a3004c",
  primaryForeground: "#fdf2f8",
  destructive: "#ef4444",
  success: "#22c55e",
  warning: "#f59e0b",
  info: "#60a5fa",
};

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const Radius = { sm: 6, md: 10, lg: 16 } as const;
