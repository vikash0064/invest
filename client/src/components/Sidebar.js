'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart4, 
  History, 
  FileText, 
  Eye, 
  Briefcase, 
  Settings, 
  User, 
  ArrowUpRight,
  LogOut,
  LogIn,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem('alphainvest_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    };
    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Research', href: '/dashboard', icon: BarChart4 },
    { name: 'History', href: '/history', icon: History },
    { name: 'Saved Reports', href: '/history?filter=saved', icon: FileText },
    { name: 'Watchlist', href: '/history?filter=favorites', icon: Eye },
    { name: 'Portfolio', href: '/about', icon: Briefcase },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-xs lg:hidden no-print transition-opacity duration-300"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside className={`no-print fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/5 bg-[#090d16] text-[#93a3b8] transition-all duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Sidebar Brand Header */}
        <div className="flex h-20 items-center gap-3 px-6 border-b border-white/[0.03]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-slate-900 border border-white/10 shadow-md">
            <img src="/aequitas_logo.png" alt="Aequitas AI Logo" className="h-full w-full object-cover scale-105" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-white tracking-tight leading-tight">
              Aequitas AI
            </span>
            <span className="text-[10px] font-semibold text-cyan-400/80 tracking-wider uppercase">
              Equity Intelligence
            </span>
          </div>
          
          {/* Mobile Close X Button */}
          <button 
            onClick={onClose} 
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white ml-auto transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Main Navigation Links */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-white/[0.04] text-white border border-white/5 shadow-inner'
                    : 'text-slate-400 hover:bg-white/[0.02] hover:text-white'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md bg-indigo-500" />
                )}
                <Icon
                  className={`h-4.5 w-4.5 transition-transform duration-150 group-hover:scale-105 ${
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Navigation */}
        <div className="px-4 space-y-1 py-4 border-t border-white/[0.03]">
          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-3.5 rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-white/[0.02] hover:text-white transition-all duration-150"
          >
            <Settings className="h-4 w-4 text-slate-400" />
            <span>Settings</span>
          </Link>
          <Link
            href="/profile"
            onClick={onClose}
            className="flex items-center gap-3.5 rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-white/[0.02] hover:text-white transition-all duration-150"
          >
            {user && user.avatar ? (
              <img src={user.avatar} className="h-4 w-4 rounded-full object-cover border border-white/10" alt="Profile" />
            ) : (
              <User className="h-4 w-4 text-slate-400" />
            )}
            <span>{user ? user.name : 'Profile'}</span>
          </Link>

          {user ? (
            <button
              onClick={() => {
                localStorage.removeItem('alphainvest_user');
                setUser(null);
                onClose();
                window.location.href = '/login';
              }}
              className="w-full flex items-center gap-3.5 rounded-xl px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/5 transition-all duration-150 text-left cursor-pointer"
            >
              <LogOut className="h-4 w-4 text-rose-400" />
              <span>Log Out</span>
            </button>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="w-full flex items-center gap-3.5 rounded-xl px-4 py-2 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/5 transition-all duration-150"
            >
              <LogIn className="h-4 w-4 text-indigo-400" />
              <span>Log In</span>
            </Link>
          )}

          {/* PRO PLAN Upgrade Card */}
          <div className="mt-4 rounded-2xl border border-white/[0.04] bg-[#0c1221] p-4 text-center shadow-lg">
            <div className="flex flex-col gap-0.5 mb-3 text-left">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Pro Plan Active
              </span>
              <span className="text-xs font-bold text-white">
                Institutional Tier
              </span>
            </div>
            
            <button className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-md shadow-indigo-600/10">
              <span>Upgrade to Pro</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}
