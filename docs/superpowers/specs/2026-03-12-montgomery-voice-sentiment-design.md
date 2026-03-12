# Montgomery Voice Sentiment Dashboard - Design Specification

## Overview
Add a "Montgomery Voice" menu item to the left sidebar that scrapes social media, news, and public forums using Bright Data MCP to display community sentiment about Montgomery, AL.

## Architecture

### Menu Integration
- **Location**: Left sidebar, between "Traffic Hotspots" and "AI Insights"
- **Icon**: MessageSquare or Heart icon from lucide-react
- **Label**: "Montgomery Voice"

### Environment Detection
- Check for `VITE_BRIGHT_DATA_API_KEY` and `VITE_BRIGHT_DATA_COLLECTOR_ID` on mount
- If missing: Display demo mode with mock data and visible banner

### Data Modes
1. **Live Mode** (env vars present):
   - Call Bright Data API to scrape specified sources
   - Use Gemini 3 Flash for sentiment analysis
   - Store results in local state

2. **Demo Mode** (env vars missing):
   - Display "Mock data for demo purposes" banner
   - Show realistic mock sentiment data
   - Allow UI exploration without API credentials

## Data Sources

### Bright Data Queries
| Source | Query Pattern |
|--------|---------------|
| Reddit | `site:reddit.com/r/montgomery AL "pothole" OR "crime" OR "trash" OR "safety"` |
| X/Twitter | `site:x.com Montgomery Alabama "pothole" OR "crime" OR "mayor"` |
| Nextdoor | `site:nextdoor.com Montgomery AL "safety" OR "trash" OR "noise"` |
| WSFA | `site:wsfa.com Montgomery AL "infrastructure" OR "crime" OR "mayor"` |
| AL.com | `site:al.com Montgomery AL "paving" OR "shooting" OR "mayor"` |
| City-Data | `site:city-data.com/forum Montgomery AL "mayor" OR "police"` |

### Categories for Sentiment Analysis
- **Public Safety/Crime**: crime, police, shooting, robbery, security, fire, law enforcement
- **Sanitation/Litter**: trash, garbage, litter, pickup, sanitation, dumping
- **Infrastructure/Potholes**: pothole, road, street, paving, bridge, traffic
- **City Management**: mayor, reed, city council, city management, priority

## UI Components

### 1. Header Card
- Title: "Public Sentiment Analysis"
- Description explaining sentiment score calculation
- "How is this score calculated?" collapsible section
- Search input for custom keyword analysis
- "Analyze Sentiment" button

### 2. Error/Warning Banners
- Error banner: Missing API credentials with instructions
- Warning banner: When using fallback/mock data

### 3. Stats Row (3 columns)
- **Overall Sentiment Score**: 0-100 scale (50 = neutral)
- **Current Trend**: improving/worsening/stable with icon
- **Top Keywords**: Pill badges showing most frequent terms

### 4. Category Breakdown
- 4 cards showing sentiment per category
- Each card: category name, sentiment count, trend

### 5. Community Voices Section
- Grid of quote cards (2 columns on desktop)
- Each card shows:
  - Actual text from scraped content
  - Source (Reddit, X, WSFA, etc.)
  - Sentiment indicator
  - Category tag

## Gemini 3 Integration

### Model
- `gemini-3-flash-preview` (via existing AI service)

### Analysis Prompt
For each scraped content:
1. Extract sentiment (positive/neutral/negative)
2. Categorize into one of 4 categories
3. Generate 1-2 sentence summary
4. Extract key entities/topics

### Fallback
If Gemini 3 unavailable, use keyword-based sentiment:
- Positive keywords: success, improvement, appointed, graduate, progress, safety, love, safe, good, better, strong, growth
- Negative keywords: crime, shooting, wages, increase, litter, trash, garbage, pothole, hate, avoid, problem, unresolved

## File Changes

| File | Action |
|------|--------|
| `src/App.tsx` | Add "Montgomery Voice" nav item, import new dashboard |
| `src/MontgomeryVoiceDashboard.tsx` | Create main dashboard component |
| `src/services/brightData.ts` | Create Bright Data API client service |
| `src/data/mockSentimentData.ts` | Create mock data for demo mode |

## Acceptance Criteria

1. ✅ "Montgomery Voice" appears in left sidebar navigation
2. ✅ Clicking navigates to new dashboard
3. ✅ If env vars missing: Shows "Mock data for demo" banner prominently
4. ✅ If env vars present: Attempts to scrape via Bright Data API
5. ✅ Dashboard displays: sentiment score, trend, keywords, categories, quotes
6. ✅ UI matches existing dark theme and design patterns
7. ✅ Uses `gemini-3-flash-preview` for AI analysis when available
8. ✅ Component renders without errors in both modes