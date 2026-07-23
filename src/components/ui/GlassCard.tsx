import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function GlassCard({ children, className = '', style = {}, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-3xl ${className} ${onClick ? 'transition-transform hover:scale-[1.01]' : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}
