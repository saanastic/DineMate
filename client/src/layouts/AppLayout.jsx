import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent text-[#f5f5f5]">
      <div className="flex min-h-screen">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}
        <div className="flex-1">
          <Topbar onMenuToggle={() => setMobileMenuOpen((s) => !s)} />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
