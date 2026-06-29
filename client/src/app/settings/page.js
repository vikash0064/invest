'use client';

import { useState, useEffect } from 'react';
import { 
  Sliders, 
  Key, 
  Bot, 
  Check, 
  Database, 
  Search, 
  Eye, 
  EyeOff, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [useFallback, setUseFallback] = useState(true);
  const [useLocalDb, setUseLocalDb] = useState(true);
  const [llmTickerGuess, setLlmTickerGuess] = useState(true);
  const [suffixStrip, setSuffixStrip] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load local overrides if any
    const savedKey = localStorage.getItem('alphainvest_api_key_override') || '';
    setApiKey(savedKey);

    const savedModel = localStorage.getItem('alphainvest_default_model') || 'gemini-2.5-flash';
    setSelectedModel(savedModel);

    const savedFallback = localStorage.getItem('alphainvest_use_fallback') !== 'false';
    setUseFallback(savedFallback);

    const savedLocalDb = localStorage.getItem('alphainvest_use_local_db') !== 'false';
    setUseLocalDb(savedLocalDb);

    const savedLlmGuess = localStorage.getItem('alphainvest_llm_ticker_guess') !== 'false';
    setLlmTickerGuess(savedLlmGuess);

    const savedSuffix = localStorage.getItem('alphainvest_suffix_strip') !== 'false';
    setSuffixStrip(savedSuffix);
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('alphainvest_api_key_override', apiKey);
    localStorage.setItem('alphainvest_default_model', selectedModel);
    localStorage.setItem('alphainvest_use_fallback', useFallback ? 'true' : 'false');
    localStorage.setItem('alphainvest_use_local_db', useLocalDb ? 'true' : 'false');
    localStorage.setItem('alphainvest_llm_ticker_guess', llmTickerGuess ? 'true' : 'false');
    localStorage.setItem('alphainvest_suffix_strip', suffixStrip ? 'true' : 'false');

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const modelsList = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Default)', speed: 'Fast', accuracy: 'Balanced' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', speed: 'Moderate', accuracy: 'High' },
    { id: 'gpt-4o', name: 'OpenAI GPT-4o (Plugin)', speed: 'Fast', accuracy: 'High' },
    { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Plugin)', speed: 'Fast', accuracy: 'Premium' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure default LLM models, API credentials, and multi-agent pipeline parameters
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Left Side: Summary Panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card border border-white/5 bg-[#090d16]/60 p-5 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-indigo-400" />
              Active System Profile
            </h3>
            
            <div className="text-xs font-semibold space-y-3 pt-2">
              <div className="flex justify-between items-center text-slate-400 border-b border-white/5 pb-2">
                <span>Model Target</span>
                <span className="text-white text-[10px] bg-indigo-500/10 border border-indigo-500/25 rounded px-2 py-0.5 uppercase">
                  {selectedModel.replace('-',' ')}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 border-b border-white/5 pb-2">
                <span>Pipeline Mode</span>
                <span className="text-white">Multi-Agent</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 border-b border-white/5 pb-2">
                <span>Local DB Storage</span>
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                  {useLocalDb ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>API Override</span>
                <span className={apiKey ? 'text-indigo-400' : 'text-slate-500'}>
                  {apiKey ? 'Configured' : 'Env Default'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <button
                onClick={handleSaveSettings}
                className="w-full flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 text-xs font-bold text-white transition-all shadow-md active:scale-95"
              >
                {saved ? <Check className="h-4 w-4" /> : null}
                {saved ? 'Settings Saved' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Options Form */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Section 1: LLM Engine */}
          <div className="glass-card border border-white/5 bg-[#090d16]/40 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white tracking-wide border-b border-white/5 pb-3 flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-400" />
              LLM Engine & API Credentials
            </h3>

            <div className="space-y-4">
              
              {/* API override input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  Gemini API Key Override
                  <HelpCircle className="h-3 w-3 text-slate-500 cursor-help" title="Overrides default backend .env key" />
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showKey ? 'text' : 'password'}
                    placeholder="Enter Custom Gemini Key (Optional)"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-[#0a0d16] py-3 pl-10 pr-12 text-xs text-white placeholder-slate-500 focus:border-indigo-500/50 focus:outline-none font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <span className="block text-[9px] text-slate-500">
                  Leave blank to utilize the system's pre-configured default Gemini API token.
                </span>
              </div>

              {/* Model selection dropdown */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Default Model Target</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-[#0a0d16] p-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500/50 focus:outline-none font-semibold cursor-pointer"
                >
                  {modelsList.map((model) => (
                    <option key={model.id} value={model.id} className="bg-[#0a0d16]">
                      {model.name} — Speed: {model.speed} / Accuracy: {model.accuracy}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Section 2: Pipeline Fallbacks */}
          <div className="glass-card border border-white/5 bg-[#090d16]/40 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white tracking-wide border-b border-white/5 pb-3 flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-400" />
              Fail-safe Pipeline & Storage Controls
            </h3>

            <div className="space-y-4">
              {/* Fail-safe model fallback toggle */}
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-white">Rule-Based Analysis Fallback</h4>
                  <p className="text-[10px] text-slate-500">Run local heuristic calculations when LLM calls fail</p>
                </div>
                <button
                  onClick={() => setUseFallback(!useFallback)}
                  className={`h-6 w-11 rounded-full p-0.5 transition-colors relative border ${
                    useFallback ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-white/5 border-white/10'
                  }`}
                >
                  <span className={`absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all ${
                    useFallback ? 'right-0.5 bg-indigo-500' : 'left-0.5 bg-slate-600'
                  }`} />
                </button>
              </div>

              {/* Local database backup history toggle */}
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-white">JSON File History Storage</h4>
                  <p className="text-[10px] text-slate-500">Store and read history on local storage when MongoDB is offline</p>
                </div>
                <button
                  onClick={() => setUseLocalDb(!useLocalDb)}
                  className={`h-6 w-11 rounded-full p-0.5 transition-colors relative border ${
                    useLocalDb ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-white/5 border-white/10'
                  }`}
                >
                  <span className={`absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all ${
                    useLocalDb ? 'right-0.5 bg-indigo-500' : 'left-0.5 bg-slate-600'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Search Settings */}
          <div className="glass-card border border-white/5 bg-[#090d16]/40 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white tracking-wide border-b border-white/5 pb-3 flex items-center gap-2">
              <Search className="h-5 w-5 text-indigo-400" />
              Stock Resolution Parameters
            </h3>

            <div className="space-y-4">
              
              {/* Corporate suffix strip toggle */}
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-white">Corporate Suffix Preprocessing</h4>
                  <p className="text-[10px] text-slate-500">Automatically clean terms like "Ltd" and "Inc" before search</p>
                </div>
                <button
                  onClick={() => setSuffixStrip(!suffixStrip)}
                  className={`h-6 w-11 rounded-full p-0.5 transition-colors relative border ${
                    suffixStrip ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-white/5 border-white/10'
                  }`}
                >
                  <span className={`absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all ${
                    suffixStrip ? 'right-0.5 bg-indigo-500' : 'left-0.5 bg-slate-600'
                  }`} />
                </button>
              </div>

              {/* LLM ticker guesser fallback */}
              <div className="flex items-center justify-between text-xs py-1.5">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-white">LLM Stock Ticker Guesser</h4>
                  <p className="text-[10px] text-slate-500">Use Gemini to guess stock tickers for misspelled search targets</p>
                </div>
                <button
                  onClick={() => setLlmTickerGuess(!llmTickerGuess)}
                  className={`h-6 w-11 rounded-full p-0.5 transition-colors relative border ${
                    llmTickerGuess ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-white/5 border-white/10'
                  }`}
                >
                  <span className={`absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all ${
                    llmTickerGuess ? 'right-0.5 bg-indigo-500' : 'left-0.5 bg-slate-600'
                  }`} />
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
