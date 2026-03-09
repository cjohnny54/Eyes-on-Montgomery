export interface DistrictData {
  id: number;
  name: string;
  actualSafetyScore: number; // 0-100 (higher means worse safety)
  perceptionScore: number; // 0-100 (higher means worse perception)
  misalignmentIndex: number; // perception - actual
  calls911: number;
  sentimentTrend: 'improving' | 'worsening' | 'stable';
  topIssue: string;
  population: number;
}

export const MOCK_DISTRICTS: DistrictData[] = [
  { id: 1, name: "District 1", actualSafetyScore: 42, perceptionScore: 65, misalignmentIndex: 23, calls911: 1240, sentimentTrend: 'worsening', topIssue: '911 Delays', population: 22000 },
  { id: 2, name: "District 2", actualSafetyScore: 58, perceptionScore: 55, misalignmentIndex: -3, calls911: 1850, sentimentTrend: 'stable', topIssue: 'Traffic Safety', population: 21500 },
  { id: 3, name: "District 3", actualSafetyScore: 75, perceptionScore: 88, misalignmentIndex: 13, calls911: 2400, sentimentTrend: 'worsening', topIssue: 'Property Crime', population: 23100 },
  { id: 4, name: "District 4", actualSafetyScore: 35, perceptionScore: 40, misalignmentIndex: 5, calls911: 950, sentimentTrend: 'improving', topIssue: 'Noise Complaints', population: 20800 },
  { id: 5, name: "District 5", actualSafetyScore: 62, perceptionScore: 85, misalignmentIndex: 23, calls911: 1950, sentimentTrend: 'worsening', topIssue: 'Violent Crime', population: 24500 },
  { id: 6, name: "District 6", actualSafetyScore: 48, perceptionScore: 45, misalignmentIndex: -3, calls911: 1420, sentimentTrend: 'improving', topIssue: 'Code Violations', population: 21200 },
  { id: 7, name: "District 7", actualSafetyScore: 82, perceptionScore: 70, misalignmentIndex: -12, calls911: 2800, sentimentTrend: 'stable', topIssue: 'Drug Activity', population: 25000 },
  { id: 8, name: "District 8", actualSafetyScore: 55, perceptionScore: 78, misalignmentIndex: 23, calls911: 1650, sentimentTrend: 'worsening', topIssue: '911 Delays', population: 22800 },
  { id: 9, name: "District 9", actualSafetyScore: 40, perceptionScore: 35, misalignmentIndex: -5, calls911: 1100, sentimentTrend: 'improving', topIssue: 'Traffic Safety', population: 20100 },
];

export const TIME_SERIES_DATA = Array.from({ length: 30 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split('T')[0],
    actualCalls: Math.floor(Math.random() * 100) + 150,
    sentimentScore: Math.floor(Math.random() * 40) + 40,
  };
});
