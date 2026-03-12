# Montgomery City Responsiveness Dashboard - Tutorial

## Welcome to Montgomery Eyes on Our Community

This interactive dashboard provides real-time insights into Montgomery's civic service requests, code violations, traffic issues, and now AI-powered analytics.

---

## Features

### 1. District Incidents Map
**Real-time 311 and Code Violation Mapping**

View live incidents mapped to Montgomery's city council districts. The map displays:
- **311 Service Requests** - Public works, sanitation, and maintenance issues
- **Code Violations** - Nuisance and blight enforcement cases

**How to use:**
- Click on district boundaries to see district details
- Filter by incident type (311 or Traffic/Code)
- Filter by specific district using the dropdown
- Date range selector for historical analysis (30 days, 90 days, Year to Date, 3 Years)

---

### 2. 311 Service Requests
**Historical Analysis of Neighborhood Service Demand**

Explore detailed 311 service request data with:
- **Hex grid visualization** showing service density
- **Category breakdown** (Public Works, Sanitation, Traffic/Safety, Blight/Nuisance)
- **Department-level statistics**

**How to use:**
- Toggle between service categories using the filter buttons
- Hover over hex cells to see request counts
- Use date range selector to compare different time periods

---

### 3. City Responsiveness Metrics
**Analyzing 311 Resolution Speeds**

Track how efficiently the city addresses service requests:
- **Average Resolution Time** - Mean days to close requests
- **Citywide Closure Rate** - Percentage of requests resolved
- **Active Service Requests** - Currently open requests by district

**How to use:**
- View resolution metrics across all departments
- Compare district performance
- Track trends over time with date range selection

---

### 4. Traffic Hotspots
**Identifying High-Priority Traffic Safety Areas**

Analyze traffic-related issues:
- **Traffic Engineering Requests** - Signs, signals, road markings
- **Code Violations** - Traffic-related enforcement
- **Environmental Nuisance** - Noise, dumping, quality of life issues

**How to use:**
- View interactive map with complaint markers
- Filter by dataset type (311 Requests, Code Violations)
- Review top complaint categories and trends

---

### 5. AI Insights (NEW!)
**AI-Powered Civic Intelligence**

Leverage Google Gemini for advanced analytics:

#### Insights Tab
- **Automated Summaries** - AI-generated analysis of complaint patterns
- **Predictions** - Forecast where issues will arise based on historical data
- **Anomaly Detection** - Identify unusual spikes in complaints by district

#### Ask AI Tab
- **Natural Language Query** - Ask questions like:
  - "Which district has the most complaints?"
  - "What's trending this month?"
  - "Compare districts 1 and 5"

**How to use:**
1. Click "AI Insights" in the left sidebar
2. Review the AI-generated insights (they load automatically)
3. Use the "Ask AI" tab to ask custom questions
4. Click example questions for quick queries

---

## Data Sources

All data is pulled live from Montgomery's official open data portals:

| Dataset | Source |
|---------|--------|
| 311 Service Requests | `gis.montgomeryal.gov` - Received 311 Service Requests |
| Code Violations | `gis.montgomeryal.gov` - Code Violations |
| City Council Districts | `gis.montgomeryal.gov` - OneView City Council District |
| AI Analysis | Google Gemini 3 Flash (when configured) |

---

## Getting Started

1. **Explore the Dashboard** - Click through each tab to see different views
2. **Use Date Filters** - Change date ranges to compare time periods
3. **Try AI Insights** - Click "AI Insights" in the sidebar for AI-powered analysis
4. **Ask Questions** - Use the Ask AI tab to query the data in natural language

---

## Tips

- **District Filtering**: Most views allow filtering by specific districts
- **Date Comparison**: Use different date ranges to identify trends
- **AI Context**: AI insights work best with the demo data; configure `GEMINI_API_KEY` for full functionality
- **Live Data**: All data refreshes from city APIs on page load

---

*Montgomery Eyes on Our Community - Service Efficiency Tracker*