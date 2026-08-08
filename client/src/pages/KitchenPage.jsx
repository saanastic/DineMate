import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Clock3, Flame, Check, Play, AlertTriangle, Star } from "lucide-react";
import SectionCard from "../components/SectionCard";
import { dashboardService, orderService } from "../services/api";
import { formatCurrency } from "../utils/formatters";

const columns = [
  { id: "new", title: "New Orders", statuses: ["placed", "confirmed"], accent: "amber" },
  { id: "preparing", title: "Preparing", statuses: ["preparing"], accent: "orange" },
  { id: "ready", title: "Ready", statuses: ["ready"], accent: "emerald" },
  { id: "served", title: "Completed", statuses: ["served", "closed"], accent: "blue" },
  { id: "cancelled", title: "Cancelled", statuses: ["cancelled"], accent: "slate" },
];

export default function KitchenPage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityMap, setPriorityMap] = useState({});
  const pollRef = useRef(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getKitchenQueue();
      // backend returns array of orders
      setQueue(Array.isArray(data) ? data : data?.items || []);
    } catch (e) {
      console.error("Failed to load kitchen queue:", e);
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    pollRef.current = setInterval(fetchQueue, 5000);
    return () => clearInterval(pollRef.current);
  }, []);

  const togglePriority = (id) => {
    setPriorityMap((s) => ({ ...s, [id]: !s[id] }));
  };

  const changeStatus = async (orderId, status) => {
    try {
      await orderService.updateStatus(orderId, status);
      await fetchQueue();
    } catch (e) {
      console.error("Failed to update status", e);
      // optimistic UI could be added
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/10 bg-[#101114]/90 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">Kitchen</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Dispatched kitchen board</h1>
        <p className="mt-2 text-sm text-white/60">An elegant Kanban flow for priority orders, prep timers, and overdue risk.</p>
      </motion.div>

      <div className="grid gap-4 xl:grid-cols-5">
        {columns.map((column) => (
          <SectionCard key={column.id} title={column.title} subtitle="Live kitchen column">
            <div className="space-y-3">
              {!loading && queue.length ? (
                queue
                  .filter((o) => column.statuses.includes(o.status))
                  .map((item) => (
                    <motion.div layout key={item.id} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-white">{item.table_label || `Table ${item.table_id || "-"}`}</p>
                          <p className="mt-1 text-sm text-white/60">{item.items?.map((it) => `${it.quantity}x ${it.item_name}`).join(" • ")}</p>
                        </div>
                        <div className="text-right">
                          <div className="inline-flex items-center gap-2">
                            <span className="text-sm text-white/60">{item.created_at ? new Date(item.created_at).toLocaleTimeString() : "-"}</span>
                          </div>
                          <div className="mt-2 text-sm text-white/75">{formatCurrency(parseFloat(item.total || 0))}</div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => togglePriority(item.id)} className="rounded px-2 py-1 bg-white/5 text-xs text-white/80">{priorityMap[item.id] ? <Star size={14} className="text-amber-300" /> : <Star size={14} />}</button>
                          <span className="text-sm text-white/50">{item.payment_status ? item.payment_status : ""}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {column.id === "new" && <button onClick={() => changeStatus(item.id, "preparing")} className="rounded bg-amber-600 px-3 py-1 text-sm text-white">Start Prep</button>}
                          {column.id === "preparing" && <button onClick={() => changeStatus(item.id, "ready")} className="rounded bg-emerald-600 px-3 py-1 text-sm text-white">Mark Ready</button>}
                          {column.id === "ready" && <button onClick={() => changeStatus(item.id, "served")} className="rounded bg-blue-600 px-3 py-1 text-sm text-white">Mark Served</button>}
                          {column.id !== "served" && <button onClick={() => changeStatus(item.id, "cancelled")} className="rounded bg-red-600 px-2 py-1 text-sm text-white">Cancel</button>}
                        </div>
                      </div>
                    </motion.div>
                  ))
              ) : (
                <div className="rounded-[20px] border border-dashed border-white/10 p-6 text-center text-sm text-white/55">{loading ? "Loading…" : "No orders in this column"}</div>
              )}
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
