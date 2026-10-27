import { DashboardCounts } from '@/types/shop_types';

import { apiFetch } from './client';

export const getCounts = (token: string) => apiFetch<DashboardCounts>('/dashboard/counts', { token });
