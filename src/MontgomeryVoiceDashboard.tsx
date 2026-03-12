import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertCircle,
  Search,
  Quote,
  Heart
} from 'lucide-react';
import { cn } from './utils';
import { fetchSentiment } from './services/sentimentService';

interface SentimentData {
  sentimentScore: number;
  trend: 'improving' | 'worsening' | 'stable';
  topKeywords: string[];
  quotes: {
    text: string;
    source: string;
  }[];
}

export function MontgomeryVoiceDashboard({ dateRange = 'Last 30 Days' }: { dateRange?: string }) {
  const [data, setData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [userKeywords, setUserKeywords] = useState('');
  const [dataStatus, setDataStatus] = useState<'live' | 'demo' | 'warning' | 'error'>('demo');

  const fetchSentimentData = async () => {
    setLoading(true);
    setError(null);
    setStatusMessage(null);
    try {
      const result = await fetchSentiment(userKeywords);

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch sentiment data');
      }

      setDataStatus((result.status as any) || 'demo');
      if (result.message) {
        setStatusMessage(result.message);
      }

      setData(result.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setDataStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentimentData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Status Banner */}
      {dataStatus === 'live' && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mt-1.5" />
          <div>
            <h4 className="text-sm font-medium text-emerald-400 mb-1">Live Data</h4>
            <p className="text-xs text-emerald-400/80">
              {statusMessage || 'Sentiment data scraped from live sources via Bright Data.'}
            </p>
          </div>
        </div>
      )}

      {dataStatus === 'demo' && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-400 mb-1">Demo Mode</h4>
            <p className="text-xs text-amber-400/80">
              {statusMessage || 'Showing mock data. Configure BRIGHT_DATA_API_KEY in .env for live scraping.'}
            </p>
          </div>
        </div>
      )}

      {dataStatus === 'warning' && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-400 mb-1">Using Fallback Data</h4>
            <p className="text-xs text-amber-400/80">
              {statusMessage || 'Live scraping encountered an issue. Showing cached data.'}
            </p>
          </div>
        </div>
      )}

      {/* Main Header Card */}
      <div className="rounded-2xl border border-white/10 bg-[#141415] p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-emerald-500/10 p-3 mt-1">
            <Heart className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Montgomery Voice</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              This dashboard aggregates public sentiment from social media, news comments, and community forums using Bright Data MCP. It provides a real-time pulse on community concerns.
            </p>
            <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">How is this score calculated?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The <strong>Overall Sentiment Score (0-100)</strong> is derived by analyzing positive, neutral, and negative keywords in recent public discourse.
                <br /><br />
                A score of <strong>50</strong> represents neutral sentiment. Scores <strong>above 50</strong> indicate positive perception (e.g., praise for initiatives, feeling safe), while scores <strong>below 50</strong> indicate negative perception (e.g., complaints about infrastructure, crime).
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. traffic, safety, downtown, schools"
                  value={userKeywords}
                  onChange={(e) => setUserKeywords(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchSentimentData()}
                  className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <button
                onClick={fetchSentimentData}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Analyze Sentiment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-rose-400 mb-1">Error Fetching Data</h4>
            <p className="text-xs text-rose-400/80">{error}</p>
          </div>
        </div>
      ) : null}

      {/* Data Display */}
      {data ? (
        <div className="flex flex-col gap-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Sentiment Score */}
            <div className="rounded-2xl border border-white/10 bg-[#141415] p-5 flex flex-col items-center justify-center text-center">
              <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">Overall Sentiment Score</h4>
              <div className="text-5xl font-light text-white mb-2">{data.sentimentScore}</div>
              <p className="text-xs text-slate-400">Out of 100 (Higher is better)</p>
            </div>

            {/* Current Trend */}
            <div className="rounded-2xl border border-white/10 bg-[#141415] p-5 flex flex-col items-center justify-center text-center">
              <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">Current Trend</h4>
              <div className={cn(
                "flex items-center justify-center h-16 w-16 rounded-full mb-3",
                data.trend === 'improving' ? "bg-emerald-500/10 text-emerald-400" :
                data.trend === 'worsening' ? "bg-rose-500/10 text-rose-400" :
                "bg-blue-500/10 text-blue-400"
              )}>
                {data.trend === 'improving' ? <TrendingUp className="h-8 w-8" /> :
                 data.trend === 'worsening' ? <TrendingDown className="h-8 w-8" /> :
                 <Minus className="h-8 w-8" />}
              </div>
              <p className="text-sm font-medium text-white capitalize">{data.trend}</p>
            </div>

            {/* Top Keywords */}
            <div className="rounded-2xl border border-white/10 bg-[#141415] p-5">
              <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4 text-center">Top Keywords</h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {data.topKeywords.map((keyword, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Community Voices */}
          {data.quotes && data.quotes.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#141415] p-6">
              <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Quote className="h-4 w-4" />
                Community Voices
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.quotes.map((quote, idx) => (
                  <div key={idx} className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <p className="text-sm text-slate-300 italic mb-3 leading-relaxed">"{quote.text}"</p>
                    <p className="text-xs text-slate-500 font-medium">— {quote.source}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[200px] rounded-2xl border border-white/10 bg-[#141415] border-dashed">
          <Loader2 className="h-8 w-8 text-slate-600 animate-spin mb-4" />
          <p className="text-xs text-slate-400">Loading sentiment data...</p>
        </div>
      )}
    </div>
  );
}