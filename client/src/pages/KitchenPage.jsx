import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import SectionCard from "../components/SectionCard";
import { dashboardService, orderService } from "../services/api";
import { formatCurrency } from "../utils/formatters";

const columns = [
  {
    id: "new",
    title: "New Orders",
    statuses: ["placed", "confirmed"],
    accent: "amber",
  },
  {
    id: "preparing",
    title: "Preparing",
    statuses: ["preparing"],
    accent: "orange",
  },
  {
    id: "ready",
    title: "Ready",
    statuses: ["ready"],
    accent: "emerald",
  },
  {
    id: "served",
    title: "Completed",
    statuses: ["served", "closed"],
    accent: "blue",
  },
  {
    id: "cancelled",
    title: "Cancelled",
    statuses: ["cancelled"],
    accent: "slate",
  },
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

      // Backend returns an array of orders
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

    pollRef.current = setInterval(() => {
      fetchQueue();
    }, 5000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  const togglePriority = (id) => {
    setPriorityMap((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const changeStatus = async (orderId, status) => {
    try {
      await orderService.updateStatus(orderId, status);
      await fetchQueue();
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* =========================
          HEADER
      ========================= */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[30px] border border-white/10 bg-[#101114]/90 p-6"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Kitchen
            </h1>

            <p className="mt-1 text-sm font-medium text-emerald-400">
              Dispatched kitchen board
            </p>

            <p className="mt-2 text-sm text-white/60">
              An elegant Kanban flow for priority orders, prep timers,
              and overdue risk.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-white/40">
              Live Orders
            </p>

            <p className="mt-1 text-2xl font-bold text-white">
              {queue.length}
            </p>
          </div>
        </div>
      </motion.div>

      {/* =========================
          KITCHEN KANBAN BOARD
      ========================= */}
      <div className="grid gap-4 xl:grid-cols-5">
        {columns.map((column) => {
          const columnOrders = queue.filter((order) =>
            column.statuses.includes(order.status)
          );

          return (
            <SectionCard
              key={column.id}
              title={column.title}
              subtitle="Live kitchen column"
            >
              <div className="space-y-3">
                {!loading && columnOrders.length > 0 ? (
                  columnOrders.map((item) => (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-[22px] border border-white/10 bg-white/5 p-4"
                    >
                      {/* =========================
                          ORDER HEADER
                      ========================= */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-white">
                            {item.table_label ||
                              `Table ${item.table_id || "-"}`}
                          </p>

                          <p className="mt-1 text-sm text-white/60">
                            {item.items?.length
                              ? item.items
                                  .map(
                                    (it) =>
                                      `${it.quantity}x ${
                                        it.item_name || "Item"
                                      }`
                                  )
                                  .join(" • ")
                              : "No items listed"}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="text-sm text-white/60">
                            {item.created_at
                              ? new Date(
                                  item.created_at
                                ).toLocaleTimeString()
                              : "-"}
                          </div>

                          <div className="mt-2 text-sm font-medium text-white/75">
                            {formatCurrency(
                              parseFloat(item.total || 0)
                            )}
                          </div>
                        </div>
                      </div>

                      {/* =========================
                          ORDER CONTROLS
                      ========================= */}
                      <div className="mt-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                togglePriority(item.id)
                              }
                              className="rounded-lg bg-white/5 p-2 text-white/70 transition hover:bg-white/10"
                              title={
                                priorityMap[item.id]
                                  ? "Remove priority"
                                  : "Mark as priority"
                              }
                            >
                              <Star
                                size={14}
                                className={
                                  priorityMap[item.id]
                                    ? "fill-amber-300 text-amber-300"
                                    : "text-white/60"
                                }
                              />
                            </button>

                            <span className="text-sm capitalize text-white/50">
                              {item.payment_status || ""}
                            </span>
                          </div>

                          <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs capitalize text-white/60">
                            {item.status || "unknown"}
                          </span>
                        </div>

                        {/* =========================
                            STATUS BUTTONS
                        ========================= */}
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {column.id === "new" && (
                            <button
                              type="button"
                              onClick={() =>
                                changeStatus(
                                  item.id,
                                  "preparing"
                                )
                              }
                              className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-500"
                            >
                              Start Prep
                            </button>
                          )}

                          {column.id === "preparing" && (
                            <button
                              type="button"
                              onClick={() =>
                                changeStatus(item.id, "ready")
                              }
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-500"
                            >
                              Mark Ready
                            </button>
                          )}

                          {column.id === "ready" && (
                            <button
                              type="button"
                              onClick={() =>
                                changeStatus(item.id, "served")
                              }
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-500"
                            >
                              Mark Served
                            </button>
                          )}

                          {column.id !== "served" &&
                            column.id !== "cancelled" && (
                              <button
                                type="button"
                                onClick={() =>
                                  changeStatus(
                                    item.id,
                                    "cancelled"
                                  )
                                }
                                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-500"
                              >
                                Cancel
                              </button>
                            )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="rounded-[20px] border border-dashed border-white/10 p-6 text-center text-sm text-white/55">
                    {loading
                      ? "Loading…"
                      : "No orders in this column"}
                  </div>
                )}
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}