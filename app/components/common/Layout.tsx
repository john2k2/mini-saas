"use client";
import { ReactNode, memo } from 'react';

interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 6 | 12;
    md?: 1 | 2 | 3 | 4 | 6 | 12;
    lg?: 1 | 2 | 3 | 4 | 6 | 12;
  };
}

const colsMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-2', 
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  12: 'grid-cols-12'
} as const;

const gapMap = {
  xs: 'gap-2',
  sm: 'gap-4',
  md: 'gap-6', 
  lg: 'gap-8',
  xl: 'gap-12'
} as const;

function Grid({ 
  children, 
  cols = 1, 
  gap = 'md',
  className = '',
  responsive 
}: GridProps) {
  const baseClasses = `grid ${colsMap[cols]} ${gapMap[gap]}`;
  
  const responsiveClasses = responsive ? [
    responsive.sm && `sm:grid-cols-${responsive.sm}`,
    responsive.md && `md:grid-cols-${responsive.md}`,
    responsive.lg && `lg:grid-cols-${responsive.lg}`,
  ].filter(Boolean).join(' ') : '';

  return (
    <div className={`${baseClasses} ${responsiveClasses} ${className}`}>
      {children}
    </div>
  );
}

// Componente Stack para layouts verticales
interface StackProps {
  children: ReactNode;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
}

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch'
} as const;

function Stack({ 
  children, 
  gap = 'md', 
  align = 'stretch',
  className = '' 
}: StackProps) {
  return (
    <div className={`flex flex-col ${gapMap[gap]} ${alignMap[align]} ${className}`}>
      {children}
    </div>
  );
}

// Componente Flex para layouts horizontales
interface FlexProps {
  children: ReactNode;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  className?: string;
}

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center', 
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly'
} as const;

function Flex({ 
  children, 
  gap = 'md',
  align = 'center',
  justify = 'start',
  wrap = false,
  className = '' 
}: FlexProps) {
  const wrapClass = wrap ? 'flex-wrap' : 'flex-nowrap';
  
  return (
    <div className={`flex ${gapMap[gap]} ${alignMap[align]} ${justifyMap[justify]} ${wrapClass} ${className}`}>
      {children}
    </div>
  );
}

export const Layout = {
  Grid: memo(Grid),
  Stack: memo(Stack), 
  Flex: memo(Flex)
};
