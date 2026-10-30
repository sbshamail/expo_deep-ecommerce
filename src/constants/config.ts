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

// n8n automations (e.g. the product-import "Generate with AI"). The web admin
// reaches these through its /api/webhook proxy; native has no proxy, so the
// app calls n8n directly — set EXPO_PUBLIC_N8N_API in .env (the same value as
// the web admin's N8N_API) and restart Metro with `-c`.
export const N8N_API = (process.env.EXPO_PUBLIC_N8N_API ?? '').trim().replace(/\/+$/, '');
