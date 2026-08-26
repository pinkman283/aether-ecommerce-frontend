import axios from "axios";
import { AdminAnalytics, Category, Order, Product, User } from "@/types";

const API_BASE_URL = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001/api")
  : (process.env.INTERNAL_API_URL || "http://127.0.0.1:8001/api");

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
    phone?: string;
    avatar?: string | null;
    password?: string;
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
  // CUSTOMERS
  // ==========================================
  async getCustomers(params?: {
    search?: string;
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ data: any[]; total: number; current_page: number; last_page: number }> {
    const res = await adminClient.get("/admin/customers", { params });
    return res.data;
  },

  async getCustomer(id: number): Promise<any> {
    const res = await adminClient.get(`/admin/customers/${id}`);
    return res.data;
  },

  async createCustomer(data: any): Promise<{ message: string; customer: any }> {
    const res = await adminClient.post("/admin/customers", data);
    return res.data;
  },

  async updateCustomer(id: number, data: any): Promise<{ message: string; customer: any }> {
    const res = await adminClient.put(`/admin/customers/${id}`, data);
    return res.data;
  },

  async deleteCustomer(id: number): Promise<{ message: string }> {
    const res = await adminClient.delete(`/admin/customers/${id}`);
    return res.data;
  },

  async toggleCustomerStatus(id: number): Promise<{ message: string; customer: any }> {
    const res = await adminClient.patch(`/admin/customers/${id}/status`);
    return res.data;
  },

  async suspendCustomer(id: number, data: {
    duration_type: "indefinite" | "24h" | "3d" | "7d" | "30d" | "custom";
    suspended_until?: string;
    reason?: string;
  }): Promise<{ message: string; customer: any }> {
    const res = await adminClient.post(`/admin/customers/${id}/suspend`, data);
    return res.data;
  },

  async reactivateCustomer(id: number): Promise<{ message: string; customer: any }> {
    const res = await adminClient.post(`/admin/customers/${id}/reactivate`);
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
    action?: string;
    entity_type?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ data: any[]; total: number; current_page: number; last_page: number }> {
    const res = await adminClient.get("/admin/audit-logs", { params });
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
    name: "Customer Relations",
    description: "Customer accounts, addresses, and account suspensions",
    permissions: [
      { id: "customers.view", name: "View Customers", description: "Access customer profiles and purchase history" },
      { id: "customers.manage", name: "Manage Customers", description: "Create, edit, suspend, and reactivate accounts" },
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
    description: "Staff access control, audit logs, and system settings",
    permissions: [
      { id: "staff.view", name: "View Staff & RBAC", description: "Inspect staff roles and assigned permissions" },
      { id: "staff.manage", name: "Manage Staff & RBAC", description: "Create staff, modify access, and suspend staff" },
      { id: "audit_logs.view", name: "View Audit Trail", description: "Inspect cryptographic immutable audit logs" },
      { id: "analytics.view", name: "View Executive Analytics", description: "View revenue, conversion, and sales charts" },
      { id: "settings.manage", name: "Manage System Settings", description: "Modify store configuration and defaults" },
    ],
  },
];

