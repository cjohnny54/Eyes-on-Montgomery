import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock data generator (same as server.ts)
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
  // NOTE: Bright Data MCP scraping via 'npx' is not supported in Vercel Serverless Functions.
  // For Vercel deployment, we default to Demo/Cache mode or recommend a separate Scraper Service.
  
  res.json({
    success: true,
    status: 'demo',
    message: 'Live Bright Data scraping via MCP is currently available only in Docker/Local environments. Vercel deployment uses demo pulse data.',
    data: getMockSentimentData()
  });
}
