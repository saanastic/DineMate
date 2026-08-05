import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Bell, Search, Settings } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const MainLayout = ({ children }) => {
  const [search, setSearch] = useState('');
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      <div className="sticky top-0 z-20 border-b border-slate-800/80 bg-[#0B0B0C]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
          <div className="flex items-center gap-4">
            <div className="rounded-3xl bg-slate-950/80 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300 shadow-lg shadow-emerald-500/10">
              DineMate AI
            </div>
            <div className="rounded-3xl bg-slate-950/80 px-4 py-3 text-sm text-slate-300 shadow-lg shadow-black/20">
              Restaurant Manager
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end gap-3">
            <div className="hidden md:flex items-center gap-3 rounded-3xl border border-slate-800/80 bg-slate-950/90 px-4 py-3 shadow-lg shadow-black/10">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders, tables or customers"
                className="w-64 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
              />
            </div>
            <button className="rounded-3xl bg-slate-950/80 p-3 text-slate-300 transition hover:bg-slate-900/90">
              <Bell className="h-5 w-5" />
            </button>
            <button className="rounded-3xl bg-slate-950/80 p-3 text-slate-300 transition hover:bg-slate-900/90">
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={handleLogout}
              className="rounded-3xl bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
            >
              <span className="inline-flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sign out
              </span>
            </button>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-6 py-8 sm:px-10">{children}</main>
    </div>
  );
};

export default MainLayout;
