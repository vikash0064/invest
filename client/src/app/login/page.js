'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle,
  Database,
  Shield,
  TrendingUp,
  Brain
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Google GSI Client SDK loader
  const hasClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && 
                     process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID !== 'your-google-client-id.apps.googleusercontent.com';

  useEffect(() => {
    // If already logged in, redirect to home
    const user = localStorage.getItem('alphainvest_user');
    if (user) {
      router.push('/');
      return;
    }

    if (hasClientId) {
      const loadGsiScript = () => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initializeGoogleSignIn();
        };
        document.body.appendChild(script);
      };
      loadGsiScript();
    }
  }, [router, hasClientId]);

  const initializeGoogleSignIn = () => {
    if (typeof window !== 'undefined' && window.google) {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleAuthCallback,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn-container'),
          { 
            theme: 'filled_dark', 
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'pill'
          }
        );
      } catch (gsiError) {
        console.warn('GSI Init failed:', gsiError.message);
      }
    }
  };

  const handleGoogleAuthCallback = async (response) => {
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('/api/auth/google', {
        idToken: response.credential
      });

      if (res.data?.success) {
        localStorage.setItem('alphainvest_user', JSON.stringify(res.data.user));
        localStorage.setItem('alphainvest_token', res.data.token);
        window.dispatchEvent(new Event('storage'));
        router.push('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Google token validation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && (!name || !confirmPassword))) {
      setError('Please fill in all fields.');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setLoading(true);
    setError('');

    // Simulate authentication
    setTimeout(() => {
      const mockUser = {
        name: isSignUp ? name.toUpperCase() : email.split('@')[0].toUpperCase(),
        email: email,
        avatar: '',
        tier: 'Institutional Tier',
        joinedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        apiCallsUsed: 14,
        apiCallsLimit: 500
      };

      localStorage.setItem('alphainvest_user', JSON.stringify(mockUser));
      localStorage.setItem('alphainvest_token', 'mock_email_token_123456');
      window.dispatchEvent(new Event('storage'));
      setLoading(false);
      router.push('/');
    }, 800);
  };

  const agentNodes = [
    { title: 'Validation Node', desc: 'Queries stock ticker metadata', icon: CheckCircle },
    { title: 'Balance Sheet Node', desc: 'Aggregates multi-year statements', icon: Database },
    { title: 'Sentiment Node', desc: 'Processes real-time news chronologies', icon: TrendingUp },
    { title: 'Synthesis Node', desc: 'Compiles risk and growth vectors', icon: Brain },
  ];

  return (
    <div className="fixed inset-0 flex bg-[#030712] overflow-hidden">
      
      {/* Left Column: Visual Brand Illustration (Visible on large screens) */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative bg-slate-950 border-r border-white/[0.03]">
        
        {/* Glow Spots */}
        <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-slate-900 border border-white/10 shadow-lg">
            <img src="/aequitas_logo.png" alt="Aequitas AI Logo" className="h-full w-full object-cover scale-105" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-white tracking-tight">Aequitas AI</span>
            <span className="text-[10px] font-semibold text-cyan-400/80 tracking-wider uppercase">Equity Intelligence</span>
          </div>
        </div>

        {/* Content Body: Agent Workflow Chart */}
        <div className="space-y-8 max-w-md relative z-10 self-center">
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
              Institutional-Grade <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
                Multi-Agent Intelligence
              </span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Whichever company you search, our 7-node LangGraph pipeline automatically scrapes financial quotes, computes debt ratios, analyzes news sentiments, and synthesizes Swot frameworks in real-time.
            </p>
          </div>

          {/* Workflow flow lines */}
          <div className="relative border-l border-white/5 pl-6 ml-2 space-y-6">
            {agentNodes.map((node, index) => {
              const Icon = node.icon;
              return (
                <div key={index} className="relative flex items-start gap-4">
                  {/* Glowing node point */}
                  <div className="absolute -left-[35px] flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 border border-indigo-500/30 text-indigo-400 shadow shadow-indigo-500/20">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-white leading-none">{node.title}</span>
                    <span className="text-[10px] text-slate-500">{node.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Brand Info */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold border-t border-white/[0.03] pt-6">
          <span>Trusted by Institutional Investors</span>
          <span>© 2026 Aequitas AI Inc.</span>
        </div>

      </div>

      {/* Right Column: Interactive Login/Sign-up Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        
        {/* Glow Spots */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-sm space-y-7 glass-card border border-white/5 bg-[#090d16]/90 p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10">
          
          {/* Form Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-400">
              {isSignUp ? 'Sign up to build your custom research dashboard' : 'Sign in to access your custom research dashboard'}
            </p>
          </div>

          {/* Segmented Controller Tab */}
          <div className="grid grid-cols-2 rounded-xl bg-[#0a0d16] p-1 border border-white/5 shadow-inner">
            <button
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`rounded-lg py-2.5 text-xs font-bold transition-all ${
                !isSignUp ? 'bg-white/[0.04] text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`rounded-lg py-2.5 text-xs font-bold transition-all ${
                isSignUp ? 'bg-white/[0.04] text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-center text-xs font-semibold text-rose-400 animate-shake">
              {error}
            </div>
          )}

          {/* Core Input Form */}
          <form className="space-y-3.5" onSubmit={handleFormSubmit}>
            
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-[#0a0d16] py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500/50 focus:outline-none font-semibold transition-all"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-[#0a0d16] py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500/50 focus:outline-none font-semibold transition-all"
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-[#0a0d16] py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500/50 focus:outline-none font-semibold transition-all"
                required
              />
            </div>

            {isSignUp && (
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-[#0a0d16] py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500/50 focus:outline-none font-semibold transition-all"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex h-11 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/10 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="relative flex py-1 items-center justify-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          {/* Google Sign-In Container */}
          <div className="flex flex-col items-center">
            <div className="flex justify-center w-full min-h-[44px] relative z-10" id="google-signin-btn-container" />
          </div>

          <div className="text-center text-[10px] text-slate-500 font-semibold leading-relaxed pt-1">
            Secure, encrypted authentication provided by Aequitas AI.
          </div>

        </div>

      </div>

    </div>
  );
}
