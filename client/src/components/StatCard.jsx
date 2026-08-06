import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({ title, value, subtitle, delta, positive, icon: Icon }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass-panel rounded-3xl p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/55">{title}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-2 text-emerald-300">
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm">
        {positive ? (
          <ArrowUpRight size={14} className="text-emerald-400" />
        ) : (
          <ArrowDownRight size={14} className="text-amber-400" />
        )}
        <span className={positive ? "text-emerald-400" : "text-amber-400"}>{delta}</span>
        <span className="text-white/45">{subtitle}</span>
      </div>
    </motion.div>
  );
}
