import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "";

const normalizeApiBaseUrl = (rawUrl) => {
  const url = (rawUrl || "").replace(/\/+$|\s+/g, "");
  if (!url) return "/api/v1";
  if (url.startsWith("/")) {
    if (url.endsWith("/api")) return `${url}/v1`;
    return url.endsWith("/api/v1") ? url : `${url}/api/v1`;
  }
  if (/^https?:\/\//.test(url)) {
    if (url.endsWith("/api/v1")) return url;
    if (url.endsWith("/api")) return `${url}/v1`;
    return url.includes("/api/v1") ? url : `${url}/api/v1`;
  }
  return "/api/v1";
};

const API_BASE_URL = normalizeApiBaseUrl(rawApiBaseUrl);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* -----------------
   Demo/local fallback store
   ----------------- */
const DEMO_ORDERS_KEY = "dinemate_demo_orders";

const loadDemoOrders = () => {
  try {
    const raw = localStorage.getItem(DEMO_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveDemoOrders = (orders) => {
  try {
    localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    /* ignore */
  }
};

const createDemoOrder = (payload) => {
  const now = new Date().toISOString();
  const id = Math.floor(Math.random() * 900000) + 100000;
  const subtotal = (payload.items || []).reduce((s, it) => s + (Number(it.price || 0) * (it.qty || 1)), 0);
  const tax = +(subtotal * 0.05).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);
  const order = {
    id,
    table_id: payload.table_id || null,
    table_label: payload.table_label || (payload.table_id ? `Table ${payload.table_id}` : null),
    status: "placed",
    payment_method: payload.payment_method || "cash",
    payment_status: payload.payment_method === "online" ? "pending" : "paid",
    subtotal: subtotal.toFixed(2),
    tax: tax.toFixed(2),
    total: total.toFixed(2),
    customer_note: payload.customer_note || null,
    created_at: now,
    updated_at: now,
    items: (payload.items || []).map((it, idx) => ({
      id: idx + 1,
      menu_item_id: it.id || it.menu_item_id,
      item_name: it.name || it.item_name,
      quantity: it.qty || it.quantity || 1,
      unit_price: (it.price || it.unit_price || 0).toString(),
      selected_modifiers: it.selected_modifiers || [],
      item_note: it.item_note || null,
    })),
  };

  const orders = loadDemoOrders();
  orders.unshift(order);
  saveDemoOrders(orders.slice(0, 200));
  return order;
};

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
    try {
      const response = await api.get("/dashboard");
      return response?.data?.data ?? response?.data;
    } catch (e) {
      // Demo fallback computed from demo orders
      const orders = loadDemoOrders();
      const today = new Date().toISOString().slice(0, 10);
      const todayOrders = orders.filter((o) => (o.created_at || "").startsWith(today));
      const revenue = todayOrders.reduce((s, o) => s + Number(o.total || 0), 0);
      return {
        summary: {
          today_revenue: revenue,
          today_orders: todayOrders.length,
          active_tables: 6,
          reservations: 5,
          staff_on_shift: 10,
          customer_satisfaction: 94,
        },
        trend: [],
        insights: [],
      };
    }
  },

  getOrders: async () => {
    try {
      const response = await api.get("/orders");
      return response?.data?.data ?? response?.data ?? [];
    } catch (e) {
      return loadDemoOrders();
    }
  },

  getTables: async () => {
    const response = await api.get("/tables");
    return response?.data?.data ?? response?.data ?? [];
  },

  getKitchenQueue: async () => {
    try {
      const response = await api.get("/kitchen");
      return response?.data?.data ?? response?.data ?? [];
    } catch (e) {
      // return demo orders in open statuses
      const orders = loadDemoOrders();
      return orders.filter((o) => ["placed", "confirmed", "preparing", "ready", "served"].includes(o.status));
    }
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
    const response = await api.get("/admin/analytics/summary");
    return response?.data?.data ?? response?.data ?? {};
  },

  getReports: async () => {
    const response = await api.get("/reports");
    return response?.data?.data ?? response?.data ?? {};
  },

  getBilling: async () => {
    try {
      const response = await api.get("/billing");
      return response?.data?.data ?? response?.data ?? { invoices: [] };
    } catch (e) {
      const orders = loadDemoOrders();
      return { invoices: orders.slice(0, 20).map((o) => ({ id: o.id, total: o.total, status: o.payment_status, created_at: o.created_at })) };
    }
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
    try {
      const response = await api.get("/assistant");
      return response?.data?.data ?? response?.data ?? {};
    } catch (e) {
      return { summary: "DineMate AI is ready — start a conversation to get insights based on demo data." };
    }
  },
};

export const assistantService = {
  chat: async (payload) => {
    try {
      const response = await api.post(`/assistant/chat`, payload);
      return response?.data ?? response?.data?.data;
    } catch (e) {
      // Simple demo assistant fallback
      const q = (payload?.message || "").toLowerCase();
      const orders = loadDemoOrders();
      if (q.includes("sales") || q.includes("revenue")) {
        const today = new Date().toISOString().slice(0, 10);
        const todayOrders = orders.filter((o) => (o.created_at || "").startsWith(today));
        const revenue = todayOrders.reduce((s, o) => s + Number(o.total || 0), 0);
        return { reply: `Today's demo revenue is ₹${Math.round(revenue)} across ${todayOrders.length} orders.` };
      }
      if (q.includes("top") && q.includes("dish")) {
        // simple top items
        const counts = {};
        orders.forEach((o) => (o.items || []).forEach((it) => (counts[it.item_name] = (counts[it.item_name] || 0) + (it.quantity || 1))));
        const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        return { reply: top ? `Top demo dish: ${top[0]} (${top[1]} sold)` : "No sales yet in demo." };
      }
      return { reply: "I can help with demo data — ask about sales, top dishes, kitchen status, or inventory." };
    }
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
          name: "Paneer Butter Masala",
          category: "Main Course",
          description: "Creamy tomato sauce with soft paneer cubes, served with butter naan.",
          price: 249,
          bestseller: true,
          veg: true,
          spice_level: 2,
          prep_time_mins: 18,
          ingredients: ["Paneer", "Tomato", "Butter", "Kasuri Methi"],
          image_url: "/public/images/paneer.jpg",
        },
        {
          id: "m2",
          name: "Chicken Biryani (Single)",
          category: "Main Course",
          description: "Aromatic basmati rice layered with spiced chicken and fried onions.",
          price: 349,
          bestseller: true,
          veg: false,
          spice_level: 3,
          prep_time_mins: 30,
          ingredients: ["Chicken", "Basmati Rice", "Spices"],
          image_url: "/public/images/biryani.jpg",
        },
        {
          id: "m3",
          name: "Gobi Manchurian",
          category: "Chinese",
          description: "Crispy cauliflower tossed in tangy Indo-Chinese sauce.",
          price: 199,
          bestseller: false,
          veg: true,
          spice_level: 2,
          prep_time_mins: 12,
          ingredients: ["Cauliflower", "Garlic", "Soya Sauce"],
          image_url: "/public/images/gobi.jpg",
        },
        {
          id: "m4",
          name: "Masala Dosa",
          category: "South Indian",
          description: "Crispy rice crepe filled with spiced potato masala, served with chutney.",
          price: 129,
          bestseller: false,
          veg: true,
          spice_level: 1,
          prep_time_mins: 15,
          ingredients: ["Rice", "Potato", "Spices"],
          image_url: "/public/images/dosa.jpg",
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
    try {
      const response = await api.post("/orders", payload);
      console.log("Order response:", response.data);
      return response?.data?.data ?? response?.data;
    } catch (e) {
      console.warn("Backend unavailable, creating demo order", e);
      return createDemoOrder(payload);
    }
  },

  updateStatus: async (orderId, status) => {
    try {
      const response = await api.patch(`/admin/orders/${orderId}/status`, { status });
      return response?.data?.data ?? response?.data;
    } catch (e) {
      // update demo store
      const orders = loadDemoOrders();
      const idx = orders.findIndex((o) => o.id === orderId);
      if (idx !== -1) {
        orders[idx].status = status;
        orders[idx].updated_at = new Date().toISOString();
        saveDemoOrders(orders);
        return orders[idx];
      }
      throw e;
    }
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