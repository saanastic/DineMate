import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Boxes, AlertTriangle, TrendingUp } from "lucide-react";
import SectionCard from "../components/SectionCard";
import { dashboardService } from "../services/api";

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  useEffect(() => {
    dashboardService.getInventory().then(setInventory);
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/10 bg-[#101114]/90 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">Inventory</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Stock health and purchasing intelligence</h1>
        <p className="mt-2 text-sm text-white/60">Watch critical items, reorder timing, and cost efficiency from a premium supply view.</p>
      </motion.div>
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Inventory overview" subtitle="Critical products and service levels">
          <div className="space-y-3">
            {inventory.length ? inventory.slice(0, 5).map((item, index) => (
              <div key={item.name || index} className="flex items-center justify-between rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="font-medium text-white">{item.name || "Premium ingredient"}</p>
                  <p className="text-sm text-white/50">{item.vendor || "Preferred partner"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-emerald-300">{item.stock || "High"}</p>
                  <p className="text-sm text-white/45">{item.status || "Healthy"}</p>
                </div>
              </div>
            )) : <div className="rounded-[20px] border border-dashed border-white/10 p-6 text-center text-white/55">Inventory data will appear here.</div>}
          </div>
        </SectionCard>
        <SectionCard title="Alerts" subtitle="Restock recommendations and shrink risk">
          <div className="space-y-3">
            {[
              { title: 'Low stock', body: 'Wagyu patties are below the safety threshold.', icon: AlertTriangle },
              { title: 'Demand spike', body: 'Truffle oil demand is up 18% from last week.', icon: TrendingUp },
            ].map((item) => (
              <div key={item.title} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-white"><item.icon size={15} className="text-amber-400" /> {item.title}</div>
                <p className="mt-2 text-sm text-white/60">{item.body}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
