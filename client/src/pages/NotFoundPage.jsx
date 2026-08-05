import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import AuthLayout from '../layouts/AuthLayout';
import { ROUTES } from '../constants/routes';

const NotFoundPage = () => {
  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-6 rounded-[2rem] border border-slate-700/70 bg-[#171717]/95 px-10 py-16 text-center shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      >
        <div className="text-7xl font-black text-emerald-300">404</div>
        <div>
          <h1 className="text-4xl font-semibold text-white">Page not found</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            The page you are looking for does not exist. Return to the secure restaurant dashboard and continue managing your operations.
          </p>
        </div>
        <Link to={ROUTES.DASHBOARD}>
          <Button variant="secondary">Return home</Button>
        </Link>
      </motion.div>
    </AuthLayout>
  );
};

export default NotFoundPage;
