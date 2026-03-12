interface AIResponse {
  success: boolean;
  insight?: string;
  answer?: string;
  error?: string;
  cached?: boolean;
}

interface StatsData {
  byDistrict: Record<string, number>;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  totalWithDistrict: number;
}

export async function getAIInsights(type: 'insights' | 'predictions' | 'anomalies', data: StatsData): Promise<AIResponse> {
  try {
    const response = await fetch('/api/ai-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data })
    });
    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function askAIQuestion(question: string, data: StatsData): Promise<AIResponse> {
  try {
    const response = await fetch('/api/ai-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, data })
    });
    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}