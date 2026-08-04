import React, { useState } from 'react';

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      console.log('Logging into DineMate:', formData);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div
      className="relative w-full overflow-hidden flex flex-col justify-between font-sans select-none min-h-screen"
      style={{ backgroundColor: "#fceec9" }}
    >
      {/* Top Navigation */}
      <header className="p-4 sm:p-6 z-20 flex items-center justify-between">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
          style={{ backgroundColor: "#fff8e7" }}
          aria-label="Go back"
        >
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* App Name */}
        <div className="flex items-center gap-1.5 pr-1">
          <span className="text-2xl">🍜</span>
          <h2
            className="text-2xl sm:text-3xl font-extrabold tracking-wide"
            style={{ color: "#125828" }}
          >
            Dine<span style={{ color: "#e74c20" }}>Mate</span>
          </h2>
        </div>

        <div className="w-11 sm:w-12" />
      </header>

      {/* Decorative Sparkles (Top Right) */}
      <div className="absolute top-2 right-4 sm:right-12 pointer-events-none opacity-90 z-0">
        <svg width="220" height="220" viewBox="0 0 200 200" fill="none">
          <path d="M120 10 C120 50, 140 70, 180 70 C140 70, 120 90, 120 130 C120 90, 100 70, 60 70 C100 70, 120 50, 120 10 Z" fill="#ffbd38" />
          <path d="M60 70 C60 90, 70 100, 90 100 C70 100, 60 110, 60 130 C60 110, 50 100, 30 100 C50 100, 60 90, 60 70 Z" fill="#ffbd38" />
          <path d="M150 110 C150 130, 160 140, 180 140 C160 140, 150 150, 150 170 C150 150, 140 140, 120 140 C140 140, 150 130, 150 110 Z" fill="#ffca58" />
        </svg>
      </div>

      {/* Decorative Cupcake (Top Left, below header) */}
      <div className="absolute top-24 left-4 sm:left-10 pointer-events-none opacity-95 z-0 -rotate-6">
        <svg width="54" height="60" viewBox="0 0 54 60">
          <path d="M10 30 L44 30 L40 55 Q27 60 14 55 Z" fill="#f2c9dd" stroke="#8a3d5f" strokeWidth="2" />
          <path d="M8 30 Q27 12 46 30 Z" fill="#fff8e7" stroke="#8a3d5f" strokeWidth="2" />
          <circle cx="27" cy="8" r="4" fill="#e74c20" />
          <line x1="27" y1="12" x2="27" y2="18" stroke="#8a3d5f" strokeWidth="2" />
        </svg>
      </div>

      {/* Decorative Dumpling (Right, middle) */}
      <div className="absolute top-1/2 right-3 sm:right-8 -translate-y-1/2 pointer-events-none opacity-90 z-0 rotate-6">
        <svg width="64" height="50" viewBox="0 0 64 50">
          <path d="M6 30 Q4 10 32 8 Q60 10 58 30 Q32 42 6 30 Z" fill="#f4e3c1" stroke="#7a5a2e" strokeWidth="2.5" />
          <path d="M10 28 Q32 20 54 28" stroke="#7a5a2e" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Login Card */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-6">
        <div
          className="w-full max-w-sm rounded-[32px] p-8 shadow-2xl border border-black/10"
          style={{ backgroundColor: "#125828" }}
        >
          <h1 className="text-white text-3xl font-extrabold text-center mb-1 tracking-wide">
            Welcome Back
          </h1>
          <p className="text-white/70 text-center text-sm mb-7">
            Log in and lets find something tasty 🍲
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="relative flex items-center">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                style={{ backgroundColor: "#488e53" }}
                className="w-full text-white placeholder-white/80 rounded-full py-3.5 pl-6 pr-12 outline-none text-base font-medium transition-all focus:ring-2 focus:ring-white/60"
                required
              />
              <svg className="absolute right-5 w-5 h-5 text-white/90 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>

            {/* Password Field */}
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                style={{ backgroundColor: "#488e53" }}
                className="w-full text-white placeholder-white/80 rounded-full py-3.5 pl-6 pr-12 outline-none text-base font-medium transition-all focus:ring-2 focus:ring-white/60"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 text-white/90 hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="pt-1 pl-2">
              <a
                href="#forgot-password"
                className="text-white/90 text-xs font-semibold hover:underline hover:text-white transition-colors"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white font-bold py-3.5 rounded-full shadow-md hover:bg-emerald-50 active:scale-[0.98] transition-all disabled:opacity-80 text-base flex items-center justify-center cursor-pointer"
                style={{ color: "#125828" }}
              >
                {isLoading ? (
                  <span className="w-6 h-6 border-2 border-[#125828] border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Bottom Food Graphic Footer */}
      <footer className="relative w-full h-44 overflow-hidden pointer-events-none">
        <div className="absolute bottom-10 left-3 sm:left-10 z-10 flex items-end gap-2 scale-90 sm:scale-100 origin-bottom-left">
          <svg width="60" height="70" viewBox="0 0 60 70">
            <path d="M10 30 Q30 5, 50 30 Q30 65, 10 30 Z" fill="#d98943" stroke="#5c3111" strokeWidth="3" />
            <circle cx="40" cy="25" r="3" fill="#5c3111" />
            <path d="M20 30 Q25 35, 20 40" stroke="#5c3111" strokeWidth="2" fill="none" />
          </svg>
          <div className="w-16 h-24 bg-[#fff1a1] rounded-t-3xl border-2 border-[#5c3111] flex flex-col items-center justify-center shadow-md">
            <div className="w-8 h-2 bg-[#8fc367] rounded-full mb-2" />
            <span className="text-[10px] font-black text-[#23582e] leading-tight">바나나</span>
            <span className="text-[10px] font-black text-[#23582e]">우유</span>
          </div>
          <svg width="46" height="56" viewBox="0 0 46 56" className="hidden sm:block">
            <path d="M23 4 L44 40 Q44 52 23 52 Q2 52 2 40 Z" fill="#fdfaf3" stroke="#3b3b3b" strokeWidth="2.5" />
            <rect x="6" y="34" width="34" height="10" fill="#1a1a1a" />
          </svg>
        </div>

        <div className="absolute bottom-10 right-3 sm:right-10 z-10 flex items-end gap-2 scale-90 sm:scale-100 origin-bottom-right">
          <svg width="40" height="66" viewBox="0 0 40 66" className="hidden sm:block">
            <path d="M6 14 L34 14 L30 60 Q20 65 10 60 Z" fill="#f6d9b8" stroke="#7a5a2e" strokeWidth="2.5" />
            <rect x="3" y="6" width="34" height="10" rx="3" fill="#e9a6c1" stroke="#7a5a2e" strokeWidth="2" />
            <circle cx="14" cy="48" r="2.5" fill="#4a2c15" />
            <circle cx="22" cy="52" r="2.5" fill="#4a2c15" />
            <circle cx="18" cy="42" r="2.5" fill="#4a2c15" />
          </svg>
          <div className="w-28 h-18 bg-[#d8dede] rounded-b-full border-2 border-[#374151] relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-0 w-full h-5 bg-[#5e8b49] flex items-center justify-around px-2">
              <span className="w-2 h-2 bg-yellow-300 rounded-full" />
              <span className="w-2 h-2 bg-red-400 rounded-full" />
              <span className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
          <div className="w-14 h-20 bg-[#e74c20] rounded-t-xl border-2 border-[#611603] flex flex-col items-center justify-center text-white shadow-md">
            <span className="text-[11px] font-black leading-tight">매운</span>
            <span className="text-[11px] font-black">국수</span>
          </div>
        </div>

        <div
          className="absolute -bottom-16 -left-10 -right-10 h-36 rounded-t-[100%] z-20"
          style={{ backgroundColor: "#0c4920" }}
        />
      </footer>
    </div>
  );
};

export default LoginPage;