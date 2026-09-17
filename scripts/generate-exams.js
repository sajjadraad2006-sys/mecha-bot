import fs from 'fs';

const events = [
  // Stage 1
  {
    courseCode: 'MCT111',
    type: 'MIDTERM',
    title: 'امتحان منتصف الفصل - الرياضيات 1',
    occursAt: '2026-11-15T09:00:00.000Z',
    sourceStatus: 'OFFICIAL_SOURCE',
    confirmationStatus: 'CONFIRMED',
    coverage: [
      { courseCode: 'MCT111', status: 'CONFIRMED', freeTextLabel: 'مفردات المنهج المقررة' },
    ],
  },
  {
    courseCode: 'MCT112',
    type: 'MIDTERM',
    title: 'امتحان منتصف الفصل - الدوائر الكهربائية 1',
    occursAt: '2026-11-17T09:00:00.000Z',
    sourceStatus: 'OFFICIAL_SOURCE',
    confirmationStatus: 'CONFIRMED',
    coverage: [
      { courseCode: 'MCT112', status: 'CONFIRMED', freeTextLabel: 'مفردات المنهج المقررة' },
    ],
  },
  {
    courseCode: 'MCT115',
    type: 'MIDTERM',
    title: 'امتحان منتصف الفصل - الميكانيك الهندسي (ستاتيك)',
    occursAt: '2026-11-19T09:00:00.000Z',
    sourceStatus: 'OFFICIAL_SOURCE',
    confirmationStatus: 'CONFIRMED',
    coverage: [
      { courseCode: 'MCT115', status: 'CONFIRMED', freeTextLabel: 'مفردات المنهج المقررة' },
    ],
  },

  // Stage 2
  {
    courseCode: 'MCT211',
    type: 'MIDTERM',
    title: 'امتحان منتصف الفصل - الرياضيات 3 (تحليلات هندسية)',
    occursAt: '2026-11-16T09:00:00.000Z',
    sourceStatus: 'OFFICIAL_SOURCE',
    confirmationStatus: 'CONFIRMED',
    coverage: [
      { courseCode: 'MCT211', status: 'CONFIRMED', freeTextLabel: 'مفردات المنهج المقررة' },
    ],
  },
  {
    courseCode: 'MCT212',
    type: 'MIDTERM',
    title: 'امتحان منتصف الفصل - الإلكترونيك 1',
    occursAt: '2026-11-18T09:00:00.000Z',
    sourceStatus: 'OFFICIAL_SOURCE',
    confirmationStatus: 'CONFIRMED',
    coverage: [
      { courseCode: 'MCT212', status: 'CONFIRMED', freeTextLabel: 'مفردات المنهج المقررة' },
    ],
  },

  // Stage 3
  {
    courseCode: 'MCT311',
    type: 'MIDTERM',
    title: 'امتحان منتصف الفصل - الجبر الخطي (Linear Algebra)',
    occursAt: '2026-11-15T09:00:00.000Z',
    sourceStatus: 'OFFICIAL_SOURCE',
    confirmationStatus: 'CONFIRMED',
    coverage: [
      { courseCode: 'MCT311', status: 'CONFIRMED', freeTextLabel: 'مفردات المنهج المقررة' },
    ],
  },
  {
    courseCode: 'MCT314',
    type: 'MIDTERM',
    title: 'امتحان منتصف الفصل - أنظمة السيطرة 1 (Control Systems 1)',
    occursAt: '2026-11-17T09:00:00.000Z',
    sourceStatus: 'OFFICIAL_SOURCE',
    confirmationStatus: 'CONFIRMED',
    coverage: [
      { courseCode: 'MCT314', status: 'CONFIRMED', freeTextLabel: 'مفردات المنهج المقررة' },
    ],
  },
  {
    courseCode: 'MCT312',
    type: 'MIDTERM',
    title: 'امتحان منتصف الفصل - الاهتزازات الميكانيكية (Vibrations)',
    occursAt: '2026-11-19T09:00:00.000Z',
    sourceStatus: 'OFFICIAL_SOURCE',
    confirmationStatus: 'CONFIRMED',
    coverage: [
      { courseCode: 'MCT312', status: 'CONFIRMED', freeTextLabel: 'مفردات المنهج المقررة' },
    ],
  },
  {
    courseCode: 'MCT313',
    type: 'MIDTERM',
    title: 'امتحان منتصف الفصل - ميكانيك ومنظومات الموائع (Fluid Mechanics)',
    occursAt: '2026-11-22T09:00:00.000Z',
    sourceStatus: 'OFFICIAL_SOURCE',
    confirmationStatus: 'CONFIRMED',
    coverage: [
      { courseCode: 'MCT313', status: 'CONFIRMED', freeTextLabel: 'مفردات المنهج المقررة' },
    ],
  },

  // Stage 4
  {
    courseCode: 'MCT411',
    type: 'MIDTERM',
    title: 'امتحان منتصف الفصل - الأنظمة المضمنة (Embedded Systems)',
    occursAt: '2026-11-16T09:00:00.000Z',
    sourceStatus: 'OFFICIAL_SOURCE',
    confirmationStatus: 'CONFIRMED',
    coverage: [
      { courseCode: 'MCT411', status: 'CONFIRMED', freeTextLabel: 'مفردات المنهج المقررة' },
    ],
  },
  {
    courseCode: 'MCT412',
    type: 'MIDTERM',
    title: 'امتحان منتصف الفصل - الروبوتات وتطبيقاتها (Robotics)',
    occursAt: '2026-11-18T09:00:00.000Z',
    sourceStatus: 'OFFICIAL_SOURCE',
    confirmationStatus: 'CONFIRMED',
    coverage: [
      { courseCode: 'MCT412', status: 'CONFIRMED', freeTextLabel: 'مفردات المنهج المقررة' },
    ],
  },
];

const quizzes = [
  // MCT111
  {
    id: 'quiz_mct111_01',
    courseCode: 'MCT111',
    title: 'كويز تدريبي: التفاضل والتكامل وقواعد المشتقات',
    questions: [
      {
        id: 'mct111_q1',
        type: 'MULTIPLE_CHOICE',
        prompt: 'ما هي مشتقة الدالة f(x) = sin(2x) بالنسبة لـ x؟',
        points: 5,
        options: [
          { id: 'a', text: 'cos(2x)' },
          { id: 'b', text: '2 cos(2x)' },
          { id: 'c', text: '-2 cos(2x)' },
          { id: 'd', text: '2 sin(x)' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'mct111_q2',
        type: 'MULTIPLE_CHOICE',
        prompt: 'تكامل e^(3x) بالنسبة لـ x هو:',
        points: 5,
        options: [
          { id: 'a', text: '(1/3) e^(3x) + C' },
          { id: 'b', text: '3 e^(3x) + C' },
          { id: 'c', text: 'e^(3x) + C' },
          { id: 'd', text: '(1/3) x e^(3x) + C' },
        ],
        correctOptionId: 'a',
      },
    ],
  },

  // MCT112
  {
    id: 'quiz_mct112_01',
    courseCode: 'MCT112',
    title: 'كويز تدريبي: قوانين كيرشوف وقانون أوم',
    questions: [
      {
        id: 'mct112_q1',
        type: 'MULTIPLE_CHOICE',
        prompt: 'قانون كيرشوف للتيار (KCL) ينص على أن المجموع الجبري للتيارات في أي عقدة يساوي:',
        points: 5,
        options: [
          { id: 'a', text: 'صفر (0)' },
          { id: 'b', text: 'مجموع الفولتيات' },
          { id: 'c', text: 'التيار الكلي للدائرة' },
          { id: 'd', text: 'قيمة المقاومة' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'mct112_q2',
        type: 'MULTIPLE_CHOICE',
        prompt:
          'مقاومتان متساويتان قيمة كل منهما 10 أوم مربوطتان على التوازي، المقاومة المكافئة لهما هي:',
        points: 5,
        options: [
          { id: 'a', text: '20 أوم' },
          { id: 'b', text: '5 أوم' },
          { id: 'c', text: '10 أوم' },
          { id: 'd', text: '2.5 أوم' },
        ],
        correctOptionId: 'b',
      },
    ],
  },

  // MCT211
  {
    id: 'quiz_mct211_01',
    courseCode: 'MCT211',
    title: 'كويز تدريبي: تحويلات لابلاس (Laplace Transforms)',
    questions: [
      {
        id: 'mct211_q1',
        type: 'MULTIPLE_CHOICE',
        prompt: 'تحويل لابلاس للدالة الأسية f(t) = e^(at) هو:',
        points: 5,
        options: [
          { id: 'a', text: '1 / (s - a)' },
          { id: 'b', text: '1 / (s + a)' },
          { id: 'c', text: 'a / s' },
          { id: 'd', text: 's / (s - a)' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'mct211_q2',
        type: 'MULTIPLE_CHOICE',
        prompt: 'ما هو تحويل لابلاس للدالة المثلثية sin(wt)؟',
        points: 5,
        options: [
          { id: 'a', text: 'w / (s^2 + w^2)' },
          { id: 'b', text: 's / (s^2 + w^2)' },
          { id: 'c', text: 'w / (s^2 - w^2)' },
          { id: 'd', text: '1 / (s^2 + w^2)' },
        ],
        correctOptionId: 'a',
      },
    ],
  },

  // MCT311
  {
    id: 'quiz_mct311_01',
    courseCode: 'MCT311',
    title: 'كويز تدريبي: المصفوفات والمحددات (Linear Algebra)',
    questions: [
      {
        id: 'mct311_q1',
        type: 'MULTIPLE_CHOICE',
        prompt:
          'تكون المصفوفة المربعة A قابلة للانعكاس (Invertible / Non-singular) إذا وفقط إذا كان محددها det(A):',
        points: 5,
        options: [
          { id: 'a', text: 'لا يساوي صفر (det(A) != 0)' },
          { id: 'b', text: 'يساوي صفر (det(A) = 0)' },
          { id: 'c', text: 'أكبر من 1 دائماً' },
          { id: 'd', text: 'موجب دائماً' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'mct311_q2',
        type: 'MULTIPLE_CHOICE',
        prompt: 'إذا كانت A مصفوفة ذات رتبة 2x2، عناصرها [2, 1; 3, 4] فإن محددها يساوي:',
        points: 5,
        options: [
          { id: 'a', text: '5' },
          { id: 'b', text: '8' },
          { id: 'c', text: '11' },
          { id: 'd', text: '-5' },
        ],
        correctOptionId: 'a',
      },
    ],
  },

  // MCT312
  {
    id: 'quiz_mct312_01',
    courseCode: 'MCT312',
    title: 'كويز تدريبي: الاهتزازات الميكانيكية الحرة',
    questions: [
      {
        id: 'mct312_q1',
        type: 'MULTIPLE_CHOICE',
        prompt:
          'التردد الطبيعي غير المخمد (Natural Frequency wn) لمنظومة كتلة ونفاخ (Spring-Mass System) يُعطى بالقانون:',
        points: 5,
        options: [
          { id: 'a', text: 'wn = sqrt(k / m)' },
          { id: 'b', text: 'wn = sqrt(m / k)' },
          { id: 'c', text: 'wn = k * m' },
          { id: 'd', text: 'wn = 2 * pi * sqrt(k)' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'mct312_q2',
        type: 'MULTIPLE_CHOICE',
        prompt: 'عندما تكون نسبة التخميد (Damping Ratio zeta = 1) فإن المنظومة تُسمى:',
        points: 5,
        options: [
          { id: 'a', text: 'تخميد حرج (Critically Damped)' },
          { id: 'b', text: 'تحت التخميد (Underdamped)' },
          { id: 'c', text: 'فوق التخميد (Overdamped)' },
          { id: 'd', text: 'بدون تخميد (Undamped)' },
        ],
        correctOptionId: 'a',
      },
    ],
  },

  // MCT314
  {
    id: 'quiz_mct314_01',
    courseCode: 'MCT314',
    title: 'كويز تدريبي: أساسيات منظومات السيطرة والاستقرارية',
    questions: [
      {
        id: 'mct314_q1',
        type: 'MULTIPLE_CHOICE',
        prompt:
          'دالة التحويل (Transfer Function) للنظام الخطي الثابت زمنياً تُعرّف بأنها نسبة تحويل لابلاس لـ:',
        points: 5,
        options: [
          { id: 'a', text: 'الإخراج إلى الإدخال عند شروط ابتدائية صفرية (Y(s)/U(s))' },
          { id: 'b', text: 'الإدخال إلى الإخراج' },
          { id: 'c', text: 'الخطأ إلى الإخراج' },
          { id: 'd', text: 'الزمن إلى التردد' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'mct314_q2',
        type: 'MULTIPLE_CHOICE',
        prompt:
          'لكي يكون النظام المستمر مستقراً (Stable)، يجب أن تقع جميع أقطاب (Poles) دالة التحويل في:',
        points: 5,
        options: [
          { id: 'a', text: 'النصف الأيسر من المستوى s (Left Half Plane - LHP)' },
          { id: 'b', text: 'النصف الأيمن من المستوى s (Right Half Plane)' },
          { id: 'c', text: 'المحور التخيلي فقط' },
          { id: 'd', text: 'نقطة الأصل (Origin)' },
        ],
        correctOptionId: 'a',
      },
    ],
  },

  // MCT411
  {
    id: 'quiz_mct411_01',
    courseCode: 'MCT411',
    title: 'كويز تدريبي: الأنظمة المضمنة والمتحكمات الدقيقة',
    questions: [
      {
        id: 'mct411_q1',
        type: 'MULTIPLE_CHOICE',
        prompt:
          'أي من البروتوكولات التالية يُعد بروتوكول اتصال تسلسلي متزامن (Synchronous Serial Communication)؟',
        points: 5,
        options: [
          { id: 'a', text: 'SPI (Serial Peripheral Interface)' },
          { id: 'b', text: 'UART' },
          { id: 'c', text: 'RS-232' },
          { id: 'd', text: 'Modbus RTU' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'mct411_q2',
        type: 'MULTIPLE_CHOICE',
        prompt:
          'تقنية تعديل عرض النبضة (PWM - Pulse Width Modulation) تُستخدم أساساً في الميكاترونكس لـ:',
        points: 5,
        options: [
          { id: 'a', text: 'التحكم بسرعة المحركات وشدة الإشارة التناظرية' },
          { id: 'b', text: 'زيادة سعة الذاكرة RAM' },
          { id: 'c', text: 'تشفير البيانات اللاسلكية' },
          { id: 'd', text: 'تفريغ المكثفات' },
        ],
        correctOptionId: 'a',
      },
    ],
  },
];

const content = `/**
 * Bundled Exam Milestones and Practice Quizzes (@mecha-bot/worker)
 */

export const BUNDLED_EXAM_EVENTS = ${JSON.stringify(events, null, 2)};

export const BUNDLED_PRACTICE_QUIZZES = ${JSON.stringify(quizzes, null, 2)};
`;

fs.writeFileSync('apps/worker/src/bundled-exams-data.ts', content, 'utf8');
console.log(
  'Generated apps/worker/src/bundled-exams-data.ts with',
  events.length,
  'events and',
  quizzes.length,
  'quizzes.',
);
