import { motion } from "framer-motion";
import { Users, QrCode, MoveRight, Split } from "lucide-react";
import SectionCard from "../components/SectionCard";

const seats = [
  { id: 1, title: "Window 1", seats: 2, occupied: true, status: "Dining" },
  { id: 2, title: "Bar 2", seats: 4, occupied: false, status: "Ready" },
  { id: 3, title: "Private 1", seats: 6, occupied: true, status: "Reserved" },
  { id: 4, title: "Patio 1", seats: 2, occupied: false, status: "Open" },
];

export default function TablesPage() {
  // tables are mocked for UI while backend is optional

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/10 bg-[#101114]/90 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">Tables</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Floor plan orchestration</h1>
        <p className="mt-2 text-sm text-white/60">Visualize occupancy, reservation status, QR menus, and service flow from a beautiful planboard.</p>
      </motion.div>

      <SectionCard title="Interactive floor plan" subtitle="Premium table overview with occupancy and service cues">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[#121317] p-4">
            <div className="grid gap-3 md:grid-cols-2">
              {seats.map((seat) => (
                <motion.div whileHover={{ y: -2 }} key={seat.id} className={`rounded-[22px] border p-4 ${seat.occupied ? "border-emerald-500/25 bg-emerald-500/10" : "border-white/10 bg-white/5"}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{seat.title}</p>
                    <div className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/60">{seat.seats} seats</div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-white/60">
                    <Users size={14} /> {seat.status}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">Merge</button>
                    <button className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">Split</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-emerald-300"><QrCode size={16} /> QR menus enabled</div>
              <p className="mt-2 text-sm text-white/60">Guests can scan and order from the floor without waiting for a waiter.</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-white"><MoveRight size={16} /> Service flow</div>
              <p className="mt-2 text-sm text-white/60">Tables 1 and 3 are on the premium pacing path with a live kitchen handoff.</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-white"><Split size={16} /> Seating actions</div>
              <p className="mt-2 text-sm text-white/60">Merge and split controls are surfaced with one-tap access for staff flexibility.</p>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
