import type {
  ProgressSignal,
  ProgressSignalType,
  StudentTopicState,
  TopicProgressSummary,
} from './types.js';

const SIGNAL_TYPES: ProgressSignalType[] = [
  'SELF_RATING',
  'QUIZ_RESULT',
  'STUDY_SESSION',
  'REPEATED_QUESTION',
  'MANUAL_STUDENT_STATUS',
];

function latest<T extends ProgressSignal['type']>(
  signals: ProgressSignal[],
  type: T,
): Extract<ProgressSignal, { type: T }> | undefined {
  return signals
    .filter((signal): signal is Extract<ProgressSignal, { type: T }> => signal.type === type)
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))[0];
}

export function deriveStudentTopicState(signals: ProgressSignal[]): StudentTopicState {
  const manual = latest(signals, 'MANUAL_STUDENT_STATUS');
  if (manual) return manual.state;
  if (signals.length === 0) return 'NEW';

  const repeatedQuestions = signals
    .filter((signal) => signal.type === 'REPEATED_QUESTION')
    .reduce((total, signal) => total + signal.count, 0);
  const selfRating = latest(signals, 'SELF_RATING');
  const quiz = latest(signals, 'QUIZ_RESULT');

  if (repeatedQuestions >= 2 || selfRating?.selfReportedConfidence === 1) return 'STRUGGLING';
  if (
    selfRating !== undefined &&
    selfRating.selfReportedConfidence >= 4 &&
    quiz !== undefined &&
    quiz.quizDerivedPerformance.percentage >= 80
  ) {
    return 'COMFORTABLE';
  }
  if (
    selfRating?.selfReportedConfidence === 2 ||
    (quiz !== undefined && quiz.quizDerivedPerformance.percentage < 60)
  ) {
    return 'REVIEW_NEEDED';
  }
  return 'LEARNING';
}

export function summarizeTopicProgress(
  studentKey: string,
  courseCode: string,
  topicKey: string,
  signals: ProgressSignal[],
): TopicProgressSummary {
  const relevant = signals.filter(
    (signal) =>
      signal.studentKey === studentKey &&
      signal.courseCode === courseCode &&
      signal.topicKey === topicKey,
  );
  const signalCounts = Object.fromEntries(
    SIGNAL_TYPES.map((type) => [type, relevant.filter((signal) => signal.type === type).length]),
  ) as Record<ProgressSignalType, number>;
  const selfRating = latest(relevant, 'SELF_RATING');
  const quiz = latest(relevant, 'QUIZ_RESULT');

  return {
    studentKey,
    courseCode,
    topicKey,
    state: deriveStudentTopicState(relevant),
    signalCounts,
    ...(selfRating === undefined
      ? {}
      : { latestSelfReportedConfidence: selfRating.selfReportedConfidence }),
    ...(quiz === undefined
      ? {}
      : { latestQuizDerivedPerformance: { ...quiz.quizDerivedPerformance } }),
    completedStudyMinutes: relevant
      .filter((signal) => signal.type === 'STUDY_SESSION')
      .reduce((total, signal) => total + signal.completedMinutes, 0),
    repeatedQuestionCount: relevant
      .filter((signal) => signal.type === 'REPEATED_QUESTION')
      .reduce((total, signal) => total + signal.count, 0),
  };
}
