import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../services/dashboardService";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  ChefHat,
  Boxes,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  Sun,
  Moon,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react";

// --- MOCK DATA ---

const chartData = [
  { day: "Mon", orders: 145, revenue: 3200 },
  { day: "Tue", orders: 182, revenue: 4100 },
  { day: "Wed", orders: 168, revenue: 3800 },
  { day: "Thu", orders: 210, revenue: 5200 },
  { day: "Fri", orders: 290, revenue: 7800 },
  { day: "Sat", orders: 340, revenue: 9400 },
  { day: "Sun", orders: 275, revenue: 7100 },
];

const kpiData = [
  {
    title: "Today's Orders",
    value: "284",
    change: "+12.5%",
    isPositive: true,
    icon: ShoppingBag,
    subtext: "vs yesterday",
  },
  {
    title: "Total Revenue",
    value: "$4,820.50",
    change: "+8.2%",
    isPositive: true,
    icon: TrendingUp,
    subtext: "vs yesterday",
  },
  {
    title: "Occupied Tables",
    value: "18 / 24",
    change: "75% Capacity",
    isPositive: true,
    icon: UtensilsCrossed,
    subtext: "6 available",
  },
  {
    title: "Pending Orders",
    value: "7",
    change: "-2 from peak",
    isPositive: false,
    icon: Clock,
    subtext: "Avg time: 14 min",
  },
];

const recentOrders = [
  {
    id: "#ORD-9482",
    table: "Table 04",
    customer: "Elena Rostova",
    items: "2x Wagyu Burger, 1x Truffle Fries",
    total: "$68.50",
    status: "Preparing",
    time: "4 mins ago",
  },
  {
    id: "#ORD-9481",
    table: "Table 12",
    customer: "Marcus Chen",
    items: "1x Ribeye Steak, 1x Pinot Noir",
    total: "$112.00",
    status: "Ready",
    time: "8 mins ago",
  },
  {
    id: "#ORD-9480",
    table: "Table 02",
    customer: "Sarah Jenkins",
    items: "3x Lobster Bisque, 2x Sparkling Water",
    total: "$84.20",
    status: "Served",
    time: "15 mins ago",
  },
  {
    id: "#ORD-9479",
    table: "Table 08",
    customer: "David Kim",
    items: "2x Salmon Tartare, 2x Espresso",
    total: "$56.00",
    status: "Served",
    time: "22 mins ago",
  },
  {
    id: "#ORD-9478",
    table: "Table 15",
    customer: "Chloe Bennett",
    items: "1x Wild Mushroom Risotto",
    total: "$32.50",
    status: "Completed",
    time: "35 mins ago",
  },
];

const kitchenQueue = [
  {
    id: "#ORD-9483",
    table: "Table 07",
    items: ["2x Sea Bass", "1x Caesar Salad"],
    time: "2m active",
    status: "Preparing",
    chef: "Marco",
  },
  {
    id: "#ORD-9482",
    table: "Table 04",
    items: ["2x Wagyu Burger", "1x Truffle Fries"],
    time: "6m active",
    status: "Preparing",
    chef: "Antoine",
  },
  {
    id: "#ORD-9481",
    table: "Table 12",
    items: ["1x Ribeye Steak", "1x Pinot Noir"],
    time: "11m active",
    status: "Ready",
    chef: "Sofia",
  },
  {
    id: "#ORD-9480",
    table: "Table 02",
    items: ["3x Lobster Bisque"],
    time: "16m active",
    status: "Served",
    chef: "Marco",
  },
];

const insightMeta = {
  forecast: { icon: Flame, badge: 'Forecast', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  inventory: { icon: AlertTriangle, badge: 'Action Required', badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20' },
  menu: { icon: Sparkles, badge: 'AI Recommendation', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

const normalizeInsights = (items) =>
  items.map((insight) => {
    if (insight.icon) return insight;
    const meta = insightMeta[insight.type] ?? insightMeta.menu;
    return { ...insight, ...meta };
  });

const aiInsights = [
  {
    type: "peak",
    icon: Flame,
    title: "Peak Rush Incoming",
    description: "Expect 35% higher traffic between 7:30 PM - 9:00 PM based on local reservations.",
    badge: "Forecast",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    type: "inventory",
    icon: AlertTriangle,
    title: "Low Stock Alert",
    description: "Wagyu Beef patties under 12 units remaining. Reorder suggested by 6:00 PM.",
    badge: "Action Required",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  {
    type: "upsell",
    icon: Sparkles,
    title: "Upsell Opportunity",
    description: "Pair Pinot Noir with Table 04's Wagyu order. High acceptance rate (68%).",
    badge: "AI Recommendation",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
];

// --- ANIMATION VARIANTS ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};
const navigate = useNavigate();
const handleLogout = () => {
  localStorage.removeItem("isLoggedIn");
  navigate("/");
};
// --- MAIN DASHBOARD COMPONENT ---

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isDarkMode, setIsDarkMode] = useState(true);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboard,
    staleTime: 1000 * 60 * 3,
    retry: false,
  });

  const summary = data?.summary;
  const trendData = data?.trend ?? chartData;
  const insights = normalizeInsights(data?.insights ?? aiInsights);
  const userName = data?.user?.full_name || "Manager";

  const kpiDisplay = summary
    ? [
        {
          title: "Today's Revenue",
          value: `$${summary.today_revenue.toLocaleString()}`,
          change: "+7.3%",
          isPositive: true,
          icon: TrendingUp,
          subtext: "from yesterday",
        },
        {
          title: "Today's Orders",
          value: `${summary.today_orders}`,
          change: "+9.1%",
          isPositive: true,
          icon: ShoppingBag,
          subtext: "order volume",
        },
        {
          title: "Active Tables",
          value: `${summary.active_tables} / 24`,
          change: "75% capacity",
          isPositive: true,
          icon: UtensilsCrossed,
          subtext: "available now",
        },
        {
          title: "Customer Satisfaction",
          value: `${summary.customer_satisfaction}%`,
          change: "+2.4%",
          isPositive: true,
          icon: Sparkles,
          subtext: "guest sentiment",
        },
      ]
    : kpiData;

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#EDEDED] font-sans antialiased flex selection:bg-[#262626] selection:text-white">
      {/* SIDEBAR */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* NAVBAR */}
        <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

        {/* DASHBOARD BODY */}
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto space-y-8">
          {/* WELCOME HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1A1A1C]"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white flex items-center gap-2">
                Welcome back, {userName} 👋
              </h1>
              <p className="text-sm text-[#888888] mt-1">
                {isLoading
                  ? "Fetching your restaurant insights..."
                  : isError
                  ? "Unable to load live dashboard data. Showing cached metrics."
                  : "Here's what's happening in your restaurant today."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-[#171717] border border-[#262626] text-[#A1A1A1]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Operations
              </span>
            </div>
          </motion.div>

          {/* KPI CARDS */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {kpiDisplay.map((kpi, index) => (
              <KpiCard key={index} data={kpi} />
            ))}
          </motion.div>

          {/* MAIN TWO-COLUMN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN (2 COLS) */}
            <div className="lg:col-span-2 space-y-6">
              <ChartSection />
              <RecentOrdersSection />
            </div>

            {/* RIGHT COLUMN (1 COL) */}
            <div className="space-y-6">
              <AiInsightsSection insights={insights} />
              <KitchenQueueSection />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function Sidebar({ collapsed, setCollapsed, activeTab, setActiveTab }) {
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Tables", icon: UtensilsCrossed },
    { name: "Orders", icon: ShoppingBag },
    { name: "Kitchen", icon: ChefHat },
    { name: "Inventory", icon: Boxes },
    { name: "Customers", icon: Users },
    { name: "Analytics", icon: BarChart3 },
    { name: "Settings", icon: Settings },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 h-screen bg-[#0B0B0C] border-r border-[#1F1F22] flex flex-col justify-between z-30 select-none"
    >
      <div>
        {/* LOGO */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#1F1F22]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-white to-[#888888] flex items-center justify-center text-black font-bold text-lg shadow-sm flex-shrink-0">
              D
            </div>
            {!collapsed && (
              <div className="whitespace-nowrap">
                <span className="font-semibold text-white tracking-tight text-base">
                  DineMate
                </span>
                <span className="ml-1.5 text-[10px] font-medium tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#1F1F22] text-[#A1A1A1] border border-[#262626]">
                  AI
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-[#171717] transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? "bg-[#171717] text-white border border-[#262626]"
                    : "text-[#888888] hover:text-white hover:bg-[#141416]"
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-white" : "text-[#888888] group-hover:text-white"}
                />
                {!collapsed && (
                  <span className="truncate tracking-tight">{item.name}</span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-5 bg-white rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* USER PROFILE & LOGOUT */}
      <div className="p-3 border-t border-[#1F1F22]">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-[#141416] border border-[#1F1F22] ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border border-[#262626] flex-shrink-0"
            />
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-medium text-white truncate">Chef Antoine</p>
                <p className="text-[11px] text-[#888888] truncate">Head Manager</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button className="text-[#888888] hover:text-white p-1 rounded-lg hover:bg-[#1F1F22] transition-colors">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

function Navbar({ isDarkMode, setIsDarkMode }) {
  return (
    <header className="h-16 border-b border-[#1F1F22] px-6 flex items-center justify-between gap-4 bg-[#0B0B0C]/80 backdrop-blur-md sticky top-0 z-20">
      {/* SEARCH BAR */}
      <div className="relative max-w-md w-full">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666666]"
        />
        <input
          type="text"
          placeholder="Search orders, tables, dishes, or staff..."
          className="w-full bg-[#141416] border border-[#222225] rounded-xl pl-10 pr-12 py-2 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#333336] transition-colors"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] text-[#666666] bg-[#1A1A1D] border border-[#262626] rounded">
          ⌘K
        </kbd>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-xl bg-[#141416] border border-[#222225] text-[#888888] hover:text-white hover:bg-[#1A1A1D] transition-colors"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="relative p-2 rounded-xl bg-[#141416] border border-[#222225] text-[#888888] hover:text-white hover:bg-[#1A1A1D] transition-colors">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
        </button>

        <div className="h-4 w-[1px] bg-[#222225] mx-1" />

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141416] border border-[#222225]">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-[#A1A1A1] font-medium">POS Online</span>
        </div>
      </div>
    </header>
  );
}

function KpiCard({ data }) {
  const Icon = data.icon;
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2 }}
      className="p-5 rounded-2xl bg-[#171717] border border-[#262626] space-y-3 relative overflow-hidden group transition-all"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#888888]">{data.title}</span>
        <div className="p-2 rounded-xl bg-[#222225] text-[#A1A1A1] group-hover:text-white transition-colors">
          <Icon size={18} />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">{data.value}</h2>
        <div className="flex items-center gap-2 mt-2">
          <span
            className={`inline-flex items-center text-xs font-medium ${
              data.isPositive ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {data.isPositive ? (
              <ArrowUpRight size={14} className="mr-0.5" />
            ) : (
              <ArrowDownRight size={14} className="mr-0.5" />
            )}
            {data.change}
          </span>
          <span className="text-xs text-[#666666]">{data.subtext}</span>
        </div>
      </div>
    </motion.div>
  );
}

function ChartSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="p-6 rounded-2xl bg-[#171717] border border-[#262626] space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            Orders & Revenue This Week
          </h2>
          <p className="text-xs text-[#888888] mt-0.5">
            Daily breakdown of completed orders vs generated revenue
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#A1A1A1] px-2.5 py-1 rounded-lg bg-[#222225]">
            <span className="w-2 h-2 rounded-full bg-white" />
            Orders
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#222225" vertical={false} />
            <XAxis dataKey="day" stroke="#666666" fontSize={12} tickLine={false} axisLine={{ stroke: "#222225" }} />
            <YAxis stroke="#666666" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0B0B0C",
                borderColor: "#262626",
                borderRadius: "12px",
                color: "#FFFFFF",
                fontSize: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
              }}
              itemStyle={{ color: "#EDEDED" }}
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#FFFFFF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#orderGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

function RecentOrdersSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="p-6 rounded-2xl bg-[#171717] border border-[#262626] space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">Recent Orders</h2>
          <p className="text-xs text-[#888888] mt-0.5">Live incoming orders from floor & digital menus</p>
        </div>
        <button className="text-xs font-medium text-white hover:underline flex items-center gap-1">
          View all orders <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#A1A1A1]">
          <thead className="border-b border-[#262626] text-[#666666] font-medium uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-2">Order ID</th>
              <th className="py-3 px-2">Table</th>
              <th className="py-3 px-2">Customer</th>
              <th className="py-3 px-2">Status</th>
              <th className="py-3 px-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222225]">
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-[#1C1C1F] transition-colors group">
                <td className="py-3.5 px-2 font-mono font-medium text-white">{order.id}</td>
                <td className="py-3.5 px-2 text-white font-medium">{order.table}</td>
                <td className="py-3.5 px-2">
                  <div className="text-white font-medium">{order.customer}</div>
                  <div className="text-[11px] text-[#666666] truncate max-w-[180px]">{order.items}</div>
                </td>
                <td className="py-3.5 px-2">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="py-3.5 px-2 text-right font-medium text-white">{order.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function AiInsightsSection({ insights }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="p-6 rounded-2xl bg-[#171717] border border-[#262626] space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-white" />
          <h2 className="text-base font-semibold text-white tracking-tight">AI Floor Insights</h2>
        </div>
        <span className="text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded bg-[#222225] text-[#A1A1A1] border border-[#2A2A2E]">
          Real-time
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((insight, idx) => {
          const Icon = insight.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#141416] border border-[#222225] space-y-2 hover:border-[#2E2E33] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={15} className="text-white" />
                  <span className="text-xs font-semibold text-white">{insight.title}</span>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${insight.badgeColor}`}>
                  {insight.badge}
                </span>
              </div>
              <p className="text-xs text-[#888888] leading-relaxed">{insight.description}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function KitchenQueueSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="p-6 rounded-2xl bg-[#171717] border border-[#262626] space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat size={18} className="text-white" />
          <h2 className="text-base font-semibold text-white tracking-tight">Kitchen Live Display</h2>
        </div>
        <span className="text-xs text-[#888888]">4 active tickets</span>
      </div>

      <div className="space-y-3">
        {kitchenQueue.map((ticket) => (
          <div
            key={ticket.id}
            className="p-3.5 rounded-xl bg-[#141416] border border-[#222225] space-y-2 hover:border-[#2E2E33] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{ticket.table}</span>
                <span className="text-[11px] font-mono text-[#666666]">{ticket.id}</span>
              </div>
              <OrderStatusBadge status={ticket.status} />
            </div>

            <div className="text-xs text-[#A1A1A1] space-y-0.5">
              {ticket.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#1C1C1F] text-[11px] text-[#666666]">
              <span className="flex items-center gap-1">
                <Clock size={12} /> {ticket.time}
              </span>
              <span>Assigned: {ticket.chef}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function OrderStatusBadge({ status }) {
  switch (status) {
    case "Preparing":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Preparing
        </span>
      );
    case "Ready":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Ready
        </span>
      );
    case "Served":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          Served
        </span>
      );
    case "Completed":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#222225] text-[#A1A1A1] border border-[#2A2A2E]">
          Completed
        </span>
      );
    default:
      return null;
  }
}