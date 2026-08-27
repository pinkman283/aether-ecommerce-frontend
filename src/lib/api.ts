import axios from "axios";
import { Address, AdminAnalytics, Category, CouponValidation, Order, Product, User } from "@/types";

const API_BASE_URL = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api")
  : (process.env.INTERNAL_API_URL || "http://127.0.0.1:8000/api");

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

// Attach bearer token dynamically if available in localStorage
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const api = {
  client: apiClient,

  // Storefront Featured
  async getFeatured(): Promise<{
    featured_products: Product[];
    new_arrivals: Product[];
    best_sellers: Product[];
    featured_categories: Category[];
  }> {
    const res = await apiClient.get("/featured");
    return res.data;
  },

  // Products Catalog
  async getProducts(params?: {
    category?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    min_rating?: number;
    sort?: string;
    featured?: boolean;
    new_arrivals?: boolean;
    best_sellers?: boolean;
    in_stock?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<{
    data: Product[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  }> {
    const res = await apiClient.get("/products", { params });
    return res.data;
  },

  // Single Product
  async getProduct(slug: string): Promise<{
    product: Product;
    related: Product[];
  }> {
    const res = await apiClient.get(`/products/${slug}`);
    return res.data;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await apiClient.get("/categories");
    return res.data;
  },

  async getCategory(slug: string): Promise<Category> {
    const res = await apiClient.get(`/categories/${slug}`);
    return res.data;
  },

  // Coupon
  async validateCoupon(code: string, subtotal: number): Promise<CouponValidation> {
    const res = await apiClient.post("/coupons/validate", { code, subtotal });
    return res.data;
  },

  // Orders & Checkout
  async createOrder(data: {
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    shipping_address: Record<string, string>;
    billing_address?: Record<string, string>;
    payment_method: string;
    coupon_code?: string;
    items: { product_id: number; variant_id?: number | null; quantity: number }[];
  }): Promise<{ message: string; order: Order }> {
    const res = await apiClient.post("/orders", data);
    return res.data;
  },

  async getOrder(orderNumber: string): Promise<Order> {
    const res = await apiClient.get(`/orders/${orderNumber}`);
    return res.data;
  },

  async trackOrder(orderNumber: string): Promise<any> {
    const res = await apiClient.get(`/orders/track/${orderNumber}`);
    return res.data;
  },

  // Addresses
  async getAddresses(): Promise<Address[]> {
    const res = await apiClient.get("/addresses");
    return res.data;
  },

  async addAddress(data: Partial<Address>): Promise<Address> {
    const res = await apiClient.post("/addresses", data);
    return res.data;
  },

  async deleteAddress(id: number): Promise<void> {
    await apiClient.delete(`/addresses/${id}`);
  },

  // Reviews
  async submitReview(productId: number, data: {
    rating: number;
    title?: string;
    comment: string;
    user_name?: string;
  }): Promise<any> {
    const res = await apiClient.post(`/products/${productId}/reviews`, data);
    return res.data;
  },

  // Auth
  async login(credentials: { email: string; password: string }): Promise<{
    message: string;
    token: string;
    user: User;
  }> {
    const res = await apiClient.post("/auth/login", credentials);
    return res.data;
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{
    message: string;
    token: string;
    user: User;
  }> {
    const res = await apiClient.post("/auth/register", userData);
    return res.data;
  },

  async getProfile(): Promise<{
    user: User;
    total_orders: number;
    total_spent: number;
  }> {
    const res = await apiClient.get("/auth/profile");
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
    const res = await apiClient.put("/auth/profile", data);
    return res.data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  // Admin
  async getAdminAnalytics(): Promise<AdminAnalytics> {
    const res = await apiClient.get("/admin/analytics");
    return res.data;
  },

  async getAdminOrders(status?: string): Promise<{ data: Order[]; total: number }> {
    const res = await apiClient.get("/admin/orders", { params: { status } });
    return res.data;
  },

  async updateOrderStatus(id: number, data: {
    order_status: string;
    payment_status?: string;
    carrier?: string;
    tracking_code?: string;
  }): Promise<{ message: string; order: Order }> {
    const res = await apiClient.patch(`/admin/orders/${id}/status`, data);
    return res.data;
  },

  async getAdminProducts(search?: string): Promise<{ data: Product[]; total: number }> {
    const res = await apiClient.get("/admin/products", { params: { search } });
    return res.data;
  },

  async createProduct(data: any): Promise<{ message: string; product: Product }> {
    const res = await apiClient.post("/admin/products", data);
    return res.data;
  },

  async updateProduct(id: number, data: any): Promise<{ message: string; product: Product }> {
    const res = await apiClient.put(`/admin/products/${id}`, data);
    return res.data;
  },

  async deleteProduct(id: number): Promise<{ message: string }> {
    const res = await apiClient.delete(`/admin/products/${id}`);
    return res.data;
  },

  // Checkout Lead Capture
  async captureLead(data: {
    lead_id?: number | null;
    name: string;
    phone: string;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    postal_code?: string | null;
    cart_items?: any[];
    total_amount?: number;
  }): Promise<{ message: string; lead_id: number; status: string }> {
    const res = await apiClient.post("/leads/capture", data);
    return res.data;
  },
};
