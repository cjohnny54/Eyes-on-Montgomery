import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Sparkles, MessageSquare, AlertTriangle, TrendingUp, Zap, CheckCircle2, Info, ArrowUpRight, BrainCircuit } from 'lucide-react';
import { getAIInsights, askAIQuestion } from './services/aiService';
import { cn } from './utils';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface DashboardStats {
  byDistrict: Record<string, number>;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  totalWithDistrict: number;
}

interface StructuredInsight {
  type: string;
  title: string;
  summary: string;
  points: string[];
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  probability?: string;
}

export function AIDashboard({ dateRange = 'Last 30 Days' }: { dateRange?: string }) {
  const [activeAITab, setActiveAITab] = useState<'insights' | 'ask'>('insights');
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<StructuredInsight[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo stats for initial load
  const stats: DashboardStats = useMemo(() => ({
    byDistrict: { '1': 450, '2': 380, '3': 520, '4': 290, '5': 410, '6': 350, '7': 280 },
    byType: { 'Pothole': 320, 'Street Light': 180, 'Signage': 150, 'Trash Collection': 410, 'Weeds': 290, 'Other': 850 },
    byCategory: { 'Public Works': 520, 'Sanitation': 480, 'Traffic Engineering': 380, 'Code Enforcement': 320 },
    totalWithDistrict: 2680
  }), []);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    setInsights([]);
    setError(null);

    try {
      const types = ['insights', 'predictions', 'anomalies'] as const;
      const results = await Promise.all(types.map(t => getAIInsights(t, stats)));
      
      const newInsights: StructuredInsight[] = results
        .filter(r => r.success && r.insight)
        .map((r, i) => ({
          ...(r.insight as any),
          type: types[i]
        }));
      
      setInsights(newInsights);
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
    setAnswer('');
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

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'predictions': return <TrendingUp size={18} className="text-cyan-400" />;
      case 'anomalies': return <AlertTriangle size={18} className="text-amber-400" />;
      default: return <Sparkles size={18} className="text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header with Stats Summary */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <BrainCircuit size={28} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">AI Studio</h3>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Montgomery Cognitive Engine 311</p>
          </div>
        </div>
        
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveAITab('insights')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-tight",
              activeAITab === 'insights' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white"
            )}
          >
            Insights & Predictions
          </button>
          <button
            onClick={() => setActiveAITab('ask')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-tight",
              activeAITab === 'ask' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white"
            )}
          >
            Natural Language Query
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-80 bg-[#141415]/50 backdrop-blur-sm rounded-3xl border border-white/10 border-dashed"
          >
            <div className="relative">
              <Loader2 className="h-12 w-12 text-emerald-500/30 animate-spin" />
              <BrainCircuit className="absolute inset-0 m-auto h-6 w-6 text-emerald-400 animate-pulse" />
            </div>
            <p className="mt-6 text-sm font-medium text-slate-400 animate-pulse">Processing Civic Datasets...</p>
          </motion.div>
        ) : activeAITab === 'insights' ? (
          <motion.div 
            key="insights"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="grid gap-6"
          >
            {insights.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative overflow-hidden p-6 bg-[#141415] rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all shadow-xl"
              >
                {/* Decorative Background Icon */}
                <div className="absolute -right-8 -bottom-8 opacity-[0.03] rotate-12 transition-transform group-hover:scale-110">
                  {getInsightIcon(item.type)}
                </div>

                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2.5 rounded-xl border",
                      item.type === 'anomalies' ? "bg-amber-500/10 border-amber-500/20" : 
                      item.type === 'predictions' ? "bg-cyan-500/10 border-cyan-500/20" : 
                      "bg-emerald-500/10 border-emerald-500/20"
                    )}>
                      {getInsightIcon(item.type)}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-0.5">Automated {item.type}</span>
                      <h4 className="text-base font-semibold text-white">{item.title}</h4>
                    </div>
                  </div>

                  {item.severity && (
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold border",
                      item.severity === 'HIGH' ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                      item.severity === 'MEDIUM' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                      "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    )}>
                      {item.severity} SEVERITY
                    </span>
                  )}
                  {item.probability && (
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">PROBABILITY</span>
                      <span className="text-sm font-bold text-cyan-400">{item.probability}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Info size={14} className="text-slate-500 mt-1 flex-shrink-0" />
                    <p className="text-sm text-slate-400 italic">{item.summary}</p>
                  </div>
                  
                  <div className="grid gap-2 pl-4">
                    {item.points.map((point, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-3">
                        <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-300">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
            
            <button
              onClick={loadInsights}
              className="mt-4 flex items-center justify-center gap-2 p-4 rounded-2xl border border-white/10 bg-white/[0.02] text-slate-400 text-sm font-semibold hover:bg-white/5 hover:text-white transition-all group"
            >
              <Zap size={16} className="group-hover:text-emerald-400 transition-colors" />
              Re-evaluate Civic Intelligence
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="ask"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
              <form onSubmit={handleQuery} className="relative flex gap-3 p-2 bg-[#141415] border border-white/10 rounded-2xl shadow-2xl">
                <div className="flex-1 relative">
                  <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask about district trends, service hotspots, or predictions..."
                    className="w-full h-14 pl-12 pr-4 bg-transparent text-white placeholder:text-slate-600 focus:outline-none text-base"
                  />
                </div>
                <button
                  type="submit"
                  disabled={queryLoading || !question.trim()}
                  className="px-8 h-14 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[120px]"
                >
                  {queryLoading ? <Loader2 className="animate-spin" size={20} /> : (
                    <div className="flex items-center gap-2">
                      RUN QUERY <ArrowUpRight size={16} />
                    </div>
                  )}
                </button>
              </form>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mr-2">Suggested:</span>
              {['Highest complaint district?', 'Volume predictions for next week', 'Summarize District 3 hotspots'].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs text-slate-400 hover:border-emerald-500/30 hover:text-emerald-400 transition-all font-medium"
                >
                  {q}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {answer && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative overflow-hidden p-8 bg-[#141415] rounded-3xl border border-emerald-500/20 shadow-2xl"
                >
                  <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                    <Sparkles size={18} className="text-emerald-400" />
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Intelligence Feed Output</span>
                  </div>
                  
                  <p className="text-base text-slate-200 leading-relaxed whitespace-pre-line font-medium mb-6">
                    {answer}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                       <button className="text-[10px] font-bold text-slate-500 hover:text-white uppercase transition-colors">Copy Result</button>
                       <span className="text-slate-800">|</span>
                       <button className="text-[10px] font-bold text-slate-500 hover:text-white uppercase transition-colors">Export Report</button>
                    </div>
                    <span className="text-[9px] font-mono text-slate-700">QUERY_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}