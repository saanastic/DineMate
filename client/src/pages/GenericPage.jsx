import { motion } from "framer-motion";
import SectionCard from "../components/SectionCard";

export default function GenericPage({ title, subtitle, accent = "emerald", items = [], actionLabel = "Review" }) {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/10 bg-[#101114]/90 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">{accent}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm text-white/60">{subtitle}</p>
      </motion.div>

      <SectionCard title="Executive overview" subtitle="Premium operations surface">
        <div className="grid gap-3 lg:grid-cols-2">
          {items.map((item, index) => (
            <div key={item.title || index} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">{item.title}</p>
                <button className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">{actionLabel}</button>
              </div>
              <p className="mt-2 text-sm text-white/60">{item.body}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
