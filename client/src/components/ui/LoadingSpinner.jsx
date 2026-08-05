const LoadingSpinner = ({ className = '' }) => (
  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-400/20 border-t-emerald-400 ${className} animate-spin`} />
);

export default LoadingSpinner;
