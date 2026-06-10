export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false' | 'fill_blank' | 'ordering';

export interface CorrectOption {
  id: string;
  is_correct: boolean;
  content: string;
  order?: number;
}

export interface StudentAnswer {
  questionId: string;
  selectedOptionIds?: string[];
  textAnswer?: string;
  orderingAnswer?: string[];
  timeSpentSeconds?: number;
}

export function scoreQuestion(
  type: QuestionType,
  studentAnswer: StudentAnswer,
  correctOptions: CorrectOption[],
  maxPoints: number
): number {
  if (!studentAnswer) return 0;

  switch (type) {
    case 'single_choice':
    case 'true_false': {
      const correctOpt = correctOptions.find(o => o.is_correct);
      if (!correctOpt) return 0;
      if (studentAnswer.selectedOptionIds && studentAnswer.selectedOptionIds[0] === correctOpt.id) {
        return maxPoints;
      }
      return 0;
    }

    case 'multiple_choice': {
      const correctIds = correctOptions.filter(o => o.is_correct).map(o => o.id);
      const studentIds = studentAnswer.selectedOptionIds || [];
      if (correctIds.length === 0) return 0;
      // Must select all correct and NO incorrect
      const allCorrectSelected = correctIds.every(id => studentIds.includes(id));
      const noIncorrectSelected = studentIds.every(id => correctIds.includes(id));
      
      if (allCorrectSelected && noIncorrectSelected) {
        return maxPoints;
      }
      // Optional: partial credit could go here
      return 0;
    }

    case 'fill_blank': {
      const correctText = correctOptions.find(o => o.is_correct)?.content;
      if (!correctText || !studentAnswer.textAnswer) return 0;
      const cleanExpected = correctText.trim().toLowerCase();
      const cleanActual = studentAnswer.textAnswer.trim().toLowerCase();
      if (cleanExpected === cleanActual) {
        return maxPoints;
      }
      return 0;
    }

    case 'ordering': {
      const correctOrder = correctOptions.sort((a, b) => (a.order || 0) - (b.order || 0)).map(o => o.id);
      const studentOrder = studentAnswer.orderingAnswer || [];
      if (correctOrder.length !== studentOrder.length) return 0;
      for (let i = 0; i < correctOrder.length; i++) {
        if (correctOrder[i] !== studentOrder[i]) return 0;
      }
      return maxPoints;
    }

    default:
      return 0;
  }
}
