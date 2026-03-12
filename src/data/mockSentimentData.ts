export const mockSentimentData = {
  sentimentScore: 47,
  trend: 'stable' as const,
  topKeywords: ['traffic', 'roads', 'safety', 'crime', 'potholes', 'garbage', 'community'],
  quotes: [
    {
      text: "The potholes on East South Boulevard have been terrible for months. Multiple flat tires reported.",
      source: "Reddit r/Montgomery"
    },
    {
      text: "New police chief seems to be making progress on community outreach programs.",
      source: "WSFA News"
    },
    {
      text: "Trash pickup has been inconsistent in the Garden District area. Missed two weeks in a row.",
      source: "Nextdoor Montgomery"
    },
    {
      text: "Traffic lights on Atlanta Highway need better timing. Sitting for 10+ minutes at empty intersections.",
      source: "Reddit r/Montgomery"
    },
    {
      text: "Mayor Reed's new infrastructure initiative shows promise but needs faster execution.",
      source: "AL.com"
    },
    {
      text: "Downtown area is getting cleaner. Appreciate the increased sanitation budget.",
      source: "Nextdoor Montgomery"
    },
    {
      text: "Crime rates in certain neighborhoods remain a concern. Need more patrol presence.",
      source: "Reddit r/Montgomery"
    },
    {
      text: "Bridge repair on I85 has caused massive delays. Wish they would work on weekends.",
      source: "X/Twitter"
    }
  ]
};

export const categories = [
  { name: 'Public Safety/Crime', count: 3, sentiment: 'negative' },
  { name: 'Sanitation/Litter', count: 2, sentiment: 'negative' },
  { name: 'Infrastructure/Potholes', count: 2, sentiment: 'negative' },
  { name: 'City Management', count: 1, sentiment: 'positive' }
];