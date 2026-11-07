import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Users,
  Eye,
  Gift,
  Trophy,
  CheckCircle2,
  Share2,
  TrendingUp,
  Calendar,
  Smartphone,
  Globe,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Copy,
  Check,
  Sparkles,
  Link2,
  AlertCircle,
  BarChart3,
  Layers,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const ADMIN_TOKEN_KEY = 'diwali_admin_session_token';

export const AdminDashboard = ({ onExit }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem(ADMIN_TOKEN_KEY) || '');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data State
  const [range, setRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  // Referral Link Generator State
  const [genName, setGenName] = useState('Deepak Prajapati');
  const [genPrefix, setGenPrefix] = useState('DEEPAK');
  const [generatedLink, setGeneratedLink] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // 1. Verify token on mount if present
  useEffect(() => {
    if (token) {
      fetch(`${API_BASE}/admin/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Session expired');
          return res.json();
        })
        .then(() => fetchStats(range, token))
        .catch(() => {
          sessionStorage.removeItem(ADMIN_TOKEN_KEY);
          setToken('');
        });
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) return;
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        setToken(data.token);
        setPassword('');
        fetchStats(range, data.token);
      } else {
        setLoginError(data.message || 'Invalid administrative credentials');
      }
    } catch (err) {
      setLoginError('Unable to connect to analytics server. Please verify backend status.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken('');
    setStats(null);
  };

  const fetchStats = async (selectedRange = range, authToken = token) => {
    if (!authToken) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/admin/analytics/stats?range=${selectedRange}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data);
      } else {
        setError(data.message || 'Failed to fetch analytics statistics');
      }
    } catch (err) {
      setError('Network error while retrieving analytics data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRangeChange = (newRange) => {
    setRange(newRange);
    fetchStats(newRange);
  };

  const handleGenerateReferral = async (e) => {
    e.preventDefault();
    if (!token) return;
    setIsGenerating(true);

    try {
      const res = await fetch(`${API_BASE}/admin/referrals/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          referrerName: genName,
          customPrefix: genPrefix,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const fullUrl = `${window.location.origin}/?ref=${data.referralCode}`;
        setGeneratedLink({ ...data, fullUrl });
        fetchStats(range); // Refresh referral table
      }
    } catch (err) {
      // ignore
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text, id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  // ==========================================
  // VIEW: ADMIN LOGIN SCREEN
  // ==========================================
  if (!token) {
    return (
      <div className="min-h-screen bg-[#090719] text-[#FFF9ED] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-[#4A1028]/30 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-[#FFD36A]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md luxury-wishes-card p-8 sm:p-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFD36A]/20 to-[#FF8A24]/20 border border-[#FFD36A]/40 flex items-center justify-center mb-4 shadow-lg shadow-[#FFD36A]/10">
            <Lock size={28} className="text-[#FFD36A]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-cinzel font-bold gold-gradient-text tracking-wider mb-2">
            ADMIN PORTAL
          </h2>
          <p className="text-xs sm:text-sm font-outfit text-[#FFF0C2]/75 mb-6">
            Enter administrative password to access visitor analytics and referral intelligence.
          </p>

          {loginError && (
            <div className="w-full mb-4 p-3 rounded-xl bg-red-900/40 border border-red-500/40 flex items-center gap-2 text-xs text-red-200">
              <AlertCircle size={15} className="shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="text-left">
              <label className="block text-[11px] font-cinzel text-[#FFD36A] uppercase tracking-wider mb-1">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-xl bg-[#21103D]/80 border border-[#FFD36A]/40 text-[#FFF9ED] placeholder-[#FFF0C2]/40 text-sm focus:outline-none focus:border-[#FFD36A] focus:ring-1 focus:ring-[#FFD36A] transition-all"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl btn-royal-gold text-xs sm:text-sm font-cinzel font-bold tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Authenticate & Enter</span>
                </>
              )}
            </button>
          </form>

          {onExit && (
            <button
              onClick={onExit}
              className="mt-6 text-xs font-outfit text-[#FFF0C2]/60 hover:text-[#FFD36A] flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Return to Diwali Wonderland</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: FULL ANALYTICS DASHBOARD
  // ==========================================
  const summary = stats?.summary || {
    totalUniqueVisitors: 0,
    totalVisits: 0,
    newVisitors: 0,
    returningVisitors: 0,
    referralVisits: 0,
    giftOpenings: 0,
    gamesStarted: 0,
    gamesCompleted: 0,
    tasksCompleted: 0,
    invitationsShared: 0,
  };

  const dailyStats = stats?.dailyStats || [];
  const topReferrals = stats?.topReferrals || [];
  const maxDailyVisits = Math.max(...dailyStats.map((d) => d.visits), 5);

  return (
    <div className="min-h-screen bg-[#090719] text-[#FFF9ED] flex flex-col p-4 sm:p-6 lg:p-8 font-outfit relative">
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#FFD36A]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD36A]/20 to-[#FF8A24]/20 border border-[#FFD36A]/40 flex items-center justify-center">
            <BarChart3 size={20} className="text-[#FFD36A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-[#FFD36A] tracking-wider">
                DIWALI WONDERLAND
              </h1>
              <span className="text-[10px] font-cinzel px-2 py-0.5 rounded-full bg-[#FFD36A]/10 border border-[#FFD36A]/30 text-[#FFD36A]">
                ANALYTICS & REFERRAL
              </span>
            </div>
            <p className="text-xs text-[#FFF0C2]/70">
              Live Visitor Intelligence • Real-time Interaction Tracking
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Database Connection Pill */}
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-cinzel flex items-center gap-1.5 border ${
              stats?.isDbConnected
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                stats?.isDbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{stats?.isDbConnected ? 'MongoDB Atlas Connected' : 'In-Memory Store (Demo Mode)'}</span>
          </div>

          <button
            onClick={() => fetchStats(range)}
            disabled={isLoading}
            className="p-2 rounded-xl bg-[#21103D] hover:bg-[#321959] border border-[#FFD36A]/30 text-[#FFD36A] transition-all disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>

          {onExit && (
            <button
              onClick={onExit}
              className="px-3.5 py-1.5 rounded-xl bg-[#4A1028] hover:bg-[#611535] border border-[#FFD36A]/40 text-xs font-cinzel font-semibold text-[#FFD36A] flex items-center gap-1.5 transition-all shadow-md"
            >
              <span>🪔</span>
              <span>View Website</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-300 transition-all"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto pt-6 space-y-6">
        {/* Date Range Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#090719]/90 border border-[#FFD36A]/25">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: 'all', label: 'All Time' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleRangeChange(btn.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition-all ${
                  range === btn.id
                    ? 'bg-gradient-to-r from-[#FFD36A] to-[#FF8A24] text-[#090719] shadow-md shadow-[#FFD36A]/20'
                    : 'text-[#FFF0C2]/70 hover:text-[#FFF9ED] hover:bg-[#21103D]/50'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-[#FFF0C2]/60 flex items-center gap-1.5">
            <Calendar size={13} className="text-[#FFD36A]" />
            <span>Updated: {new Date().toLocaleTimeString()}</span>
          </span>
        </div>

        {/* 8 Primary KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Unique Visitors */}
          <div className="p-4 rounded-2xl bg-[#21103D]/50 border border-[#FFD36A]/25 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#FFF0C2]/70 mb-2">
              <span className="text-xs font-cinzel tracking-wider uppercase">Unique Visitors</span>
              <Users size={16} className="text-[#FFD36A]" />
            </div>
            <div className="text-2xl sm:text-3xl font-cinzel font-bold text-[#FFD36A]">
              {summary.totalUniqueVisitors}
            </div>
            <div className="text-[11px] text-[#FFF0C2]/60 mt-1">
              New: {summary.newVisitors} • Returning: {summary.returningVisitors}
            </div>
          </div>

          {/* Card 2: Total Page Views / Visits */}
          <div className="p-4 rounded-2xl bg-[#21103D]/50 border border-[#FFD36A]/25 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#FFF0C2]/70 mb-2">
              <span className="text-xs font-cinzel tracking-wider uppercase">Total Visits</span>
              <Eye size={16} className="text-[#FF8A24]" />
            </div>
            <div className="text-2xl sm:text-3xl font-cinzel font-bold text-[#FFF9ED]">
              {summary.totalVisits}
            </div>
            <div className="text-[11px] text-[#FFF0C2]/60 mt-1">
              Session deduplicated
            </div>
          </div>

          {/* Card 3: Gifts Unlocked */}
          <div className="p-4 rounded-2xl bg-[#21103D]/50 border border-[#FFD36A]/25 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#FFF0C2]/70 mb-2">
              <span className="text-xs font-cinzel tracking-wider uppercase">Gifts Opened</span>
              <Gift size={16} className="text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-cinzel font-bold text-amber-300">
              {summary.giftOpenings}
            </div>
            <div className="text-[11px] text-[#FFF0C2]/60 mt-1">
              Stage 04 Mystery Chest
            </div>
          </div>

          {/* Card 4: Tasks Completed */}
          <div className="p-4 rounded-2xl bg-[#21103D]/50 border border-[#FFD36A]/25 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#FFF0C2]/70 mb-2">
              <span className="text-xs font-cinzel tracking-wider uppercase">Tasks Completed</span>
              <CheckCircle2 size={16} className="text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-cinzel font-bold text-emerald-300">
              {summary.tasksCompleted}
            </div>
            <div className="text-[11px] text-[#FFF0C2]/60 mt-1">
              Games finished: {summary.gamesCompleted}
            </div>
          </div>

          {/* Card 5: Referral Visits */}
          <div className="p-4 rounded-2xl bg-[#21103D]/50 border border-[#FFD36A]/25 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#FFF0C2]/70 mb-2">
              <span className="text-xs font-cinzel tracking-wider uppercase">Referral Traffic</span>
              <Link2 size={16} className="text-[#FFD36A]" />
            </div>
            <div className="text-2xl sm:text-3xl font-cinzel font-bold text-[#FFD36A]">
              {summary.referralVisits}
            </div>
            <div className="text-[11px] text-[#FFF0C2]/60 mt-1">
              Arrived via ?ref= link
            </div>
          </div>

          {/* Card 6: Invitations Shared */}
          <div className="p-4 rounded-2xl bg-[#21103D]/50 border border-[#FFD36A]/25 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#FFF0C2]/70 mb-2">
              <span className="text-xs font-cinzel tracking-wider uppercase">Invitations Shared</span>
              <Share2 size={16} className="text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-cinzel font-bold text-cyan-300">
              {summary.invitationsShared}
            </div>
            <div className="text-[11px] text-[#FFF0C2]/60 mt-1">
              WhatsApp & Native shares
            </div>
          </div>

          {/* Card 7: Games Started */}
          <div className="p-4 rounded-2xl bg-[#21103D]/50 border border-[#FFD36A]/25 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#FFF0C2]/70 mb-2">
              <span className="text-xs font-cinzel tracking-wider uppercase">Games Played</span>
              <Trophy size={16} className="text-[#FF8A24]" />
            </div>
            <div className="text-2xl sm:text-3xl font-cinzel font-bold text-[#FF8A24]">
              {summary.gamesStarted}
            </div>
            <div className="text-[11px] text-[#FFF0C2]/60 mt-1">
              Diyas, Quiz, Rangoli, Fireworks
            </div>
          </div>

          {/* Card 8: Adventure Completion Rate */}
          <div className="p-4 rounded-2xl bg-[#21103D]/50 border border-[#FFD36A]/25 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#FFF0C2]/70 mb-2">
              <span className="text-xs font-cinzel tracking-wider uppercase">Engagement Rate</span>
              <TrendingUp size={16} className="text-purple-300" />
            </div>
            <div className="text-2xl sm:text-3xl font-cinzel font-bold text-purple-300">
              {summary.totalVisits > 0
                ? `${Math.min(100, Math.round((summary.giftOpenings / summary.totalVisits) * 100))}%`
                : '0%'}
            </div>
            <div className="text-[11px] text-[#FFF0C2]/60 mt-1">
              Visit-to-Gift conversion
            </div>
          </div>
        </div>

        {/* Visual Charts & Breakdowns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Chart: Daily Activity Trend */}
          <div className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-[#21103D]/40 border border-[#FFD36A]/20 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-cinzel font-bold text-[#FFD36A]">
                  Daily Visitor & Activity Trends
                </h3>
                <p className="text-xs text-[#FFF0C2]/70">
                  Visits (Golden bars) vs Gift Unlocks (Amber bars)
                </p>
              </div>
            </div>

            {/* Pure SVG & CSS Reactive Bar Chart */}
            <div className="h-48 sm:h-56 w-full flex items-end justify-between gap-2 pt-6 pb-2 border-b border-[#FFD36A]/20">
              {dailyStats.length > 0 ? (
                dailyStats.map((day, idx) => {
                  const visitHeight = Math.max(8, (day.visits / maxDailyVisits) * 100);
                  const giftHeight = Math.max(4, (day.gifts / maxDailyVisits) * 100);

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 px-2.5 py-1.5 rounded-lg bg-[#090719] border border-[#FFD36A]/60 text-[10px] text-[#FFF9ED] whitespace-nowrap shadow-xl">
                        <div className="font-bold text-[#FFD36A]">{day.date}</div>
                        <div>Visits: {day.visits} • Gifts: {day.gifts}</div>
                      </div>

                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        {/* Visit Bar */}
                        <div
                          style={{ height: `${visitHeight}%` }}
                          className="w-1/2 max-w-[14px] rounded-t-md bg-gradient-to-t from-[#FFD36A]/40 to-[#FFD36A] transition-all group-hover:brightness-125"
                        />
                        {/* Gift Bar */}
                        <div
                          style={{ height: `${giftHeight}%` }}
                          className="w-1/2 max-w-[14px] rounded-t-md bg-gradient-to-t from-[#FF8A24]/40 to-[#FF8A24] transition-all group-hover:brightness-125"
                        />
                      </div>
                      <span className="text-[10px] text-[#FFF0C2]/60 mt-2 truncate w-full text-center">
                        {day.label}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[#FFF0C2]/50">
                  No data captured yet for this timeframe.
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-6 mt-3 text-xs text-[#FFF0C2]/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#FFD36A]" />
                <span>Total Visits</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#FF8A24]" />
                <span>Gifts Opened</span>
              </div>
            </div>
          </div>

          {/* Right Chart: Device & Browser Intelligence */}
          <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-[#21103D]/40 border border-[#FFD36A]/20 flex flex-col justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-cinzel font-bold text-[#FFD36A] mb-1">
                Audience Breakdown
              </h3>
              <p className="text-xs text-[#FFF0C2]/70 mb-4">
                Visitor device and browser distribution
              </p>

              {/* Device distribution */}
              <div className="space-y-3 mb-6">
                <span className="text-[11px] font-cinzel uppercase text-[#FFD36A] block">
                  Device Types
                </span>
                {['Mobile', 'Desktop', 'Tablet'].map((dev) => {
                  const count = stats?.deviceBreakdown?.[dev] || 0;
                  const total = summary.totalVisits || 1;
                  const percent = Math.round((count / total) * 100);

                  return (
                    <div key={dev} className="space-y-1">
                      <div className="flex justify-between text-xs text-[#FFF9ED]">
                        <span className="flex items-center gap-1.5">
                          {dev === 'Mobile' ? <Smartphone size={12} /> : <Globe size={12} />}
                          {dev}
                        </span>
                        <span className="text-[#FFD36A]">{count} ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#090719]">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-[#FFD36A] to-[#FF8A24]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Browser tags */}
              <div>
                <span className="text-[11px] font-cinzel uppercase text-[#FFD36A] block mb-2">
                  Top Browsers
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats?.browserBreakdown || {}).map(([b, c]) => (
                    <span
                      key={b}
                      className="px-2.5 py-1 rounded-xl bg-[#090719] border border-[#FFD36A]/20 text-xs text-[#FFF0C2] flex items-center gap-1.5"
                    >
                      <span>{b}:</span>
                      <strong className="text-[#FFD36A]">{c}</strong>
                    </span>
                  ))}
                  {Object.keys(stats?.browserBreakdown || {}).length === 0 && (
                    <span className="text-xs text-[#FFF0C2]/50">Awaiting visitor data...</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Referral Link Generator Card */}
        <div className="p-5 sm:p-6 rounded-3xl luxury-wishes-card border border-[#FFD36A]/30">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles size={20} className="text-[#FFD36A]" />
            <div>
              <h3 className="text-base sm:text-lg font-cinzel font-bold text-[#FFD36A]">
                Royal Referral Link Generator
              </h3>
              <p className="text-xs text-[#FFF0C2]/80">
                Generate new invitation links dynamically with custom inviter attribution.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleGenerateReferral}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
          >
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-cinzel text-[#FFD36A] uppercase mb-1">
                Inviter Display Name
              </label>
              <input
                type="text"
                value={genName}
                onChange={(e) => setGenName(e.target.value)}
                placeholder="e.g. Deepak Prajapati"
                className="w-full px-4 py-2.5 rounded-xl bg-[#21103D] border border-[#FFD36A]/40 text-xs sm:text-sm text-[#FFF9ED] focus:outline-none focus:border-[#FFD36A]"
                required
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[11px] font-cinzel text-[#FFD36A] uppercase mb-1">
                Code Prefix
              </label>
              <input
                type="text"
                value={genPrefix}
                onChange={(e) => setGenPrefix(e.target.value.toUpperCase())}
                placeholder="e.g. DEEPAK"
                maxLength={8}
                className="w-full px-4 py-2.5 rounded-xl bg-[#21103D] border border-[#FFD36A]/40 text-xs sm:text-sm text-[#FFF9ED] uppercase focus:outline-none focus:border-[#FFD36A]"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl btn-royal-gold text-xs sm:text-sm font-cinzel font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {isGenerating ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Link2 size={15} />
                )}
                <span>Generate Link</span>
              </button>
            </div>
          </form>

          {/* Generated Result Banner */}
          {generatedLink && (
            <div className="mt-4 p-4 rounded-2xl bg-[#090719]/90 border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[11px] font-cinzel text-emerald-400 uppercase block font-semibold">
                    Referral Link Ready for {generatedLink.referrerName}:
                  </span>
                  <span className="text-xs sm:text-sm font-mono text-[#FFD36A] break-all">
                    {generatedLink.fullUrl}
                  </span>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(generatedLink.fullUrl, 'generated')}
                className="px-4 py-2 rounded-xl bg-[#FFD36A] text-[#090719] font-cinzel font-bold text-xs flex items-center gap-1.5 shrink-0 hover:bg-[#ffe194] transition-all"
              >
                {copiedCode === 'generated' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedCode === 'generated' ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Top Referral Performance Table */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#21103D]/40 border border-[#FFD36A]/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-cinzel font-bold text-[#FFD36A]">
                Top Referral Sources & Impact
              </h3>
              <p className="text-xs text-[#FFF0C2]/70">
                Track visits, gift openings, and completed tasks per invitation link.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-outfit">
              <thead>
                <tr className="border-b border-[#FFD36A]/20 text-[#FFD36A] font-cinzel uppercase text-[11px]">
                  <th className="py-3 px-3">Referral Code</th>
                  <th className="py-3 px-3">Sender Name</th>
                  <th className="py-3 px-3 text-center">Visits</th>
                  <th className="py-3 px-3 text-center">Gifts Opened</th>
                  <th className="py-3 px-3 text-center">Tasks Completed</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFD36A]/10 text-[#FFF9ED]/90">
                {topReferrals.length > 0 ? (
                  topReferrals.map((ref) => {
                    const link = `${window.location.origin}/?ref=${ref.referralCode}`;
                    return (
                      <tr key={ref.referralCode} className="hover:bg-[#FFD36A]/5 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-[#FFD36A]">
                          {ref.referralCode}
                        </td>
                        <td className="py-3 px-3 font-medium">
                          {ref.referrerName || 'Deepak Prajapati'}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-[#FFF9ED]">
                          {ref.totalVisits}
                        </td>
                        <td className="py-3 px-3 text-center text-amber-300">
                          {ref.giftsOpened || 0}
                        </td>
                        <td className="py-3 px-3 text-center text-emerald-300">
                          {ref.tasksCompleted || 0}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => copyToClipboard(link, ref.referralCode)}
                            className="px-2.5 py-1 rounded-lg border border-[#FFD36A]/30 text-[#FFF0C2] hover:bg-[#FFD36A]/10 text-[11px] inline-flex items-center gap-1 transition-all"
                          >
                            {copiedCode === ref.referralCode ? (
                              <Check size={12} className="text-emerald-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                            <span>{copiedCode === ref.referralCode ? 'Copied' : 'Copy'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#FFF0C2]/50 text-xs">
                      No referral codes recorded yet. Share your first invitation to begin tracking!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
