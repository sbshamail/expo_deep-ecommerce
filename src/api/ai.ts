import { N8N_API } from '@/constants/config';

import { ApiError } from './client';

export interface AIProductVariant {
  sku?: string | null;
  price?: number | null;
  discount_price?: number | null;
  stock?: number | null;
  weight?: number | null;
  /** Source-site image URL — the backend downloads it on save. */
  image?: string | null;
}

/**
 * Mirrors the backend's n8nPrompt.md extraction prompt — every field is
 * optional, since the model only fills in what it found on the page.
 * thumbnail / images / variants[].image are raw source-site URLs.
 */
export interface AIProductSuggestion {
  name?: string | null;
  short_description?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  images?: string[] | null;
  tags?: string[] | null;
  meta_title?: string | null;
  meta_description?: string | null;
  whats_in_box?: string | null;
  video_url?: string | null;
  variants?: AIProductVariant[] | null;
}

/** Scrapes a product page via the n8n `product-ai` webhook. */
export async function generateProduct(url: string, prompt: string): Promise<AIProductSuggestion> {
  if (!N8N_API) throw new ApiError(0, 'AI import is not configured (EXPO_PUBLIC_N8N_API).');

  let res: Response;
  try {
    res = await fetch(`${N8N_API}/webhook/product-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, prompt }),
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection.');
  }
  const payload = await res.json().catch(() => null);

  // n8n's "Respond to Webhook" wraps the result as { output: {...} }; tolerate
  // a bare suggestion in case the workflow changes.
  const suggestion: AIProductSuggestion | null | undefined =
    payload && typeof payload === 'object' && 'output' in payload ? payload.output : payload;
  if (!res.ok || !suggestion || typeof suggestion !== 'object') {
    throw new ApiError(res.status, payload?.message ?? "Couldn't generate product details. Try again.");
  }
  return suggestion;
}
