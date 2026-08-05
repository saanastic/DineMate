import { motion } from 'framer-motion';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_35%),linear-gradient(180deg,_#0b0b0c,_#121212)] text-white">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-8 sm:px-10"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default AuthLayout;
