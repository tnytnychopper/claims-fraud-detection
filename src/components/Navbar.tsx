import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldIcon } from 'lucide-react';
export function Navbar() {
  const location = useLocation();
  return <nav className="w-full backdrop-blur-md bg-[#0A0F1A]/80 border-b border-[#00BFFF]/20 fixed top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <ShieldIcon className="w-6 h-6 text-[#33FFDD]" />
          <span className="text-xl font-bold text-white">Digital Guardian</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" active={location.pathname === '/'}>
            Home
          </NavLink>
          <NavLink to="/live-check" active={location.pathname === '/live-check'}>
            Live Check
          </NavLink>
          <NavLink to="/bulk-analysis" active={location.pathname === '/bulk-analysis'}>
            Bulk Analysis
          </NavLink>
        </div>
      </div>
    </nav>;
}
interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}
function NavLink({
  to,
  active,
  children
}: NavLinkProps) {
  return <Link to={to} className={`relative py-1 transition-colors ${active ? 'text-[#33FFDD]' : 'text-gray-300 hover:text-white'}`}>
      {children}
      {active && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#33FFDD]" />}
    </Link>;
}