'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Search, Trash2, Calendar, Star, StarOff, CheckCircle2, XCircle, ArrowUpRight, Loader2 } from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterRec, setFilterRec] = useState('ALL'); // ALL, INVEST, PASS

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const storedUser = localStorage.getItem('alphainvest_user');
      const userEmail = storedUser ? JSON.parse(storedUser).email : 'guest@alphainvest.ai';
      
      const response = await axios.get(`/api/research/history?email=${encodeURIComponent(userEmail)}`, {
        headers: { 'x-user-email': userEmail }
      });
      if (response.data?.success) {
        setHistory(response.data.history || []);
      } else {
        throw new Error('Malformed API history response.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch research history records.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this analysis report from history?')) return;

    try {
      const response = await axios.delete(`/api/research/history/${id}`);
      if (response.data?.success) {
        setHistory(history.filter(item => item._id !== id));
      }
    } catch (err) {
      console.error('Delete failed:', err.message);
      alert('Failed to delete history record: ' + err.message);
    }
  };

  const handleSelectRecord = (record) => {
    // Save details to session storage to load instantly in dashboard
    sessionStorage.setItem('alphainvest_current_analysis', JSON.stringify(record));
    router.push('/dashboard'); // dashboard loads it from session
  };

  // Filter logic
  const filteredHistory = history.filter(item => {
    const matchesSearch =
      item.companyName.toLowerCase().includes(search.toLowerCase()) ||
      item.symbol.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filterRec === 'ALL' || item.recommendation === filterRec;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-xl font-bold text-white tracking-wide">Research Archives</h2>
        <p className="text-xs text-slate-400 mt-1">
          Review previous equity research pipelines compiled by the AI agent
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search archive (e.g. Apple, TSLA, AAPL)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/80 py-2.5 pl-11 pr-4 text-xs text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
          />
        </div>

        {/* Status filters */}
        <div className="flex gap-2">
          {['ALL', 'INVEST', 'PASS'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterRec(type)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                filterRec === type
                  ? 'bg-cyan-500 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {type === 'ALL' ? 'Show All' : type === 'INVEST' ? 'INVEST Only' : 'PASS Only'}
            </button>
          ))}
        </div>

      </div>

      {/* Grid of items */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/10 bg-rose-500/5 p-6 text-center text-xs text-rose-400 max-w-sm mx-auto">
          {error}
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/5 bg-white/[0.01] p-12 text-center text-xs text-slate-500">
          No records found matching search filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredHistory.map((item) => {
            const isInvest = item.recommendation === 'INVEST';
            const dateStr = new Date(item.createdAt || item.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={item._id}
                onClick={() => handleSelectRecord(item)}
                className="glass-card hover-glow border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-48 cursor-pointer bg-slate-950/20"
              >
                {/* Header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-cyan-400 tracking-wider">
                      {item.symbol}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      {dateStr}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white truncate max-w-[200px]" title={item.companyName}>
                    {item.companyName}
                  </h3>
                </div>

                {/* Summary snippet */}
                <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                  {item.summary}
                </p>

                {/* Footer status & Actions */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-3.5">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                      isInvest
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      {isInvest ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {item.recommendation}
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-400">
                      {item.confidence}% Conf
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleDelete(e, item._id)}
                      className="p-1.5 rounded-lg border border-white/5 text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-all"
                      title="Delete Analysis"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="p-1.5 rounded-lg border border-white/5 text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
