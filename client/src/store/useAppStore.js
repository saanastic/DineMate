import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAppStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      theme: "dark",
      activeRestaurant: "Aurelia Room",
      // cart and ordering
      cart: [],
      assignedWaiter: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token, isAuthenticated: Boolean(token) }),
      addToCart: (dish) =>
        set((state) => {
          const existing = state.cart.find((d) => d.id === dish.id);
          if (existing) {
            return { cart: state.cart.map((d) => (d.id === dish.id ? { ...d, qty: d.qty + (dish.qty || 1) } : d)) };
          }
          return { cart: [...state.cart, { ...dish, qty: dish.qty || 1 }] };
        }),
      removeFromCart: (id) => set((state) => ({ cart: state.cart.filter((d) => d.id !== id) })),
      updateQty: (id, qty) => set((state) => ({ cart: state.cart.map((d) => (d.id === id ? { ...d, qty } : d)) })),
      clearCart: () => set({ cart: [] }),
      assignWaiter: (waiter) => set({ assignedWaiter: waiter }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setTheme: (theme) => set({ theme }),
      setActiveRestaurant: (activeRestaurant) => set({ activeRestaurant }),
    }),
    {
      name: "dinemate-store",
      partialize: (state) => ({
        theme: state.theme,
        activeRestaurant: state.activeRestaurant,
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);