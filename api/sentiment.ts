import type { VercelRequest, VercelResponse } from '@vercel/node';

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const sentimentCache = new Map<string, { data: any; timestamp: number }>();

async function callGemini(prompt: string, model: string = "gemini-3.1-pro-preview"): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";
}

async function scrapeBrightData(query: string, apiKey: string): Promise<any[]> {
  // Common SERP zone name patterns in Bright Data
  const zonesToTry = [
    process.env.BRIGHT_DATA_ZONE,
    'mcp_browser',
    'serp_api1',
    'serp_api_1',
    'google',
    'google_search',
    'default',
    'main'
  ].filter(Boolean) as string[];
  
  // Try both the simplified endpoint and the explicit one
  const url = `https://api.brightdata.com/request?brd_json=1`;
  
  for (const zone of zonesToTry) {
    try {
      console.log(`[Scraper] Attempting scrape with zone: ${zone}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          zone: zone,
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en`,
          format: 'json'
        })
      });

      const body = await response.text();
      
      if (response.ok) {
        try {
          const data = JSON.parse(body);
          if (data && data.organic) {
            console.log(`[Scraper] SUCCESS using zone ${zone}: Found ${data.organic.length} results`);
            return data.organic;
          }
        } catch (e) {
          console.warn(`[Scraper] Zone ${zone} returned non-JSON: ${body.substring(0, 500)}`);
        }
      } else {
        console.warn(`[Scraper] Zone "${zone}" failed | Status: ${response.status} | Msg: ${body}`);
        // If we get an "invalid zone" error specifically, we know this zone is wrong
        // but if we get "unauthorized", there might be a key issue.
      }
    } catch (err) {
      console.error(`[Scraper] System error for zone ${zone}:`, err);
    }
  }

  return [];
}

function getMockSentimentData() {
  return {
    sentimentScore: 47,
    trend: 'stable',
    topKeywords: ['traffic', 'roads', 'safety', 'crime', 'potholes', 'garbage', 'community'],
    quotes: [
      { text: "The potholes on East South Boulevard have been terrible for months.", source: "Reddit r/Montgomery" },
      { text: "New police chief seems to be making progress.", source: "WSFA News" },
      { text: "Trash pickup has been inconsistent in the Garden District.", source: "Nextdoor Montgomery" }
    ]
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userKeywords } = req.body;
    const brightDataKey = process.env.BRIGHT_DATA_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!brightDataKey || !geminiKey) {
      return res.json({
        success: true,
        status: 'demo',
        message: 'Missing API keys (BRIGHT_DATA_API_KEY or GEMINI_API_KEY). Using demo data.',
        data: getMockSentimentData()
      });
    }

    const cacheKey = `sentiment-${userKeywords || 'default'}`;
    const cached = sentimentCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({ success: true, status: 'live', data: cached.data, cached: true });
    }

    const baseKeywords = userKeywords || "Montgomery Alabama city services";
    const queries = [
      `site:reddit.com/r/montgomery ${baseKeywords}`,
      `site:al.com Montgomery AL ${baseKeywords}`,
      `site:wsfa.com Montgomery AL ${baseKeywords}`
    ];

    let allResults: any[] = [];
    for (const query of queries) {
      const results = await scrapeBrightData(query, brightDataKey);
      allResults = [...allResults, ...results];
    }

    if (allResults.length === 0) {
      throw new Error("No results found from Bright Data");
    }

    const textContent = allResults.slice(0, 15).map(r => 
      `[${r.link}] ${r.title}: ${r.snippet || r.description || ''}`
    ).join('\n').substring(0, 8000);

    const prompt = `You are a civic sentiment analyst for Montgomery, Alabama. Analyze the following scraped web content and extract public sentiment about Montgomery city services.

Scraped content:
${textContent}

Respond with ONLY a JSON object:
{
  "sentimentScore": <number 0-100>,
  "trend": "<improving|worsening|stable>",
  "topKeywords": ["link1", "link2", "link3", "link4", "link5"],
  "quotes": [{"text": "quote", "source": "sourceName"}]
}`;

    const geminiResponse = await callGemini(prompt);
    const firstBrace = geminiResponse.indexOf('{');
    const lastBrace = geminiResponse.lastIndexOf('}');
    const analysisData = JSON.parse(geminiResponse.substring(firstBrace, lastBrace + 1));

    sentimentCache.set(cacheKey, { data: analysisData, timestamp: Date.now() });

    res.json({
      success: true,
      status: 'live',
      message: `Analyzed ${allResults.length} live results`,
      data: analysisData
    });

  } catch (error: any) {
    console.error("Sentiment production error:", error);
    res.json({
      success: true,
      status: 'warning',
      message: `Production scraper failed: ${error.message}. Showing demo data.`,
      data: getMockSentimentData()
    });
  }
}
