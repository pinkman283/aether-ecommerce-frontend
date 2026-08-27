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
  invoice_number?: string;
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
  ip_address?: string | null;
  notes?: string | null;
  order_source?: 'online' | 'pos' | 'admin';
  pos_register_session_id?: number | null;
  cashier_user_id?: number | null;
  cogs_amount?: number;
  gross_profit?: number;
  cash_received?: number;
  change_returned?: number;
  created_at: string;
  shipped_at?: string | null;
  delivered_at?: string | null;
  items?: OrderItem[];
  user?: User;
  cashier_user?: User;
  pos_register_session?: PosRegisterSession;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'staff' | 'admin' | 'super_admin';
  customer_type?: 'registered' | 'guest';
  status?: 'active' | 'suspended' | 'blocked' | 'review';
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  risk_score?: number;
  risk_reasons?: string[];
  internal_notes?: string | null;
  suspended_until?: string | null;
  suspension_reason?: string | null;
  permissions?: string[];
  phone?: string | null;
  avatar?: string | null;
  addresses?: Address[];
  orders?: Order[];
  orders_count?: number;
  total_spent?: number;
  risk_analysis?: {
    score: number;
    level: 'low' | 'medium' | 'high' | 'critical';
    reasons: string[];
    recommendation: string;
  };
  risk_metrics?: {
    total_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    refunded_orders: number;
    failed_orders: number;
    cancellation_rate: number;
    refund_rate: number;
    failed_rate: number;
    total_spent: number;
    aov: number;
    cancellations_24h: number;
    cancellations_7d: number;
    cancellations_30d: number;
  };
  ip_history?: CustomerIpHistoryItem[];
  activity_timeline?: CustomerActivityTimelineItem[];
  created_at?: string;
}

export interface BlockedIp {
  id: number;
  ip_address: string;
  status: 'active' | 'expired' | 'revoked';
  is_active?: boolean;
  reason: string;
  notes?: string | null;
  blocked_by_user_id?: number | null;
  blocked_by?: {
    id: number;
    name: string;
    email: string;
  } | null;
  expires_at?: string | null;
  related_orders_count?: number;
  related_customers_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerIpHistoryItem {
  ip_address: string;
  first_seen: string;
  last_seen: string;
  total_orders: number;
  cancelled_orders: number;
  completed_orders: number;
  failed_orders: number;
  is_blocked: boolean;
  block_details?: {
    id: number;
    reason: string;
    expires_at?: string | null;
  } | null;
  other_customers_count: number;
}

export interface CustomerActivityTimelineItem {
  id: string;
  timestamp: string;
  type: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
  metadata?: Record<string, any>;
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

export interface LeadCartItem {
  product_id?: number;
  id?: number;
  title?: string;
  name?: string;
  price?: number;
  quantity?: number;
  image?: string;
  variant_id?: number | null;
  variant_name?: string | null;
}

export interface Lead {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  cart_items?: LeadCartItem[];
  total_amount: number;
  status: 'new' | 'contacted' | 'in_progress' | 'converted' | 'lost';
  notes?: string | null;
  source: string;
  user_id?: number | null;
  user?: User | null;
  converted_order_id?: number | null;
  converted_order?: Order | null;
  created_at: string;
  updated_at: string;
}

export interface LeadStats {
  total_leads: number;
  pipeline_value: number;
  new_leads_count: number;
  contacted_count: number;
  in_progress_count: number;
  converted_count: number;
  lost_count: number;
  conversion_rate: number;
}

// ==========================================
// VENDORS & PROCUREMENT
// ==========================================
export interface Vendor {
  id: number;
  vendor_code: string;
  name: string;
  company_name: string;
  contact_person?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  tax_number?: string | null;
  payment_terms: string;
  notes?: string | null;
  status: 'active' | 'inactive';
  vendor_products_count?: number;
  purchase_orders_count?: number;
  vendor_products?: VendorProduct[];
  purchase_orders?: PurchaseOrder[];
  price_histories?: VendorPriceHistory[];
  created_at: string;
  updated_at: string;
}

export interface VendorProduct {
  id: number;
  vendor_id: number;
  product_id: number;
  variant_id?: number | null;
  vendor_sku?: string | null;
  purchase_price: number;
  currency: string;
  min_order_quantity: number;
  lead_time_days: number;
  is_primary: boolean;
  status: 'active' | 'inactive';
  vendor?: Vendor;
  product?: Product;
  variant?: ProductVariant | null;
  created_at: string;
  updated_at: string;
}

export interface VendorPriceHistory {
  id: number;
  vendor_id: number;
  product_id: number;
  variant_id?: number | null;
  price: number;
  effective_date: string;
  changed_by_user_id?: number | null;
  notes?: string | null;
  product?: Product;
  created_at: string;
}

export interface PurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  product_id: number;
  variant_id?: number | null;
  product_name: string;
  sku: string;
  unit_cost: number;
  quantity_ordered: number;
  quantity_received: number;
  quantity_damaged: number;
  quantity_rejected: number;
  subtotal: number;
  product?: Product;
  variant?: ProductVariant | null;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  vendor_id: number;
  status: 'draft' | 'submitted' | 'approved' | 'partially_received' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery_date?: string | null;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  other_costs: number;
  total_amount: number;
  notes?: string | null;
  created_by_user_id: number;
  approved_by_user_id?: number | null;
  approved_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  vendor?: Vendor;
  items_count?: number;
  items?: PurchaseOrderItem[];
  goods_receipts?: GoodsReceipt[];
  created_by_user?: User;
  approved_by_user?: User;
  created_at: string;
  updated_at: string;
}

export interface GoodsReceiptItem {
  id: number;
  goods_receipt_id: number;
  purchase_order_item_id: number;
  product_id: number;
  variant_id?: number | null;
  quantity_received: number;
  quantity_damaged: number;
  quantity_rejected: number;
  unit_cost: number;
  total_cost: number;
  product?: Product;
  variant?: ProductVariant | null;
  purchase_order_item?: PurchaseOrderItem;
}

export interface GoodsReceipt {
  id: number;
  receipt_number: string;
  purchase_order_id: number;
  vendor_id: number;
  received_by_user_id: number;
  received_date: string;
  notes?: string | null;
  purchase_order?: PurchaseOrder;
  vendor?: Vendor;
  received_by_user?: User;
  items?: GoodsReceiptItem[];
  created_at: string;
  updated_at: string;
}

// ==========================================
// INVENTORY COSTING & LEDGER
// ==========================================
export interface InventoryCostLayer {
  id: number;
  product_id: number;
  variant_id?: number | null;
  goods_receipt_item_id?: number | null;
  unit_cost: number;
  initial_quantity: number;
  remaining_quantity: number;
  is_depleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: number;
  product_id: number;
  variant_id?: number | null;
  movement_type: 'purchase_received' | 'pos_sale' | 'online_sale' | 'customer_return' | 'refund_restock' | 'damage_writeoff' | 'manual_adjustment';
  quantity: number;
  unit_cost: number;
  total_cost: number;
  balance_after: number;
  reference_type?: string | null;
  reference_id?: string | null;
  user_id?: number | null;
  notes?: string | null;
  product?: Product;
  variant?: ProductVariant | null;
  user?: User;
  created_at: string;
}

export interface ProductValuation {
  id: number;
  name: string;
  sku: string;
  category: string;
  category_id?: number | null;
  stock_quantity: number;
  retail_price: number;
  average_unit_cost: number;
  total_inventory_cost: number;
  potential_retail_value: number;
  potential_gross_margin: number;
  cost_layers_count: number;
  active_layers?: InventoryCostLayer[];
  image?: string | null;
}

// ==========================================
// POS (POINT OF SALE)
// ==========================================
export interface PosRegister {
  id: number;
  name: string;
  code: string;
  status: 'open' | 'closed';
  active_session?: PosRegisterSession | null;
  created_at: string;
  updated_at: string;
}

export interface PosCashMovement {
  id: number;
  pos_register_session_id: number;
  type: 'cash_in' | 'cash_out' | 'drop';
  amount: number;
  reason: string;
  user_id: number;
  user?: User;
  created_at: string;
}

export interface PosRegisterSession {
  id: number;
  pos_register_id: number;
  user_id: number;
  opened_at: string;
  closed_at?: string | null;
  opening_balance: number;
  cash_sales_amount: number;
  card_sales_amount: number;
  mobile_sales_amount: number;
  cash_in_amount: number;
  cash_out_amount: number;
  cash_refunds_amount: number;
  expected_cash_balance: number;
  actual_closing_cash?: number | null;
  cash_difference?: number | null;
  closing_notes?: string | null;
  status: 'open' | 'closed';
  pos_register?: PosRegister;
  register?: PosRegister;
  user?: User;
  cash_movements?: PosCashMovement[];
  created_at: string;
  updated_at: string;
}

export interface PosReceipt {
  order_id?: number;
  invoice_number?: string;
  order_number: string;
  date: string;
  cashier: string;
  register: string;
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: string;
  cash_received: number;
  change: number;
}

// ==========================================
// EXPENSES & FINANCE
// ==========================================
export interface ExpenseCategory {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  is_active: boolean;
  expenses_count?: number;
  created_at: string;
}

export interface Expense {
  id: number;
  expense_number: string;
  expense_category_id: number;
  title: string;
  amount: number;
  expense_date: string;
  payee_vendor_id?: number | null;
  payee_name?: string | null;
  payment_method: string;
  reference_number?: string | null;
  receipt_attachment_url?: string | null;
  notes?: string | null;
  status: 'recorded' | 'approved' | 'cancelled';
  created_by_user_id: number;
  category?: ExpenseCategory;
  payee_vendor?: Vendor | null;
  created_by_user?: User;
  created_at: string;
  updated_at: string;
}

export interface FinancialSummary {
  period: {
    from: string;
    to: string;
  };
  metrics: {
    gross_sales: number;
    discounts: number;
    refunds: number;
    net_sales: number;
    cogs: number;
    gross_profit: number;
    gross_margin_percentage: number;
    operating_expenses: number;
    operating_profit: number;
    net_margin_percentage: number;
    total_orders: number;
    avg_order_value: number;
  };
  channels: {
    online: { sales: number; orders_count: number };
    pos: { sales: number; orders_count: number };
  };
  expense_categories: {
    category_id: number;
    category_name: string;
    total_spent: number;
    count: number;
  }[];
}

export interface ProductProfitabilityItem {
  product_id: number;
  name: string;
  sku: string;
  category: string;
  image?: string | null;
  units_sold: number;
  net_revenue: number;
  cogs: number;
  gross_profit: number;
  gross_margin_percentage: number;
  stock_on_hand: number;
  inventory_value: number;
}

export interface VendorAnalyticsItem {
  id: number;
  name: string;
  vendor_code: string;
  status: string;
  total_spend: number;
  purchase_orders_count: number;
  units_purchased: number;
  avg_unit_cost: number;
  products_supplied_count: number;
}

export interface SalesSummary {
  total_sales: number;
  total_transactions: number;
  average_invoice_value: number;
  pos_sales: number;
  online_sales: number;
  total_tax_collected: number;
  total_discount_given: number;
}

export interface SalesInvoice {
  invoice_number: string;
  order_number: string;
  order_source: 'online' | 'pos' | 'admin';
  issue_date: string;
  issue_timestamp: string;
  payment_status: string;
  payment_method: string;
  order_status: string;
  company: {
    name: string;
    tagline: string;
    address: string;
    tax_number: string;
    phone: string;
    email: string;
    website: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
    shipping_address?: any;
    billing_address?: any;
  };
  terminal: {
    register_name: string;
    cashier_name: string;
    session_id?: number | null;
  };
  items: {
    id: number;
    sku: string;
    name: string;
    variant?: string | null;
    quantity: number;
    unit_price: number;
    discount_amount: number;
    total_price: number;
  }[];
  financials: {
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    shipping_amount: number;
    total_amount: number;
    cash_received: number;
    change_returned: number;
    payment_transaction_id?: string | null;
  };
  notes?: string | null;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  user_name: string;
  user_role: string;
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  description: string | null;
  old_values: any | null;
  new_values: any | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
  };
}

export interface AuditLogStats {
  total_logs: number;
  today_logs: number;
  auth_events: number;
  financial_ops: number;
}

export interface AuditLogFacets {
  entity_types: string[];
  actors: {
    id: number;
    name: string;
    email: string;
    role: string;
  }[];
  modules: {
    id: string;
    label: string;
  }[];
}

export interface AuditLogsResponse {
  logs: {
    data: AuditLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
  stats: AuditLogStats;
  facets: AuditLogFacets;
}
