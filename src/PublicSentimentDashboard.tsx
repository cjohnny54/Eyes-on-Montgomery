import React, { useState, useEffect } from 'react';
import { MessageSquareWarning, TrendingUp, TrendingDown, Minus, Loader2, AlertCircle, Search, Quote } from 'lucide-react';
import { cn } from './utils';

interface SentimentData {
  sentimentScore: number;
  trend: 'improving' | 'worsening' | 'stable';
  topKeywords: string[];
  quotes: {
    text: string;
    source: string;
  }[];
}

export function PublicSentimentDashboard() {
  const [data, setData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [userKeywords, setUserKeywords] = useState('');

  const fetchSentiment = async () => {
    setLoading(true);
    setError(null);
    setWarning(null);
    try {
      const response = await fetch('/api/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userKeywords })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch sentiment data');
      }

      if (result.status === 'warning') {
        setWarning(result.message);
      }

      setData(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentiment();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-white/10 bg-[#141415] p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-emerald-500/10 p-3 mt-1">
            <MessageSquareWarning className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Public Sentiment Analysis</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              This dashboard aggregates public sentiment from social media, news comments, and community forums using the Bright Data MCP. It provides a real-time pulse on community concerns regarding safety and traffic.
            </p>
            <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">How is this score calculated?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The <strong>Overall Sentiment Score (0-100)</strong> is derived by analyzing the ratio of positive, neutral, and negative keywords in recent public discourse. 
                <br/><br/>
                A score of <strong>50</strong> represents neutral sentiment. Scores <strong>above 50</strong> indicate positive perception (e.g., praise for police presence, feeling safe), while scores <strong>below 50</strong> indicate negative perception (e.g., complaints about noise, traffic, or crime). The <strong>Current Trend</strong> compares the latest batch of data against the 30-day moving average.
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
                  onKeyDown={(e) => e.key === 'Enter' && fetchSentiment()}
                  className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <button 
                onClick={fetchSentiment}
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

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-rose-400 mb-1">Error Fetching Data</h4>
            <p className="text-xs text-rose-400/80">{error}</p>
            <p className="text-xs text-slate-400 mt-2">
              Make sure you have added the <code className="bg-black/30 px-1 py-0.5 rounded">BRIGHT_DATA_API_KEY</code> and <code className="bg-black/30 px-1 py-0.5 rounded">BRIGHT_DATA_COLLECTOR_ID</code> to your environment variables.
            </p>
          </div>
        </div>
      ) : null}

      {warning ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-400 mb-1">Using Fallback Data</h4>
            <p className="text-xs text-amber-400/80">{warning}</p>
          </div>
        </div>
      ) : null}

      {data ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/10 bg-[#141415] p-5 flex flex-col items-center justify-center text-center">
              <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">Overall Sentiment Score</h4>
              <div className="text-5xl font-light text-white mb-2">{data.sentimentScore}</div>
              <p className="text-xs text-slate-400">Out of 100 (Higher is better)</p>
            </div>

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

          {data.quotes && data.quotes.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#141415] p-6">
              <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Quote className="h-4 w-4" />
                Ground Truth / Community Voices
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
