import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Sparkles, MessageSquare, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { getAIInsights, askAIQuestion } from './services/aiService';
import { cn } from './utils';

// Types
interface DashboardStats {
  byDistrict: Record<string, number>;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  totalWithDistrict: number;
}

export function AIDashboard({ dateRange = 'Last 30 Days' }: { dateRange?: string }) {
  const [activeAITab, setActiveAITab] = useState<'insights' | 'ask'>('insights');
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<{ type: string; text: string }[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo stats for initial load - in production, fetch from API
  const stats: DashboardStats = useMemo(() => ({
    byDistrict: { '1': 450, '2': 380, '3': 520, '4': 290, '5': 410, '6': 350, '7': 280 },
    byType: { 'Pothole': 320, 'Street Light': 180, 'Signage': 150, 'Trash Collection': 410, 'Weeds': 290, 'Other': 850 },
    byCategory: { 'Public Works': 520, 'Sanitation': 480, 'Traffic Engineering': 380, 'Code Enforcement': 320 },
    totalWithDistrict: 2680
  }), []);

  // Load AI insights on mount
  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get insights
      const insightsResult = await getAIInsights('insights', stats);
      if (insightsResult.success) {
        setInsights([{ type: 'insights', text: insightsResult.insight || '' }]);
      }

      // Get predictions
      const predResult = await getAIInsights('predictions', stats);
      if (predResult.success) {
        setInsights(prev => [...prev, { type: 'predictions', text: predResult.insight || '' }]);
      }

      // Get anomalies
      const anomResult = await getAIInsights('anomalies', stats);
      if (anomResult.success) {
        setInsights(prev => [...prev, { type: 'anomalies', text: anomResult.insight || '' }]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setQueryLoading(true);
    try {
      const result = await askAIQuestion(question, stats);
      if (result.success) {
        setAnswer(result.answer || '');
      } else {
        setError(result.error || 'Failed to get answer');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setQueryLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'predictions': return <TrendingUp size={16} className="text-cyan-400" />;
      case 'anomalies': return <AlertTriangle size={16} className="text-amber-400" />;
      default: return <Sparkles size={16} className="text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveAITab('insights')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeAITab === 'insights'
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
          )}
        >
          <Sparkles size={16} />
          AI Insights
        </button>
        <button
          onClick={() => setActiveAITab('ask')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeAITab === 'ask'
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
          )}
        >
          <MessageSquare size={16} />
          Ask AI
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 bg-[#141415] rounded-2xl border border-white/10">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mb-4" />
          <p className="text-sm text-slate-400">Analyzing civic data...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* AI Insights Tab */}
      {!loading && activeAITab === 'insights' && (
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold text-white">AI-Powered Analysis</h3>
          {insights.map((item, idx) => (
            <div key={idx} className="p-5 bg-[#141415] rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                {getTypeIcon(item.type)}
                <span className="text-xs font-mono text-slate-500 uppercase">{item.type}</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {item.text}
              </p>
            </div>
          ))}
          <button
            onClick={loadInsights}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-all"
          >
            <Zap size={14} />
            Refresh Insights
          </button>
        </div>
      )}

      {/* Ask AI Tab */}
      {!loading && activeAITab === 'ask' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Ask About Montgomery Data</h3>

          <form onSubmit={handleQuery} className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., Which district has the worst response time?"
              className="flex-1 h-12 px-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
            <button
              type="submit"
              disabled={queryLoading || !question.trim()}
              className="px-6 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {queryLoading ? <Loader2 className="animate-spin" size={18} /> : 'Ask'}
            </button>
          </form>

          {/* Example Questions */}
          <div className="flex flex-wrap gap-2">
            {['Which district has the most complaints?', "What's trending this month?", 'Compare districts 1 and 5'].map((q) => (
              <button
                key={q}
                onClick={() => setQuestion(q)}
                className="px-3 py-1.5 rounded-full bg-white/5 text-xs text-slate-400 hover:bg-white/10 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Answer Display */}
          {answer && (
            <div className="p-5 bg-[#141415] rounded-2xl border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-emerald-400" />
                <span className="text-xs font-mono text-emerald-400 uppercase">Answer</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {answer}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}