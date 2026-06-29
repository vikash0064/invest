'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Calendar, 
  ShieldAlert, 
  LogOut, 
  Check, 
  Clock, 
  Sliders, 
  Award,
  Database
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('alphainvest_user');
    if (!storedUser) {
      // Create a default session user if none exists
      const defaultUser = {
        name: 'HP INVESTOR',
        email: 'hp.investor@gmail.com',
        avatar: '',
        tier: 'Institutional Tier',
        joinedDate: 'June 28, 2026',
        apiCallsUsed: 42,
        apiCallsLimit: 1000
      };
      localStorage.setItem('alphainvest_user', JSON.stringify(defaultUser));
      setUser(defaultUser);
      setName(defaultUser.name);
    } else {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setName(parsed.name);
    }
  }, []);

  const handleSaveProfile = () => {
    if (!user) return;
    const updated = { ...user, name: name };
    setUser(updated);
    localStorage.setItem('alphainvest_user', JSON.stringify(updated));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('alphainvest_user');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-xs text-slate-500 italic">
        Loading profile credentials...
      </div>
    );
  }

  const quotaPercent = Math.min(100, Math.round((user.apiCallsUsed / user.apiCallsLimit) * 100));

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">User Profile</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your personal credentials, subscription quotas, and active sessions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Left Column: Avatar & Subscription Card */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Identity glass card */}
          <div className="glass-card border border-white/5 bg-[#090d16]/60 p-6 rounded-3xl text-center space-y-4 shadow-xl">
            <div className="mx-auto relative flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 border-2 border-indigo-500/20 shadow-2xl overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-indigo-400" />
              )}
              {/* Active tag */}
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[#090d16]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-white tracking-tight">{user.name}</h2>
              <p className="text-[10px] text-slate-400 font-semibold truncate">{user.email}</p>
            </div>

            <div className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 px-3 py-0.5 text-[9px] font-bold text-indigo-400 uppercase">
              <Award className="h-3 w-3" />
              {user.tier}
            </div>

            <div className="pt-4 border-t border-white/5 text-left text-[10px] text-slate-500 font-semibold space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Joined</span>
                <span className="text-slate-300">{user.joinedDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Session Status</span>
                <span className="text-emerald-400 font-bold uppercase tracking-wider">Active</span>
              </div>
            </div>
          </div>

          {/* Quota limit card */}
          <div className="glass-card border border-white/5 bg-[#090d16]/60 p-5 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Database className="h-4 w-4 text-indigo-400" />
              LLM Quota Limit
            </h3>

            <div className="space-y-1">
              <div className="flex justify-between items-end text-xs font-semibold">
                <span className="text-slate-400">Monthly Usage</span>
                <span className="text-white">{user.apiCallsUsed} / {user.apiCallsLimit} calls</span>
              </div>
              
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
              <span className="block text-[9px] text-slate-500 text-right">Resetting in 18 days</span>
            </div>
          </div>

        </div>

        {/* Right Column: Profile Edits & System Settings */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Personal Settings */}
          <div className="glass-card border border-white/5 bg-[#090d16]/40 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white tracking-wide border-b border-white/5 pb-3">
              Profile Customization
            </h3>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-[#0a0d16] p-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500/50 focus:outline-none font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full rounded-xl border border-white/5 bg-[#0a0d16]/50 p-3 pl-9 text-xs text-slate-500 placeholder-slate-500 focus:outline-none cursor-not-allowed font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveProfile}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 text-xs font-bold text-white transition-all shadow-md active:scale-95"
                >
                  {copied ? <Check className="h-4 w-4 text-white" /> : null}
                  {copied ? 'Profile Saved' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* Security & Danger zone */}
          <div className="glass-card border border-white/5 bg-[#090d16]/40 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-base font-bold text-rose-500 tracking-wide border-b border-white/5 pb-3 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" />
              Security / Danger Zone
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                <div className="space-y-0.5 pr-4">
                  <h4 className="font-bold text-white">Multi-Factor Authentication (2FA)</h4>
                  <p className="text-[10px] text-slate-500">Secure your account with an extra verification layer</p>
                </div>
                {/* Simulated checkbox */}
                <button className="h-6 w-11 rounded-full bg-white/5 border border-white/10 p-0.5 transition-colors relative">
                  <span className="absolute left-0.5 top-0.5 h-4.5 w-4.5 rounded-full bg-slate-600" />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                <div className="space-y-0.5 pr-4">
                  <h4 className="font-bold text-white">API Quota Notifications</h4>
                  <p className="text-[10px] text-slate-500">Email alerts when usage reaches 80% threshold</p>
                </div>
                <button className="h-6 w-11 rounded-full bg-indigo-500/20 border border-indigo-500/30 p-0.5 transition-colors relative">
                  <span className="absolute right-0.5 top-0.5 h-4.5 w-4.5 rounded-full bg-indigo-500" />
                </button>
              </div>

              <div className="flex justify-between items-center pt-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Close Active Session</h4>
                  <p className="text-[10px] text-slate-500">Logs your profile out of this browser session</p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 px-4 text-xs font-bold text-rose-400 transition-all active:scale-95 shadow-inner"
                >
                  <LogOut className="h-4 w-4 text-rose-400" />
                  Log Out Session
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
