'use client';

import { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function RiskMeter({ riskData = {} }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = riskData.categories || {};
  const overallScore = riskData.overallScore || 5;

  // Format data for Recharts Radar
  const radarData = Object.entries(categories).map(([key, item]) => {
    // Format label: competition -> Competition
    const formattedLabel = key.replace(/([A-Z])/g, ' $1').trim();
    const finalLabel = formattedLabel.charAt(0).toUpperCase() + formattedLabel.slice(1);
    return {
      subject: finalLabel,
      score: item.score || 5,
      fullMark: 10
    };
  });

  const getRiskColor = (score) => {
    if (score < 4) return 'bg-emerald-500';
    if (score < 8) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getRiskTextColor = (score) => {
    if (score < 4) return 'text-emerald-400';
    if (score < 8) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getRiskLabel = (score) => {
    if (score < 4) return 'Low Risk';
    if (score < 8) return 'Moderate Risk';
    return 'High Risk';
  };

  return (
    <div className="glass-card rounded-2xl border border-white/5 p-5 space-y-6 bg-slate-900/10">
      
      {/* Header and overall score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-wide">
            Risk Analysis
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Individual category hazard assessments scored 1–10
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-400">Overall Score:</span>
          <span className={`text-2xl font-black ${getRiskTextColor(overallScore)}`}>
            {overallScore}/10
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border border-white/5 ${getRiskTextColor(overallScore)} bg-white/5`}>
            {getRiskLabel(overallScore)}
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 items-center">
        
        {/* Progress Bars list */}
        <div className="space-y-4">
          {Object.entries(categories).map(([key, item]) => {
            const label = key.replace(/([A-Z])/g, ' $1').trim();
            const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);
            const score = item.score || 5;

            return (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">{formattedLabel}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 italic font-medium max-w-[150px] truncate" title={item.reason}>
                      {item.reason}
                    </span>
                    <span className={`font-bold ${getRiskTextColor(score)}`}>{score}/10</span>
                  </div>
                </div>
                {/* Custom bar */}
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getRiskColor(score)} transition-all duration-1000`}
                    style={{ width: `${score * 10}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recharts Radar view */}
        <div className="h-64 w-full flex items-center justify-center">
          {mounted && radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 10, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 10]}
                  tick={{ fill: 'rgba(148, 163, 184, 0.5)', fontSize: 9 }}
                  stroke="rgba(255, 255, 255, 0.05)"
                />
                <Radar
                  name="Risk Score"
                  dataKey="score"
                  stroke="#ef4444" /* red accent */
                  fill="#ef4444"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-xs text-slate-500 italic">Loading radar visualizer...</div>
          )}
        </div>

      </div>
    </div>
  );
}
