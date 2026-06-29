'use client';

import { ShieldCheck, ShieldAlert, Zap, AlertTriangle } from 'lucide-react';

export default function SwotCard({ swot = {} }) {
  const { strengths = [], weaknesses = [], opportunities = [], threats = [] } = swot;

  const categories = [
    {
      title: 'Strengths',
      items: strengths,
      icon: ShieldCheck,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      gradient: 'from-emerald-500/5 to-transparent'
    },
    {
      title: 'Weaknesses',
      items: weaknesses,
      icon: ShieldAlert,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      gradient: 'from-rose-500/5 to-transparent'
    },
    {
      title: 'Opportunities',
      items: opportunities,
      icon: Zap,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      gradient: 'from-amber-500/5 to-transparent'
    },
    {
      title: 'Threats',
      items: threats,
      icon: AlertTriangle,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      gradient: 'from-violet-500/5 to-transparent'
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <div
            key={cat.title}
            className={`glass-card overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br ${cat.gradient} p-5 space-y-4`}
          >
            {/* Category Header */}
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${cat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-wide uppercase">
                {cat.title}
              </h3>
            </div>

            {/* List */}
            {cat.items.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No points generated.</p>
            ) : (
              <ul className="space-y-2.5">
                {cat.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
