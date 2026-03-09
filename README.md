# Montgomery — Eyes on our Community

A civic intelligence dashboard that visualizes **live** 311 service requests, code violations, and traffic data from the City of Montgomery's public GIS APIs. All dashboards are powered by real-time data — no mock or simulated data is used.

## Live Dashboards

| Dashboard | Data Source | Description |
|---|---|---|
| **District Incidents** | Montgomery GIS (311 + Code Violations) | Maps live incidents to the 9 city council districts with spatial joins |
| **311 Service Requests** | Montgomery GIS (311) | Date-filtered heatmap of neighborhood service demand |
| **City Responsiveness** | Montgomery GIS (311) | Analyzes 311 resolution speeds and open/closed ratios |
| **Traffic Hotspots** | Montgomery GIS (311 + Code Violations) | Identifies high-priority traffic safety and nuisance areas |
| **Public Sentiment** | Bright Data API + Gemini AI | Real-time social media and news sentiment analysis |

## Tech Stack

- **Frontend:** React 18, Vite, Vanilla CSS, Recharts, Leaflet, Lucide icons
- **Backend:** Node.js with Express (API proxy for external services)
- **AI:** Google Gemini API (`@google/genai`) for sentiment analysis
- **Data Scraping:** Bright Data API for social media collection
- **Geospatial:** Turf.js for point-in-polygon district assignment

## Data Sources

### Montgomery Open Data Portal
- **URL:** [opendata.montgomeryal.gov](https://opendata.montgomeryal.gov/)
- **APIs Used:**
  - 311 Service Requests (ArcGIS REST)
  - Code Violations (ArcGIS REST)
  - City Council Districts (GeoJSON)
- **Date Filtering:** All API queries support dynamic date ranges (30 days, 90 days, YTD, 3 years)

### Social Media Sentiment
- **Source:** Bright Data Web Scraper API → Gemini AI
- **Flow:** Raw social posts are collected via Bright Data, then analyzed by Gemini to produce sentiment scores, trend direction, and keyword extraction
- **Fallback:** If Bright Data fails, Gemini generates a context-aware sentiment report

## Environment Variables

Copy `.env.example` to `.env` and set:

```env
GEMINI_API_KEY=your_gemini_key
BRIGHT_DATA_API_KEY=your_bright_data_key
BRIGHT_DATA_COLLECTOR_ID=your_collector_id
```

## Running Locally

```bash
npm install
npm run dev
```

The app will be available at **http://localhost:8081**

## Docker

See [DOCKER_README.md](./DOCKER_README.md) for Docker-based development.

## Architecture

1. **Data Layer:** Montgomery GIS REST APIs provide authoritative, real-time incident data
2. **Geospatial Processing:** Turf.js performs point-in-polygon checks to assign incidents to council districts
3. **AI Layer:** Gemini processes scraped social media text to generate sentiment scores
4. **Frontend:** React dashboard combines live GIS data with AI sentiment for civic insight
