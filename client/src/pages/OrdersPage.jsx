import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  FileText,
  Receipt,
  Clock3,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import SectionCard from "../components/SectionCard";
import Button from "../components/Button";
import { dashboardService } from "../services/api";
import { formatCurrency } from "../utils/formatters";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await dashboardService.getOrders();

      console.log("Orders received from backend:", data);

      /*
       * Make sure we always store an array.
       */
      if (Array.isArray(data)) {
        setOrders(data);
      } else if (Array.isArray(data?.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load orders from server."
      );

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const customer =
        order.customerName ||
        order.customer ||
        order.customer_name ||
        "";

      const id =
        order.id ||
        order._id ||
        order.orderId ||
        "";

      return `${customer} ${id}`
        .toLowerCase()
        .includes(search.toLowerCase());
    });
  }, [orders, search]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[30px] border border-white/10 bg-[#101114]/90 p-6"
    >
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Orders
          </h1>

          <p className="mt-2 text-white/50">
            Precision order management
          </p>

          <p className="mt-1 text-sm text-white/40">
            Track service states, invoices, receipts, and kitchen
            progress in a polished operational view.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={loadOrders}
          disabled={loading}
        >
          <RefreshCw
            size={15}
            className={`mr-2 ${
              loading ? "animate-spin" : ""
            }`}
          />

          Refresh
        </Button>
      </div>

      {/* SEARCH */}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <Search
            size={18}
            className="text-white/40"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search orders"
            className="w-full bg-transparent text-white outline-none placeholder:text-white/30"
          />
        </div>

        <Button variant="secondary">
          <SlidersHorizontal
            size={16}
            className="mr-2"
          />
          Filters
        </Button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* ORDERS */}

      <div className="mt-6">
        <SectionCard
          title="Live orders"
          subtitle="Modern table with progress states and invoice actions"
        >
          <div className="space-y-3">

            {/* LOADING */}

            {loading ? (
              <div className="rounded-[20px] border border-white/10 p-8 text-center text-white/50">
                Loading orders...
              </div>
            ) : filtered.length ? (

              filtered.map((order) => {

                const orderId =
                  order.id ||
                  order._id ||
                  order.orderId ||
                  "Pending";

                const customer =
                  order.customerName ||
                  order.customer ||
                  order.customer_name ||
                  "Guest";

                const status =
                  order.status ||
                  "Preparing";

                const table =
                  order.table ||
                  order.tableNumber ||
                  "12";

                const total =
                  order.total ||
                  order.amount ||
                  0;

                const time =
                  order.time ||
                  order.createdAt ||
                  "Just now";

                let itemsText = "Order items";

                if (Array.isArray(order.items)) {
                  itemsText = order.items
                    .map((item) => {
                      if (typeof item === "string") {
                        return item;
                      }

                      return (
                        item.name ||
                        item.itemName ||
                        "Item"
                      );
                    })
                    .join(" • ");
                } else if (order.summary) {
                  itemsText = order.summary;
                }

                return (
                  <div
                    key={orderId}
                    className="rounded-3xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                      {/* ORDER INFO */}

                      <div className="space-y-2">

                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                            {status}
                          </span>

                          <span className="text-sm text-white/45">
                            #{orderId}
                          </span>
                        </div>

                        <div>
                          <p className="font-semibold text-white">
                            {customer}
                          </p>

                          <p className="text-sm text-white/55">
                            {itemsText}
                          </p>
                        </div>

                      </div>

                      {/* ORDER META */}

                      <div className="flex flex-wrap gap-3 text-sm text-white/60">

                        <div className="rounded-2xl border border-white/10 bg-[#121317] px-3 py-2">
                          Table {table}
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#121317] px-3 py-2">
                          {formatCurrency(total)}
                        </div>

                        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#121317] px-3 py-2">
                          <Clock3 size={14} />
                          {time}
                        </div>

                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="mt-4 flex flex-wrap gap-2">

                      <Button variant="secondary">
                        <Receipt
                          size={15}
                          className="mr-2"
                        />
                        Receipt
                      </Button>

                      <Button variant="secondary">
                        <FileText
                          size={15}
                          className="mr-2"
                        />
                        Invoice
                      </Button>

                      <Button>
                        Advance
                        <ArrowRight
                          size={15}
                          className="ml-2"
                        />
                      </Button>

                    </div>
                  </div>
                );
              })

            ) : (

              <div className="rounded-[20px] border border-dashed border-white/10 p-8 text-center text-white/55">
                <p className="font-medium text-white">
                  No orders found
                </p>

                <p className="mt-1 text-sm text-white/40">
                  Orders placed from the Menu will appear here.
                </p>
              </div>

            )}

          </div>
        </SectionCard>
      </div>
    </motion.div>
  );
}