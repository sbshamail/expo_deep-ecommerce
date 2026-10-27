This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`. There is deliberately **no separate `screens/` folder** — `app/` is where screens live (see "Project structure" below).
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Project structure (read this instead of scanning the code)

This app is the **shop-admin** mobile client only (mirror of `../monofrontend/admin`).
It talks to the FastAPI backend directly via `apiFetch` — native has no Node server, so there is no `/api/*` proxy like the Next admin has (`EXPO_PUBLIC_BACKEND_API_URL` in `.env`, default `http://localhost:8000/api`; on a physical device use the LAN IP; restart Metro with `-c` after editing). Package manager is **pnpm**; `@/*` → `src/*`.

```
src/
├── app/            Expo Router — each file IS the screen (compose it from common/ + components/)
│   ├── _layout.tsx        <AppProviders> + auth guard (Stack.Protected) + splash hide
│   ├── (auth)/            signed-out routes  → index (= sign-in, URL "/"), register, forgot-password (OTP reset)
│   └── (dashboard)/       signed-in routes   → index.tsx
├── common/         Screen-specific pieces, grouped by screen: common/<screen>/Foo.tsx
│                   (knows auth/shop/domain; NOT reusable elsewhere)
├── components/     Reusable, domain-free UI used by any screen
│   └── ui/                primitives: Text, Button, Input, Card, Screen (all themed)
├── providers/      EVERY React context lives here, one folder each
│   ├── index.tsx          AppProviders — the single place providers are composed
│   ├── theme/             ThemeProvider + useTheme() → { mode, scheme, colors, setMode, toggleMode }
│   └── auth/              AuthProvider + useAuth(); permissions.ts (mirrors web admin's)
├── api/            client.ts (apiFetch: unwraps {success,detail,data}, throws ApiError) + per-domain fetchers (auth.ts)
├── constants/      config.ts (API_URL, STORAGE_KEYS), theme.ts (color tokens, Spacing, Radius)
├── lib/            storage.ts (expo-secure-store wrapper) and other pure helpers
└── types/          backend-mirroring types (auth_types.ts, ...)
```

### How to add a screen (follow exactly)

1. Create the route file `src/app/(dashboard)/<path>.tsx` (or `(auth)/`): default-export the screen, wrapped in `<Screen>`. Keep it short — layout + composition only.
2. Put screen-specific parts (forms, cards, lists) in `src/common/<name>/`, not in the route file.
3. Add a `Stack.Screen`/tab in that group's `_layout.tsx` only if it needs options.

### Rules / conventions

- **common vs components**: reusable with zero app knowledge → `components/`; belongs to one screen → `common/<screen>/`; the screen itself → its file in `app/`.
- **Colors/spacing**: never hardcode. Use `useTheme().colors.<token>` and `Spacing`/`Radius` from `constants/theme.ts`. Add a token to *both* `lightColors` and `darkColors`.
- **Providers**: new context → `providers/<name>/<Name>Provider.tsx` exporting default provider + `use<Name>` hook (throws if used outside), then register in `providers/index.tsx`.
- **Auth**: tokens in `expo-secure-store` (via `lib/storage`), never AsyncStorage. Redirects are NOT done imperatively — `Stack.Protected` in `app/_layout.tsx` swaps (auth)/(dashboard) when `useAuth().isAuthenticated` changes. Permission checks (`can`, `canInShop`, `isShopAdmin`) are UX-only; backend re-checks. Permission strings are `resource:action` like on web.
- **API**: call `apiFetch` through `src/api/<domain>.ts` functions, pass `token` from `useAuth()`. Backend envelope is `{success, detail, data, total?}`; zero rows is a valid result, not an error.
- **Errors**: show a fetch error as an inline banner/prop, never replace the whole screen; keep "empty" and "failed to load" states distinct (same rule as web).
- **React Compiler is on** — don't add manual `useMemo`/`useCallback` in new components unless they're context values (as in providers).
- **Every route group needs an `index` route.** `Stack.Protected` redirects to the *group* (e.g. `/(auth)`), not a leaf — a group without `index` shows "Unmatched Route". That's why sign-in is `(auth)/index.tsx` (URL `/`) and the dashboard is `(dashboard)/index.tsx`; only one group is active at a time so both can own `/`. Link to sign-in with `href="/"`.
- Auth flows (all via `src/api/auth.ts`): `POST /login`, `POST /register` (region fields omitted → backend defaults), `POST /otp-send-email?email=` then `POST /reset-password`, `POST /refresh?refresh_token=` (used once on app start if the stored access token 401s). Auth screens share `common/auth/AuthLayout`. A network failure on launch does NOT sign the user out; only a server rejection does.
- Backend login flow: `POST /login {identifier,password}` → `{access_token, refresh_token, user}`; current user: `GET /user/read` (raw, unwrapped).
- Verify with `npx tsc --noEmit` and `npx expo export --platform android` (bundle check). `expo lint` needs eslint installed first (not yet set up).
