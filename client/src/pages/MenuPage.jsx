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

  const [selectedWaiter, setSelectedWaiter] = useState(assignedWaiter || "Tom");

  const waiters = ["Tom", "Lina", "Miguel", "Asha"];

  const { data: menu = [], isLoading } = useQuery(["menu"], menuService.getMenu);

  const bestSellers = useMemo(() => (menu || []).filter((m) => m.bestseller), [menu]);
  const chefPicks = useMemo(() => (menu || []).filter((m) => m.chef), [menu]);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalDiscount = cart.reduce((s, i) => s + ((i.discount || 0) / 100) * i.price * i.qty, 0);
  const total = subtotal - totalDiscount;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="rounded-[20px] border border-white/10 bg-[#101114]/90 p-6">
          <h2 className="text-xl font-semibold text-white">Menu</h2>
          <p className="mt-1 text-sm text-white/60">Explore dishes, chef picks and best sellers.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {isLoading ? (
              <div className="text-sm text-white/50">Loading menu…</div>
            ) : (
              menu.map((dish) => (
              <div key={dish.id} className="rounded-lg border border-white/6 bg-white/5 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{dish.name}</h3>
                    <p className="mt-1 text-sm text-white/60">{dish.ingredients.join(', ')}</p>
                    {dish.discount ? <div className="mt-2 inline-flex items-center rounded-full bg-rose-600/10 px-2 py-1 text-xs text-rose-300">{dish.discount}% off</div> : null}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white/60">{dish.price.toFixed(2)}$</div>
                    <div className="mt-3 flex gap-2">
                      <Button onClick={() => addToCart(dish)}>Add</Button>
                    </div>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[20px] border border-white/10 bg-[#101114]/90 p-4">
            <h4 className="text-sm font-semibold text-white">Best Sellers</h4>
              <ul className="mt-3 space-y-2 text-sm text-white/60">
                {bestSellers.map((b) => <li key={b.id}>{b.name} — {b.price}$</li>)}
            </ul>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-[#101114]/90 p-4">
            <h4 className="text-sm font-semibold text-white">Chef's Picks</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              {chefPicks.map((c) => <li key={c.id}>{c.name} — {c.price}$</li>)}
            </ul>
          </div>
        </div>
      </div>

      <aside className="rounded-[20px] border border-white/10 bg-[#0b0b0c]/95 p-4">
        <h3 className="text-lg font-semibold text-white">Your Order</h3>
        <div className="mt-3 space-y-3">
          {cart.length ? (
            cart.map((it) => (
              <div key={it.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{it.name}</div>
                  <div className="text-sm text-white/60">{(it.price).toFixed(2)}$ × {it.qty}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" min={1} value={it.qty} onChange={(e) => updateQty(it.id, Number(e.target.value))} className="w-16 rounded-md bg-white/5 p-1 text-white" />
                  <Button variant="ghost" onClick={() => removeFromCart(it.id)}>Remove</Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-white/50">Your cart is empty.</div>
          )}
        </div>

        <div className="mt-4 border-t border-white/6 pt-3">
          <div className="flex items-center justify-between text-sm text-white/60">Subtotal <span>{subtotal.toFixed(2)}$</span></div>
          <div className="flex items-center justify-between text-sm text-rose-300">Discount <span>-{totalDiscount.toFixed(2)}$</span></div>
          <div className="flex items-center justify-between mt-2 font-semibold text-white">Total <span>{total.toFixed(2)}$</span></div>

          <div className="mt-4">
            <label className="text-sm text-white/60">Assign waiter</label>
              <div className="mt-2 flex gap-2">
              <select value={selectedWaiter} onChange={(e) => setSelectedWaiter(e.target.value)} className="flex-1 rounded-md bg-white/5 p-2 text-white">
                {waiters.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
              <Button onClick={() => setAssignedWaiter(selectedWaiter)}>Assign</Button>
            </div>
            {assignedWaiter && <div className="mt-2 text-sm text-white/60">Assigned: {assignedWaiter}</div>}
          </div>

            <div className="mt-4">
            <OrderControls cart={cart} subtotal={subtotal} totalDiscount={totalDiscount} total={total} assignWaiter={setAssignedWaiter} selectedWaiter={selectedWaiter} navigate={navigate} />
          </div>
        </div>
      </aside>
    </div>
  );
}

function OrderControls({ cart, subtotal, totalDiscount, total, assignWaiter, selectedWaiter, navigate }) {
  const placeOrder = useMutation({
    mutationFn: (payload) => orderService.placeOrder(payload),
    onSuccess: (data) => {
      alert(`Order placed — ${data.orderId || 'pending'}`);
    },
    onError: () => alert('Failed to place order'),
  });
  const clearCart = useAppStore((s) => s.clearCart);

  return (
    <>
      <div className="flex items-center justify-between text-sm text-white/60">Subtotal <span>{subtotal.toFixed(2)}$</span></div>
      <div className="flex items-center justify-between text-sm text-rose-300">Discount <span>-{totalDiscount.toFixed(2)}$</span></div>
      <div className="flex items-center justify-between mt-2 font-semibold text-white">Total <span>{total.toFixed(2)}$</span></div>

        <div className="mt-3 flex gap-2">
        <Button onClick={() => {
          if (!cart.length) return alert('Cart is empty');
          // assign waiter to the order in the store if provided
          assignWaiter?.(selectedWaiter);
          placeOrder.mutate({ items: cart, waiter: selectedWaiter });
          clearCart();
        }} disabled={placeOrder.isLoading}>{placeOrder.isLoading ? 'Placing…' : 'Place order'}</Button>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>Continue browsing</Button>
      </div>
    </>
  );
}
