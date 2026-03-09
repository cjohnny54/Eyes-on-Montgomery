# Montgomery Safety Lens: Reality vs Perception

This document outlines the architecture, data sources, and methodologies used to power the Montgomery Safety Lens dashboard. It explains how disparate data streams are combined to analyze the gap between actual safety incidents and public perception.

## Setup & Architecture

The application is built using a modern full-stack architecture:

- **Frontend:** React 18, Vite, Tailwind CSS, Recharts for data visualization, and Lucide for iconography.
- **Backend:** Node.js with Express, serving as a proxy for external APIs to prevent CORS issues and protect API keys.
- **AI Integration:** Google Gemini API (`@google/genai`) for natural language processing and sentiment analysis.
- **Data Scraping:** Bright Data API for real-time social media data collection.

### Required Environment Variables

To run this project, you will need to set the following environment variables (see `.env.example`):

```env
GEMINI_API_KEY=your_gemini_key
BRIGHT_DATA_API_KEY=your_bright_data_key
BRIGHT_DATA_COLLECTOR_ID=c_m7z...
```

## Data Sources & Acquisition

### 1. Montgomery Open Data Portal
- **Source:** [opendata.montgomeryal.gov](https://opendata.montgomeryal.gov/)
- **How it was obtained:** Accessed via public ArcGIS REST APIs and embedded iframes provided by the city.
- **Usage:** Provides the foundational layers for the Live Crime Map, 911 Calls, and 311 Service Requests.

### 2. Social Media Sentiment (X/Twitter)
- **Source:** Bright Data Web Scraper API
- **How it was obtained:** A custom Express backend route triggers a Bright Data collector job. The job scrapes recent posts related to Montgomery, AL traffic and safety. The raw JSON output is then polled and retrieved.
- **Usage:** The raw text is fed into the Gemini AI model to extract a normalized "Perception Score" (0-100) and identify trending keywords.

### 3. Simulated District Metrics
- **Source:** Internal Mock Data Generator
- **How it was obtained:** Generated algorithmically to represent the 9 city council districts.
- **Usage:** Used to calculate the "Misalignment Index" (Perceived Risk minus Actual Risk) to demonstrate the core value proposition of the dashboard.

## Map Creation & Integration

The maps in this application utilize a hybrid approach, combining embedded official city maps with custom data visualizations.

### Official City Maps
The **Live Crime Map**, **911 Calls**, and **311 Requests** tabs embed official ArcGIS dashboards from the Montgomery Open Data Portal via iframes. This ensures the data is authoritative, real-time, and requires zero maintenance of spatial databases on our end.

### Custom District Map
The **District Map** (SVG-based) was created by mapping the 9 City Council districts. It combines the simulated *Actual Risk* (derived from 911/311 density) with the *Perceived Risk* (derived from Bright Data/Gemini sentiment analysis) to color-code areas based on their Misalignment Index.

## System Architecture

1. **External Sources:** Montgomery Open Data Portal & Social Media (X) via Bright Data Scraper.
2. **Processing Layer:** Direct iFrame Embeds for maps, and an Express backend to handle Bright Data API polling.
3. **AI Layer:** Gemini AI processes the scraped social media text to generate sentiment scores and keywords.
4. **Frontend Dashboard:** React dashboard combines the actual data with AI sentiment to calculate the Misalignment Index and display it to the user.

## Useful Information

- **Misalignment Index:** Calculated as `Perceived Risk - Actual Risk`. A positive number means citizens feel less safe than the data suggests.
- **Fallback Mechanism:** If the Bright Data scraper times out or fails (e.g., due to rate limits), the backend automatically asks Gemini to generate a realistic, context-aware fallback sentiment report based on the requested keywords.
- **Proxy Metrics:** Due to restricted access to detailed crash databases, 911 calls (filtered by specific categories) and 311 traffic engineering requests are used as proxies for traffic safety issues.
