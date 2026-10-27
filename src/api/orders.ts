import { OrderItemRead, OrderItemStatus } from '@/types/shop_types';

import { apiFetch, apiList } from './client';

export const listOrderItems = (token: string) =>
  apiList<OrderItemRead>(
    `/order-item/list?${new URLSearchParams({
      limit: '200',
      sort: JSON.stringify(['created_at', 'desc']),
    })}`,
    { token },
  );

export const readOrderItem = (token: string, id: number | string) =>
  apiFetch<OrderItemRead>(`/order-item/read/${id}`, { token });

export const updateOrderItemStatus = (token: string, id: number, status: OrderItemStatus) =>
  apiFetch<OrderItemRead>(`/order-item/update-status/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    token,
  });
