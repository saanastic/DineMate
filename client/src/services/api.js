import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState()?.accessToken || localStorage.getItem("dinemate_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/login") &&
      !originalRequest?.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState()?.refreshToken || localStorage.getItem("dinemate_refresh_token");
      if (!refreshToken) {
        useAuthStore.getState()?.logout?.();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (!token) {
              reject(error);
              return;
            }
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const response = await axios.post(`${API_BASE_URL.replace(/\/$/, "")}/auth/refresh`, { refresh_token: refreshToken });
        const { access_token, refresh_token } = response.data || {};
        if (access_token && refresh_token) {
          useAuthStore.getState().setCredentials?.(access_token, refresh_token);
        }
        onRefreshed(access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState()?.logout?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

const fallback = {
  overview: {
    revenue: 14280,
    orders: 248,
    tables: 18,
    reservations: 32,
    satisfaction: 96,
    averageOrderValue: 58,
    inventoryHealth: 87,
    kitchenPerformance: 94,
  },
  orders: [],
  tables: [],
  kitchen: [],
  inventory: [],
  customers: [],
  reservations: [],
  staff: [],
  analytics: {},
  ai: {},
  notifications: [],
  profile: {},
};

const withFallback = async (request, fallbackData) => {
  try {
    const response = await request();
    return response?.data?.data ?? response?.data ?? fallbackData;
  } catch (error) {
    return fallbackData;
  }
};

export const authService = {
  login: (payload) => withFallback(() => api.post("/auth/login", payload), { user: { name: "Ava Chen" } }),
  signup: (payload) => withFallback(() => api.post("/auth/register", payload), { user: { name: payload.name || "Guest" } }),
  forgotPassword: (email) => withFallback(() => api.post("/auth/forgot-password", { email }), { success: true }),
  resetPassword: (token, password) => withFallback(() => api.post(`/auth/reset-password/${token}`, { password }), { success: true }),
};

export const dashboardService = {
  getOverview: () => withFallback(() => api.get("/dashboard/overview"), fallback.overview),
  getOrders: () => withFallback(() => api.get("/orders"), fallback.orders),
  getTables: () => withFallback(() => api.get("/tables"), fallback.tables),
  getKitchenQueue: () => withFallback(() => api.get("/kitchen"), fallback.kitchen),
  getInventory: () => withFallback(() => api.get("/inventory"), fallback.inventory),
  getCustomers: () => withFallback(() => api.get("/customers"), fallback.customers),
  getReservations: () => withFallback(() => api.get("/reservations"), fallback.reservations),
  getStaff: () => withFallback(() => api.get("/staff"), fallback.staff),
  getAnalytics: () => withFallback(() => api.get("/analytics"), fallback.analytics),
  getReports: () => withFallback(() => api.get("/reports"), fallback.analytics),
  getBilling: () => withFallback(() => api.get("/billing"), { invoices: [] }),
  getProfile: () => withFallback(() => api.get("/profile"), fallback.profile),
  getNotifications: () => withFallback(() => api.get("/notifications"), fallback.notifications),
  getAiAssistant: () => withFallback(() => api.get("/ai/assistant"), fallback.ai),
};

export const menuService = {
  getMenu: () =>
    withFallback(
      () => api.get("/menu"),
      [
        { id: "m1", name: "Grilled Salmon", price: 18.5, bestseller: true, chef: false, ingredients: ["Salmon", "Lemon", "Herbs"], discount: 0 },
        { id: "m2", name: "Spicy Ramen", price: 12.0, bestseller: false, chef: true, ingredients: ["Noodles", "Chili", "Pork"], discount: 10 },
        { id: "m3", name: "Caesar Salad", price: 9.5, bestseller: true, chef: false, ingredients: ["Lettuce", "Croutons", "Parmesan"], discount: 0 },
        { id: "m4", name: "Chef's Tasting Plate", price: 28.0, bestseller: false, chef: true, ingredients: ["Seasonal"], discount: 15 },
      ],
    ),
};

export const orderService = {
  placeOrder: (payload) => withFallback(() => api.post("/orders", payload), { success: true, orderId: "stub-ord-123" }),
  assignWaiter: (orderId, waiter) => withFallback(() => api.post(`/orders/${orderId}/assign-waiter`, { waiter }), { success: true }),
};

export default api;

const fallback = {
  overview: {
    revenue: 14280,
    orders: 248,
    tables: 18,
    reservations: 32,
    satisfaction: 96,
    averageOrderValue: 58,
    inventoryHealth: 87,
    kitchenPerformance: 94,
  },
  orders: [],
  tables: [],
  kitchen: [],
  inventory: [],
  customers: [],
  reservations: [],
  staff: [],
  analytics: {},
  ai: {},
  notifications: [],
  profile: {},
};

const withFallback = async (request, fallbackData) => {
  try {
    const response = await request();
    return response?.data?.data ?? response?.data ?? fallbackData;
  } catch (error) {
    return fallbackData;
  }
};

export const authService = {
  login: (payload) => withFallback(() => api.post("/auth/login", payload), { user: { name: "Ava Chen" } }),
  signup: (payload) => withFallback(() => api.post("/auth/register", payload), { user: { name: payload.name || "Guest" } }),
  forgotPassword: (email) => withFallback(() => api.post("/auth/forgot-password", { email }), { success: true }),
  resetPassword: (token, password) => withFallback(() => api.post(`/auth/reset-password/${token}`, { password }), { success: true }),
};

export const dashboardService = {
  getOverview: () => withFallback(() => api.get("/dashboard/overview"), fallback.overview),
  getOrders: () => withFallback(() => api.get("/orders"), fallback.orders),
  getTables: () => withFallback(() => api.get("/tables"), fallback.tables),
  getKitchenQueue: () => withFallback(() => api.get("/kitchen"), fallback.kitchen),
  getInventory: () => withFallback(() => api.get("/inventory"), fallback.inventory),
  getCustomers: () => withFallback(() => api.get("/customers"), fallback.customers),
  getReservations: () => withFallback(() => api.get("/reservations"), fallback.reservations),
  getStaff: () => withFallback(() => api.get("/staff"), fallback.staff),
  getAnalytics: () => withFallback(() => api.get("/analytics"), fallback.analytics),
  getReports: () => withFallback(() => api.get("/reports"), fallback.analytics),
  getBilling: () => withFallback(() => api.get("/billing"), { invoices: [] }),
  getProfile: () => withFallback(() => api.get("/profile"), fallback.profile),
  getNotifications: () => withFallback(() => api.get("/notifications"), fallback.notifications),
  getAiAssistant: () => withFallback(() => api.get("/ai/assistant"), fallback.ai),
};

export const menuService = {
  getMenu: () =>
    withFallback(
      () => api.get("/menu"),
      [
        { id: "m1", name: "Grilled Salmon", price: 18.5, bestseller: true, chef: false, ingredients: ["Salmon", "Lemon", "Herbs"], discount: 0 },
        { id: "m2", name: "Spicy Ramen", price: 12.0, bestseller: false, chef: true, ingredients: ["Noodles", "Chili", "Pork"], discount: 10 },
        { id: "m3", name: "Caesar Salad", price: 9.5, bestseller: true, chef: false, ingredients: ["Lettuce", "Croutons", "Parmesan"], discount: 0 },
        { id: "m4", name: "Chef's Tasting Plate", price: 28.0, bestseller: false, chef: true, ingredients: ["Seasonal"], discount: 15 },
      ],
    ),
};

export const orderService = {
  placeOrder: (payload) => withFallback(() => api.post("/orders", payload), { success: true, orderId: "stub-ord-123" }),
  assignWaiter: (orderId, waiter) => withFallback(() => api.post(`/orders/${orderId}/assign-waiter`, { waiter }), { success: true }),
};

