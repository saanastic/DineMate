import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { login } from '../services/authService';
import useAuthStore from '../store/useAuthStore';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { ROUTES } from '../constants/routes';
import { formatApiError } from '../utils/formatApiError';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const infoMessage = location.state?.resetComplete
    ? 'Password reset complete. Sign in with your new credentials.'
    : location.state?.signedUp
    ? 'Account created successfully. Please sign in to continue.'
    : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      remember: true,
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => login(data),
    onSuccess: (data) => {
      setCredentials(data.access_token, data.refresh_token);
      navigate(ROUTES.DASHBOARD);
    },
  });

  const onSubmit = (formData) =>
    mutation.mutate({ email: formData.email, password: formData.password });

  return (
    <AuthLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 xl:flex-row xl:items-stretch">
        <motion.section
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="relative flex-1 overflow-hidden rounded-[2.5rem] border border-slate-700/70 bg-emerald-950/90 p-10 shadow-[0_40px_140px_rgba(4,120,87,0.16)] backdrop-blur-xl"
        >
          <div className="absolute -right-24 top-8 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute left-0 top-0 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200 shadow-lg shadow-black/20">
                Premium restaurant AI
              </span>
              <h1 className="mt-8 max-w-xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                Welcome to DineMate AI
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Manage orders, reservations, inventory and restaurant performance from one elegant dashboard built for modern hospitality teams.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[2rem] border border-slate-700/80 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.2)]">
                <div className="inline-flex items-center gap-3 rounded-3xl bg-emerald-500/10 px-3 py-2 text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  Secure password store
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Your restaurant data is protected with modern authentication and refresh token flow.
                </p>
              </div>
              <div className="rounded-[2rem] border border-slate-700/80 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.2)]">
                <div className="inline-flex items-center gap-3 rounded-3xl bg-white/5 px-3 py-2 text-slate-200">
                  <ArrowRight className="h-4 w-4 text-emerald-300" />
                  Fast onboarding
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Sign in and access smart restaurant analytics, live orders, and AI insights in seconds.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
          className="w-full max-w-xl rounded-[2.5rem] border border-slate-700/70 bg-[#171717]/95 p-10 shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        >
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Access your restaurant hub</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Sign in to DineMate</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Use your restaurant email and secure password to continue to your premium dashboard.
            </p>
            {infoMessage && (
              <div className="mt-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {infoMessage}
              </div>
            )}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email address"
              placeholder="you@restaurant.com"
              type="email"
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Provide a valid email address',
                },
              })}
              error={errors.email?.message}
            />
            <div className="relative">
              <Input
                label="Password"
                placeholder="Enter your password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Use at least 8 characters' },
                })}
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-[58px] inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/90 text-slate-400 transition hover:bg-white/10"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex items-center gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-400"
                  {...register('remember')}
                />
                Remember me
              </label>
              <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
                Forgot password?
              </Link>
            </div>

            <div className="space-y-3">
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? 'Signing in…' : 'Sign in'}
              </Button>
              {mutation.isError && (
                <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {formatApiError(mutation.error, 'Unable to sign in. Check your credentials and try again.')}
                </div>
              )}
            </div>
          </form>

          <div className="mt-8 border-t border-slate-800/70 pt-6 text-center text-sm text-slate-500">
            Don’t have an account yet?{' '}
            <Link to={ROUTES.SIGNUP} className="font-semibold text-emerald-300 hover:text-emerald-200">
              Create one now
            </Link>
          </div>
        </motion.section>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
                </div>
