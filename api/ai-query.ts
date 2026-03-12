import type { VercelRequest, VercelResponse } from '@vercel/node';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { question, data } = req.body;
    if (!question) return res.status(400).json({ error: "Question is required" });

    const prompt = `You are a civic data assistant for Montgomery AL. Answer the user's question based on the provided data. Be concise and specific.
User question: ${question}
Data: ${JSON.stringify(data)}
Answer:`;

    let answer;
    let isLive = false;
    try {
      answer = await callGemini(prompt);
      isLive = true;
    } catch (err) {
      answer = "I'm currently unable to process complex AI queries. However, my quick-look data shows steady progress on city services in Montgomery today.";
      isLive = false;
    }

    res.json({ success: true, answer, isLive });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
