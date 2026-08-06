import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api";
import { useAppStore } from "../store/useAppStore";
import Button from "../components/Button";

export default function AuthPage() {
  const navigate = useNavigate();
  const { setUser, setToken, isAuthenticated } = useAppStore();
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", remember: true });

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = mode === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };
      const res = mode === "login" ? await authService.login(payload) : await authService.signup(payload);
      setUser(res.user || { name: form.name || "Ava Chen", email: form.email });
      setToken("demo-token");
      localStorage.setItem("isLoggedIn", "true");
      navigate("/dashboard");
    } catch {
      setError("We couldn’t connect to the authentication service just yet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.15),transparent_28%),linear-gradient(135deg,#fbeecb_0%,#fff8e7_100%)] px-4 py-6 text-[#14261d] sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-4xl border border-[#1c4129]/15 bg-[#0e3b20]/95 shadow-[0_25px_60px_rgba(12,26,16,0.24)] lg:flex-row">
        <div className="flex-1 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7e2b6] text-[#0e3b20] shadow-sm">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7abf7d]">DineMate AI</p>
                <h1 className="text-2xl font-semibold text-white">Premium restaurant OS</h1>
              </div>
            </div>
            <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white/70">Secure workspace</div>
          </div>

          <div className="max-w-md">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">{mode === "login" ? "Welcome back" : "Create your restaurant HQ"}</h2>
            <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">Launch premium front-of-house and back-of-house operations with real-time intelligence, elegant workflows, and AI guidance.</p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {mode === "signup" && (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-white/80">Full name</span>
                  <div className="flex items-center rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white">
                    <Mail size={16} className="mr-3 text-white/50" />
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-transparent outline-none placeholder:text-white/35" placeholder="Ava Chen" />
                  </div>
                </label>
              )}
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white/80">Email</span>
                <div className="flex items-center rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white">
                  <Mail size={16} className="mr-3 text-white/50" />
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-transparent outline-none placeholder:text-white/35" placeholder="ops@aurora.com" required />
                </div>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white/80">Password</span>
                <div className="flex items-center rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white">
                  <Lock size={16} className="mr-3 text-white/50" />
                  <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full bg-transparent outline-none placeholder:text-white/35" placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="ml-3 text-white/70">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
              <div className="flex items-center justify-between text-sm text-white/70">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.remember} onChange={() => setForm({ ...form, remember: !form.remember })} className="accent-emerald-500" />
                  Remember me
                </label>
                <button type="button" className="text-emerald-300">Forgot password?</button>
              </div>
              {error ? <p className="rounded-2xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
              <Button className="w-full" disabled={loading}>
                {loading ? "Signing in..." : mode === "login" ? "Continue to dashboard" : "Create account"}
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </form>
            <div className="mt-6 text-sm text-white/70">
              {mode === "login" ? "New to DineMate?" : "Already have an account?"}{" "}
              <button className="font-semibold text-emerald-300" onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Create an account" : "Sign in"}</button>
            </div>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center bg-[#f7e2b6] p-6 sm:p-8 lg:p-10">
          <div className="w-full max-w-sm rounded-[28px] border border-[#1f4626]/15 bg-[#fff8e7] p-6 shadow-xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#125828] text-white">🍽️</div>
              <div>
                <p className="text-sm font-semibold text-[#125828]">AI-powered hospitality</p>
                <p className="text-sm text-[#6c7b51]">From kitchen to guest delight</p>
              </div>
            </div>
            <div className="space-y-3 rounded-3xl border border-[#d9c69f] bg-white/70 p-4">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-[#0e3b20]">Revenue forecast: +14.2% this week</div>
              <div className="rounded-2xl border border-[#f3d69a] bg-[#fff5da] p-3 text-sm text-[#8a5b00]">Peak traffic expected at 8:30 PM</div>
              <div className="rounded-2xl border border-[#dfe9e7] bg-[#f3faf7] p-3 text-sm text-[#2a5a45]">Inventory health remains strong at 91%</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
