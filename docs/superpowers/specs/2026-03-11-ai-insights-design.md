# AI Insights Design Specification

## Overview

Add AI-powered features to the Montgomery City Responsiveness dashboard using Google Gemini 3. The feature set includes predictive analytics, anomaly detection, automated insights, and natural language querying.

## Data Sources

- **311 Service Requests:** 207,630 records (Dec 2020 - present)
- **Code Violations:** 78,943 records
- **API Limit:** 2000 records per query (requires pagination for full dataset)

## Architecture

### Backend (server.ts)

Two new API endpoints:

```typescript
// POST /api/ai-insights
// Body: { type: 'insights' | 'predictions' | 'anomalies', data: AggregatedStats }
// Response: AI-generated insights, predictions, or anomaly alerts

// POST /api/ai-query
// Body: { question: string, data: AggregatedStats }
// Response: Natural language answer to user question
```

### Frontend

New component: `src/AIDashboard.tsx`

Left nav: New "AI Insights" menu item with:
- **Insights** tab - Automated summaries and anomaly detection
- **Ask AI** tab - Natural language query interface

### Token Strategy

- Send aggregated stats to Gemini (not raw 207K records)
- Estimate: ~700-1500 tokens per query
- Cache responses in memory for demo reuse

## Functionality

### 1. AI Insights Tab

**Automated Summaries:**
- "District 3 has seen a 40% spike in pothole complaints this month"
- "Sanitation complaints are down 15% citywide compared to last month"

**Anomaly Detection:**
- Identify districts with unusual complaint spikes
- Flag emerging trends early

**Predictive Analytics:**
- Forecast hotspots for next 7/14/30 days based on historical patterns
- "Expect increased traffic complaints in District 2 next week"

### 2. Ask AI Tab

Natural language queries:
- "Which district has the worst response time?"
- "What's causing the most complaints in District 5?"
- "Show me the trend for pothole complaints"

### Data Aggregation

Before sending to Gemini, aggregate:
- Requests by district (last 30 days, 90 days, year)
- Requests by type/category
- Average resolution time by district
- Month-over-month comparisons
- Year-over-year comparisons

## UI/UX

### Layout

```
Left Nav:
├── District Incidents
├── 311 Service Requests
├── City Responsiveness
├── Traffic Hotspots
└── AI Insights ▼
    ├── Insights
    └── Ask AI
```

### AI Insights Tab

- Summary cards showing key AI-generated insights
- Prediction charts (optional)
- Anomaly alerts with severity indicators

### Ask AI Tab

- Search bar with keyboard shortcut `/`
- Results appear below in natural language
- Example questions shown as suggestions

## Acceptance Criteria

1. New "AI Insights" menu item appears in left navigation
2. Clicking shows Insights and Ask AI tabs
3. AI Insights displays at least 3 automated summaries
4. Anomaly detection identifies districts with unusual activity
5. Ask AI accepts plain English questions and returns relevant answers
6. Token usage stays under 2000 tokens per request
7. Works with existing live data from city APIs

## Out of Scope

- Real-time streaming responses
- Persistent caching (demo-only, in-memory)
- Historical data beyond 30 days for detailed analysis
- Multi-turn conversational memory