'use client';

import { TrendingUp, Award, Rocket, Globe, Zap, Cpu } from 'lucide-react';

export default function GrowthMeter({ growthData = {} }) {
  const categories = growthData.categories || {};
  const overallScore = growthData.overallScore || 5;

  const getGrowthTextColor = (score) => {
    if (score >= 8) return 'text-emerald-400';
    if (score >= 5) return 'text-violet-400';
    return 'text-slate-400';
  };

  const getGrowthColor = (score) => {
    if (score >= 8) return 'bg-emerald-500';
    if (score >= 5) return 'bg-violet-500';
    return 'bg-slate-500';
  };

  const getGrowthLabel = (score) => {
    if (score >= 8) return 'High Expansion';
    if (score >= 5) return 'Moderate Expansion';
    return 'Stagnant Expansion';
  };

  // Map category keys to custom icons
  const iconsMap = {
    revenueGrowth: TrendingUp,
    industryGrowth: Award,
    innovation: Rocket,
    aiAdoption: Cpu,
    futurePlans: Zap,
    expansion: Globe
  };

  return (
    <div className="glass-card rounded-2xl border border-white/5 p-5 space-y-6 bg-slate-900/10">
      
      {/* Header and overall score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-wide">
            Growth & Innovation Analysis
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Category opportunities scored 1–10
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-400">Growth Index:</span>
          <span className={`text-2xl font-black ${getGrowthTextColor(overallScore)}`}>
            {overallScore}/10
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border border-white/5 ${getGrowthTextColor(overallScore)} bg-white/5`}>
            {getGrowthLabel(overallScore)}
          </span>
        </div>
      </div>

      {/* Grid of growth categories */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {Object.entries(categories).map(([key, item]) => {
          const score = item.score || 5;
          const Icon = iconsMap[key] || TrendingUp;

          // Format label: revenueGrowth -> Revenue Growth
          const label = key.replace(/([A-Z])/g, ' $1').trim();
          const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);

          return (
            <div key={key} className="glass-card border border-white/5 rounded-xl p-4 space-y-3 hover:border-violet-500/20 bg-slate-950/20">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-slate-300 border border-white/5`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">{formattedLabel}</span>
                </div>
                <span className={`text-xs font-black ${getGrowthTextColor(score)}`}>
                  {score}/10
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${getGrowthColor(score)} transition-all duration-1000`}
                  style={{ width: `${score * 10}%` }}
                />
              </div>

              {/* Snippet / reason */}
              <p className="text-[10px] leading-relaxed text-slate-400 italic">
                {item.reason}
              </p>

            </div>
          );
        })}
      </div>
      
    </div>
  );
}
