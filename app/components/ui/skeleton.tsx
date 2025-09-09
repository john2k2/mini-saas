interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

export default function Skeleton({ 
  className = "", 
  width = "100%", 
  height = "1rem",
  rounded = "md" 
}: SkeletonProps) {
  const roundedClass = {
    sm: "rounded-sm",
    md: "rounded-md", 
    lg: "rounded-lg",
    full: "rounded-full"
  }[rounded];

  return (
    <div 
      className={`skeleton ${roundedClass} ${className}`}
      style={{ width, height }}
      aria-label="Cargando..."
    />
  );
}
