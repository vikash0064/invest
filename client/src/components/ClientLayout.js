'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';
  
  // Mobile drawer open state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('alphainvest_user');
    if (!user && pathname !== '/login') {
      router.push('/login');
    }
  }, [pathname, router]);

  return (
    <>
      {/* Glowing Background Accent */}
      <div className="pointer-events-none fixed -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-cyan-500/10 to-violet-500/10 opacity-30 blur-[120px]" />
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-violet-500/10 to-fuchsia-500/10 opacity-20 blur-[120px]" />

      {/* Sidebar Nav (Drawer on mobile) */}
      {!isLoginPage && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen relative w-full">
        
        {/* Mobile Top Navigation Header */}
        {!isLoginPage && (
          <header className="lg:hidden no-print flex h-16 items-center justify-between border-b border-white/5 bg-[#090d16]/90 backdrop-blur px-5 sticky top-0 z-20">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="p-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 hover:text-white transition-all active:scale-95"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/aequitas_logo.png" className="h-7 w-7 rounded-lg border border-white/10" alt="Aequitas AI Logo" />
              <span className="text-sm font-bold text-white tracking-tight">Aequitas AI</span>
            </div>
            <div className="w-9" /> {/* Visual spacer */}
          </header>
        )}

        {/* Core Content Body with responsive margin */}
        <main className={`flex-1 flex flex-col relative z-10 transition-all duration-300 ${isLoginPage ? 'lg:pl-0' : 'lg:pl-64'} print:pl-0`}>
          <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 flex flex-col">
            {children}
          </div>
        </main>
        
      </div>
    </>
  );
}
