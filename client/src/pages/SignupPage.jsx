import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Smile } from 'lucide-react';
import { signup } from '../services/authService';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import { ROUTES } from '../constants/routes';
import { formatApiError } from '../utils/formatApiError';

const SignupPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      fullName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const mutation = useMutation({
    mutationFn: (payload) => signup(payload),
    onSuccess: () => {
      navigate(ROUTES.LOGIN, { state: { signedUp: true } });
    },
  });

  const onSubmit = (formData) => {
    mutation.mutate({ email: formData.email, password: formData.password, full_name: formData.fullName });
  };

  return (
    <AuthLayout>
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 xl:flex-row xl:items-stretch">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full rounded-[2.5rem] border border-slate-700/70 bg-[#171717]/95 p-10 shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        >
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200">
              <Smile className="h-4 w-4" />
              New restaurant partner
            </div>
            <h2 className="mt-5 text-4xl font-semibold text-white">Create your DineMate account</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Join the most polished restaurant operations platform with secure access, instant onboarding, and premium productivity tools.
            </p>
          </div>

          <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Restaurant email"
              placeholder="hello@dinemate.com"
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
            <Input
              label="Full name"
              placeholder="Alex Morgan"
              type="text"
              autoComplete="name"
              {...register('fullName', {
                required: 'Full name is required',
              })}
              error={errors.fullName?.message}
            />
            <div className="relative">
              <PasswordInput
                label="Create password"
                placeholder="Choose a secure password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password should be at least 8 characters' },
                })}
                error={errors.password?.message}
              />
            </div>
            <div className="relative">
              <PasswordInput
                label="Confirm password"
                placeholder="Repeat your password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                error={errors.confirmPassword?.message}
              />
            </div>

            <div className="space-y-3">
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? 'Creating account…' : 'Create account'}
              </Button>
              {mutation.isError && (
                <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {formatApiError(mutation.error, 'Something went wrong when creating your account.')}
                </div>
              )}
              {mutation.isSuccess && (
                <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  Account created successfully. Redirecting to login…
                </div>
              )}
            </div>
          </form>

          <div className="mt-8 border-t border-slate-800/70 pt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="font-semibold text-emerald-300 hover:text-emerald-200">
              Sign in instead
            </Link>
          </div>
        </motion.section>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
