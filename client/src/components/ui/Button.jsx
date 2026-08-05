import clsx from 'clsx';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-3xl px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60';

  const variants = {
    primary: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400',
    secondary: 'bg-white/5 text-slate-100 border border-slate-700 hover:bg-white/10',
    ghost: 'bg-transparent text-slate-200 hover:bg-white/5',
  };

  return (
    <button className={clsx(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};

export default Button;
