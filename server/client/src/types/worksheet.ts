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
