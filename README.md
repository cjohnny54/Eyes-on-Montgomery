# Montgomery — Eyes on our Community

This app address Public safety analytics.A civic intelligence dashboard that visualizes **live** 311 service requests, code violations, and traffic data from the City of Montgomery's public GIS APIs. All dashboards are powered by real-time data — no mock or simulated data is used.

## Dashboards & Use Cases (The Story)

This application was built to bridge the gap between open city data and actionable civic intelligence. By exploring the dashboards, judges and users can uncover truthful, data-driven actionable steps to increase safety and quality of life in the City of Montgomery.

### 📍 District Incidents
**Use Case: Democratizing Neighborhood Awareness**
Citizens often wonder, "What is happening in my district compared to others?" This dashboard takes raw 311 and Code Violation coordinates and spatially joins them (via Turf.js inside the browser) to the 9 city council districts. Instead of searching through a spreadsheet, a resident or city council member can instantly see a live map of their district, understand the primary types of incidents (e.g., overgrown lots vs. potholes), and compare their district's incident volume against the rest of the city.

### 👥 311 Service Requests
**Use Case: Mapping Civic Demand**
The city receives thousands of 311 requests, but where is the demand highest? This dashboard provides a geographic heatmap and breakdown of service demand. City planners can filter by date (from the last 30 days up to 3 years) to see whether a sudden spike in requests is a short-term anomaly or a recurring issue. This empowers the city to allocate resources (like sanitation crews or maintenance teams) proactively where they are needed most.

### ⏱️ City Responsiveness
**Use Case: Measuring Government Efficiency & Accountability**
Submitting a 311 request is only half the battle; how fast does the city fix it? The City Responsiveness dashboard calculates the exact time difference between ticket creation and resolution. By visualizing the ratio of Open vs. Closed tickets and the average resolution time across districts, advocacy groups and residents can objectively measure government efficiency. It highlights city departments that are excelling and identifies bottlenecks where citizens are left waiting too long for basic services.

### 🚦 Traffic Hotspots
**Use Case: Identifying Chronic Safety Hazards**
Traffic safety is a top concern for residents. This dashboard zeroes in on Traffic Engineering requests and specific traffic-related code violations. By plotting these on a heatmap and analyzing historic data trends (e.g., viewing data over a 3-year period), the dashboard reveals chronic problem areas. If a specific intersection or street shows recurring 311 requests for traffic issues month after month, it proves that temporary fixes are failing. This hard evidence gives city planners the data they need to justify capital investments for permanent infrastructure improvements, ultimately saving lives.

### 🎙️ Public Sentiment
**Use Case: Reality vs. Perception**
While the other dashboards show what is *actually* happening in the city, the Public Sentiment dashboard captures how citizens *feel*. By leveraging the Bright Data API to ingest live social media and news comments, and using Google Gemini AI to analyze the sentiment, we reveal the gap between reality and perception. If the open data shows a district is safe and responsive, but public sentiment is highly negative, city officials know they have a communication and trust problem to solve, not just an infrastructure problem.

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
