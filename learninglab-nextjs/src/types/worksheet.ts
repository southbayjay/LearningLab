export interface MultipleChoiceQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface ShortAnswerQuestion {
  question: string;
  answer: string;
}

export interface Worksheet {
  title: string;
  passage: string;
  multipleChoice: MultipleChoiceQuestion[];
  shortAnswer: ShortAnswerQuestion[];
}

export type GradeLevel = 
  | 'K' | '1' | '2' | '3' | '4' | '5' | '6' 
  | '7' | '8' | '9' | '10' | '11' | '12';

export type Topic = 
  | 'Science' | 'History' | 'Literature' | 'Geography' 
  | 'Math' | 'Social Studies' | 'Art' | 'Music' | 'Custom';

export type Complexity = 'easy' | 'medium' | 'hard';
