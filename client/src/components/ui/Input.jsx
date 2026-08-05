import { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <label className="block text-sm text-slate-200">
      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">{label}</span>
      <input
        ref={ref}
        className={clsx(
          'w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20',
          error && 'border-rose-500 text-rose-100 focus:ring-rose-400/20',
          className
        )}
        {...props}
      />
      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
    </label>
  );
});

export default Input;
