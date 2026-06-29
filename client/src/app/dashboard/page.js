'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  FileDown,
  Copy,
  Star,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  XCircle,
  RefreshCw,
  Search,
  Check,
  Brain,
  Bell,
  Moon,
  User
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

import Gauge from '@/components/Gauge';
import MetricsGrid from '@/components/MetricsGrid';
import NewsSection from '@/components/NewsSection';
import SwotCard from '@/components/SwotCard';
import RiskMeter from '@/components/RiskMeter';
import GrowthMeter from '@/components/GrowthMeter';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryCompany = searchParams.get('q');

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);

  const steps = [
    'Validating company name and searching stock ticker...',
    'Collecting company executive profiles and business sector metadata...',
    'Gathering key financial statements (income statements, balance sheets)...',
    'Scraping latest market announcements and news publications...',
    'Evaluating risk factors (competition, debt leverage, regulatory environment)...',
    'Quantifying innovation initiatives and AI adoption growth vectors...',
    'Synthesizing investment research and recommendation status...'
  ];

  // Load from sessionStorage if navigated from history, or analyze query
  useEffect(() => {
    const checkSessionAndAnalyze = async () => {
      // Check if we have analysis in session storage first
      const storedData = sessionStorage.getItem('alphainvest_current_analysis');
      
      if (queryCompany) {
        // If we have a query, run a fresh analysis
        await runAnalysis(queryCompany);
      } else if (storedData) {
        // Load stored history record directly
        const parsed = JSON.parse(storedData);
        setData(parsed.fullData || parsed);
        setError(null);
        setLoading(false);
      } else {
        setData(null);
        setError(null);
        setLoading(false);
      }
    };

    checkSessionAndAnalyze();
  }, [queryCompany]);

  // Check if current data is in favorites
  useEffect(() => {
    if (!data) return;
    const storedUser = localStorage.getItem('alphainvest_user');
    const email = storedUser ? JSON.parse(storedUser).email : 'guest@alphainvest.ai';
    const favs = JSON.parse(localStorage.getItem(`alphainvest_favorites_${email}`) || '[]');
    const isFav = favs.some((item) => item.symbol === data.symbol);
    setIsFavorite(isFav);
  }, [data]);

  // Simulate loading steps in UI while resolving API in background
  useEffect(() => {
    if (!loading) return;
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 1800); // Progress tick every 1.8s
    
    return () => clearInterval(interval);
  }, [loading]);

  const runAnalysis = async (companyName) => {
    setLoading(true);
    setError(null);
    setData(null);
    sessionStorage.removeItem('alphainvest_current_analysis');

    try {
      // API call to Express backend
      const storedUser = localStorage.getItem('alphainvest_user');
      const userEmail = storedUser ? JSON.parse(storedUser).email : 'guest@alphainvest.ai';
      
      const response = await axios.post('/api/research/analyze', { 
        companyName,
        userEmail: userEmail
      }, {
        headers: { 'x-user-email': userEmail }
      });
      
      if (response.data?.success && response.data?.data?.fullData) {
        const fullPayload = response.data.data.fullData;
        setData(fullPayload);
        
        // Also save to recent searches in page context
        const savedRecents = JSON.parse(localStorage.getItem(`alphainvest_recents_${userEmail}`) || '[]');
        const updatedRecents = [companyName, ...savedRecents.filter(t => t !== companyName)].slice(0, 5);
        localStorage.setItem(`alphainvest_recents_${userEmail}`, JSON.stringify(updatedRecents));
      } else {
        throw new Error('Analysis payload was incomplete or malformed.');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.details ||
        err.response?.data?.error ||
        err.message ||
        'An unexpected error occurred during analysis.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    if (!data) return;
    const storedUser = localStorage.getItem('alphainvest_user');
    const email = storedUser ? JSON.parse(storedUser).email : 'guest@alphainvest.ai';
    const favs = JSON.parse(localStorage.getItem(`alphainvest_favorites_${email}`) || '[]');
    let updated;
    if (isFavorite) {
      updated = favs.filter((item) => item.symbol !== data.symbol);
    } else {
      updated = [
        ...favs,
        {
          symbol: data.symbol,
          name: data.companyInfo.name,
          recommendation: data.recommendation.decision,
          confidence: data.recommendation.confidenceScore
        }
      ];
    }
    localStorage.setItem(`alphainvest_favorites_${email}`, JSON.stringify(updated));
    setIsFavorite(!isFavorite);
  };

  const copyToClipboard = () => {
    if (!data) return;
    const summaryText = `[Aequitas AI Recommendation Report]
Company: ${data.companyInfo.name} (${data.symbol})
Decision: ${data.recommendation.decision} (Confidence Score: ${data.recommendation.confidenceScore}%)
Reasoning: ${data.recommendation.reasoning}
Future Outlook: ${data.recommendation.futureOutlook}`;
    
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.symbol}_ai_research.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const triggerPrint = () => {
    window.print();
  };

  const HeaderBar = () => {
    const [headerQuery, setHeaderQuery] = useState(queryCompany || '');
    const [headerUser, setHeaderUser] = useState(null);
    
    useEffect(() => {
      const stored = localStorage.getItem('alphainvest_user');
      if (stored) {
        setHeaderUser(JSON.parse(stored));
      }
    }, []);

    const handleHeaderSubmit = (e) => {
      e.preventDefault();
      if (!headerQuery.trim()) return;
      router.push(`/dashboard?q=${encodeURIComponent(headerQuery.trim())}`);
    };

    return (
      <div className="no-print hidden lg:flex items-center justify-between h-20 border-b border-white/[0.03] px-8 bg-[#090d16]/80 backdrop-blur-xl z-20 sticky top-0 -mx-8 -mt-6 mb-6">
        {/* Search bar input */}
        <form onSubmit={handleHeaderSubmit} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search markets or ticker..."
              value={headerQuery}
              onChange={(e) => setHeaderQuery(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-[#0a0d16] py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500/50 focus:outline-none"
            />
          </div>
        </form>

        {/* Action icons and profile */}
        <div className="flex items-center gap-6">
          <button className="text-slate-400 hover:text-white transition-colors" title="Toggle theme">
            <Moon className="h-4 w-4" />
          </button>
          
          <div className="relative">
            <button className="text-slate-400 hover:text-white transition-colors" title="Notifications">
              <Bell className="h-4 w-4" />
            </button>
            <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          </div>

          <div className="h-4 w-px bg-white/10" />

          <button
            type="button"
            onClick={handleHeaderSubmit}
            className="inline-flex h-9 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/10 active:scale-95"
          >
            Analyze
          </button>

          <div className="h-4 w-px bg-white/10" />

          {/* Profile Name & Avatar */}
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-85" onClick={() => router.push('/profile')}>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-slate-400 tracking-wider">
                {headerUser ? headerUser.name : 'DRIVE_'}
              </span>
              <Search className="h-3 w-3 text-slate-500" />
            </div>
            {/* Avatar Circle */}
            <div className="h-8 w-8 rounded-full border border-white/10 bg-[#0a0d16] flex items-center justify-center overflow-hidden">
              {headerUser && headerUser.avatar ? (
                <img src={headerUser.avatar} className="h-full w-full object-cover" alt="Profile" />
              ) : (
                <User className="h-4 w-4 text-slate-300" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Rendering Loader UI (Matches user screenshot exactly)
  if (loading) {
    const percentMap = [10, 25, 45, 60, 75, 85, 95];
    const timeMap = [14, 12, 10, 8, 6, 4, 2];
    const currentPercent = percentMap[loadingStep] || 45;
    const currentTime = timeMap[loadingStep] || 10;

    const timelineSteps = [
      'Collecting Data',
      'Financial Analysis',
      'News Analysis',
      'Market Sentiment',
      'SWOT Framework',
      'Competitor Matrix',
      'Risk Assessment'
    ];

    return (
      <div className="flex-1 flex flex-col space-y-6 animate-fade-in bg-[#030712] min-h-[90vh]">
        {/* Render HeaderBar inside Loader */}
        <HeaderBar />

        {/* Center Agent Icon Containment */}
        <div className="flex flex-col items-center justify-center pt-8 text-center space-y-4">
          <div className="relative">
            {/* Outer glowing pulsing border */}
            <div className="absolute -inset-1.5 rounded-full border border-indigo-500/20 animate-pulse" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#0a0d16] border border-white/5 shadow-2xl">
              <div className="absolute inset-2.5 rounded-full border border-indigo-500/10 bg-indigo-500/5 flex items-center justify-center">
                <Brain className="h-10 w-10 text-indigo-400" />
              </div>
            </div>
          </div>
          <div className="inline-flex rounded-full bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-0.5 text-[9px] font-black text-[#10b981] tracking-widest uppercase shadow shadow-emerald-500/5">
            Agent Active
          </div>
        </div>

        {/* Loading Titles */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Active Market Intelligence Analysis
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed px-4">
            Our neural networks are currently synthesizing millions of data points to generate your institutional-grade research report for <span className="font-bold text-white">${(queryCompany || 'STOCK').toUpperCase()}</span>.
          </p>
        </div>

        {/* Progress bar block */}
        <div className="w-full max-w-3xl mx-auto bg-[#0a0d16]/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          {/* Progress Track */}
          <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000"
              style={{ width: `${currentPercent}%` }}
            />
          </div>
          {/* Text details */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 shrink-0">
            <span className="text-white font-bold">{currentPercent}% Complete</span>
            <span className="h-3 w-px bg-white/10" />
            <span>Est: {currentTime}s remaining</span>
          </div>
        </div>

        {/* Timeline Trace & Skeleton Content Grid */}
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto w-full pt-4">
          
          {/* Left Column: Progress Trace Timeline */}
          <div className="md:col-span-1 glass-card rounded-2xl border border-white/5 p-5 space-y-4 h-fit">
            <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase border-b border-white/5 pb-2">
              Progress Trace
            </h3>
            
            <div className="relative border-l border-white/5 pl-5 ml-2.5 space-y-5.5 py-1">
              {timelineSteps.map((step, idx) => {
                const isCompleted = loadingStep > idx;
                const isCurrent = loadingStep === idx;

                return (
                  <div key={idx} className="relative flex items-center">
                    {/* Visual node circle */}
                    <div className={`absolute -left-[30px] flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                      isCompleted 
                        ? 'bg-indigo-500 border-indigo-500 text-white' 
                        : isCurrent 
                          ? 'bg-slate-950 border-indigo-400 text-indigo-400 shadow shadow-indigo-500/20' 
                          : 'bg-slate-950 border-slate-800 text-slate-700'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-3 w-3 stroke-[3]" />
                      ) : isCurrent ? (
                        <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                      )}
                    </div>
                    
                    <span className={`text-xs font-semibold ${
                      isCompleted 
                        ? 'text-slate-300' 
                        : isCurrent 
                          ? 'text-white' 
                          : 'text-slate-600'
                    }`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Skeleton Card Screen placeholders */}
          <div className="md:col-span-2 space-y-4">
            {/* Skeleton Card 1: Text placeholders */}
            <div className="glass-card rounded-2xl border border-white/5 p-5 space-y-4 bg-slate-900/10">
              <div className="h-4 w-1/4 rounded bg-white/10 animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-white/5 animate-pulse" />
                <div className="h-3 w-5/6 rounded bg-white/5 animate-pulse" />
                <div className="h-3 w-4/5 rounded bg-white/5 animate-pulse" />
              </div>
            </div>

            {/* Skeleton Grid: Charts/metrics placeholders */}
            <div className="grid gap-4 grid-cols-2">
              <div className="glass-card rounded-2xl border border-white/5 p-5 h-36 flex flex-col justify-between bg-slate-900/10">
                <div className="h-3.5 w-1/3 rounded bg-white/10 animate-pulse" />
                {/* Simulated Chart Waves */}
                <div className="flex items-end gap-1.5 h-16 pt-2">
                  <div className="flex-1 bg-white/5 h-2/5 rounded animate-pulse" />
                  <div className="flex-1 bg-white/5 h-3/5 rounded animate-pulse" />
                  <div className="flex-1 bg-white/5 h-4/5 rounded animate-pulse" />
                  <div className="flex-1 bg-white/10 h-1/2 rounded animate-pulse" />
                  <div className="flex-1 bg-white/5 h-2/3 rounded animate-pulse" />
                </div>
              </div>

              <div className="glass-card rounded-2xl border border-white/5 p-5 h-36 flex flex-col justify-between bg-slate-900/10">
                <div className="h-3.5 w-1/3 rounded bg-white/10 animate-pulse" />
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-1/2 rounded bg-white/5 animate-pulse" />
                    <div className="h-3 w-1/6 rounded bg-white/10 animate-pulse" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-2/5 rounded bg-white/5 animate-pulse" />
                    <div className="h-3 w-1/5 rounded bg-white/10 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Skeleton metrics grid */}
            <div className="grid gap-3 grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-card rounded-xl border border-white/5 p-4 space-y-2.5 bg-slate-900/10">
                  <div className="h-2.5 w-1/2 rounded bg-white/10 animate-pulse" />
                  <div className="h-5 w-3/4 rounded bg-white/5 animate-pulse" />
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    );
  }

  // Rendering Error UI
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[75vh] max-w-md mx-auto space-y-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white">Analysis Pipeline Interrupted</h2>
          <p className="text-xs leading-relaxed text-slate-400">{error}</p>
        </div>
        <button
          onClick={() => runAnalysis(queryCompany || 'Apple')}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-semibold text-slate-200"
        >
          Retry Pipeline
        </button>
      </div>
    );
  }

  // Empty State UI
  if (!data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 max-w-sm mx-auto">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-slate-400 border border-white/5 shadow-inner">
          <Search className="h-7 w-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-slate-200">No Research Report Loaded</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Search for a company using the main search bar or watchlist tags to run our LangGraph financial research pipeline.
          </p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 text-xs font-bold text-white"
        >
          Go to Home Search
        </button>
      </div>
    );
  }

  // Render Full Dashboard Report
  const isInvest = data.recommendation?.decision === 'INVEST';

  return (
    <div className="space-y-6 pb-12 animate-fade-in print:space-y-8">
      
      {/* Top action toolbar header */}
      <HeaderBar />

      {/* Action buttons list */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Search
        </button>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Watchlist toggle */}
          <button
            onClick={toggleFavorite}
            className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold transition-all ${
              isFavorite
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
            {isFavorite ? 'On Watchlist' : 'Add to Watchlist'}
          </button>
          {/* Copy summary */}
          <button
            onClick={copyToClipboard}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-slate-300 transition-all hover:bg-white/10 hover:text-white"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-400" />}
            {copied ? 'Copied!' : 'Copy Summary'}
          </button>
          {/* Download JSON */}
          <button
            onClick={downloadJson}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-slate-300 transition-all hover:bg-white/10 hover:text-white"
          >
            <FileDown className="h-4 w-4 text-slate-400" />
            JSON
          </button>
          {/* Export PDF */}
          <button
            onClick={triggerPrint}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-cyan-500 px-4 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:opacity-90 active:scale-95"
          >
            <FileDown className="h-4 w-4 text-white" />
            Export PDF Report
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="glass-card overflow-hidden rounded-3xl border border-white/5 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-950/40 via-cyan-950/[0.03] to-slate-950/40">
        <div className="space-y-4 max-w-xl">
          {/* Company identity */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-black text-white tracking-tight">{data.companyInfo.name}</h2>
              <span className="rounded-lg bg-white/5 px-2 py-0.5 text-xs font-bold text-slate-400 tracking-wider">
                {data.symbol}
              </span>
              <span className="rounded-lg bg-white/5 px-2 py-0.5 text-xs font-semibold text-cyan-400">
                {data.companyInfo.exchange}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {data.companyInfo.sector} • {data.companyInfo.industry}
            </p>
          </div>
          {/* Business Summary */}
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
            {data.companyInfo.description}
          </p>
          {/* CEO & metadata */}
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/5 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            <div>
              <span className="block text-slate-500">CEO</span>
              <span className="text-slate-200 mt-0.5 block truncate">{data.companyInfo.ceo}</span>
            </div>
            <div>
              <span className="block text-slate-500">Founded</span>
              <span className="text-slate-200 mt-0.5 block truncate">{data.companyInfo.founded}</span>
            </div>
            <div>
              <span className="block text-slate-500">Employees</span>
              <span className="text-slate-200 mt-0.5 block truncate">
                {typeof data.companyInfo.employees === 'number'
                  ? data.companyInfo.employees.toLocaleString()
                  : data.companyInfo.employees}
              </span>
            </div>
          </div>
        </div>

        {/* Decision Banner and Confidence score */}
        <div className="flex items-center gap-6 self-center md:self-auto border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Recommendation</span>
            <div
              className={`rounded-2xl px-6 py-3 border text-lg font-black tracking-widest ${
                isInvest
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 shadow-md shadow-emerald-500/5'
                  : 'bg-rose-500/10 border-rose-500/25 text-rose-400 shadow-md shadow-rose-500/5'
              }`}
            >
              {data.recommendation?.decision}
            </div>
          </div>
          <Gauge value={data.recommendation?.confidenceScore || 50} size={110} />
        </div>
      </div>

      {/* Financial Metrics Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-cyan-400" />
          Financial Performance Metrics
        </h3>
        <MetricsGrid metrics={data.financialAnalysis} />
      </div>

      {/* Charts Section: Historical Stock Price & Multi-Year Revenue/Income */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Stock price chart */}
        <div className="glass-card rounded-2xl border border-white/5 p-5 space-y-4 bg-slate-900/10">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Historical Close Price (3 Years)</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Closing stock values (USD) aggregated monthly</p>
          </div>
          <div className="h-60 w-full">
            {data.chartData && data.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData}>
                  <defs>
                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(148, 163, 184, 0.6)', fontSize: 9 }} />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fill: 'rgba(148, 163, 184, 0.6)', fontSize: 9 }}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#ffffff'
                    }}
                    formatter={(val) => [`$${parseFloat(val).toFixed(2)}`, 'Close']}
                  />
                  <Area type="monotone" dataKey="close" stroke="#06b6d4" fillOpacity={1} fill="url(#priceGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">Chart data unavailable.</div>
            )}
          </div>
        </div>

        {/* Revenue Multi-Year Chart */}
        <div className="glass-card rounded-2xl border border-white/5 p-5 space-y-4 bg-slate-900/10">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Multi-Year Revenues & Net Income</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Top and bottom line comparative trends (USD)</p>
          </div>
          <div className="h-60 w-full">
            {data.financialHistory && data.financialHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.financialHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="year" tick={{ fill: 'rgba(148, 163, 184, 0.6)', fontSize: 9 }} />
                  <YAxis
                    tick={{ fill: 'rgba(148, 163, 184, 0.6)', fontSize: 9 }}
                    tickFormatter={(val) => `$${(val / 1e9).toFixed(1)}B`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#ffffff'
                    }}
                    formatter={(val) => [`$${(val / 1e9).toFixed(2)}B`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netIncome" name="Net Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">Statement history unavailable.</div>
            )}
          </div>
        </div>
      </div>

      {/* SWOT Analysis Card */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          SWOT Analysis Matrix
        </h3>
        <SwotCard swot={data.swot} />
      </div>

      {/* Risk and Growth Meters */}
      <div className="grid gap-6 md:grid-cols-1">
        <RiskMeter riskData={data.riskAnalysis} />
        <GrowthMeter growthData={data.growthAnalysis} />
      </div>

      {/* Final Detailed Recommendation Report Text */}
      <div className="glass-card rounded-3xl border border-white/5 p-6 md:p-8 space-y-6 bg-slate-950/30">
        <div className="border-b border-white/5 pb-4">
          <h3 className="text-base font-bold text-white tracking-wide">
            Detailed Investment Analysis Synthesis
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Reasoned research compilation and long-term outlook
          </p>
        </div>

        {/* Report columns */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Pros */}
          <div className="space-y-3 border-r border-white/5 pr-0 md:pr-6">
            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
              Investment Strengths & Catalysts
            </h4>
            <ul className="space-y-2">
              {data.recommendation?.pros?.map((item, idx) => (
                <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-400" />
              Investment Headwinds & Concerns
            </h4>
            <ul className="space-y-2">
              {data.recommendation?.cons?.map((item, idx) => (
                <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Detailed Reasoning */}
        <div className="border-t border-white/5 pt-5 space-y-2.5">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Analysis Synthesis</h4>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
            {data.recommendation?.reasoning}
          </p>
        </div>

        {/* Future Outlook */}
        <div className="border-t border-white/5 pt-5 space-y-2.5 bg-gradient-to-r from-violet-500/5 to-transparent p-4 rounded-2xl border border-violet-500/10">
          <h4 className="text-sm font-bold text-violet-400 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-violet-400" />
            Long-Term Valuation & Future Outlook
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {data.recommendation?.futureOutlook}
          </p>
        </div>
      </div>

      {/* News Sentiment Chronology */}
      <div className="space-y-3 print:page-break">
        <h3 className="text-xs font-extrabold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-cyan-400" />
          News Coverage & Sentiment Chronology
        </h3>
        <NewsSection news={data.newsSentiment} />
      </div>

    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
