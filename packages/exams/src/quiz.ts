import type { NewQuizQuestion, QuizQuestion } from './types.js';

export function materializeQuizQuestion(input: NewQuizQuestion, id: string): QuizQuestion {
  if (input.type === 'MULTIPLE_CHOICE') {
    return {
      id,
      type: input.type,
      prompt: input.prompt.trim(),
      points: input.points,
      options: input.options.map((option) => ({ id: option.id.trim(), text: option.text.trim() })),
      correctOptionId: input.correctOptionId,
    };
  }
  return {
    id,
    type: input.type,
    prompt: input.prompt.trim(),
    points: input.points,
    correctAnswer: input.correctAnswer,
  };
}
