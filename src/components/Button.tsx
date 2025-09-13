import React from 'react';
import { Link } from 'react-router-dom';
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'solid' | 'outline';
  to?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}
export function Button({
  children,
  variant = 'solid',
  to,
  onClick,
  className = '',
  disabled = false,
  type = 'button'
}: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center relative overflow-hidden group';
  const variantStyles = {
    solid: 'bg-[#00BFFF] text-white hover:bg-[#00A6E6] shadow-lg shadow-[#00BFFF]/20',
    outline: 'border-2 border-[#00BFFF] text-[#00BFFF] hover:bg-[#00BFFF]/10'
  };
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  const content = <>
      {children}
      <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      <div className="absolute -inset-px rounded-lg opacity-0 group-hover:opacity-100 duration-300">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#00BFFF] to-[#33FFDD] opacity-30 blur-xl" />
      </div>
    </>;
  if (to) {
    return <Link to={to} className={combinedStyles}>
        {content}
      </Link>;
  }
  return <button type={type} onClick={onClick} disabled={disabled} className={combinedStyles}>
      {content}
    </button>;
}