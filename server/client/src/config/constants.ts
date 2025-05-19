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

// Base URL is empty in production (same origin). Override with VITE/ENV if provided.
// Cast `import.meta` to `any` to avoid TS complaint in non-Vite tooling.
// Vite provides `import.meta.env` at build time.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ENV_BASE = (import.meta as any).env?.PUBLIC_API_BASE || '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MODE = (import.meta as any).env?.MODE;

export const API_CONFIG: ApiConfig = {
  baseUrl: ENV_BASE || (MODE === 'production' ? '' : 'http://localhost:3001'),
  endpoints: {
    health: '/api/health',
    generateWorksheet: '/api/generate-worksheet'
  }
};
