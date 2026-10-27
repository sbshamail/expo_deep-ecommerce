// Mirrors monofrontend/shared/types/{product,order,review,blog,media}_types.ts
// (backend response shapes) — trimmed to what the mobile screens read.

export interface MediaRead {
  id: number;
  filename: string;
  original: string;
  thumbnail: string | null;
  media_type: string;
}

export interface ProductVariantRead {
  id: number;
  product_id: number;
  sku: string | null;
  price: number | null;
  discount_price: number | null;
  stock: number;
  is_in_stock: boolean;
  weight: number | null;
  attributes: Record<string, string> | null;
  image: MediaRead | null;
  position: number;
}

export interface ProductRead {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  whats_in_box: string | null;
  thumbnail: MediaRead | null;
  images: MediaRead[] | null;
  attributes: { name: string; value: string }[] | null;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  video_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  category: { id: number; name: string; root_id: number };
  total_stock: number;
  min_price: number | null;
  max_price: number | null;
  created_at: string;
}

/** GET /product/read/{id} — variants carry price/stock/sku. */
export interface ProductSingleRead extends ProductRead {
  variants: ProductVariantRead[] | null;
}

export interface CategoryTreeNode {
  id: number;
  name: string;
  slug: string;
  level: number;
  icon: string | null;
  image: MediaRead | null;
  details: string | null;
  parent_id: number | null;
  admin_commission_rate: number | null;
  is_active: boolean;
  children: CategoryTreeNode[];
}

export const ORDER_ITEM_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;
export type OrderItemStatus = (typeof ORDER_ITEM_STATUSES)[number];

export interface OrderShippingAddress {
  city: string;
  phone: string;
  person_name: string;
  region: string;
  postal_code?: string;
  country?: string;
  details: string;
  email?: string;
}

export interface OrderItemRead {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  status: OrderItemStatus;
  variant_attributes: Record<string, string> | null;
  price: number;
  actual_price: number | null;
  quantity: number;
  image: MediaRead | null;
  shipping_address: OrderShippingAddress | null;
  created_at: string;
}

export interface ShopQuestionRead {
  id: number;
  product_id: number;
  product_name: string | null;
  question: string;
  answer: string | null;
  answered_at: string | null;
  author_name: string;
  created_at: string;
}

export interface BlogListRead {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: MediaRead | null;
  video: { url: string; title: string | null; thumbnail: MediaRead | null } | null;
  created_at: string;
}

export interface BlogRead extends BlogListRead {
  /** Sanitised rich-text HTML. */
  content: string;
}

export interface DashboardCounts {
  products: number;
  /** Pending order items, not a lifetime total. */
  orders: number;
  categories: number;
  /** Unanswered product questions. */
  questions: number;
}
