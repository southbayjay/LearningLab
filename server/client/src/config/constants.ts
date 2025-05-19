export type GradeLevel = 
  | 'Kindergarten'
  | '1st Grade'
  | '2nd Grade'
  | '3rd Grade'
  | '4th Grade'
  | '5th Grade'
  | '6th Grade'
  | '7th Grade'
  | '8th Grade'
  | '9th Grade'
  | '10th Grade'
  | '11th Grade'
  | '12th Grade';

export const GRADE_LEVELS: GradeLevel[] = [
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
];

export type Topic = 
  | 'Animals'
  | 'Plants'
  | 'Science'
  | 'Math'
  | 'English'
  | 'Reading'
  | 'Writing'
  | 'Geography'
  | 'History'
  | 'Art'
  | 'Music';

export const TOPICS: Topic[] = [
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
];

export interface ApiEndpoints {
  health: string;
  generateWorksheet: string;
}

export interface ApiConfig {
  baseUrl: string;
  endpoints: ApiEndpoints;
}

export const API_CONFIG: ApiConfig = {
  baseUrl: 'http://localhost:3001',
  endpoints: {
    health: '/api/health',
    generateWorksheet: '/api/generate-worksheet'
  }
};
