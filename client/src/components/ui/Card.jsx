const Card = ({ children, className = '' }) => {
  return (
    <div className={`rounded-[2rem] border border-slate-700/80 bg-slate-950/95 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
};

export default Card;
