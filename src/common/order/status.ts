import { ColorName } from '@/constants/theme';
import { OrderItemStatus } from '@/types/shop_types';

export const STATUS_TONE: Record<OrderItemStatus, ColorName> = {
  pending: 'warning',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'destructive',
};

/** The one-tap "what happens next" for each status; none for finished orders. */
export const NEXT_STEP: Partial<Record<OrderItemStatus, { to: OrderItemStatus; label: string }>> = {
  pending: { to: 'processing', label: 'Accept & start processing' },
  processing: { to: 'shipped', label: 'Mark as shipped' },
  shipped: { to: 'delivered', label: 'Mark as delivered' },
};
