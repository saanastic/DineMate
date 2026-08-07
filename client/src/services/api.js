import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/* =========================
   REQUEST INTERCEPTOR
========================= */

api.interceptors.request.use(
  (config) => {
    const token =
      useAuthStore.getState()?.accessToken ||
      localStorage.getItem("dinemate_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */

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

      const refreshToken =
        useAuthStore.getState()?.refreshToken ||
        localStorage.getItem("dinemate_refresh_token");

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
        const response = await axios.post(
          `${API_BASE_URL.replace(/\/$/, "")}/auth/refresh`,
          {
            refresh_token: refreshToken,
          }
        );

        const {
          access_token,
          refresh_token: newRefreshToken,
        } = response.data || {};

        if (access_token && newRefreshToken) {
          useAuthStore
            .getState()
            .setCredentials?.(access_token, newRefreshToken);
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

/* =========================
   AUTH
========================= */

export const authService = {
  login: async (payload) => {
    const response = await api.post("/auth/login", payload);

    return response?.data?.data ?? response?.data;
  },

  signup: async (payload) => {
    const response = await api.post("/auth/register", payload);

    return response?.data?.data ?? response?.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", {
      email,
    });

    return response?.data?.data ?? response?.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post(
      `/auth/reset-password/${token}`,
      {
        password,
      }
    );

    return response?.data?.data ?? response?.data;
  },
};

/* =========================
   DASHBOARD
========================= */

export const dashboardService = {
  getOverview: async () => {
    const response = await api.get("/dashboard/overview");
    return response?.data?.data ?? response?.data;
  },

  getOrders: async () => {
    const response = await api.get("/orders");
    return response?.data?.data ?? response?.data ?? [];
  },

  getTables: async () => {
    const response = await api.get("/tables");
    return response?.data?.data ?? response?.data ?? [];
  },

  getKitchenQueue: async () => {
    const response = await api.get("/kitchen");
    return response?.data?.data ?? response?.data ?? [];
  },

  getInventory: async () => {
    const response = await api.get("/inventory");
    return response?.data?.data ?? response?.data ?? [];
  },

  getCustomers: async () => {
    const response = await api.get("/customers");
    return response?.data?.data ?? response?.data ?? [];
  },

  getReservations: async () => {
    const response = await api.get("/reservations");
    return response?.data?.data ?? response?.data ?? [];
  },

  getStaff: async () => {
    const response = await api.get("/staff");
    return response?.data?.data ?? response?.data ?? [];
  },

  getAnalytics: async () => {
    const response = await api.get("/analytics");
    return response?.data?.data ?? response?.data ?? {};
  },

  getReports: async () => {
    const response = await api.get("/reports");
    return response?.data?.data ?? response?.data ?? {};
  },

  getBilling: async () => {
    const response = await api.get("/billing");
    return response?.data?.data ?? response?.data ?? {
      invoices: [],
    };
  },

  getProfile: async () => {
    const response = await api.get("/profile");
    return response?.data?.data ?? response?.data ?? {};
  },

  getNotifications: async () => {
    const response = await api.get("/notifications");
    return response?.data?.data ?? response?.data ?? [];
  },

  getAiAssistant: async () => {
    const response = await api.get("/ai/assistant");
    return response?.data?.data ?? response?.data ?? {};
  },
};

/* =========================
   MENU
========================= */

export const menuService = {
  getMenu: async () => {
    try {
      const response = await api.get("/menu");

      return response?.data?.data ?? response?.data ?? [];
    } catch (error) {
      console.error("Failed to load menu:", error);

      /*
       * Temporary fallback menu.
       * Remove this once your backend menu endpoint is ready.
       */
      return [
        {
          id: "m1",
          name: "Grilled Salmon",
          price: 18.5,
          bestseller: true,
          chef: false,
          ingredients: ["Salmon", "Lemon", "Herbs"],
          discount: 0,
        },
        {
          id: "m2",
          name: "Spicy Ramen",
          price: 12,
          bestseller: false,
          chef: true,
          ingredients: ["Noodles", "Chili", "Pork"],
          discount: 10,
        },
        {
          id: "m3",
          name: "Caesar Salad",
          price: 9.5,
          bestseller: true,
          chef: false,
          ingredients: ["Lettuce", "Croutons", "Parmesan"],
          discount: 0,
        },
        {
          id: "m4",
          name: "Chef's Tasting Plate",
          price: 28,
          bestseller: false,
          chef: true,
          ingredients: ["Seasonal"],
          discount: 15,
        },
      ];
    }
  },
};

/* =========================
   ORDERS
========================= */

export const orderService = {
  placeOrder: async (payload) => {
    console.log("Sending order to backend:", payload);

    const response = await api.post("/orders", payload);

    console.log("Order response:", response.data);

    return response?.data?.data ?? response?.data;
  },

  assignWaiter: async (orderId, waiter) => {
    const response = await api.post(
      `/orders/${orderId}/assign-waiter`,
      {
        waiter,
      }
    );

    return response?.data?.data ?? response?.data;
  },
};

export default api;