import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { navigation } from "../constants/navigation";

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 88 : 260 }}
      transition={{ type: "spring", stiffness: 180, damping: 24 }}
      className="hidden lg:flex flex-col h-screen sticky top-0 border-r border-white/10 bg-[#0f1012]/95 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
            <Sparkles size={18} />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-white/70 uppercase">DineMate</p>
              <p className="text-xs text-emerald-400">AI Operations</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed((s) => !s)}
          className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.href;
          return (
            <Link
              key={item.id}
              to={item.href}
              className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${
                active
                  ? "bg-emerald-500/15 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
