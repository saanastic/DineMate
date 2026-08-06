import { motion } from "framer-motion";
import { Bell, Search, Moon, Sun, Sparkles, ChevronDown, Menu } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export default function Topbar({ onMenuToggle }) {
  const { theme, setTheme, activeRestaurant, setActiveRestaurant } = useAppStore();

  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-20 border-b border-white/10 bg-[#0f1012]/80 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white/70 lg:hidden"
          >
            <Menu size={18} />
          </button>
          <div className="hidden md:flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <Search size={16} className="text-white/50" />
            <input
              placeholder="Search orders, guests, inventory..."
              className="w-56 bg-transparent text-sm outline-none placeholder:text-white/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
            <Sparkles size={16} className="text-emerald-400" />
            <span className="hidden sm:inline">{activeRestaurant}</span>
            <ChevronDown size={14} className="text-white/50" />
          </button>

          <button className="relative rounded-2xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10">
            <Bell size={16} />
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
