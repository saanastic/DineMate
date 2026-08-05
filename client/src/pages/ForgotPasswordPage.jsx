import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { forgotPassword } from '../services/authService';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { ROUTES } from '../constants/routes';

const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (payload) => forgotPassword(payload),
  });

  const onSubmit = (formData) => mutation.mutate(formData);

  return (
    <AuthLayout>
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full rounded-[2.5rem] border border-slate-700/70 bg-[#171717]/95 p-10 shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        >
          <div className="mb-8 flex items-center gap-3 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-200">
            <Mail className="h-4 w-4" />
            Reset your password instantly
          </div>
          <h2 className="text-4xl font-semibold text-white">Forgot your password?</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Enter your email address and we will send you a secure reset token to regain access.
          </p>

          <form className="mt-8 grid gap-5" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email address"
              placeholder="admin@restaurant.com"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Provide a valid email address',
                },
              })}
              error={errors.email?.message}
            />

            <div className="space-y-3">
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? 'Sending reset token…' : 'Send reset token'}
              </Button>
              {mutation.isError && (
                <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {mutation.error?.response?.data?.detail || 'Unable to send reset token. Please try again later.'}
                </div>
              )}
              {mutation.isSuccess && mutation.data?.reset_token && (
                <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  Your reset token is ready. Use it on the reset page or copy it here:
                  <div className="mt-3 overflow-x-auto rounded-3xl border border-emerald-500/20 bg-slate-950/80 px-4 py-3 text-xs text-slate-100">
                    {mutation.data.reset_token}
                  </div>
                </div>
              )}
            </div>
          </form>

          <div className="mt-8 border-t border-slate-800/70 pt-6 text-sm text-slate-500">
            Remembered your password?{' '}
            <Link to={ROUTES.LOGIN} className="font-semibold text-emerald-300 hover:text-emerald-200">
              Sign in
            </Link>
          </div>
        </motion.section>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
