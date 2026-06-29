'use client';

import { Sparkles, GitBranch, ArrowRight, Info, CheckCircle, Brain, Database, ShieldAlert, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  const steps = [
    {
      node: 'Node 1',
      name: 'Validate Company & Ticker',
      icon: Database,
      desc: 'Receives the search query (e.g. "Apple" or "AAPL") and queries Yahoo Finance search autocomplete to resolve it to a valid stock ticker symbol (e.g. "AAPL") traded on a public exchange.'
    },
    {
      node: 'Node 2',
      name: 'Collect Company Profile',
      icon: Info,
      desc: 'Retrieves corporate metadata including CEO, full-time employees, sector, industry classifications, exchange info, and founding year by parsing the business description.'
    },
    {
      node: 'Node 3',
      name: 'Collect Financial Data',
      icon: TrendingUp,
      desc: 'Gathers key balance sheet metrics, operating cash flow, operating margin, P/E ratio, debt-to-equity ratios, EPS, and 3-year historical financial figures.'
    },
    {
      node: 'Node 4',
      name: 'Collect Latest News',
      icon: Database,
      desc: 'Retrieves current company news articles and recent announcements to form a context baseline for sentiment analysis.'
    },
    {
      node: 'Node 5',
      name: 'Analyze Risks',
      icon: ShieldAlert,
      desc: 'Leverages the Gemini model (or local fallback formulas) to score 7 risk dimensions (competition, debt leverage, economic, regulations, tech, supply chain, geopolitics) on a scale of 1–10.'
    },
    {
      node: 'Node 6',
      name: 'Analyze Growth',
      icon: Sparkles,
      desc: 'Evaluates the company growth factors (revenue speed, industry expansion, product innovation, AI adoption, expansion plans) on a scale of 1-10.'
    },
    {
      node: 'Node 7',
      name: 'Final Recommendation',
      icon: Brain,
      desc: 'Synthesizes all gathered metrics, news sentiment, SWOT, risk scoring, and growth scoring, and uses LLM cognitive reasoning to arrive at a final INVEST or PASS recommendation.'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-xl font-bold text-white tracking-wide">Methodology & Architecture</h2>
        <p className="text-xs text-slate-400 mt-1">
          Understanding the LangGraph multi-agent cognitive pipeline and decision matrix
        </p>
      </div>

      {/* Intro section */}
      <div className="glass-card rounded-2xl border border-white/5 p-6 bg-slate-900/10 space-y-4">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <GitBranch className="h-4.5 w-4.5 text-cyan-400" />
          The LangGraph Cognitive Framework
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Unlike traditional simple LLM prompts, AlphaInvest runs a state-aware multi-node workflow using <strong>LangGraph.js</strong> and <strong>LangChain.js</strong>. LangGraph allows us to define agents as a State Graph where each node acts as an independent specialist. The output state of each node is passed along to subsequent nodes, creating a reliable, traceable, and deterministic pipeline that eliminates hallucination of financial facts.
        </p>
      </div>

      {/* Pipeline steps visualization */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold text-slate-400 tracking-wider uppercase">
          Pipeline Node Breakdown
        </h3>
        
        <div className="relative border-l border-white/10 pl-6 ml-4 space-y-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative space-y-1">
                {/* Visual node circle */}
                <div className="absolute -left-[35px] top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-slate-950 border border-cyan-500/50 text-[8px] font-black text-cyan-400 shadow shadow-cyan-500/20">
                  {idx + 1}
                </div>
                
                <div className="glass-card rounded-xl p-4 bg-slate-950/20 hover:border-cyan-500/15 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {step.node}
                    </span>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-slate-400" />
                      {step.name}
                    </h4>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400 mt-2">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial ratios explained */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold text-slate-400 tracking-wider uppercase">
          Key Valuation & Financial Indicators
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          
          <div className="glass-card rounded-xl p-4 border border-white/5 bg-slate-950/10 space-y-2">
            <h4 className="text-xs font-bold text-white">Trailing P/E Ratio</h4>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Price-to-Earnings measures the stock price relative to its earnings per share. High values (e.g. &gt;35) indicate premium growth expectations or overvaluation, which raises multiple contraction risk during market cycles.
            </p>
          </div>

          <div className="glass-card rounded-xl p-4 border border-white/5 bg-slate-950/10 space-y-2">
            <h4 className="text-xs font-bold text-white">Debt to Equity Ratio</h4>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Measures total liabilities relative to shareholder equity. High leverage (e.g. &gt;1.5x) exposes the company to balance sheet vulnerabilities during high interest rate environments and limits strategic flexibility.
            </p>
          </div>

          <div className="glass-card rounded-xl p-4 border border-white/5 bg-slate-950/10 space-y-2">
            <h4 className="text-xs font-bold text-white">Operating & Profit Margins</h4>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Measures what percentage of revenue remains after operating or net costs. Superior margins (e.g. &gt;15%) demonstrate pricing power, competitive advantages, and the capacity to absorb supply chain inflation.
            </p>
          </div>

          <div className="glass-card rounded-xl p-4 border border-white/5 bg-slate-950/10 space-y-2">
            <h4 className="text-xs font-bold text-white">Current Ratio</h4>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Measures short-term asset liquidity relative to short-term obligations. A ratio below 1.0 indicates potential working capital deficiencies, while values above 1.5 indicate sound short-term buffer capacity.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
