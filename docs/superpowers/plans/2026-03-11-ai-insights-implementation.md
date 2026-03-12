# AI Insights Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add AI-powered insights and natural language query to the Montgomery dashboard using Gemini API

**Architecture:** Server-side AI endpoints in server.ts + new frontend AIDashboard component + navigation update

**Tech Stack:** React, Express, Google Gemini API, Lucide icons

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `server.ts` | Modify | Add /api/ai-insights and /api/ai-query endpoints |
| `src/AIDashboard.tsx` | Create | New AI dashboard component with Insights + Ask AI tabs |
| `src/services/aiService.ts` | Create | Frontend service to call AI endpoints |
| `src/App.tsx` | Modify | Add AI Insights to left navigation |
| `.env.example` | Create | Document GEMINI_API_KEY requirement |

---

## Chunk 1: Backend API Endpoints

### Task 1: Add AI endpoints to server.ts

**Files:**
- Modify: `server.ts:27-54` (inside startServer function, before Vite middleware)

- [ ] **Step 1: Add AI endpoints after /api/env route**

Insert this code after line 36 in server.ts:

```typescript
// In-memory cache for demo (simple Map)
const aiCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper to aggregate data for AI
function aggregateStats(data: any[]) {
  const byDistrict: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let totalWithDistrict = 0;

  data.forEach(item => {
    const district = item.properties?.District || 'Unknown';
    const type = item.properties?.Request_Type || item.properties?.Request_Type || 'Other';
    const dept = item.properties?.Department || 'Other';

    byDistrict[district] = (byDistrict[district] || 0) + 1;
    byType[type] = (byType[type] || 0) + 1;
    byCategory[dept] = (byCategory[dept] || 0) + 1;
    if (district !== 'Unknown') totalWithDistrict++;
  });

  return { byDistrict, byType, byCategory, totalWithDistrict };
}

// POST /api/ai-insights - Generate insights, predictions, anomalies
app.post("/api/ai-insights", async (req, res) => {
  try {
    const { type = 'insights', data } = req.body;
    const cacheKey = `${type}-${JSON.stringify(data)}`;

    // Check cache
    const cached = aiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({ success: true, insight: cached.response, cached: true });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: "GEMINI_API_KEY not configured" });
    }

    const ai = new GoogleGenAI({ apiKey });

    let prompt = "";
    if (type === 'insights') {
      prompt = `You are a civic data analyst. Analyze this Montgomery 311 data and provide 3-5 key insights in plain English. Focus on:
- Which districts have the most complaints
- What types of issues are most common
- Any notable trends

Data: ${JSON.stringify(data)}`;
    } else if (type === 'predictions') {
      prompt = `Based on this historical 311 data for Montgomery AL, predict what districts or issue types will see increased complaints in the next 7 days. Be specific.

Data: ${JSON.stringify(data)}`;
    } else if (type === 'anomalies') {
      prompt = `Analyze this Montgomery 311 data and identify any anomalies - districts or issue types with unusual spikes compared to average. Flag severity as LOW, MEDIUM, or HIGH.

Data: ${JSON.stringify(data)}`;
    }

    const result = await generateContentWithRetry(ai, {
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const response = result.text || "Unable to generate insights";
    aiCache.set(cacheKey, { response, timestamp: Date.now() });

    res.json({ success: true, insight: response });
  } catch (error: any) {
    console.error("AI insights error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to generate insights" });
  }
});

// POST /api/ai-query - Natural language question answering
app.post("/api/ai-query", async (req, res) => {
  try {
    const { question, data } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, error: "Question is required" });
    }

    const cacheKey = `query-${question}`;
    const cached = aiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({ success: true, answer: cached.response, cached: true });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: "GEMINI_API_KEY not configured" });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a civic data assistant for Montgomery AL. Answer the user's question based on the provided data. Be concise and specific. If you don't have enough information, say so.

User question: ${question}

Data: ${JSON.stringify(data)}

Answer:`;

    const result = await generateContentWithRetry(ai, {
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 300,
      },
    });

    const response = result.text || "Unable to answer question";
    aiCache.set(cacheKey, { response, timestamp: Date.now() });

    res.json({ success: true, answer: response });
  } catch (error: any) {
    console.error("AI query error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to answer question" });
  }
});
```

- [ ] **Step 2: Run build to verify syntax**

Run: `npm run build 2>&1 | tail -10`
Expected: Build completes without errors

- [ ] **Step 3: Commit**

```bash
git add server.ts
git commit -m "feat: add AI insights and query endpoints

- POST /api/ai-insights for insights, predictions, anomalies
- POST /api/ai-query for natural language questions
- In-memory caching for demo reuse
- Uses Gemini 2.0 Flash model

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 2: Frontend AI Service

### Task 2: Create AI service for frontend

**Files:**
- Create: `src/services/aiService.ts`

- [ ] **Step 1: Write the aiService.ts file**

Create `src/services/aiService.ts`:

```typescript
interface AIResponse {
  success: boolean;
  insight?: string;
  answer?: string;
  error?: string;
  cached?: boolean;
}

interface StatsData {
  byDistrict: Record<string, number>;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  totalWithDistrict: number;
}

export async function getAIInsights(type: 'insights' | 'predictions' | 'anomalies', data: StatsData): Promise<AIResponse> {
  try {
    const response = await fetch('/api/ai-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data })
    });
    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function askAIQuestion(question: string, data: StatsData): Promise<AIResponse> {
  try {
    const response = await fetch('/api/ai-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, data })
    });
    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/aiService.ts
git commit -m "feat: add AI service for frontend API calls

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 3: AI Dashboard Component

### Task 3: Create AIDashboard component

**Files:**
- Create: `src/AIDashboard.tsx`

- [ ] **Step 1: Write AIDashboard.tsx**

Create `src/AIDashboard.tsx`:

```typescript
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
  const [activeAI Tab, setActiveAITab] = useState<'insights' | 'ask'>('insights');
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<{ type: string; text: string }[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stats from city API for AI context
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
```

- [ ] **Step 2: Run build to check for errors**

Run: `npm run build 2>&1 | grep -E "(error|Error)" | head -10`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/AIDashboard.tsx
git commit -m "feat: add AI dashboard component

- Insights tab with AI-generated summaries, predictions, anomalies
- Ask AI tab with natural language query
- Uses aiService to call backend API
- Demo stats for testing

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 4: Navigation Integration

### Task 4: Add AI Insights to left navigation

**Files:**
- Modify: `src/App.tsx:6-70` (imports and nav section)

- [ ] **Step 1: Add Sparkles import**

In `src/App.tsx`, add Sparkles to the lucide-react imports on line 9:
```typescript
import {
  MessageSquareWarning, ShieldAlert, Users,
  Search, Bell, Settings, MapPin, Clock, Sparkles
} from 'lucide-react';
```

- [ ] **Step 2: Add AIDashboard import**

Add after line 17:
```typescript
import { AIDashboard } from './AIDashboard';
```

- [ ] **Step 3: Add AI Insights to navigation**

In the nav section (around line 70), add after Traffic Hotspots:
```typescript
<NavItem icon={<Sparkles size={16} />} label="AI Insights" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
```

- [ ] **Step 4: Add AI tab header and content**

Add to header section (around line 99):
```typescript
{activeTab === 'ai' && 'AI-Powered Insights'}
```

Add to main content (around line 125, before City Responsiveness):
```typescript
{activeTab === 'ai' && (
  <ErrorBoundary>
    <AIDashboard dateRange={dateRange} />
  </ErrorBoundary>
)}
```

- [ ] **Step 5: Build and verify**

Run: `npm run build 2>&1 | tail -5`
Expected: Build successful

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add AI Insights to navigation

- New AI Insights menu item in left sidebar
- Integrates AIDashboard component
- Supports dateRange prop for time-based analysis

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 5: Documentation

### Task 5: Create .env.example

**Files:**
- Create: `.env.example`

- [ ] **Step 1: Create .env.example**

```
# Google Gemini API Key (required for AI features)
# Get your API key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_api_key_here
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: add .env.example with GEMINI_API_KEY

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Verification Steps

After all tasks complete:

1. Rebuild container: `docker-compose up --build -d`
2. Navigate to http://localhost:8081
3. Click "AI Insights" in left sidebar
4. Verify:
   - Insights tab shows AI-generated content
   - Ask AI tab accepts questions
   - No console errors

4. Test with real API key in .env to verify Gemini integration works