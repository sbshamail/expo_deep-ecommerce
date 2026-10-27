// Mirrors monofrontend/admin/types/auth_types.ts (backend shapes).

export interface AuthRole {
  id: number;
  name: string;
  permissions: string[];
  shop_id: number | null;
}

export interface AuthShop {
  id: number;
  name: string;
}

// GET /user/read — returned raw by the backend (no envelope).
export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  image: string | null;
  country: string;
  country_code: string;
  currency_code: string;
  currency_symbol: string;
  verified: boolean;
  is_root: boolean;
  default_shop_id: number | null;
  default_shop: AuthShop | null;
  shop: AuthShop | null;
  shops_member: AuthShop[] | null;
  roles: AuthRole[];
}

export interface SigninPayload {
  identifier: string; // email or phone
  password: string;
}

// POST /login (data inside the envelope)
export interface LoginResponseData {
  message: string;
  token_type: string;
  access_token: string;
  refresh_token: string;
  user: AuthUser;
  exp: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  new_password: string;
  confirm_password: string;
}

// POST /refresh (data inside the envelope)
export interface RefreshResponseData {
  access_token: string;
  refresh_token: string;
}
