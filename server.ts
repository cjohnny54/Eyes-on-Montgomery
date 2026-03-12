import express from "express";
import "dotenv/config";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

async function generateContentWithRetry(ai: GoogleGenAI, params: any, maxRetries = 3): Promise<GenerateContentResponse> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      const isRetryable = error?.status === 'UNAVAILABLE' || 
                          error?.message?.includes('503') || 
                          error?.message?.includes('429') ||
                          error?.message?.includes('UNAVAILABLE');
      if (isRetryable && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
        console.log(`Gemini API error (${error.status || '503/429'}). Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/env", (req, res) => {
    res.json(process.env);
  });

  // In-memory cache for demo (simple Map)
  const aiCache = new Map<string, { response: string; timestamp: number }>();
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // POST /api/ai-insights - Generate insights, predictions, anomalies
  app.post("/api/ai-insights", async (req, res) => {
    try {
      const { type = 'insights', data } = req.body;
      const cacheKey = `${type}-${JSON.stringify(data)}`;

      // Check cache
      const cached = aiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return res.json({ success: true, insight: cached.response, cached: true });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ success: false, error: "GEMINI_API_KEY not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });

      let prompt = "";
      if (type === 'insights') {
        prompt = `You are a civic data analyst. Analyze this Montgomery 311 data and provide 3-5 key insights in plain English. Focus on:
- Which districts have the most complaints
- What types of issues are most common
- Any notable trends

Data: ${JSON.stringify(data)}`;
      } else if (type === 'predictions') {
        prompt = `Based on this historical 311 data for Montgomery AL, predict what districts or issue types will see increased complaints in the next 7 days. Be specific.

Data: ${JSON.stringify(data)}`;
      } else if (type === 'anomalies') {
        prompt = `Analyze this Montgomery 311 data and identify any anomalies - districts or issue types with unusual spikes compared to average. Flag severity as LOW, MEDIUM, or HIGH.

Data: ${JSON.stringify(data)}`;
      }

      const result = await generateContentWithRetry(ai, {
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      });

      const response = result.text || "Unable to generate insights";
      aiCache.set(cacheKey, { response, timestamp: Date.now() });

      res.json({ success: true, insight: response });
    } catch (error: any) {
      console.error("AI insights error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to generate insights" });
    }
  });

  // POST /api/ai-query - Natural language question answering
  app.post("/api/ai-query", async (req, res) => {
    try {
      const { question, data } = req.body;
      if (!question) {
        return res.status(400).json({ success: false, error: "Question is required" });
      }

      const cacheKey = `query-${question}`;
      const cached = aiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return res.json({ success: true, answer: cached.response, cached: true });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ success: false, error: "GEMINI_API_KEY not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are a civic data assistant for Montgomery AL. Answer the user's question based on the provided data. Be concise and specific. If you don't have enough information, say so.

User question: ${question}

Data: ${JSON.stringify(data)}

Answer:`;

      const result = await generateContentWithRetry(ai, {
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      });

      const response = result.text || "Unable to answer question";
      aiCache.set(cacheKey, { response, timestamp: Date.now() });

      res.json({ success: true, answer: response });
    } catch (error: any) {
      console.error("AI query error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to answer question" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
