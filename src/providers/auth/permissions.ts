import { AuthUser } from '@/types/auth_types';

// Mirrors admin/providers/auth/permissions.ts — UX convenience only,
// the backend re-checks every request.

export const SUPER_ADMIN_PERMISSIONS = ['system:*', 'all'];
export const SHOP_ADMIN_PERMISSION = 'shop:*';

export function getPermissions(user: AuthUser | null | undefined): Set<string> {
  const perms = new Set<string>();
  for (const role of user?.roles ?? []) for (const p of role.permissions ?? []) perms.add(p);
  return perms;
}

export function isSuperAdmin(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (user.is_root) return true;
  const perms = getPermissions(user);
  return SUPER_ADMIN_PERMISSIONS.some((p) => perms.has(p));
}

export function hasPermission(user: AuthUser | null | undefined, ...permissions: string[]) {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  const perms = getPermissions(user);
  return permissions.some((p) => perms.has(p));
}

export function isShopAdmin(user: AuthUser | null | undefined, shopId?: number | null) {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  const target = shopId ?? user.default_shop_id;
  if (target == null) return false;
  return (user.roles ?? []).some(
    (r) => r.shop_id === target && r.permissions.includes(SHOP_ADMIN_PERMISSION),
  );
}

export function hasShopPermission(
  user: AuthUser | null | undefined,
  shopId: number | null | undefined,
  ...permissions: string[]
) {
  if (!user) return false;
  const target = shopId ?? user.default_shop_id;
  if (target == null) return false;
  if (isShopAdmin(user, target)) return true;
  return (user.roles ?? []).some(
    (r) => r.shop_id === target && permissions.some((p) => r.permissions.includes(p)),
  );
}
