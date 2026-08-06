import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, FileText, Receipt, Clock3, ArrowRight } from "lucide-react";
import SectionCard from "../components/SectionCard";
import Button from "../components/Button";
import { dashboardService } from "../services/api";
import { formatCurrency } from "../utils/formatters";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  useEffect(() => {
    dashboardService.getOrders().then(setOrders);
  }, []);

  const filtered = useMemo(() => orders.filter((order) => `${order.customerName || order.customer || ""} ${order.id || ""}`.toLowerCase().includes(search.toLowerCase())), [orders, search]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/10 bg-[#101114]/90 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">Orders</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Precision order management</h1>
            <p className="mt-2 text-sm text-white/60">Track service states, invoices, receipts, and kitchen progress in a polished operational view.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
              <Search size={15} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders" className="bg-transparent outline-none" />
            </div>
            <Button variant="secondary"><SlidersHorizontal size={15} className="mr-2" />Filters</Button>
          </div>
        </div>
      </motion.div>

      <SectionCard title="Live orders" subtitle="Modern table with progress states and invoice actions">
        <div className="space-y-3">
          {filtered.length ? filtered.map((order) => (
            <div key={order.id || order._id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">{order.status || "Preparing"}</span>
                    <span className="text-sm text-white/45">{order.id || "#ORD-1001"}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{order.customerName || order.customer || "Guest"}</p>
                    <p className="text-sm text-white/55">{order.items?.join ? order.items.join(" • ") : order.summary || "Chef's tasting"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-white/60">
                  <div className="rounded-2xl border border-white/10 bg-[#121317] px-3 py-2">Table {order.table || "12"}</div>
                  <div className="rounded-2xl border border-white/10 bg-[#121317] px-3 py-2">{formatCurrency(order.total || 0)}</div>
                  <div className="rounded-2xl border border-white/10 bg-[#121317] px-3 py-2 flex items-center gap-2"><Clock3 size={14} />{order.time || "12 min"}</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary"><Receipt size={15} className="mr-2" />Receipt</Button>
                <Button variant="secondary"><FileText size={15} className="mr-2" />Invoice</Button>
                <Button>Advance <ArrowRight size={15} className="ml-2" /></Button>
              </div>
            </div>
          )) : <div className="rounded-[20px] border border-dashed border-white/10 p-6 text-center text-white/55">No orders matched your current filters.</div>}
        </div>
      </SectionCard>
    </div>
  );
}
