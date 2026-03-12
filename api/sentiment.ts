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

async function scrapeBrightData(query: string, apiKey: string): Promise<any | any[]> {
  const zonesToTry = [
    process.env.BRIGHT_DATA_ZONE,
    'mcp_unlocker',
    'mcp_browser'
  ].filter(Boolean) as string[];
  
  const url = `https://api.brightdata.com/request`;
  
  for (const zone of zonesToTry) {
    try {
      console.log(`[Scraper] Probing zone: ${zone}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          zone: zone,
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          format: 'json' // Try to get structured first
        })
      });

      const body = await response.text();
      
      if (response.ok && body.length > 100) {
        try {
          const data = JSON.parse(body);
          // 1. Check for SERP Organic results
          if (data.organic && Array.isArray(data.organic) && data.organic.length > 0) {
            console.log(`[Scraper] SUCCESS: Found ${data.organic.length} SERP results in ${zone}`);
            return data.organic;
          }
          // 2. Check for general wrapped content
          const block = data.content || data.html || data.results;
          if (block) {
            console.log(`[Scraper] SUCCESS: Found wrapped content in ${zone}`);
            return typeof block === 'string' ? block : JSON.stringify(block);
          }
          // 3. Last ditch: return the whole JSON as text for Gemini
          console.log(`[Scraper] SUCCESS: Using raw JSON response from ${zone}`);
          return body;
        } catch (e) {
          // If not JSON but looks like HTML
          if (body.toLowerCase().includes('<html') || body.length > 500) {
            console.log(`[Scraper] SUCCESS: Found raw HTML/text in ${zone} (${body.length} chars)`);
            return body;
          }
        }
      } else {
        console.warn(`[Scraper] Zone "${zone}" ignored. Status: ${response.status}. Body: ${body.substring(0, 200)}`);
      }
    } catch (err) {
      console.error(`[Scraper] Critical connection error for ${zone}:`, err);
    }
  }

  return null;
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
    // Combine queries into a single search to stay within Vercel's 10s timeout
    const broadQuery = `${baseKeywords} Montgomery Alabama (site:reddit.com OR site:al.com OR site:wsfa.com)`;
    const results = await scrapeBrightData(broadQuery, brightDataKey);

    if (!results || (Array.isArray(results) && results.length === 0)) {
      console.warn("Scraper returned no data for query:", broadQuery);
      return res.json({
        success: true,
        status: 'warning',
        message: 'No live search results found. Showing demo pulse data.',
        data: getMockSentimentData()
      });
    }

    let textContent = "";
    if (Array.isArray(results)) {
      // Handle structured results from SERP API
      textContent = results.slice(0, 10).map(r => 
        `[${r.link}] ${r.title}: ${r.snippet || r.description || ''}`
      ).join('\n');
    } else {
      // Handle raw HTML from Web Unblocker
      textContent = results.substring(0, 15000); 
    }

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
      message: `Analyzed ${Array.isArray(results) ? results.length : 'document'} live results`,
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
