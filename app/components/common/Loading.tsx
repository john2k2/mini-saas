"use client";
import { memo } from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'accent' | 'muted';
  className?: string;
  text?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8'
} as const;

const colorMap = {
  primary: 'text-[color:var(--foreground)]',
  accent: 'text-[color:var(--accent)]',
  muted: 'text-[color:var(--muted)]'
} as const;

function Loading({ 
  size = 'md', 
  color = 'accent',
  className = '',
  text
}: LoadingProps) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div 
        className={`${sizeMap[size]} ${colorMap[color]} animate-spin border-2 border-current border-t-transparent rounded-full`}
      />
      {text && (
        <span className={`${colorMap[color]} text-sm font-medium`}>
          {text}
        </span>
      )}
    </div>
  );
}

export default memo(Loading);
