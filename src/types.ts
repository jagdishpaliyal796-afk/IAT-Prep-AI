export type Subject = 'Biology' | 'Chemistry' | 'Mathematics' | 'Physics';

export interface Question {
  id: string;
  subject: Subject;
  text: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  explanation: string;
}

export interface TestResult {
  score: number;
  total: number;
  answers: {
    questionId: string;
    selectedOption: number | null;
    isCorrect: boolean;
  }[];
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  image?: string; // base64 data URL
}
