# Plan: Bright Data Sentiment Analysis Integration

## Objective
Add a new "Community Sentiment" menu item to the left sidebar that displays sentiment analysis data scraped from social media, news, and public forums about Montgomery, AL using Bright Data MCP.

---

## Summary

The Bright Data project already has:
- MCP client for scraping Google search results and URL content
- Sentiment analysis with categories (Public Safety, Sanitation, Infrastructure, City Management)
- Database storing scraped feedback with sentiment scores

The Montgomery dashboard will need to:
1. Add new navigation item
2. Create a new Sentiment Dashboard component to display the scraped data
3. Connect to the Bright Data backend API (or replicate the scraping logic)

**Decision Point**:
- **Option C**: (Chosen) Use the official `@modelcontextprotocol/sdk` to spawn the Bright Data MCP server for robust, tool-based scraping. This handles authentication, polling, and structured data extraction automatically.

---

## Implementation Steps

### Step 1: Add Navigation Item
- **File**: `src/App.tsx`
- **Changes**:
  - Import a new icon (e.g., `Heart` or `MessageCircle` from lucide-react)
  - Add `sentiment` to the tab state
  - Add new NavItem between "Traffic Hotspots" and "AI Insights"
  - Add header text for the new tab
  - Add conditional rendering for new SentimentDashboard component

### Step 2: Create Sentiment Dashboard Component
- **File**: `src/SentimentDashboard.tsx` (new)
- **Components to build**:
  - Summary stats cards (Positive/Negative/Neutral counts)
  - Category breakdown chart
  - Timeline view of sentiment over time
  - Source breakdown (Reddit, Twitter, News, etc.)
  - List of recent community feedback items with sentiment scores

### Step 3: Mock Data Integration
- **File**: `src/data/sentimentData.ts` (new)
- Create mock data matching the Bright Data schema for initial development
- This allows the UI to work without requiring the backend to be running

### Step 4: Styling Consistency
- Ensure the new dashboard matches existing dark theme and design patterns

---

## Files to Modify/Create

| File | Action |
|------|--------|
| `src/App.tsx` | Modify - add nav item |
| `src/SentimentDashboard.tsx` | Create - main dashboard component |
| `src/data/sentimentData.ts` | Create - mock data |

---

## Acceptance Criteria

1. New "Community Sentiment" menu item appears in left sidebar
2. Clicking the menu item shows the Sentiment Dashboard
3. Dashboard displays:
   - Overall sentiment distribution (positive/negative/neutral)
   - Category breakdown (Crime, Sanitation, Infrastructure, City Management)
   - List of recent sentiment data with source attribution
4. UI matches existing design patterns (dark theme, emerald accents)
5. Component renders without errors


Bright Data Sources Added

  ┌──────────────────┬────────────────────────────────────────┐
  │      Source      │                 Query                  │
  ├──────────────────┼────────────────────────────────────────┤
  │ Reddit           │ site:reddit.com/r/montgomery AL        │
  ├──────────────────┼────────────────────────────────────────┤
  │ X/Twitter        │ site:x.com Montgomery Alabama          │
  ├──────────────────┼────────────────────────────────────────┤
  │ Nextdoor         │ site:nextdoor.com Montgomery AL        │
  ├──────────────────┼────────────────────────────────────────┤
  │ WSFA News        │ site:wsfa.com Montgomery AL            │
  ├──────────────────┼────────────────────────────────────────┤
  │ AL.com           │ site:al.com Montgomery AL              │
  ├──────────────────┼────────────────────────────────────────┤
  │ City-Data Forums │ site:city-data.com/forum Montgomery AL │
  └──────────────────┴────────────────────────────────────────┘