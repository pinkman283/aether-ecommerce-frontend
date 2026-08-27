import axios from "axios";
import { 
  AdminAnalytics, 
  AuditLog,
  AuditLogsResponse,
  BlockedIp,
  Category, 
  CustomerActivityTimelineItem,
  CustomerIpHistoryItem,
  Expense, 
  ExpenseCategory, 
  FinancialSummary, 
  GoodsReceipt, 
  InventoryCostLayer, 
  InventoryMovement, 
  Lead, 
  LeadStats, 
  Order, 
  PosCashMovement, 
  PosReceipt, 
  PosRegister, 
  PosRegisterSession, 
  Product, 
  ProductProfitabilityItem, 
  ProductValuation, 
  PurchaseOrder, 
  SalesInvoice,
  SalesSummary,
  User, 
  Vendor, 
  VendorAnalyticsItem, 
  VendorProduct 
} from "@/types";

const API_BASE_URL = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api")
  : (process.env.INTERNAL_API_URL || "http://127.0.0.1:8000/api");

export const adminClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

// Attach isolated admin token to requests
adminClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("aether_admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: on 401 or 403 on admin routes
adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      if (error.response?.status === 401 || (error.response?.status === 403 && !window.location.pathname.includes("/admin/login"))) {
        localStorage.removeItem("aether_admin_token");
        localStorage.removeItem("aether_admin_user");
        if (window.location.pathname.startsWith("/admin") && !window.location.pathname.includes("/admin/login")) {
          window.location.href = "/admin/login?error=session_expired";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  client: adminClient,

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  async login(credentials: { email: string; password: string }): Promise<{
    message: string;
    token: string;
    user: User;
  }> {
    const res = await adminClient.post("/admin/auth/login", credentials);
    return res.data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await adminClient.get("/admin/auth/me");
    return res.data;
  },

  async updateProfile(data: {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string | null;
    current_password?: string;
    password?: string;
    password_confirmation?: string;
  }): Promise<{ message: string; user: User }> {
    const res = await adminClient.put("/admin/auth/profile", data);
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await adminClient.post("/admin/auth/logout");
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("aether_admin_token");
        localStorage.removeItem("aether_admin_user");
      }
    }
  },

  // ==========================================
  // ANALYTICS & DASHBOARD
  // ==========================================
  async getAnalytics(): Promise<AdminAnalytics> {
    const res = await adminClient.get("/admin/analytics");
    return res.data;
  },

  // ==========================================
  // PRODUCT CATALOG
  // ==========================================
  async getProducts(params?: {
    search?: string;
    category_id?: number | string;
    stock_status?: string;
    is_active?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<{ data: Product[]; total: number; current_page: number; last_page: number }> {
    const res = await adminClient.get("/admin/products", { params });
    return res.data;
  },

  async getProduct(id: number): Promise<Product> {
    const res = await adminClient.get(`/admin/products/${id}`);
    return res.data;
  },

  async uploadProductImage(file: File): Promise<{ message: string; image_url: string; path: string }> {
    const formData = new FormData();
    formData.append("image", file);
    const res = await adminClient.post("/admin/products/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async createProduct(data: any): Promise<{ message: string; product: Product }> {
    const res = await adminClient.post("/admin/products", data);
    return res.data;
  },

  async updateProduct(id: number, data: any): Promise<{ message: string; product: Product }> {
    const res = await adminClient.put(`/admin/products/${id}`, data);
    return res.data;
  },

  async deleteProduct(id: number): Promise<{ message: string }> {
    const res = await adminClient.delete(`/admin/products/${id}`);
    return res.data;
  },

  async bulkDeleteProducts(ids: number[]): Promise<{ message: string; deleted_count: number }> {
    const res = await adminClient.post("/admin/products/bulk-delete", { ids });
    return res.data;
  },

  // ==========================================
  // CATEGORIES
  // ==========================================
  async getCategories(): Promise<Category[]> {
    const res = await adminClient.get("/admin/categories");
    return res.data;
  },

  async createCategory(data: any): Promise<{ message: string; category: Category }> {
    const res = await adminClient.post("/admin/categories", data);
    return res.data;
  },

  async updateCategory(id: number, data: any): Promise<{ message: string; category: Category }> {
    const res = await adminClient.put(`/admin/categories/${id}`, data);
    return res.data;
  },

  async deleteCategory(id: number): Promise<{ message: string }> {
    const res = await adminClient.delete(`/admin/categories/${id}`);
    return res.data;
  },

  async bulkDeleteCategories(ids: number[]): Promise<{ message: string; deleted_count: number; skipped_count?: number }> {
    const res = await adminClient.post("/admin/categories/bulk-delete", { ids });
    return res.data;
  },

  // ==========================================
  // ORDERS
  // ==========================================
  async getOrders(params?: {
    search?: string;
    status?: string;
    payment_status?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ data: Order[]; total: number; current_page: number; last_page: number }> {
    const res = await adminClient.get("/admin/orders", { params });
    return res.data;
  },

  async getOrder(id: number): Promise<Order> {
    const res = await adminClient.get(`/admin/orders/${id}`);
    return res.data;
  },

  async createOrder(data: any): Promise<{ message: string; order: Order }> {
    const res = await adminClient.post("/admin/orders", data);
    return res.data;
  },

  async updateOrder(id: number, data: any): Promise<{ message: string; order: Order }> {
    const res = await adminClient.put(`/admin/orders/${id}`, data);
    return res.data;
  },

  async deleteOrder(id: number): Promise<{ message: string }> {
    const res = await adminClient.delete(`/admin/orders/${id}`);
    return res.data;
  },

  async bulkDeleteOrders(ids: number[]): Promise<{ message: string; deleted_count: number }> {
    const res = await adminClient.post("/admin/orders/bulk-delete", { ids });
    return res.data;
  },

  async updateOrderStatus(id: number, data: {
    order_status: string;
    payment_status?: string;
    carrier?: string;
    tracking_code?: string;
    notes?: string;
  }): Promise<{ message: string; order: Order }> {
    const res = await adminClient.patch(`/admin/orders/${id}/status`, data);
    return res.data;
  },

  async refundOrder(id: number, data: { reason: string; restock?: boolean }): Promise<{ message: string; order: Order }> {
    const res = await adminClient.post(`/admin/orders/${id}/refund`, data);
    return res.data;
  },

  // ==========================================
  // LEADS & ABANDONED CARTS
  // ==========================================
  async getLeads(params?: {
    search?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  }): Promise<{
    leads: { data: Lead[]; total: number; current_page: number; last_page: number; per_page: number };
    stats: LeadStats;
  }> {
    const res = await adminClient.get("/admin/leads", { params });
    return res.data;
  },

  async getLead(id: number): Promise<Lead> {
    const res = await adminClient.get(`/admin/leads/${id}`);
    return res.data;
  },

  async updateLead(id: number, data: Partial<Lead>): Promise<{ message: string; lead: Lead }> {
    const res = await adminClient.put(`/admin/leads/${id}`, data);
    return res.data;
  },

  async deleteLead(id: number): Promise<{ message: string }> {
    const res = await adminClient.delete(`/admin/leads/${id}`);
    return res.data;
  },

  async bulkDeleteLeads(ids: number[]): Promise<{ message: string }> {
    const res = await adminClient.post("/admin/leads/bulk-delete", { ids });
    return res.data;
  },

  async convertLeadToOrder(id: number, data?: {
    payment_method?: string;
    payment_status?: string;
    order_status?: string;
    shipping_amount?: number;
    discount_amount?: number;
    notes?: string;
  }): Promise<{ message: string; order: Order; lead: Lead }> {
    const res = await adminClient.post(`/admin/leads/${id}/convert-to-order`, data || {});
    return res.data;
  },

  // ==========================================
  // VENDORS & SUPPLIER MANAGEMENT
  // ==========================================
  async getVendors(params?: {
    search?: string;
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ vendors: { data: Vendor[]; total: number; current_page: number; last_page: number }; stats: { total_vendors: number; active_vendors: number } }> {
    const res = await adminClient.get("/admin/vendors", { params });
    return res.data;
  },

  async getVendor(id: number): Promise<{ vendor: Vendor; analytics: any }> {
    const res = await adminClient.get(`/admin/vendors/${id}`);
    return res.data;
  },

  async createVendor(data: Partial<Vendor>): Promise<{ message: string; vendor: Vendor }> {
    const res = await adminClient.post("/admin/vendors", data);
    return res.data;
  },

  async updateVendor(id: number, data: Partial<Vendor>): Promise<{ message: string; vendor: Vendor }> {
    const res = await adminClient.put(`/admin/vendors/${id}`, data);
    return res.data;
  },

  async deleteVendor(id: number): Promise<{ message: string }> {
    const res = await adminClient.delete(`/admin/vendors/${id}`);
    return res.data;
  },

  async getVendorProducts(params?: { vendor_id?: number; product_id?: number; page?: number }): Promise<{ data: VendorProduct[]; total: number }> {
    const res = await adminClient.get("/admin/vendor-products", { params });
    return res.data;
  },

  async createVendorProduct(data: {
    vendor_id: number;
    product_id: number;
    variant_id?: number | null;
    vendor_sku?: string;
    purchase_price: number;
    min_order_quantity?: number;
    lead_time_days?: number;
    is_primary?: boolean;
    notes?: string;
  }): Promise<{ message: string; vendor_product: VendorProduct }> {
    const res = await adminClient.post("/admin/vendor-products", data);
    return res.data;
  },

  async updateVendorProduct(id: number, data: Partial<VendorProduct>): Promise<{ message: string; vendor_product: VendorProduct }> {
    const res = await adminClient.put(`/admin/vendor-products/${id}`, data);
    return res.data;
  },

  async deleteVendorProduct(id: number): Promise<{ message: string }> {
    const res = await adminClient.delete(`/admin/vendor-products/${id}`);
    return res.data;
  },

  // ==========================================
  // PURCHASE ORDERS (PROCUREMENT)
  // ==========================================
  async getPurchaseOrders(params?: {
    search?: string;
    status?: string;
    vendor_id?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ purchase_orders: { data: PurchaseOrder[]; total: number; current_page: number; last_page: number }; stats: any }> {
    const res = await adminClient.get("/admin/purchase-orders", { params });
    return res.data;
  },

  async getPurchaseOrder(id: number): Promise<PurchaseOrder> {
    const res = await adminClient.get(`/admin/purchase-orders/${id}`);
    return res.data;
  },

  async createPurchaseOrder(data: {
    vendor_id: number;
    order_date: string;
    expected_delivery_date?: string;
    shipping_cost?: number;
    tax_amount?: number;
    other_costs?: number;
    notes?: string;
    items: {
      product_id: number;
      variant_id?: number | null;
      unit_cost: number;
      quantity_ordered: number;
    }[];
  }): Promise<{ message: string; purchase_order: PurchaseOrder }> {
    const res = await adminClient.post("/admin/purchase-orders", data);
    return res.data;
  },

  async submitPurchaseOrder(id: number): Promise<{ message: string; purchase_order: PurchaseOrder }> {
    const res = await adminClient.post(`/admin/purchase-orders/${id}/submit`);
    return res.data;
  },

  async approvePurchaseOrder(id: number): Promise<{ message: string; purchase_order: PurchaseOrder }> {
    const res = await adminClient.post(`/admin/purchase-orders/${id}/approve`);
    return res.data;
  },

  async cancelPurchaseOrder(id: number, reason: string): Promise<{ message: string; purchase_order: PurchaseOrder }> {
    const res = await adminClient.post(`/admin/purchase-orders/${id}/cancel`, { reason });
    return res.data;
  },

  // ==========================================
  // GOODS RECEIPTS (GRN)
  // ==========================================
  async getGoodsReceipts(params?: { search?: string; date_from?: string; date_to?: string; page?: number }): Promise<{ data: GoodsReceipt[]; total: number }> {
    const res = await adminClient.get("/admin/goods-receipts", { params });
    return res.data;
  },

  async getGoodsReceipt(id: number): Promise<GoodsReceipt> {
    const res = await adminClient.get(`/admin/goods-receipts/${id}`);
    return res.data;
  },

  async createGoodsReceipt(data: {
    purchase_order_id: number;
    received_date: string;
    notes?: string;
    items: {
      purchase_order_item_id: number;
      quantity_received: number;
      quantity_damaged?: number;
      quantity_rejected?: number;
    }[];
  }): Promise<{ message: string; goods_receipt: GoodsReceipt; purchase_order_status: string }> {
    const res = await adminClient.post("/admin/goods-receipts", data);
    return res.data;
  },

  // ==========================================
  // INVENTORY COSTING, VALUATION & LEDGER
  // ==========================================
  async getInventoryValuation(params?: { search?: string; category_id?: string | number }): Promise<{
    summary: {
      total_units: number;
      total_asset_valuation: number;
      total_potential_retail_value: number;
      low_stock_count: number;
      out_of_stock_count: number;
    };
    products: ProductValuation[];
    category_breakdown: { id: number; name: string; units: number; valuation: number }[];
  }> {
    const res = await adminClient.get("/admin/inventory-valuation", { params });
    return res.data;
  },

  async adjustInventoryValuation(data: {
    product_id: number;
    variant_id?: number | null;
    adjustment_quantity: number;
    reason: string;
    unit_cost?: number;
  }): Promise<{ message: string; movement: InventoryMovement; new_stock_quantity: number }> {
    const res = await adminClient.post("/admin/inventory-valuation/adjust", data);
    return res.data;
  },

  async getInventoryLedger(params?: {
    search?: string;
    movement_type?: string;
    product_id?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
  }): Promise<{ data: InventoryMovement[]; total: number; current_page: number; last_page: number }> {
    const res = await adminClient.get("/admin/inventory-ledger", { params });
    return res.data;
  },

  // ==========================================
  // POS (POINT OF SALE) & REGISTERS
  // ==========================================
  async getPosRegisters(): Promise<PosRegister[]> {
    const res = await adminClient.get("/admin/pos/registers");
    return res.data;
  },

  async getCurrentPosSession(): Promise<{ session: PosRegisterSession | null }> {
    const res = await adminClient.get("/admin/pos/registers/current-session");
    return res.data;
  },

  async openPosSession(registerId: number, openingBalance: number): Promise<{ message: string; session: PosRegisterSession }> {
    const res = await adminClient.post(`/admin/pos/registers/${registerId}/open-session`, { opening_balance: openingBalance });
    return res.data;
  },

  async closePosSession(sessionId: number, actualClosingCash: number, closingNotes?: string): Promise<{ message: string; session: PosRegisterSession }> {
    const res = await adminClient.post(`/admin/pos/registers/${sessionId}/close-session`, {
      actual_closing_cash: actualClosingCash,
      closing_notes: closingNotes,
    });
    return res.data;
  },

  async recordPosCashMovement(sessionId: number, data: { type: 'cash_in' | 'cash_out' | 'drop'; amount: number; reason: string }): Promise<{ message: string; expected_cash_balance: number }> {
    const res = await adminClient.post(`/admin/pos/registers/${sessionId}/cash-movement`, data);
    return res.data;
  },

  async getPosProducts(params?: { search?: string; category_id?: string | number; page?: number }): Promise<{ data: Product[]; total: number; last_page: number }> {
    const res = await adminClient.get("/admin/pos/products", { params });
    return res.data;
  },

  async checkoutPosSale(data: {
    pos_register_session_id: number;
    customer_id?: number | null;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    payment_method: string;
    cash_received?: number;
    discount_amount?: number;
    tax_amount?: number;
    notes?: string;
    items: {
      product_id: number;
      variant_id?: number | null;
      unit_price: number;
      quantity: number;
      discount_amount?: number;
    }[];
  }): Promise<{ message: string; order: Order; receipt: PosReceipt }> {
    const res = await adminClient.post("/admin/pos/checkout", data);
    return res.data;
  },

  // ==========================================
  // OPERATING EXPENSES
  // ==========================================
  async getExpenses(params?: {
    search?: string;
    category_id?: string | number;
    status?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
  }): Promise<{ expenses: { data: Expense[]; total: number; current_page: number; last_page: number }; stats: any }> {
    const res = await adminClient.get("/admin/expenses", { params });
    return res.data;
  },

  async createExpense(data: Partial<Expense>): Promise<{ message: string; expense: Expense }> {
    const res = await adminClient.post("/admin/expenses", data);
    return res.data;
  },

  async updateExpense(id: number, data: Partial<Expense>): Promise<{ message: string; expense: Expense }> {
    const res = await adminClient.put(`/admin/expenses/${id}`, data);
    return res.data;
  },

  async deleteExpense(id: number): Promise<{ message: string }> {
    const res = await adminClient.delete(`/admin/expenses/${id}`);
    return res.data;
  },

  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    const res = await adminClient.get("/admin/expense-categories");
    return res.data;
  },

  async createExpenseCategory(data: { name: string; code: string; description?: string }): Promise<{ message: string; category: ExpenseCategory }> {
    const res = await adminClient.post("/admin/expense-categories", data);
    return res.data;
  },

  // ==========================================
  // FINANCIAL ENGINE & P&L PROFITABILITY
  // ==========================================
  async getFinanceSummary(params?: { period?: string; date_from?: string; date_to?: string }): Promise<FinancialSummary> {
    const res = await adminClient.get("/admin/finance/summary", { params });
    return res.data;
  },

  async getProductProfitability(params?: { period?: string; date_from?: string; date_to?: string }): Promise<ProductProfitabilityItem[]> {
    const res = await adminClient.get("/admin/finance/product-profitability", { params });
    return res.data;
  },

  async getVendorAnalytics(params?: { period?: string }): Promise<VendorAnalyticsItem[]> {
    const res = await adminClient.get("/admin/finance/vendor-analytics", { params });
    return res.data;
  },

  async getFinanceDrilldown(params: { metric: string; period?: string; date_from?: string; date_to?: string; page?: number }): Promise<{ type: string; data: any }> {
    const res = await adminClient.get("/admin/finance/drilldown", { params });
    return res.data;
  },



  // ==========================================
  // COUPONS
  // ==========================================
  async getCoupons(params?: {
    search?: string;
    type?: string;
    is_active?: boolean;
    page?: number;
  }): Promise<{ data: any[]; total: number; current_page: number; last_page: number }> {
    const res = await adminClient.get("/admin/coupons", { params });
    return res.data;
  },

  async createCoupon(data: any): Promise<{ message: string; coupon: any }> {
    const res = await adminClient.post("/admin/coupons", data);
    return res.data;
  },

  async updateCoupon(id: number, data: any): Promise<{ message: string; coupon: any }> {
    const res = await adminClient.put(`/admin/coupons/${id}`, data);
    return res.data;
  },

  async deleteCoupon(id: number): Promise<{ message: string }> {
    const res = await adminClient.delete(`/admin/coupons/${id}`);
    return res.data;
  },

  async bulkDeleteCoupons(ids: number[]): Promise<{ message: string; deleted_count: number }> {
    const res = await adminClient.post("/admin/coupons/bulk-delete", { ids });
    return res.data;
  },

  // ==========================================
  // INVENTORY
  // ==========================================
  async getInventory(params?: {
    search?: string;
    filter?: "low_stock" | "out_of_stock" | "all";
    page?: number;
  }): Promise<{
    summary: { total_skus: number; total_units: number; low_stock_count: number; out_of_stock_count: number };
    inventory: { data: Product[]; total: number; current_page: number; last_page: number };
  }> {
    const res = await adminClient.get("/admin/inventory", { params });
    return res.data;
  },

  async adjustStock(id: number, data: { adjustment: number; reason: string }): Promise<{ message: string; product: Product }> {
    const res = await adminClient.post(`/admin/inventory/${id}/adjust`, data);
    return res.data;
  },

  // ==========================================
  // REVIEWS MODERATION
  // ==========================================
  async getReviews(params?: {
    search?: string;
    status?: "all" | "approved" | "pending";
    rating?: number;
    page?: number;
    per_page?: number;
  }): Promise<{ data: any[]; total: number; current_page: number; last_page: number }> {
    const res = await adminClient.get("/admin/reviews", { params });
    return res.data;
  },

  async toggleReviewApproval(id: number): Promise<{ message: string; review: any }> {
    const res = await adminClient.patch(`/admin/reviews/${id}/approval`);
    return res.data;
  },

  async deleteReview(id: number): Promise<{ message: string }> {
    const res = await adminClient.delete(`/admin/reviews/${id}`);
    return res.data;
  },

  async bulkDeleteReviews(ids: number[]): Promise<{ message: string; deleted_count: number }> {
    const res = await adminClient.post("/admin/reviews/bulk-delete", { ids });
    return res.data;
  },

  // ==========================================
  // STAFF & RBAC
  // ==========================================
  async getStaff(): Promise<User[]> {
    const res = await adminClient.get("/admin/staff");
    return res.data;
  },

  async createStaff(data: any): Promise<{ message: string; staff: User }> {
    const res = await adminClient.post("/admin/staff", data);
    return res.data;
  },

  async updateStaff(id: number, data: any): Promise<{ message: string; staff: User }> {
    const res = await adminClient.put(`/admin/staff/${id}`, data);
    return res.data;
  },

  async deleteStaff(id: number): Promise<{ message: string }> {
    const res = await adminClient.delete(`/admin/staff/${id}`);
    return res.data;
  },

  async bulkDeleteStaff(ids: number[]): Promise<{ message: string; deleted_count: number; skipped_count?: number }> {
    const res = await adminClient.post("/admin/staff/bulk-delete", { ids });
    return res.data;
  },

  async suspendStaff(id: number, data: {
    duration_type: "indefinite" | "24h" | "3d" | "7d" | "30d" | "custom";
    suspended_until?: string;
    reason?: string;
  }): Promise<{ message: string; staff: User }> {
    const res = await adminClient.post(`/admin/staff/${id}/suspend`, data);
    return res.data;
  },

  async reactivateStaff(id: number): Promise<{ message: string; staff: User }> {
    const res = await adminClient.post(`/admin/staff/${id}/reactivate`);
    return res.data;
  },

  async promoteStaff(id: number): Promise<{ message: string; staff: User }> {
    const res = await adminClient.post(`/admin/staff/${id}/promote`);
    return res.data;
  },

  async demoteStaff(id: number): Promise<{ message: string; staff: User }> {
    const res = await adminClient.post(`/admin/staff/${id}/demote`);
    return res.data;
  },

  // ==========================================
  // AUDIT LOGS
  // ==========================================
  async getAuditLogs(params?: {
    search?: string;
    module?: string;
    action?: string;
    entity_type?: string;
    user_id?: string | number;
    user_role?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  }): Promise<AuditLogsResponse> {
    const res = await adminClient.get("/admin/audit-logs", { params });
    return res.data;
  },

  async bulkDeleteAuditLogs(ids: number[]): Promise<{ message: string; deleted_count: number }> {
    const res = await adminClient.post("/admin/audit-logs/bulk-delete", { ids });
    return res.data;
  },

  // ==========================================
  // SALES & INVOICES
  // ==========================================
  async getSales(params?: {
    search?: string;
    source?: string;
    payment_status?: string;
    payment_method?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ sales: { data: Order[]; total: number; current_page: number; last_page: number }; summary: SalesSummary }> {
    const res = await adminClient.get("/admin/sales", { params });
    return res.data;
  },

  async getSalesInvoice(orderId: number): Promise<SalesInvoice> {
    const res = await adminClient.get(`/admin/sales/invoice/${orderId}`);
    return res.data;
  },

  // ==========================================
  // CUSTOMER RELATIONS & RISK INTELLIGENCE
  // ==========================================
  async getCustomers(params?: {
    search?: string;
    status?: string;
    customer_type?: string;
    risk_level?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ data: User[]; total: number; current_page: number; last_page: number }> {
    const res = await adminClient.get("/admin/customers", { params });
    return res.data;
  },

  async getCustomer(id: number): Promise<User> {
    const res = await adminClient.get(`/admin/customers/${id}`);
    return res.data;
  },

  async getCustomerTimeline(id: number): Promise<CustomerActivityTimelineItem[]> {
    const res = await adminClient.get(`/admin/customers/${id}/timeline`);
    return res.data;
  },

  async getCustomerIpHistory(id: number): Promise<CustomerIpHistoryItem[]> {
    const res = await adminClient.get(`/admin/customers/${id}/ip-history`);
    return res.data;
  },

  async createCustomer(data: any): Promise<{ message: string; customer: User }> {
    const res = await adminClient.post("/admin/customers", data);
    return res.data;
  },

  async updateCustomer(id: number, data: any): Promise<{ message: string; customer: User }> {
    const res = await adminClient.put(`/admin/customers/${id}`, data);
    return res.data;
  },

  async deleteCustomer(id: number): Promise<{ message: string }> {
    const res = await adminClient.delete(`/admin/customers/${id}`);
    return res.data;
  },

  async bulkDeleteCustomers(ids: number[]): Promise<{ message: string; deleted_count: number }> {
    const res = await adminClient.post("/admin/customers/bulk-delete", { ids });
    return res.data;
  },

  async toggleCustomerStatus(id: number): Promise<{ message: string; customer: User }> {
    const res = await adminClient.patch(`/admin/customers/${id}/status`);
    return res.data;
  },

  async suspendCustomer(id: number, data: any): Promise<{ message: string; customer: User }> {
    const res = await adminClient.post(`/admin/customers/${id}/suspend`, data);
    return res.data;
  },

  async reactivateCustomer(id: number): Promise<{ message: string; customer: User }> {
    const res = await adminClient.post(`/admin/customers/${id}/reactivate`);
    return res.data;
  },

  async blockCustomer(id: number, reason: string): Promise<{ message: string; customer: User }> {
    const res = await adminClient.post(`/admin/customers/${id}/block`, { reason });
    return res.data;
  },

  async unblockCustomer(id: number): Promise<{ message: string; customer: User }> {
    const res = await adminClient.post(`/admin/customers/${id}/unblock`);
    return res.data;
  },

  async setCustomerReview(id: number): Promise<{ message: string; customer: User }> {
    const res = await adminClient.post(`/admin/customers/${id}/review`);
    return res.data;
  },

  async updateCustomerNotes(id: number, notes: string): Promise<{ message: string; customer: User }> {
    const res = await adminClient.put(`/admin/customers/${id}/notes`, { internal_notes: notes });
    return res.data;
  },

  // ==========================================
  // SECURITY & BLOCKED IPS REGISTRY
  // ==========================================
  async getBlockedIps(params?: {
    search?: string;
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ data: BlockedIp[]; total: number; current_page: number; last_page: number }> {
    const res = await adminClient.get("/admin/blocked-ips", { params });
    return res.data;
  },

  async getBlockedIp(id: number): Promise<BlockedIp & { related_orders: Order[]; related_customers: User[] }> {
    const res = await adminClient.get(`/admin/blocked-ips/${id}`);
    return res.data;
  },

  async getBlockedIpRelated(id: number): Promise<{ blocked_ip: BlockedIp; orders: Order[]; customers: User[] }> {
    const res = await adminClient.get(`/admin/blocked-ips/${id}/related`);
    return res.data;
  },

  async blockIp(data: {
    ip_address: string;
    reason: string;
    notes?: string;
    duration: '1_hour' | '24_hours' | '7_days' | '30_days' | 'permanent' | 'custom';
    custom_expires_at?: string;
  }): Promise<{ message: string; blocked_ip: BlockedIp; co_tenant_warning?: string | null }> {
    const res = await adminClient.post("/admin/blocked-ips", data);
    return res.data;
  },

  async unblockIp(id: number, reason?: string): Promise<{ message: string }> {
    const res = await adminClient.delete(`/admin/blocked-ips/${id}`, { data: { reason } });
    return res.data;
  },

  // ==========================================
  // SETTINGS
  // ==========================================
  async getSettings(): Promise<Record<string, any>> {
    const res = await adminClient.get("/admin/settings");
    return res.data;
  },

  async updateSettings(settings: Record<string, any>): Promise<{ message: string; settings: Record<string, any> }> {
    const res = await adminClient.put("/admin/settings", { settings });
    return res.data;
  },
};

export interface PermissionItem {
  id: string;
  name: string;
  description: string;
}

export interface PermissionModule {
  name: string;
  description: string;
  permissions: PermissionItem[];
}

export const ADMIN_PERMISSION_MODULES: PermissionModule[] = [
  {
    name: "Point of Sale (POS)",
    description: "Physical retail terminal, fast cashier checkout, and register cash sessions",
    permissions: [
      { id: "pos.access", name: "Access POS Terminal", description: "Open register and process walk-in customer sales" },
      { id: "pos.create_sale", name: "Execute POS Sales", description: "Ring up orders, accept multi-payments, print receipts" },
      { id: "pos.register_manage", name: "Manage Cash Registers", description: "Open/close sessions, record cash drops, reconcile float" },
    ],
  },
  {
    name: "Vendors & Procurement",
    description: "Supplier relationships, purchase orders, and goods receiving notes (GRN)",
    permissions: [
      { id: "vendors.view", name: "View Vendors", description: "Inspect supplier profiles and supplied catalog" },
      { id: "vendors.manage", name: "Manage Vendors", description: "Create and edit suppliers and contract pricing" },
      { id: "purchase_orders.view", name: "View Purchase Orders", description: "Read procurement orders and delivery tracking" },
      { id: "purchase_orders.create", name: "Create & Submit POs", description: "Draft and submit purchase orders to suppliers" },
      { id: "purchase_orders.approve", name: "Approve Purchase Orders", description: "Authorize purchase order fulfillment and spending" },
      { id: "goods_receipts.manage", name: "Process Goods Receipts", description: "Inspect and receive physical shipments into FIFO inventory" },
    ],
  },
  {
    name: "Inventory Costing & Valuation",
    description: "FIFO cost layers, auditable stock ledger, and manual write-offs",
    permissions: [
      { id: "inventory.valuation", name: "View Inventory Valuation", description: "Inspect FIFO layer asset values and movement ledger" },
      { id: "inventory.adjust", name: "Adjust Stock & Write-offs", description: "Record manual stock inflows, damage, and adjustments" },
    ],
  },
  {
    name: "Financial & Expense Engine",
    description: "Operating expense ledger, executive P&L, product profitability, and report exports",
    permissions: [
      { id: "expenses.view", name: "View Expenses", description: "Inspect operating expenditure and cost categories" },
      { id: "expenses.manage", name: "Manage Expenses", description: "Record, categorize, and approve business operating expenses" },
      { id: "finance.reports_view", name: "View Financial Reports & P&L", description: "Access real-time Net Profit, COGS, and margin analytics" },
      { id: "finance.drilldown", name: "Financial Metric Drill-down", description: "Inspect individual orders and cost layers behind revenue and COGS" },
    ],
  },
  {
    name: "Products & Catalog",
    description: "Manage physical hardware catalog, specs, and categories",
    permissions: [
      { id: "products.view", name: "View Products", description: "Read catalog items and stock levels" },
      { id: "products.manage", name: "Manage Products", description: "Create, edit, and delete products" },
      { id: "categories.manage", name: "Manage Categories", description: "Create and edit product categories" },
    ],
  },
  {
    name: "Warehouse & Inventory",
    description: "Control stock levels, batch restocking, and write-offs",
    permissions: [
      { id: "inventory.manage", name: "Manage Inventory", description: "Perform stock additions and deductions" },
    ],
  },
  {
    name: "Orders & Fulfillment",
    description: "Handle incoming customer orders, logistics, and manual orders",
    permissions: [
      { id: "orders.view", name: "View Orders", description: "Inspect customer shipments and invoices" },
      { id: "orders.manage", name: "Manage Orders", description: "Create orders, update tracking, and issue refunds" },
    ],
  },
  {
    name: "Lead & Checkout Recovery",
    description: "Manage abandoned checkout leads, direct customer outreach, and order conversion",
    permissions: [
      { id: "leads.view", name: "View Leads", description: "Inspect abandoned checkouts, customer contacts, and pipeline" },
      { id: "leads.manage", name: "Manage & Contact Leads", description: "Update lead status, internal notes, and customer info" },
      { id: "leads.convert", name: "Convert Leads to Orders", description: "1-Click convert abandoned leads into official orders" },
      { id: "leads.delete", name: "Delete Leads", description: "Remove single or multiple lead records" },
    ],
  },
  {
    name: "Customer Relations & Risk Control",
    description: "Customer accounts, risk scoring, account suspensions, and block enforcement",
    permissions: [
      { id: "customers.view", name: "View Customers & Risk", description: "Access customer profiles, order history, and risk analysis" },
      { id: "customers.manage", name: "Manage Customers", description: "Create, edit, flag for review, and update internal notes" },
      { id: "customers.suspend", name: "Suspend Customer Accounts", description: "Temporarily suspend or reactivate customer accounts" },
      { id: "customers.block", name: "Block Customer Accounts", description: "Permanently block abusive customer identities" },
    ],
  },
  {
    name: "Discounts & Reviews",
    description: "Promotional campaigns and customer review moderation",
    permissions: [
      { id: "coupons.manage", name: "Manage Coupons", description: "Create and configure discount vouchers" },
      { id: "reviews.manage", name: "Moderate Reviews", description: "Approve or reject customer product reviews" },
    ],
  },
  {
    name: "Administration & Security",
    description: "Staff access control, IP blocking registry, audit logs, and system settings",
    permissions: [
      { id: "staff.view", name: "View Staff & RBAC", description: "Inspect staff roles and assigned permissions" },
      { id: "staff.manage", name: "Manage Staff & RBAC", description: "Create staff, modify access, and suspend staff" },
      { id: "security.ip_block", name: "IP Blocking & Abuse Defense", description: "Block, unblock, and manage IP abuse registry rules" },
      { id: "audit_logs.view", name: "View Audit Trail", description: "Inspect cryptographic immutable audit logs" },
      { id: "analytics.view", name: "View Executive Analytics", description: "View revenue, conversion, and sales charts" },
      { id: "settings.manage", name: "Manage System Settings", description: "Modify store configuration and defaults" },
    ],
  },
];

