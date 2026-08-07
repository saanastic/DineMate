import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useAppStore } from "../store/useAppStore";
import { useQuery, useMutation } from "@tanstack/react-query";
import { menuService, orderService } from "../services/api";

export default function MenuPage() {
  const navigate = useNavigate();

  const addToCart = useAppStore((s) => s.addToCart);
  const cart = useAppStore((s) => s.cart);
  const removeFromCart = useAppStore((s) => s.removeFromCart);
  const updateQty = useAppStore((s) => s.updateQty);
  const setAssignedWaiter = useAppStore((s) => s.assignWaiter);
  const assignedWaiter = useAppStore((s) => s.assignedWaiter);
  const clearCart = useAppStore((s) => s.clearCart);

  const [selectedWaiter, setSelectedWaiter] = useState(assignedWaiter || "Tom");

  const waiters = ["Tom", "Lina", "Miguel", "Asha"];

  const {
    data: menu = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["menu"],
    queryFn: menuService.getMenu,
  });

  const bestSellers = useMemo(() => menu.filter((dish) => dish.bestseller), [menu]);
  const chefPicks = useMemo(() => menu.filter((dish) => dish.chef), [menu]);

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.qty,
    0
  );

  const totalDiscount = cart.reduce(
    (sum, item) =>
      sum + ((Number(item.discount) || 0) / 100) * Number(item.price || 0) * item.qty,
    0
  );

  const total = subtotal - totalDiscount;

  const placeOrder = useMutation({
    mutationFn: (payload) => orderService.placeOrder(payload),
    onSuccess: (data) => {
      clearCart();
      alert(
        `Order placed successfully — ${
          data?.orderId || data?.id || data?._id || "Order received"
        }`
      );
      navigate("/orders");
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to place order.";
      alert(message);
    },
  });

  const handlePlaceOrder = () => {
    if (!cart.length) {
      alert("Cart is empty");
      return;
    }

    setAssignedWaiter(selectedWaiter);

    placeOrder.mutate({
      items: cart,
      waiter: selectedWaiter,
    });
  };

  const handleQtyChange = (id, value) => {
    const parsed = Number(value);
    const safeQty = Number.isFinite(parsed) ? Math.max(1, parsed) : 1;
    updateQty(id, safeQty);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div>
        <div>
          <h1 className="text-3xl font-bold text-white">Menu</h1>
          <p className="mt-2 text-white/60">
            Explore dishes, chef picks and best sellers.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {isLoading ? (
            <div className="text-sm text-white/50">Loading menu...</div>
          ) : isError ? (
            <div className="text-sm text-red-400">Failed to load menu.</div>
          ) : menu.length === 0 ? (
            <div className="text-sm text-white/50">No dishes available.</div>
          ) : (
            menu.map((dish) => (
              <div
                key={dish.id || dish._id}
                className="rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white">{dish.name}</h3>

                    <p className="mt-1 text-sm text-white/60">
                      {Array.isArray(dish.ingredients)
                        ? dish.ingredients.join(", ")
                        : dish.ingredients || ""}
                    </p>

                    {dish.discount ? (
                      <div className="mt-2 inline-flex items-center rounded-full bg-rose-600/10 px-2 py-1 text-xs text-rose-300">
                        {dish.discount}% off
                      </div>
                    ) : null}
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-white/60">
                      {Number(dish.price || 0).toFixed(2)}$
                    </div>

                    <div className="mt-3">
                      <Button onClick={() => addToCart(dish)}>Add</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[20px] border border-white/10 bg-[#101114]/90 p-4">
            <h4 className="text-sm font-semibold text-white">Best Sellers</h4>

            <ul className="mt-3 space-y-2 text-sm text-white/60">
              {bestSellers.length > 0 ? (
                bestSellers.map((item) => (
                  <li key={item.id || item._id}>
                    {item.name} — {Number(item.price || 0).toFixed(2)}$
                  </li>
                ))
              ) : (
                <li>No best sellers yet.</li>
              )}
            </ul>
          </div>

          <div className="rounded-[20px] border border-white/10 bg-[#101114]/90 p-4">
            <h4 className="text-sm font-semibold text-white">Chef's Picks</h4>

            <ul className="mt-3 space-y-2 text-sm text-white/60">
              {chefPicks.length > 0 ? (
                chefPicks.map((item) => (
                  <li key={item.id || item._id}>
                    {item.name} — {Number(item.price || 0).toFixed(2)}$
                  </li>
                ))
              ) : (
                <li>No chef picks yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <aside className="rounded-[20px] border border-white/10 bg-[#0b0b0c]/95 p-4">
        <h3 className="text-lg font-semibold text-white">Your Order</h3>

        <div className="mt-3 space-y-3">
          {cart.length ? (
            cart.map((item) => (
              <div
                key={item.id || item._id}
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-medium text-white">{item.name}</div>
                  <div className="text-sm text-white/60">
                    {Number(item.price || 0).toFixed(2)}$ × {item.qty}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={item.qty}
                    onChange={(e) =>
                      handleQtyChange(item.id || item._id, e.target.value)
                    }
                    className="w-16 rounded-md bg-white/5 p-1 text-white"
                  />

                  <Button
                    variant="ghost"
                    onClick={() => removeFromCart(item.id || item._id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-white/50">Your cart is empty.</div>
          )}
        </div>

        <div className="mt-4 border-t border-white/10 pt-3">
          <div className="flex items-center justify-between text-sm text-white/60">
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)}$</span>
          </div>

          <div className="flex items-center justify-between text-sm text-rose-300">
            <span>Discount</span>
            <span>-{totalDiscount.toFixed(2)}$</span>
          </div>

          <div className="mt-2 flex items-center justify-between font-semibold text-white">
            <span>Total</span>
            <span>{total.toFixed(2)}$</span>
          </div>

          <div className="mt-4">
            <label className="text-sm text-white/60">Assign waiter</label>

            <div className="mt-2 flex gap-2">
              <select
                value={selectedWaiter}
                onChange={(e) => setSelectedWaiter(e.target.value)}
                className="flex-1 rounded-md bg-white/5 p-2 text-white"
              >
                {waiters.map((waiter) => (
                  <option key={waiter} value={waiter}>
                    {waiter}
                  </option>
                ))}
              </select>

              <Button onClick={() => setAssignedWaiter(selectedWaiter)}>
                Assign
              </Button>
            </div>

            {assignedWaiter && (
              <div className="mt-2 text-sm text-white/60">
                Assigned: {assignedWaiter}
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              onClick={handlePlaceOrder}
              disabled={placeOrder.isPending || !cart.length}
            >
              {placeOrder.isPending ? "Placing..." : "Place order"}
            </Button>

            <Button variant="secondary" onClick={() => navigate("/dashboard")}>
              Continue browsing
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}