"use client";
import Link from "next/link";
import { memo, forwardRef } from "react";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

type Size = "sm" | "md" | "lg";
type Variant = "primary" | "outline" | "ghost" | "danger" | "success";

type ButtonProps = (
  | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
  | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
) & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
};

const sizeMap: Record<Size, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2 text-sm", 
  lg: "px-6 py-3 text-base"
};

const variantMap: Record<Variant, { base: string; hover: string }> = {
  primary: {
    base: "bg-[color:var(--accent)] text-black font-medium",
    hover: "hover:opacity-90"
  },
  outline: {
    base: "border border-[color:var(--border)] text-[color:var(--foreground)] bg-transparent",
    hover: "hover:bg-[color:var(--accent)]/10"
  },
  ghost: {
    base: "text-[color:var(--muted)] bg-transparent",
    hover: "hover:text-[color:var(--foreground)] hover:bg-[color:var(--accent)]/5"
  },
  danger: {
    base: "bg-red-600 text-white font-medium",
    hover: "hover:bg-red-700"
  },
  success: {
    base: "bg-green-600 text-white font-medium", 
    hover: "hover:bg-green-700"
  }
};

function getButtonClasses(variant: Variant, size: Size, fullWidth: boolean, loading: boolean): string {
  const { base, hover } = variantMap[variant];
  const sizeClass = sizeMap[size];
  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = loading ? "opacity-50 cursor-not-allowed" : "";
  
  return [
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:ring-offset-2",
    "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
    sizeClass,
    base,
    !loading && hover,
    widthClass,
    disabledClass
  ].filter(Boolean).join(" ");
}

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ 
    variant = "primary", 
    size = "md",
    children, 
    loading = false,
    fullWidth = false,
    ...props 
  }, ref) => {
    const className = getButtonClasses(variant, size, fullWidth, loading);
    
    if ("href" in props && props.href) {
      const { href, ...rest } = props as { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;
      return (
        <Link 
          href={href} 
          {...rest} 
          className={className}
          ref={ref as React.Ref<HTMLAnchorElement>}
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          )}
          {children}
        </Link>
      );
    }
    
    const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button 
        {...buttonProps} 
        className={className}
        disabled={loading || buttonProps.disabled}
        ref={ref as React.Ref<HTMLButtonElement>}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default memo(Button);
