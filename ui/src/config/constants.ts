export const GRADE_LEVELS = [
  'Kindergarten',
  '1st Grade',
  '2nd Grade',
  '3rd Grade',
  '4th Grade',
  '5th Grade',
  '6th Grade',
  '7th Grade',
  '8th Grade',
  '9th Grade',
  '10th Grade',
  '11th Grade',
  '12th Grade'
] as const;

export const TOPICS = [
  'Animals',
  'Plants',
  'Science',
  'Math',
  'English',
  'Reading',
  'Writing',
  'Geography',
  'History',
  'Art',
  'Music'
] as const;

export const API_CONFIG = {
  baseUrl: 'http://localhost:3001',
  endpoints: {
    health: '/api/health',
    generateWorksheet: '/api/generate-worksheet'
  }
} as const;
