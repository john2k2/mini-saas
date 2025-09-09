"use client";
import { ReactNode, memo, forwardRef } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'premium' | 'danger' | 'success';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

const variantMap = {
  default: "bg-[color:var(--card)] border-[color:var(--border)]",
  premium: "bg-gradient-to-br from-[color:var(--accent)]/10 to-[color:var(--accent)]/5 border-[color:var(--accent)]/20",
  danger: "bg-red-500/10 border-red-500/20",
  success: "bg-green-500/10 border-green-500/20"
} as const;

const paddingMap = {
  none: "p-0",
  sm: "p-3",
  md: "p-5", 
  lg: "p-6"
} as const;

const shadowMap = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-lg",
  lg: "shadow-xl"
} as const;

const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  className = "",
  variant = 'default',
  padding = 'md',
  hover = true,
  shadow = 'md'
}, ref) => {
  const baseClasses = "border rounded-2xl backdrop-blur-sm transition-all duration-300";
  const variantClasses = variantMap[variant];
  const paddingClasses = paddingMap[padding];
  const shadowClasses = shadowMap[shadow];
  const hoverClasses = hover ? "card-hover cursor-pointer hover:scale-[1.02]" : "";
  
  return (
    <div 
      ref={ref}
      className={`${baseClasses} ${variantClasses} ${paddingClasses} ${shadowClasses} ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default memo(Card);
