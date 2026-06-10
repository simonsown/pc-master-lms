export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank';
export type AttemptStatus = 'in_progress' | 'submitted' | 'timed_out';

export interface QuestionBank {
  id: string;
  teacher_id: string;
  title: string;
  subject?: string;
  created_at: string;
}

export interface Question {
  id: string;
  bank_id: string;
  content: string;
  type: QuestionType;
  points: number;
  order: number;
  created_at: string;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  question_id: string;
  content: string;
  is_correct?: boolean; // Optional because we hide it from students
  created_at: string;
}

export interface Quiz {
  id: string;
  lesson_id?: string;
  assignment_id?: string;
  title: string;
  time_limit_minutes: number;
  passing_score: number;
  randomize: boolean;
  max_attempts: number;
  created_at: string;
  questions?: Question[];
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  started_at: string;
  submitted_at?: string;
  score: number;
  status: AttemptStatus;
}

export interface QuizAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id?: string;
  text_answer?: string;
  is_correct: boolean;
  points_earned: number;
}
