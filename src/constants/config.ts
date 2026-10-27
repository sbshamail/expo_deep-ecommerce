// Native apps have no Node server (unlike the Next admin's /api proxy), so
// the app calls the FastAPI backend directly. EXPO_PUBLIC_* vars are inlined
// at bundle time (restart Metro with `-c` after editing .env). On a physical
// device "localhost" is the phone itself — use your computer's LAN IP.
export const API_URL = (
  process.env.EXPO_PUBLIC_BACKEND_API_URL ?? 'http://localhost:8000/api'
)
  .trim()
  .replace(/\/+$/, '');

export const STORAGE_KEYS = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  theme: "theme_mode",
} as const;
