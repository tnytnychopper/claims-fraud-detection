import React from 'react';
interface GlassmorphicCardProps {
  children: React.ReactNode;
  className?: string;
}
export function GlassmorphicCard({
  children,
  className = ''
}: GlassmorphicCardProps) {
  return <div className={`relative rounded-2xl backdrop-blur-lg bg-white/5 border border-white/10 shadow-xl ${className}`}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 pointer-events-none" />
      <div className="relative z-10 p-6 h-full">{children}</div>
    </div>;
}