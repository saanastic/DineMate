import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Sparkles, Star } from "lucide-react";
import SectionCard from "../components/SectionCard";
import { dashboardService } from "../services/api";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  useEffect(() => {
    dashboardService.getCustomers().then(setCustomers);
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/10 bg-[#101114]/90 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">Customers</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Loyalty, satisfaction, and guest relationship intelligence</h1>
        <p className="mt-2 text-sm text-white/60">Segment premium guests and deliver highly personalized service journeys.</p>
      </motion.div>

      <SectionCard title="Guest profiles" subtitle="High-value diners and recurring preferences">
        <div className="grid gap-3 lg:grid-cols-2">
          {customers.length ? customers.slice(0, 6).map((customer, index) => (
            <div key={customer.name || index} className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{customer.name || `Guest ${index + 1}`}</p>
                  <p className="text-sm text-white/50">{customer.segment || "Loyal guest"}</p>
                </div>
                <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                  {customer.score ? `${customer.score}/5` : "5/5"}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-white/60">
                <Star size={14} className="text-amber-400" />
                Preferred experience: {customer.preference || "Chef's table"}
              </div>
            </div>
          )) : <div className="rounded-3xl border border-dashed border-white/10 p-6 text-center text-white/55">Guest intelligence will appear as live data arrives.</div>}
        </div>
      </SectionCard>
    </div>
  );
}
