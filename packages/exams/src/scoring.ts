import type { QuizAnswers, QuizQuestion, QuizScore } from './types.js';

export function scoreQuiz(questions: QuizQuestion[], answers: QuizAnswers): QuizScore {
  let rawScore = 0;
  const correctQuestionIds: string[] = [];
  const incorrectQuestionIds: string[] = [];
  const unansweredQuestionIds: string[] = [];

  for (const question of questions) {
    const answer = answers[question.id];
    if (answer === undefined) {
      unansweredQuestionIds.push(question.id);
      continue;
    }
    const correct =
      question.type === 'MULTIPLE_CHOICE'
        ? typeof answer === 'string' && answer === question.correctOptionId
        : typeof answer === 'boolean' && answer === question.correctAnswer;
    if (correct) {
      rawScore += question.points;
      correctQuestionIds.push(question.id);
    } else {
      incorrectQuestionIds.push(question.id);
    }
  }

  const maxScore = questions.reduce((total, question) => total + question.points, 0);
  const percentage = maxScore === 0 ? 0 : Math.round((rawScore / maxScore) * 10_000) / 100;
  return {
    rawScore,
    maxScore,
    percentage,
    correctQuestionIds,
    incorrectQuestionIds,
    unansweredQuestionIds,
  };
}
