import { motion } from "framer-motion";
import { Bell, ShieldCheck, Sparkles, Palette, Globe2 } from "lucide-react";
import SectionCard from "../components/SectionCard";
import Button from "../components/Button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/10 bg-[#101114]/90 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Control the platform experience</h1>
        <p className="mt-2 text-sm text-white/60">Tune notifications, security, branding, and multi-location preferences in a beautifully structured workspace.</p>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Notifications" subtitle="Keep staff and managers aligned">
          <div className="space-y-3">
            {['Peak traffic alert', 'Inventory reorders', 'Reservation changes'].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                <span>{item}</span>
                <button className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">Enabled</button>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Workspace" subtitle="Theme, language, and security preferences">
          <div className="space-y-3">
            <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-white"><Palette size={16} /> Brand accents</div>
              <p className="mt-2 text-sm text-white/60">Emerald highlights and premium dark surfaces are applied system-wide.</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-white"><ShieldCheck size={16} /> Security</div>
              <p className="mt-2 text-sm text-white/60">Two-factor authentication and role-based access controls keep operations secure.</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-white"><Globe2 size={16} /> Locale</div>
              <p className="mt-2 text-sm text-white/60">English, French, and Japanese support are available across the interface.</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
