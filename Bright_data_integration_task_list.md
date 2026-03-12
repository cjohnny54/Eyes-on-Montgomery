# Bright Data Integration - Task List

## Overview
Integration of Bright Data MCP for scraping Montgomery, AL sentiment from social media, news, and public forums.

---

## Tasks

### ✅ Completed Tasks

| # | Task | Description |
|---|------|-------------|
| 1 | Add sentiment API endpoint | Added POST /api/sentiment to server.ts |
| 2 | Create sentiment service | Created src/services/sentimentService.ts |
| 3 | Create mock data file | Created src/data/mockSentimentData.ts |
| 4 | Create dashboard component | Created src/MontgomeryVoiceDashboard.tsx |
| 5 | Add navigation item | Added "Montgomery Voice" to left sidebar in App.tsx |
| 6 | Add header text | Added page title and description |
| 7 | Add conditional rendering | Added ErrorBoundary wrapper for dashboard |

### ⏳ In Progress Tasks

| # | Task | Description | Status |
|---|------|-------------|--------|
| 8 | Verify integration | Start server and test API/UI | ✅ Done |
| 9 | Configure Bright Data credentials | Set environment variables for live scraping | ✅ Done |
| 10 | Test live scraping | Verify Bright Data API integration works | ✅ Done |
| 11 | Add Gemini 3 analysis | Connect scraped content to Gemini 3 for sentiment analysis | ✅ Done |
| 12 | Implement MCP SDK | Switch to official MCP SDK for robust scraping | ✅ Done |

---

## Bright Data Sources

| Source | Query |
|--------|-------|
| Reddit | `site:reddit.com/r/montgomery AL` |
| X/Twitter | `site:x.com Montgomery Alabama` |
| Nextdoor | `site:nextdoor.com Montgomery AL` |
| WSFA News | `site:wsfa.com Montgomery AL` |
| AL.com | `site:al.com Montgomery AL` |
| City-Data Forums | `site:city-data.com/forum Montgomery AL` |

---

## Environment Variables

```bash
# Required for live data
VITE_BRIGHT_DATA_API_KEY=your_api_key
VITE_BRIGHT_DATA_COLLECTOR_ID=your_collector_id
GEMINI_API_KEY=your_gemini_key
```

---

## Files Modified/Created

| File | Action |
|------|--------|
| server.ts | Modified - Added /api/sentiment endpoint |
| src/App.tsx | Modified - Added navigation item |
| src/MontgomeryVoiceDashboard.tsx | Created |
| src/services/sentimentService.ts | Created |
| src/data/mockSentimentData.ts | Created |

---

## Next Action

Start the development server and verify the UI displays correctly:

```bash
npm run dev
```

Then navigate to http://localhost:8080 and click "Montgomery Voice" in the sidebar.