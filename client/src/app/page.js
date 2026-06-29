'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Search, Sparkles, Star, History, Compass, ArrowRight, Loader2, X } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  
  // Autocomplete states
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  const dropdownRef = useRef(null);

  const [userEmail, setUserEmail] = useState('guest@alphainvest.ai');

  useEffect(() => {
    // Load favorites and recent searches from localStorage
    const storedUser = localStorage.getItem('alphainvest_user');
    const email = storedUser ? JSON.parse(storedUser).email : 'guest@alphainvest.ai';
    setUserEmail(email);

    const savedFavs = localStorage.getItem(`alphainvest_favorites_${email}`);
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const savedRecents = localStorage.getItem(`alphainvest_recents_${email}`);
    if (savedRecents) setRecentSearches(JSON.parse(savedRecents));
  }, []);

  // Debounced search suggestions fetch
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await axios.get(`/api/research/suggest?q=${encodeURIComponent(query)}`);
        if (res.data?.success) {
          setSuggestions(res.data.suggestions || []);
        }
      } catch (err) {
        console.error('Failed to load search suggestions:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 250); // 250ms debounce delay

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Click outside suggestions dropdown handler to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Save to recents
    saveRecentSearch(query.trim());
    
    // Redirect to dashboard
    router.push(`/dashboard?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSelectSuggestion = (item) => {
    // We can search directly by their exact resolved name or symbol!
    // Searching by symbol guarantees immediate resolution on backend.
    const searchTerm = item.symbol;
    saveRecentSearch(item.name);
    setQuery(item.name);
    setShowSuggestions(false);
    router.push(`/dashboard?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleQuickSearch = (term) => {
    saveRecentSearch(term);
    router.push(`/dashboard?q=${encodeURIComponent(term)}`);
  };

  const saveRecentSearch = (term) => {
    let recents = [...recentSearches];
    recents = recents.filter(item => item.toLowerCase() !== term.toLowerCase());
    recents.unshift(term);
    recents = recents.slice(0, 5); // Keep top 5
    setRecentSearches(recents);
    localStorage.setItem(`alphainvest_recents_${userEmail}`, JSON.stringify(recents));
  };

  const removeRecentSearch = (e, term) => {
    e.stopPropagation();
    const updated = recentSearches.filter(item => item !== term);
    setRecentSearches(updated);
    localStorage.setItem(`alphainvest_recents_${userEmail}`, JSON.stringify(updated));
  };

  const popularSymbols = [
    { name: 'Apple', symbol: 'AAPL' },
    { name: 'NVIDIA', symbol: 'NVDA' },
    { name: 'Tesla', symbol: 'TSLA' },
    { name: 'Microsoft', symbol: 'MSFT' },
    { name: 'Reliance', symbol: 'RELIANCE.NS' },
    { name: 'Infosys', symbol: 'INFY' }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] py-10 space-y-12">
      
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-4xl font-extrabold sm:text-5xl tracking-tight text-white">
          Institutional-Grade <br />
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
            AI Investment Research
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Type any public company name or stock ticker. Our multi-agent LangGraph pipeline aggregates real-time financials, sentiment news, and balance sheet risks to deliver an objective recommendation.
        </p>
      </div>

      {/* Main Search Bar Form with Autocomplete */}
      <div className="w-full max-w-xl relative" ref={dropdownRef}>
        <form onSubmit={handleSearchSubmit} className="w-full">
          <div className="relative group">
            {/* Pulsing ring glow */}
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 opacity-20 blur-lg group-focus-within:opacity-40 transition-all duration-300" />
            
            {/* Input body */}
            <div className="relative flex items-center rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-md p-1.5 focus-within:border-cyan-500/50">
              <Search className="h-5 w-5 text-slate-500 ml-4" />
              <input
                type="text"
                placeholder="Search company (e.g., Apple, NVIDIA, Tesla, Infosys...)"
                value={query}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                className="flex-1 bg-transparent px-3 py-3.5 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
              />
              
              {loadingSuggestions && (
                <Loader2 className="h-4 w-4 text-cyan-400 animate-spin mr-2" />
              )}
              
              <button
                type="submit"
                className="inline-flex h-11 sm:h-12 items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 text-xs sm:text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-md shadow-cyan-500/20"
              >
                Analyze
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Autocomplete Dropdown List */}
        {showSuggestions && (query.trim().length >= 2) && (
          <div className="absolute left-0 right-0 top-full mt-2.5 z-30 rounded-2xl border border-white/10 bg-[#0e1322] overflow-hidden shadow-2xl max-h-64 overflow-y-auto divide-y divide-white/5">
            {suggestions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 italic">
                {loadingSuggestions ? 'Loading matches...' : 'No stock matches found.'}
              </div>
            ) : (
              suggestions.map((item) => (
                <div
                  key={item.symbol}
                  onClick={() => handleSelectSuggestion(item)}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-white/5 cursor-pointer transition-colors duration-150 group"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                      {item.symbol}
                    </span>
                    <span className="text-xs text-slate-300 group-hover:text-white truncate max-w-[280px]">
                      {item.name}
                    </span>
                  </div>
                  <span className="rounded bg-white/5 border border-white/5 px-2 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-300">
                    {item.exchange}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Quick-Search Tags */}
      <div className="w-full max-w-xl space-y-3">
        <h4 className="text-[10px] font-bold tracking-wider text-slate-500 uppercase text-center flex items-center justify-center gap-1.5">
          <Compass className="h-3 w-3" />
          Popular Queries
        </h4>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {popularSymbols.map((item) => (
            <button
              key={item.symbol}
              onClick={() => handleQuickSearch(item.name)}
              className="rounded-full border border-white/5 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:text-white"
            >
              {item.name} ({item.symbol.replace('.NS', '')})
            </button>
          ))}
        </div>
      </div>

      {/* Favorites & Recent Search Sections */}
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 pt-6">
        
        {/* Recent Searches */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 tracking-wider uppercase flex items-center gap-2">
            <History className="h-4 w-4 text-cyan-400" />
            Recent Analyses
          </h3>
          {recentSearches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/5 bg-white/[0.01] p-6 text-center text-xs text-slate-500">
              No recent searches recorded.
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-2 divide-y divide-white/5">
              {recentSearches.map((term, index) => (
                <div
                  key={index}
                  onClick={() => handleQuickSearch(term)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors duration-150 rounded-xl group"
                >
                  <span className="text-sm text-slate-300 group-hover:text-white font-medium">{term}</span>
                  <button
                    onClick={(e) => removeRecentSearch(e, term)}
                    className="text-xs text-slate-500 hover:text-rose-400 font-semibold px-2 py-1"
                  >
                    Clear
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Favorite Companies */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 tracking-wider uppercase flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" />
            Watchlist / Favorites
          </h3>
          {favorites.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/5 bg-white/[0.01] p-6 text-center text-xs text-slate-500">
              No companies added to your watchlist.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {favorites.map((fav) => (
                <div
                  key={fav.symbol}
                  onClick={() => handleQuickSearch(fav.symbol)}
                  className="glass-card hover-glow rounded-xl p-3 border border-white/5 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-bold tracking-wider">{fav.symbol}</span>
                    <span className="text-xs font-semibold text-white truncate max-w-[120px]">{fav.name}</span>
                  </div>
                  <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    fav.recommendation === 'INVEST' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {fav.recommendation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
