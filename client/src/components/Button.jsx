import { motion } from "framer-motion";

export default function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition";
  const variants = {
    primary: "bg-emerald-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.22)] hover:bg-emerald-400",
    secondary: "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
    ghost: "bg-transparent text-white/70 hover:bg-white/5 hover:text-white",
  };

  return (
    <motion.button whileTap={{ scale: 0.98 }} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </motion.button>
  );
}
