import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { resetPassword } from '../services/authService';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import { ROUTES } from '../constants/routes';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tokenFromState = location.state?.token || '';
  const infoMessage = location.state?.info || null;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      token: tokenFromState,
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (tokenFromState) {
      setValue('token', tokenFromState);
    }
  }, [tokenFromState, setValue]);

  const password = watch('password');

  const mutation = useMutation({
    mutationFn: (payload) => resetPassword(payload),
    onSuccess: () => {
      navigate(ROUTES.LOGIN, { state: { resetComplete: true } });
    },
  });

  const onSubmit = (formData) => {
    mutation.mutate({ token: formData.token, password: formData.password });
  };

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
            <ShieldCheck className="h-4 w-4" />
            Secure password reset
          </div>
          <h2 className="text-4xl font-semibold text-white">Reset your password</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Paste the reset token you received and choose a new password for your restaurant account.
          </p>
          {infoMessage && (
            <div className="mt-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {infoMessage}
            </div>
          )}

          <form className="mt-8 grid gap-5" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Reset token"
              placeholder="Paste your reset token"
              type="text"
              {...register('token', { required: 'Reset token is required' })}
              error={errors.token?.message}
            />
            <PasswordInput
              label="New password"
              placeholder="Enter your new password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password should be at least 8 characters' },
              })}
              error={errors.password?.message}
            />
            <PasswordInput
              label="Confirm new password"
              placeholder="Confirm your new password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
              error={errors.confirmPassword?.message}
            />

            <div className="space-y-3">
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? 'Resetting password…' : 'Reset password'}
              </Button>
              {mutation.isError && (
                <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {mutation.error?.response?.data?.detail || 'Unable to reset your password. Please verify your token and try again.'}
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

export default ResetPasswordPage;
