import { ProductRead, ProductSingleRead } from '@/types/shop_types';

import { apiFetch, apiList } from './client';

// Everything (up to 200) is loaded once; search/filter chips run on the device.
export const listProducts = (token: string) =>
  apiList<ProductRead>(
    `/product/my-products?${new URLSearchParams({
      limit: '200',
      sort: JSON.stringify(['created_at', 'desc']),
    })}`,
    { token },
  );

export const readProduct = (token: string, id: number | string) =>
  apiFetch<ProductSingleRead>(`/product/read/${id}`, { token });

export const saveProduct = (token: string, id: number | null, form: FormData) =>
  apiFetch<ProductSingleRead>(id ? `/product/update/${id}` : '/product/create', {
    method: 'POST',
    body: form,
    token,
  });

export const deleteProduct = (token: string, id: number) =>
  apiFetch<unknown>(`/product/delete/${id}`, { method: 'DELETE', token });

/** Toggles need only the one field — the backend leaves unsent fields alone. */
export const setProductFlags = (
  token: string,
  id: number,
  flags: { is_active?: boolean; is_featured?: boolean },
) => {
  const form = new FormData();
  for (const [k, v] of Object.entries(flags)) form.append(k, String(v));
  return saveProduct(token, id, form);
};

/** Stock is the only thing the stock screen touches. */
export const setVariantStock = (token: string, variantId: number, stock: number) => {
  const form = new FormData();
  form.append('stock', String(stock));
  return apiFetch<unknown>(`/product-variant/update/${variantId}`, {
    method: 'POST',
    body: form,
    token,
  });
};
