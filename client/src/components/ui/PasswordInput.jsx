import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input from './Input';

const PasswordInput = forwardRef(({ label, error, ...props }, ref) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        ref={ref}
        label={label}
        error={error}
        type={visible ? 'text' : 'password'}
        autoComplete="new-password"
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="absolute right-4 top-[58px] inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/90 text-slate-400 transition hover:bg-white/10"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});

export default PasswordInput;
