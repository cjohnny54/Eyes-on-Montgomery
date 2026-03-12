# Montgomery Voice Sentiment Dashboard Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan.

**Goal:** Add "Montgomery Voice" menu item to left sidebar that scrapes social media/news/forums using Bright Data MCP and displays sentiment analysis using Gemini 3.

**Architecture:** Frontend React dashboard with Express backend. Check for Bright Data env vars on mount - if missing, show mock data with demo banner. Scraped content analyzed via Gemini 3 through backend API.

**Tech Stack:** React 18, Express, Bright Data API, Gemini 3 Flash Preview, Vite

---

## Bright Data Sources

The following data sources will be scraped for Montgomery, AL sentiment:

| Source | Query Pattern |
|--------|---------------|
| Reddit | `site:reddit.com/r/montgomery AL "pothole" OR "crime" OR "trash" OR "safety"` |
| X/Twitter | `site:x.com Montgomery Alabama "pothole" OR "crime" OR "mayor"` |
| Nextdoor | `site:nextdoor.com Montgomery AL "safety" OR "trash" OR "noise"` |
| WSFA (News) | `site:wsfa.com Montgomery AL "infrastructure" OR "crime" OR "mayor"` |
| AL.com | `site:al.com Montgomery AL "paving" OR "shooting" OR "mayor"` |
| City-Data Forums | `site:city-data.com/forum Montgomery AL "mayor" OR "police"` |

**Sentiment Categories:**
- Public Safety/Crime: crime, police, shooting, robbery, security, fire
- Sanitation/Litter: trash, garbage, litter, pickup, sanitation, dumping
- Infrastructure/Potholes: pothole, road, street, paving, bridge, traffic
- City Management: mayor, reed, city council, city management, priority

---

## Task Status

### ✅ Completed Tasks

| Task | Description | Status |
|------|-------------|--------|
| 1 | Add sentiment analysis API endpoint to server.ts | ✅ Completed |
| 3 | Create sentiment service (src/services/sentimentService.ts) | ✅ Completed |
| 5 | Create mock data file (src/data/mockSentimentData.ts) | ✅ Completed |
| 7 | Create Montgomery Voice Dashboard component | ✅ Completed |
| 9 | Add navigation item to sidebar | ✅ Completed |

### ⏳ Pending Tasks

| Task | Description | Status |
|------|-------------|--------|
| 11 | Verify complete integration - Start server, test API, verify UI | ⏳ Pending |

---

## File Structure

```
src/
├── App.tsx                                    # ✅ Modified - nav item added
├── MontgomeryVoiceDashboard.tsx              # ✅ Created
├── services/
│   ├── sentimentService.ts                    # ✅ Created
│   └── brightData.ts                          # Exists
├── data/
│   └── mockSentimentData.ts                   # ✅ Created
server.ts                                       # ✅ Modified - API endpoint added
```

---

## Implementation Summary

### Files Created:
1. `src/services/sentimentService.ts` - Service to call /api/sentiment endpoint
2. `src/data/mockSentimentData.ts` - Mock data for demo mode
3. `src/MontgomeryVoiceDashboard.tsx` - Main dashboard component

### Files Modified:
1. `server.ts` - Added POST /api/sentiment endpoint
2. `src/App.tsx` - Added "Montgomery Voice" nav item

---

## Environment Variables Required

For live Bright Data integration, set these environment variables:

```bash
VITE_BRIGHT_DATA_API_KEY=your_api_key
VITE_BRIGHT_DATA_COLLECTOR_ID=your_collector_id
GEMINI_API_KEY=your_gemini_key
```

Without these, the dashboard runs in demo mode with mock data.

---

## Next Steps

1. Start the server: `npm run dev`
2. Navigate to http://localhost:3000
3. Click "Montgomery Voice" in sidebar
4. Verify demo mode banner appears with mock data
5. Configure Bright Data credentials for live data integration