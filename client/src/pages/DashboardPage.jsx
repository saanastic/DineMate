import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ShoppingBag,
  UtensilsCrossed,
  CalendarDays,
  Star,
  Boxes,
  ChefHat,
  Sparkles,
  CircleEllipsis,
  ArrowRight,
  Clock3,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import StatCard from "../components/StatCard";
import SectionCard from "../components/SectionCard";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { dashboardService } from "../services/api";
import { formatCurrency } from "../utils/formatters";

const revenueSeries = [
  { name: "Mon", value: 4800 },
  { name: "Tue", value: 5200 },
  { name: "Wed", value: 6100 },
  { name: "Thu", value: 7000 },
  { name: "Fri", value: 8400 },
  { name: "Sat", value: 9600 },
  { name: "Sun", value: 8800 },
];

const occupancy = [
  { name: "Breakfast", value: 42 },
  { name: "Lunch", value: 65 },
  { name: "Dinner", value: 88 },
  { name: "Late", value: 54 },
];

const paymentMix = [
  { name: "Card", value: 62, color: "#34d399" },
  { name: "Cash", value: 18, color: "#60a5fa" },
  { name: "Digital", value: 20, color: "#f59e0b" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [kitchen, setKitchen] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: overview = {} } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: dashboardService.getOverview,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [orderData, kitchenData] = await Promise.all([
        dashboardService.getOrders(),
        dashboardService.getKitchenQueue(),
      ]);
      setOrders(orderData);
      setKitchen(kitchenData);
      setLoading(false);
    };
    load();
  }, []);

  const statCards = useMemo(() => [
    { title: "Today's Revenue", value: formatCurrency(overview?.revenue || 14280), subtitle: "vs yesterday", delta: "+8.2%", positive: true, icon: TrendingUp },
    { title: "Total Orders", value: `${overview?.orders || 248}`, subtitle: "live service", delta: "+12.4%", positive: true, icon: ShoppingBag },
    { title: "Active Tables", value: `${overview?.tables || 18}/24`, subtitle: "occupancy", delta: "75%", positive: true, icon: UtensilsCrossed },
    { title: "Reservations", value: `${overview?.reservations || 32}`, subtitle: "upcoming", delta: "+5", positive: true, icon: CalendarDays },
    { title: "Customer Satisfaction", value: `${overview?.satisfaction || 96}%`, subtitle: "guest score", delta: "+2.1", positive: true, icon: Star },
    { title: "Average Order Value", value: formatCurrency(overview?.averageOrderValue || 58), subtitle: "per check", delta: "+6.8%", positive: true, icon: Boxes },
    { title: "Inventory Health", value: `${overview?.inventoryHealth || 87}%`, subtitle: "stock status", delta: "Stable", positive: true, icon: Boxes },
    { title: "Kitchen Performance", value: `${overview?.kitchenPerformance || 94}%`, subtitle: "ready speed", delta: "-3m", positive: false, icon: ChefHat },
  ], []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 rounded-[30px] border border-white/10 bg-[#101114]/90 p-6 shadow-[0_20px_45px_rgba(0,0,0,0.24)] lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">Live control center</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Make every shift feel effortless.</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/60">Monitor revenue, guest flow, kitchen throughput, and AI recommendations from a premium command surface.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary">Export report</Button>
          <Button onClick={() => navigate('/menu')}>View menu</Button>
          <Button><Sparkles size={16} className="mr-2" />Open AI copilot</Button>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <SectionCard title="Weekly revenue" subtitle="Animated performance across the week" action={<span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">+14.6%</span>}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#8b8b8b" tickLine={false} axisLine={false} />
                <YAxis stroke="#8b8b8b" tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#34d399" fill="url(#revenue)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Occupancy trend" subtitle="Peak demand by service window">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancy}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#8b8b8b" tickLine={false} axisLine={false} />
                <YAxis stroke="#8b8b8b" tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Recent orders" subtitle="Live kitchen and service queue" action={<Button variant="ghost">View all</Button>}>
          <div className="space-y-3">
            {!loading && orders.length ? orders.slice(0, 5).map((order) => (
              <div key={order.id || order._id} className="flex items-center justify-between rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="font-medium text-white">{order.customerName || order.customer || "Guest"}</p>
                  <p className="text-sm text-white/50">{order.items?.join ? order.items.join(", ") : order.summary || "Luxury tasting menu"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{order.total ? formatCurrency(order.total) : "$0"}</p>
                  <p className="text-sm text-emerald-400">{order.status || "Preparing"}</p>
                </div>
              </div>
            )) : <div className="rounded-[20px] border border-dashed border-white/10 p-6 text-center text-white/55">No live orders available yet.</div>}
          </div>
        </SectionCard>

        <SectionCard title="AI business insights" subtitle="Revenue, inventory, and guest intelligence" action={<span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">Updated now</span>}>
          <div className="space-y-3">
            {[{ title: "Peak rush forecast", body: "Dinner demand will rise 18% between 7:30 PM and 9:00 PM.", tone: "emerald" }, { title: "Inventory prediction", body: "Salmon stock is likely to dip below safety levels by Friday.", tone: "amber" }, { title: "Guest segmentation", body: "Loyal weekend diners are 2.3x more likely to order premium wine pairing.", tone: "blue" }].map((item) => (
              <div key={item.title} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Sparkles size={14} className="text-emerald-400" />{item.title}
                </div>
                <p className="mt-2 text-sm leading-6 text-white/60">{item.body}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard title="Kitchen queue" subtitle="Priority dishes and prep pacing">
          <div className="space-y-3">
            {!loading && kitchen.length ? kitchen.slice(0, 4).map((item, index) => (
              <div key={item.id || index} className="flex items-center justify-between rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">{item.table || "Table"}</p>
                  <p className="text-sm text-white/50">{Array.isArray(item.items) ? item.items.join(" • ") : item.summary || "Priority plate"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-emerald-400">{item.status || "Prep"}</p>
                  <p className="text-sm text-white/45">{item.time || "Now"}</p>
                </div>
              </div>
            )) : <div className="rounded-[20px] border border-dashed border-white/10 p-6 text-center text-white/55">Kitchen queue will appear here once live data arrives.</div>}
          </div>
        </SectionCard>
        <SectionCard title="Payment mix" subtitle="Guest preference by spend channel">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentMix} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {paymentMix.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
