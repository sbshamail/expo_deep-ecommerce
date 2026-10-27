import {
  AuthUser,
  LoginResponseData,
  RefreshResponseData,
  RegisterPayload,
  ResetPasswordPayload,
  SigninPayload,
} from '@/types/auth_types';

import { apiFetch } from './client';

export const login = (body: SigninPayload) =>
  apiFetch<LoginResponseData>('/login', { method: 'POST', body: JSON.stringify(body) });

export const fetchCurrentUser = (token: string) => apiFetch<AuthUser>('/user/read', { token });

// Backend takes refresh_token as a query param, not a body.
export const refreshTokens = (refreshToken: string) =>
  apiFetch<RefreshResponseData>(`/refresh?refresh_token=${encodeURIComponent(refreshToken)}`, {
    method: 'POST',
  });

// Region fields are omitted on purpose — backend defaults them (PK / PKR).
export const register = (body: RegisterPayload) =>
  apiFetch<AuthUser>('/register', { method: 'POST', body: JSON.stringify(body) });

// Emails a 6-digit code (valid 10 min). Always succeeds so emails can't be probed.
export const sendResetOtp = (email: string) =>
  apiFetch<unknown>(`/otp-send-email?email=${encodeURIComponent(email)}`, { method: 'POST' });

export const resetPassword = (body: ResetPasswordPayload) =>
  apiFetch<unknown>('/reset-password', { method: 'POST', body: JSON.stringify(body) });
