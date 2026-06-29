'use client';

import { DollarSign, Percent, BarChart3, TrendingUp, ShieldAlert, Award, Activity, Calendar } from 'lucide-react';

export default function MetricsGrid({ metrics = {} }) {
  
  const formatValue = (key, val) => {
    if (val === undefined || val === null || val === 'Data unavailable') return 'N/A';
    
    // If it's already a formatted string (like containing %)
    if (typeof val === 'string' && (val.includes('%') || val.includes('$') || isNaN(val))) {
      return val;
    }
    
    const num = parseFloat(val);
    if (isNaN(num)) return val;

    // Currency values
    if (['revenue', 'netIncome', 'debt', 'cashFlow', 'marketCapitalization'].includes(key)) {
      const isNegative = num < 0;
      const absNum = Math.abs(num);
      let suffix = '';
      let formatted = absNum;

      if (absNum >= 1e12) {
        formatted = absNum / 1e12;
        suffix = 'T';
      } else if (absNum >= 1e9) {
        formatted = absNum / 1e9;
        suffix = 'B';
      } else if (absNum >= 1e6) {
        formatted = absNum / 1e6;
        suffix = 'M';
      } else {
        return (isNegative ? '-' : '') + '$' + absNum.toLocaleString(undefined, { maximumFractionDigits: 0 });
      }

      return (isNegative ? '-' : '') + '$' + formatted.toFixed(2) + suffix;
    }

    // Ratio and pricing values
    if (['peRatio', 'eps', 'currentRatio', 'fiftyTwoWeekHigh', 'fiftyTwoWeekLow', 'debtToEquity'].includes(key)) {
      if (['fiftyTwoWeekHigh', 'fiftyTwoWeekLow'].includes(key)) {
        return '$' + num.toFixed(2);
      }
      if (key === 'eps') {
        return '$' + num.toFixed(2);
      }
      if (key === 'debtToEquity') {
        // sometimes expressed as percentage, e.g. 140.5% or ratio 1.4
        return num > 10 ? (num / 100).toFixed(2) + 'x' : num.toFixed(2) + 'x';
      }
      return num.toFixed(2);
    }

    return num.toLocaleString();
  };

  const metricCards = [
    { label: 'Market Cap', key: 'marketCapitalization', icon: DollarSign, color: 'text-cyan-400 bg-cyan-500/10' },
    { label: 'Revenue', key: 'revenue', icon: BarChart3, color: 'text-violet-400 bg-violet-500/10' },
    { label: 'Revenue Growth', key: 'revenueGrowth', icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'Net Income', key: 'netIncome', icon: DollarSign, color: 'text-teal-400 bg-teal-500/10' },
    { label: 'Operating Margin', key: 'operatingMargin', icon: Percent, color: 'text-indigo-400 bg-indigo-500/10' },
    { label: 'Profit Margin', key: 'profitMargin', icon: Percent, color: 'text-pink-400 bg-pink-500/10' },
    { label: 'EPS', key: 'eps', icon: Award, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'P/E Ratio', key: 'peRatio', icon: Activity, color: 'text-orange-400 bg-orange-500/10' },
    { label: 'Total Debt', key: 'debt', icon: ShieldAlert, color: 'text-rose-400 bg-rose-500/10' },
    { label: 'Operating Cash Flow', key: 'cashFlow', icon: BarChart3, color: 'text-blue-400 bg-blue-500/10' },
    { label: 'ROE', key: 'roe', icon: TrendingUp, color: 'text-cyan-400 bg-cyan-500/10' },
    { label: 'Current Ratio', key: 'currentRatio', icon: Activity, color: 'text-teal-400 bg-teal-500/10' },
    { label: 'Debt to Equity', key: 'debtToEquity', icon: ShieldAlert, color: 'text-rose-400 bg-rose-500/10' },
    { label: 'Dividend Yield', key: 'dividendYield', icon: Percent, color: 'text-emerald-400 bg-emerald-500/10' },
    { label: '52-Week High', key: 'fiftyTwoWeekHigh', icon: Calendar, color: 'text-slate-400 bg-slate-500/10' },
    { label: '52-Week Low', key: 'fiftyTwoWeekLow', icon: Calendar, color: 'text-slate-400 bg-slate-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {metricCards.map((card) => {
        const value = metrics[card.key];
        const displayValue = formatValue(card.key, value);
        const Icon = card.icon;

        return (
          <div key={card.label} className="glass-card hover-glow rounded-2xl p-4 flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                {card.label}
              </span>
              <span className="text-lg font-bold text-white tracking-tight">
                {displayValue}
              </span>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color} border border-white/5`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
