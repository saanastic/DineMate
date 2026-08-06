import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock3, Flame } from "lucide-react";
import SectionCard from "../components/SectionCard";
import { dashboardService } from "../services/api";

const columns = [
  { id: "prep", title: "In Prep", accent: "amber" },
  { id: "ready", title: "Ready", accent: "emerald" },
  { id: "served", title: "Served", accent: "blue" },
];

export default function KitchenPage() {
  const [queue, setQueue] = useState([]);
  useEffect(() => {
    dashboardService.getKitchenQueue().then(setQueue);
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/10 bg-[#101114]/90 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">Kitchen</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Dispatched kitchen board</h1>
        <p className="mt-2 text-sm text-white/60">An elegant Kanban flow for priority orders, prep timers, and overdue risk.</p>
      </motion.div>

      <div className="grid gap-4 xl:grid-cols-3">
        {columns.map((column) => (
          <SectionCard key={column.id} title={column.title} subtitle="Animated queue state">
            <div className="space-y-3">
              {queue.length ? queue.map((item, index) => (
                <motion.div layout key={item.id || index} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{item.table || "Table"}</p>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">{item.status || "Prep"}</span>
                  </div>
                  <p className="mt-2 text-sm text-white/60">{Array.isArray(item.items) ? item.items.join(" • ") : item.summary || "Priority dishes"}</p>
                  <div className="mt-3 flex items-center justify-between text-sm text-white/45">
                    <span className="flex items-center gap-2"><Clock3 size={14} /> {item.time || "Active"}</span>
                    <span className="flex items-center gap-2"><Flame size={14} className="text-amber-400" /> {item.chef || "Chef"}</span>
                  </div>
                </motion.div>
              )) : <div className="rounded-[20px] border border-dashed border-white/10 p-6 text-center text-sm text-white/55">Queue is quiet right now.</div>}
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
