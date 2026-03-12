interface SentimentData {
  sentimentScore: number;
  trend: 'improving' | 'worsening' | 'stable';
  topKeywords: string[];
  quotes: {
    text: string;
    source: string;
  }[];
}

interface SentimentResponse {
  success: boolean;
  status?: string;
  message?: string;
  data: SentimentData;
}

export async function fetchSentiment(userKeywords?: string): Promise<SentimentResponse> {
  try {
    const response = await fetch('/api/sentiment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userKeywords })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();

    // The server always returns { success, status, message, data }
    return {
      success: result.success ?? true,
      status: result.status,
      message: result.message,
      data: result.data
    };
  } catch (error: any) {
    return {
      success: false,
      status: 'error',
      message: error.message || 'Network error',
      data: {
        sentimentScore: 47,
        trend: 'stable',
        topKeywords: ['traffic', 'roads', 'safety', 'crime', 'potholes'],
        quotes: []
      }
    };
  }
}