interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }[size];

  return (
    <div className={`inline-block ${sizeClasses} ${className}`}>
      <div className="relative">
        {/* Spinner principal */}
        <div 
          className={`${sizeClasses} border-2 border-white/20 border-t-[color:var(--accent)] rounded-full animate-spin`}
          aria-label="Cargando..."
        />
        {/* Efecto glow sutil */}
        <div 
          className={`absolute inset-0 ${sizeClasses} border-2 border-transparent border-t-[color:var(--accent)] rounded-full animate-spin opacity-50 blur-sm`}
        />
      </div>
    </div>
  );
}
