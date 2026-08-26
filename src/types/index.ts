export interface Category {
  id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  badge?: string | null;
  is_featured: boolean;
  display_order: number;
  products_count?: number;
  children?: Category[];
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text?: string | null;
  is_primary: boolean;
  display_order: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  size?: string | null;
  color_name?: string | null;
  color_hex?: string | null;
  sku?: string | null;
  price_modifier: number;
  stock_quantity: number;
}

export interface Review {
  id: number;
  product_id: number;
  user_id?: number | null;
  user_name: string;
  user_avatar?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  is_verified_purchase: boolean;
  is_approved?: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  category_id?: number | null;
  category?: Category;
  name: string;
  slug: string;
  brand?: string | null;
  sku?: string | null;
  short_description?: string | null;
  description: string;
  price: number;
  compare_at_price?: number | null;
  stock_quantity: number;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_active: boolean;
  rating_average: number;
  review_count: number;
  tags?: string[] | null;
  specifications?: Record<string, string> | null;
  primary_image?: ProductImage | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
  reviews?: Review[];
  created_at: string;
}

export interface Address {
  id: number;
  user_id: number;
  type: 'shipping' | 'billing';
  full_name: string;
  phone?: string | null;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state?: string | null;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant | null;
  quantity: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id?: number | null;
  variant_id?: number | null;
  product_name: string;
  product_sku?: string | null;
  product_image?: string | null;
  variant_name?: string | null;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: number;
  user_id?: number | null;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  shipping_address: {
    full_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  billing_address?: Record<string, string> | null;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'credit_card' | 'cash_on_delivery' | 'paypal' | 'apple_pay' | string;
  payment_transaction_id?: string | null;
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  tracking_code?: string | null;
  carrier?: string | null;
  coupon_code?: string | null;
  notes?: string | null;
  created_at: string;
  shipped_at?: string | null;
  delivered_at?: string | null;
  items?: OrderItem[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'staff' | 'admin' | 'super_admin';
  status?: 'active' | 'suspended';
  permissions?: string[];
  phone?: string | null;
  avatar?: string | null;
  addresses?: Address[];
  orders?: Order[];
  created_at?: string;
}

export interface CouponValidation {
  valid: boolean;
  code?: string;
  type?: 'percentage' | 'fixed';
  value?: number;
  discount_amount?: number;
  message: string;
}

export interface AdminAnalytics {
  stats: {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    total_products: number;
    low_stock_count: number;
  };
  recent_orders: Order[];
  top_products: Product[];
  sales_trend: { month: string; sales: number; orders: number }[];
}
