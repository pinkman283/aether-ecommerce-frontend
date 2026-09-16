export default function Loading() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[45vh] py-16 px-4">
      <div className="relative flex items-center justify-center">
        {/* Subtle Outer Glow */}
        <div 
          className="w-12 h-12 rounded-full absolute animate-ping opacity-20"
          style={{ backgroundColor: "var(--theme-primary, #005826)" }}
        />
        {/* Clean Modern Spinner */}
        <div 
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ 
            borderColor: "var(--theme-card-border, rgba(0, 88, 38, 0.2))",
            borderTopColor: "var(--theme-primary, #005826)",
          }}
        />
      </div>
      <span 
        className="mt-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 animate-pulse"
      >
        Loading...
      </span>
    </div>
  );
}
