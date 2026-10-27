import { CategoryTreeNode } from '@/types/shop_types';

import { apiFetch } from './client';

// Public endpoint; returns the whole tree (children nested).
export const listCategoryTree = () => apiFetch<CategoryTreeNode[]>('/category/list?limit=500');

export const saveCategory = (token: string, id: number | null, form: FormData) =>
  apiFetch<unknown>(id ? `/category/update/${id}` : '/category/create', {
    method: id ? 'PUT' : 'POST',
    body: form,
    token,
  });

export const deleteCategory = (token: string, id: number) =>
  apiFetch<unknown>(`/category/delete/${id}`, { method: 'DELETE', token });

/** Depth-first flatten, keeping each node's depth for indentation. */
export const flattenTree = (
  nodes: CategoryTreeNode[],
  depth = 0,
): { node: CategoryTreeNode; depth: number }[] =>
  nodes.flatMap((n) => [{ node: n, depth }, ...flattenTree(n.children ?? [], depth + 1)]);
