/**
 * Official Academic Materials & Curated Notes Catalog (@mecha-bot/worker)
 * Populated with verified University of Basrah curriculum, faculty lecture notes, and canonical textbooks.
 */

import type { AcademicFileRecord } from '@mecha-bot/distribution';

export const BUNDLED_ACADEMIC_MATERIALS: AcademicFileRecord[] = [
  {
    id: 'doc_uob_mct313_fluid_saleem',
    title: '📖 ميكانيك الموائع 1 (محاضرات جامعة البصرة الرسمية) — د. خالد باقر سليم',
    courseCode: 'MCT313',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://raw.githubusercontent.com/sajjadraad2006-sys/mecha-bot/main/curriculum/official-materials/1651836034.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المحاضرة الرسمية الأولى في ميكانيك الموائع - قسم الهندسة الميكانيكية والميكاترونكس بجامعة البصرة بإشراف د. خالد باقر سليم (Dr. Khalid B. Saleem). تتناول المحاضرة مقدمة علم موائع الهندسة، الفرق بين المائع والجسم الصلب، خواص الموائع الأساسية (الكثافة النوعية، اللزوجة الديناميكية والكينماتيكية، الانضغاطية، والشد السطحي)، وقانون نيوتن للزوجة tau = mu * du/dy. كما تحدد المراجع العالمية الموصى بها في جامعة البصرة (Streeter, Frank M. White, Munson). نصيحة امتحانية: التركيز التام على تحويل الوحدات الدولية وحساب إجهاد القص وتدرج السرعة بين الألواح المتوازية.',
  },
  {
    id: 'doc_uob_mct312_vibration_khalaf',
    title: '📖 الاهتزازات الميكانيكية المتقدمة (محاضرات جامعة البصرة الرسمية) — د. جعفر خلف',
    courseCode: 'MCT312',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://raw.githubusercontent.com/sajjadraad2006-sys/mecha-bot/main/curriculum/official-materials/1662098990.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "المحاضرة الافتتاحية في منهاج الاهتزازات الميكانيكية المتقدمة - كلية الهندسة بجامعة البصرة بإشراف د. جعفر خلف (Dr. Jaafar Khalaf). تشمل مفردات المنهاج المعتمد، المفاهيم الجوهرية للاهتزاز الميكانيكي، الحركة التوافقية البسيطة (SHM)، درجات الحرية (Degrees of Freedom: SDOF, MDOF, Continuous systems)، ومعادلات الحركة التفاضلية m*x'' + c*x' + k*x = F(t) وحساب التردد الطبيعي الزاوي wn = sqrt(k/m) والتردد بالهيرتز fn = wn/(2*pi). نصائح امتحانية: إتقان رسم مخطط الجسم الحر وتطبيق قانون نيوتن الثاني أو طريقة الطاقة لحساب التردد الطبيعي.",
  },
  {
    id: 'doc_uob_mct212_mechanics_yaqoob',
    title: '📖 مقاومة وميكانيك المواد (محاضرات جامعة البصرة الرسمية) — م. محمد يعقوب يوسف',
    courseCode: 'MCT212',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://raw.githubusercontent.com/sajjadraad2006-sys/mecha-bot/main/curriculum/official-materials/1687380480.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "سلسلة المحاضرات الجامعية الرسمية في مقاومة المواد لطلبة قسم الهندسة الميكانيكية والميكاترونكس - جامعة البصرة، إعداد المدرس محمد يعقوب يوسف (Mr. Mohammed Yaqoob Yousif) بالاعتماد على مرجع E.J. Hearn الشهير و Beer & Johnston. تتناول الإجهاد والانفعال المباشر (Direct Stress and Strain)، قانون هوك ومعامل المرونة E، الانفعال الجانبي ونسبة بواسون Poisson's Ratio، الإجهادات والانفعالات في القضبان المركبة (Composite Bars)، والإجهادات الناتجة عن التغيرات الحرارية (Thermal Stresses). نصائح امتحانية: انتبه لإشارات الشد (+) والضغط (-) وتوافق الإزاحات (Compatibility Equations) في المنظومات غير المحددة استاتيكياً.",
  },
  {
    id: 'doc_uob_mct217_thermo_shaker',
    title: '📖 الثرموديناميك I (الفصل الرابع: العمليات العكسية - جامعة البصرة) — د. محمود شاكر',
    courseCode: 'MCT217',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://raw.githubusercontent.com/sajjadraad2006-sys/mecha-bot/main/curriculum/official-materials/1688291090.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'محاضرات الفصل الرابع: العمليات العكسية غير الجريانية والمستقرة (Reversible Processes: Non-Flow & Steady Flow) للديناميكا الحرارية - قسم الهندسة الميكانيكية بجامعة البصرة، إعداد الأستاذ الدكتور محمود شاكر (Dr. Mahmood Shaker). تشمل شروط انعكاسية العمليات، حساب الشغل غير الجرياني W = int(P dV)، وتحليل العمليات الأساسية للغاز المثالي: ثبوت الحجم (Isochoric W=0)، ثبوت الضغط (Isobaric W=P*(V2-V1))، ثبوت درجة الحرارة (Isothermal W=P1*V1*ln(V2/V1))، العملية الأديباتية (Adiabatic P*V^gamma=C)، والعملية البولتروبية (Polytropic P*V^n=C). نصائح امتحانية: انتبه لحساب السعة الحرارية النوعية Cn للعملية البولتروبية وتطبيق القانون الأول Q = Delta_U + W.',
  },
  {
    id: 'doc_uob_mct125_production_sabur',
    title: '📖 هندسة الإنتاج وخواص المواد BEM125 (المحاضرات الكاملة) — د. رحيم السابور',
    courseCode: 'MCT125',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://raw.githubusercontent.com/sajjadraad2006-sys/mecha-bot/main/curriculum/official-materials/1746991329.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الملزمة الأكاديمية الشاملة والمقرر النظري الكامل لمادة هندسة الإنتاج وخواص المواد BEM125 - كلية الهندسة بجامعة البصرة، إعداد الأستاذ الدكتور رحيم السابور (Dr. Raheem Al-Sabur) في 82 صفحة. تتضمن الخطة الأسبوعية الكاملة: تصنيف المواد الهندسية، الفحوصات الميكانيكية التدميرية (اختبار الشد Tensile Test، الصدم Impact، الصلادة Hardness بمقاييس Brinell و Vickers و Rockwell)، منحنى الإجهاد والانفعال الهندسي والحقيقي، إنتاج الحديد والصلب، عمليات السباكة والتشغيل وتشكيل المعادن. نصائح امتحانية: حفظ خطوات حساب مقاومة الخضوع بطريقة 0.2% Offset وحساب نسبة الاستطالة وتناقص المساحة.',
  },
  {
    id: 'doc_uob_mct215_machines_lecture',
    title: '📖 الآلات الكهربائية: آلات التيار المستمر والمحولات — جامعة البصرة',
    courseCode: 'MCT215',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://raw.githubusercontent.com/sajjadraad2006-sys/mecha-bot/main/curriculum/official-materials/1687296365.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المحاضرات الرسمية المعتمدة لآلات التيار المستمر (D.C. Machines) والمحولات الكهربائية (Transformers) لطلبة قسم الهندسة الميكانيكية والميكاترونكس بجامعة البصرة (35 صفحة). تشمل نظرية عمل مولدات ومحركات التيار المستمر، معادلة القوة الدافعة الكهربائية E = (P*Z*N*phi)/(60*A)، طرق التغذية (Shunt, Series, Compound)، مخططات عزم الدوران والسرعة، منحنيات الكفاءة ومخطط تدفق القدرة Power Flow Diagram، ونظرية عمل المحولات الكهربائية ودائرة المكافئ المكافئة.',
  },
  {
    id: 'doc_uob_mct315_arch_dalia',
    title: '📖 معمارية وتنظيم الحاسوب (المحاضرات الرسمية) — م. داليا عادل',
    courseCode: 'MCT315',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://raw.githubusercontent.com/sajjadraad2006-sys/mecha-bot/main/curriculum/official-materials/1727623180.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المحاضرات الدراسية في معمارية وتنظيم الحاسوب لطلبة قسم هندسة الميكاترونكس - جامعة البصرة، إعداد المدرس داليا عادل (Lecturer Dalia Adil). تتناول التمييز المفاهيمي بين معمارية الحاسوب (Computer Architecture) وتنظيم الحاسوب (Computer Organization)، وظائف وبنية المعالج الدقيق CPU (وحدة التحكم Control Unit، وحدة الحساب والمنطق ALU، مسجلات المعالج Registers: PC, IR, MAR, MBR)، ومسارات النواقل (System Bus)، ودورة جلب وتنفيذ التعليمات (Instruction Fetch & Execution Cycle).',
  },
  {
    id: 'doc_uob_mct411_textbook_leeseshia',
    title:
      '📖 Introduction to Embedded Systems: A Cyber-Physical Systems Approach — Edward A. Lee & Sanjit A. Seshia (UC Berkeley)',
    courseCode: 'MCT411',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value: 'https://ptolemy.berkeley.edu/books/leeseshia/releases/LeeSeshia_DigitalV1_08.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المنهجي التأسيسي المعتمد عالمياً وفي جامعة البصرة للأنظمة المضمنة والأنظمة الفيزيائية السيبرانية الصادر عن جامعة كاليفورنيا بيركلي (478 صفحة كاملة). يشمل نمذجة الأنظمة الديناميكية المتصلة، آلات الحالة المحدودة التفاعلية التزامنية، معمارية المعالجات الصغرية والمتحكمات، نموذج إدارة الذاكرة في لغة C، البرمجة المتزامنة وجدولة الزمن الحقيقي ومسائل الاستبعاد المتبادل Mutual Exclusion.',
  },
  {
    id: 'doc_uob_curriculum_2025_official',
    title:
      '📑 التوصيف الأكاديمي الرسمي الكامل لبرنامج بكالوريوس هندسة الميكاترونكس (2024-2025) — جامعة البصرة',
    courseCode: 'P4MCT',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://raw.githubusercontent.com/sajjadraad2006-sys/mecha-bot/main/curriculum/official-materials/3437Mechatronics%20Engineering.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الوثيقة الأكاديمية الرسمية الشاملة الصادرة عن كلية الهندسة - جامعة البصرة (52 صفحة) المعتمدة للعام الدراسي 2024-2025. تتضمن الرؤية والرسالة والأهداف لقسم هندسة الميكاترونكس، ومخرجات التعلم التخصصية (المعرفية والمهارية والقيمية)، والخطة الدراسية التفصيلية الكاملة لجميع المقررات الإلزامية والاختيارية للمراحل الأربع، ومتطلبات مشروع التخرج والتدريب الصيفي.',
  },
  {
    id: 'doc_uob_course_catalog_official',
    title: '📑 جدول المواد والمقررات الدراسية المعتمدة — قسم الهندسة الميكانيكية والميكاترونكس',
    courseCode: 'P4MCT',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://raw.githubusercontent.com/sajjadraad2006-sys/mecha-bot/main/curriculum/official-materials/6193mec.%20courses.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'جدول المقررات الرسمية والمصطلحات الوزارية المعتمدة الصادر من عمادة كلية الهندسة - جامعة البصرة لقسم الهندسة الميكانيكية وهندسة الميكاترونكس لجميع الفصول الدراسية والمراحل (الأولى، الثانية، الثالثة، الرابعة) باللغتين العربية والإنكليزية وتوزيع الوحدات والساعات الأسبوعية.',
  },
  {
    id: 'doc_mct111_textbook_primary',
    title:
      "📖 الكتاب المنهجي الرئيسي: Thomas' Calculus (14th/15th Ed.) — George B. Thomas, Maurice D. Weir, Joel Hass",
    courseCode: 'MCT111',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/thomas-calculus-14th-edition/Thomas%20Calculus%2014th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (الرياضيات I) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* الدوال الحقيقية، النهايات والاستمرارية، قواعد الاشتقاق وتطبيقاتها (المعدلات المرتبطة، التقريب الخطي، رسم الدوال)، التكامل غير المحدد والمحدد، المساحات بين المنحنيات، وحجوم الأجسام الدورانية.\n📐 *أهم القوانين:* مشتقات الدوال المثلثية والعكسية، نظرية القيمة المتوسطة MVT، والنظرية الأساسية للتفاضل والتكامل d/dx[int_a^x f(t)dt] = f(x).\n💡 *نصائح امتحانية:* احرص على إتقان رسم الدوال بالخطوات الست (المجال، التناظر، المحاذيات، المشتقة الأولى والثانية، نقاط الانقلاب).',
  },
  {
    id: 'doc_mct111_textbook_secondary',
    title: '📚 الكتاب المساعد المعتمد: Calculus: Early Transcendentals (9th Ed.) — James Stewart',
    courseCode: 'MCT111',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/calculus-early-transcendentals-9th-edition/Calculus%20Early%20Transcendentals%209th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (الرياضيات I) - جامعة البصرة.\n📌 *الفهرس والمفردات:* الدوال الحقيقية، النهايات والاستمرارية، قواعد الاشتقاق وتطبيقاتها (المعدلات المرتبطة، التقريب الخطي، رسم الدوال)، التكامل غير المحدد والمحدد، المساحات بين المنحنيات، وحجوم الأجسام الدورانية.\n📐 *أهم القوانين:* مشتقات الدوال المثلثية والعكسية، نظرية القيمة المتوسطة MVT، والنظرية الأساسية للتفاضل والتكامل d/dx[int_a^x f(t)dt] = f(x).\n💡 *نصائح امتحانية:* احرص على إتقان رسم الدوال بالخطوات الست (المجال، التناظر، المحاذيات، المشتقة الأولى والثانية، نقاط الانقلاب).',
  },
  {
    id: 'doc_mct111_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (الرياضيات I)',
    courseCode: 'MCT111',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/thomas-calculus-14th-edition/Thomas%20Calculus%2014th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (الرياضيات I - MCT111) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* الدوال الحقيقية، النهايات والاستمرارية، قواعد الاشتقاق وتطبيقاتها (المعدلات المرتبطة، التقريب الخطي، رسم الدوال)، التكامل غير المحدد والمحدد، المساحات بين المنحنيات، وحجوم الأجسام الدورانية.\n📐 *أهم القوانين:* مشتقات الدوال المثلثية والعكسية، نظرية القيمة المتوسطة MVT، والنظرية الأساسية للتفاضل والتكامل d/dx[int_a^x f(t)dt] = f(x).\n💡 *نصائح امتحانية:* احرص على إتقان رسم الدوال بالخطوات الست (المجال، التناظر، المحاذيات، المشتقة الأولى والثانية، نقاط الانقلاب).',
  },
  {
    id: 'doc_mct111_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (الرياضيات I)',
    courseCode: 'MCT111',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/thomas-calculus-14th-edition/Thomas%20Calculus%2014th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* الدوال الحقيقية، النهايات والاستمرارية، قواعد الاشتقاق وتطبيقاتها (المعدلات المرتبطة، التقريب الخطي، رسم الدوال)، التكامل غير المحدد والمحدد، المساحات بين المنحنيات، وحجوم الأجسام الدورانية.\n📐 *أهم القوانين:* مشتقات الدوال المثلثية والعكسية، نظرية القيمة المتوسطة MVT، والنظرية الأساسية للتفاضل والتكامل d/dx[int_a^x f(t)dt] = f(x).\n💡 *نصائح امتحانية:* احرص على إتقان رسم الدوال بالخطوات الست (المجال، التناظر، المحاذيات، المشتقة الأولى والثانية، نقاط الانقلاب).',
  },
  {
    id: 'doc_mct112_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Engineering Circuit Analysis (9th Ed.) — William H. Hayt, Jack Kemmerly, Steven Durbin',
    courseCode: 'MCT112',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/hayt-engineering-circuit-analysis-9th-edition/Engineering%20Circuit%20Analysis%209th%20Edition%20Hayt.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (الدوائر الكهربائية 1) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* المفاهيم الكهربائية الأساسية، قانون أوم، قوانين كيرشوف للتيار والجهد (KCL & KVL)، تحليل العقد (Nodal Analysis) والمش (Mesh Analysis)، ونظريات الدوائر: ثيفنن (Thevenin)، نورتون (Norton)، والتراكب (Superposition).\n📐 *أهم القوانين:* V = I*R, P = V*I, R_th = Voc / Isc, P_max = V_th^2 / (4*R_th).\n💡 *نصائح امتحانية:* حدد العقدة المرجعية (Reference/Ground) بدقة قبل كتابة معادلات KCL لتجنب أخطاء الإشارات في التيارات الخارجة والداخلة.',
  },
  {
    id: 'doc_mct112_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Electric Circuits (11th Ed.) — James W. Nilsson, Susan A. Riedel',
    courseCode: 'MCT112',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/electric-circuits-11th-edition-nilsson/Electric%20Circuits%2011th%20Edition%20Nilsson.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (الدوائر الكهربائية 1) - جامعة البصرة.\n📌 *الفهرس والمفردات:* المفاهيم الكهربائية الأساسية، قانون أوم، قوانين كيرشوف للتيار والجهد (KCL & KVL)، تحليل العقد (Nodal Analysis) والمش (Mesh Analysis)، ونظريات الدوائر: ثيفنن (Thevenin)، نورتون (Norton)، والتراكب (Superposition).\n📐 *أهم القوانين:* V = I*R, P = V*I, R_th = Voc / Isc, P_max = V_th^2 / (4*R_th).\n💡 *نصائح امتحانية:* حدد العقدة المرجعية (Reference/Ground) بدقة قبل كتابة معادلات KCL لتجنب أخطاء الإشارات في التيارات الخارجة والداخلة.',
  },
  {
    id: 'doc_mct112_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (الدوائر الكهربائية 1)',
    courseCode: 'MCT112',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/hayt-engineering-circuit-analysis-9th-edition/Engineering%20Circuit%20Analysis%209th%20Edition%20Hayt.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (الدوائر الكهربائية 1 - MCT112) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* المفاهيم الكهربائية الأساسية، قانون أوم، قوانين كيرشوف للتيار والجهد (KCL & KVL)، تحليل العقد (Nodal Analysis) والمش (Mesh Analysis)، ونظريات الدوائر: ثيفنن (Thevenin)، نورتون (Norton)، والتراكب (Superposition).\n📐 *أهم القوانين:* V = I*R, P = V*I, R_th = Voc / Isc, P_max = V_th^2 / (4*R_th).\n💡 *نصائح امتحانية:* حدد العقدة المرجعية (Reference/Ground) بدقة قبل كتابة معادلات KCL لتجنب أخطاء الإشارات في التيارات الخارجة والداخلة.',
  },
  {
    id: 'doc_mct112_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (الدوائر الكهربائية 1)',
    courseCode: 'MCT112',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/hayt-engineering-circuit-analysis-9th-edition/Engineering%20Circuit%20Analysis%209th%20Edition%20Hayt.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* المفاهيم الكهربائية الأساسية، قانون أوم، قوانين كيرشوف للتيار والجهد (KCL & KVL)، تحليل العقد (Nodal Analysis) والمش (Mesh Analysis)، ونظريات الدوائر: ثيفنن (Thevenin)، نورتون (Norton)، والتراكب (Superposition).\n📐 *أهم القوانين:* V = I*R, P = V*I, R_th = Voc / Isc, P_max = V_th^2 / (4*R_th).\n💡 *نصائح امتحانية:* حدد العقدة المرجعية (Reference/Ground) بدقة قبل كتابة معادلات KCL لتجنب أخطاء الإشارات في التيارات الخارجة والداخلة.',
  },
  {
    id: 'doc_mct113_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Computer Science: An Overview (13th Ed.) — J. Glenn Brookshear, Dennis Brylow',
    courseCode: 'MCT113',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/computer-science-an-overview-13th-edition/Computer%20Science%20An%20Overview%2013th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (مبادئ الحاسوب) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* تمثيل البيانات والأنظمة العددية (Binary, Hexadecimal, Octal, 2's Complement)، بنية الحاسوب والمعالجات، أنظمة التشغيل، الخوارزميات ومخططات التدفق (Flowcharts)، وأساسيات شبكات الحاسوب وأمن المعلومات.\n📐 *أهم القوانين:* التحويل بين الأنظمة العددية، حساب نطاق الأعداد المؤشرة n-bit 2's complement من -2^(n-1) إلى 2^(n-1)-1.\n💡 *نصائح امتحانية:* تدرب على العمليات الحسابية الثنائية واكتشاف الـ Overflow في الجمع والطرح.",
  },
  {
    id: 'doc_mct113_textbook_secondary',
    title: '📚 الكتاب المساعد المعتمد: Introduction to Computers — Peter Norton',
    courseCode: 'MCT113',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/peter-norton-intro-to-computers/Peter%20Norton%20Intro%20to%20Computers.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "الكتاب المساعد والتمارين المحلولة الداعمة لمادة (مبادئ الحاسوب) - جامعة البصرة.\n📌 *الفهرس والمفردات:* تمثيل البيانات والأنظمة العددية (Binary, Hexadecimal, Octal, 2's Complement)، بنية الحاسوب والمعالجات، أنظمة التشغيل، الخوارزميات ومخططات التدفق (Flowcharts)، وأساسيات شبكات الحاسوب وأمن المعلومات.\n📐 *أهم القوانين:* التحويل بين الأنظمة العددية، حساب نطاق الأعداد المؤشرة n-bit 2's complement من -2^(n-1) إلى 2^(n-1)-1.\n💡 *نصائح امتحانية:* تدرب على العمليات الحسابية الثنائية واكتشاف الـ Overflow في الجمع والطرح.",
  },
  {
    id: 'doc_mct113_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (مبادئ الحاسوب)',
    courseCode: 'MCT113',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/computer-science-an-overview-13th-edition/Computer%20Science%20An%20Overview%2013th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (مبادئ الحاسوب - MCT113) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* تمثيل البيانات والأنظمة العددية (Binary, Hexadecimal, Octal, 2's Complement)، بنية الحاسوب والمعالجات، أنظمة التشغيل، الخوارزميات ومخططات التدفق (Flowcharts)، وأساسيات شبكات الحاسوب وأمن المعلومات.\n📐 *أهم القوانين:* التحويل بين الأنظمة العددية، حساب نطاق الأعداد المؤشرة n-bit 2's complement من -2^(n-1) إلى 2^(n-1)-1.\n💡 *نصائح امتحانية:* تدرب على العمليات الحسابية الثنائية واكتشاف الـ Overflow في الجمع والطرح.",
  },
  {
    id: 'doc_mct113_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (مبادئ الحاسوب)',
    courseCode: 'MCT113',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/computer-science-an-overview-13th-edition/Computer%20Science%20An%20Overview%2013th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "📌 *الفهرس والمفردات:* تمثيل البيانات والأنظمة العددية (Binary, Hexadecimal, Octal, 2's Complement)، بنية الحاسوب والمعالجات، أنظمة التشغيل، الخوارزميات ومخططات التدفق (Flowcharts)، وأساسيات شبكات الحاسوب وأمن المعلومات.\n📐 *أهم القوانين:* التحويل بين الأنظمة العددية، حساب نطاق الأعداد المؤشرة n-bit 2's complement من -2^(n-1) إلى 2^(n-1)-1.\n💡 *نصائح امتحانية:* تدرب على العمليات الحسابية الثنائية واكتشاف الـ Overflow في الجمع والطرح.",
  },
  {
    id: 'doc_mct114_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Chemistry for Engineering Students (4th Ed.) — Lawrence S. Brown, Thomas A. Holme',
    courseCode: 'MCT114',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/chemistry-for-engineering-students-4th-edition/Chemistry%20for%20Engineering%20Students%204th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (الكيمياء) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* البنية الذرية، الروابط الكيميائية، الكيمياء الحرارية، الحركية الكيميائية والاتزان، الكيمياء الكهربائية وتآكل المعادن (Corrosion mechanisms and protection)، والبوليمرات والمواد الهندسية الحديثة.\n📐 *أهم القوانين:* معادلة نرنست E = E0 - (RT/nF)*ln(Q)، وقوانين فاراداي للتحليل الكهربائي m = (Q*M)/(z*F).\n💡 *نصائح امتحانية:* ركز على خلايا الجلفنة وآليات الحماية المهبطية (Cathodic Protection) وتأثير الوسط الحمضي على سرعة التآكل.',
  },
  {
    id: 'doc_mct114_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: General Chemistry: Principles and Modern Applications — Ralph H. Petrucci',
    courseCode: 'MCT114',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/general-chemistry-petrucci-11th/General%20Chemistry%20Petrucci.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (الكيمياء) - جامعة البصرة.\n📌 *الفهرس والمفردات:* البنية الذرية، الروابط الكيميائية، الكيمياء الحرارية، الحركية الكيميائية والاتزان، الكيمياء الكهربائية وتآكل المعادن (Corrosion mechanisms and protection)، والبوليمرات والمواد الهندسية الحديثة.\n📐 *أهم القوانين:* معادلة نرنست E = E0 - (RT/nF)*ln(Q)، وقوانين فاراداي للتحليل الكهربائي m = (Q*M)/(z*F).\n💡 *نصائح امتحانية:* ركز على خلايا الجلفنة وآليات الحماية المهبطية (Cathodic Protection) وتأثير الوسط الحمضي على سرعة التآكل.',
  },
  {
    id: 'doc_mct114_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (الكيمياء)',
    courseCode: 'MCT114',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/chemistry-for-engineering-students-4th-edition/Chemistry%20for%20Engineering%20Students%204th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (الكيمياء - MCT114) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* البنية الذرية، الروابط الكيميائية، الكيمياء الحرارية، الحركية الكيميائية والاتزان، الكيمياء الكهربائية وتآكل المعادن (Corrosion mechanisms and protection)، والبوليمرات والمواد الهندسية الحديثة.\n📐 *أهم القوانين:* معادلة نرنست E = E0 - (RT/nF)*ln(Q)، وقوانين فاراداي للتحليل الكهربائي m = (Q*M)/(z*F).\n💡 *نصائح امتحانية:* ركز على خلايا الجلفنة وآليات الحماية المهبطية (Cathodic Protection) وتأثير الوسط الحمضي على سرعة التآكل.',
  },
  {
    id: 'doc_mct114_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (الكيمياء)',
    courseCode: 'MCT114',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/chemistry-for-engineering-students-4th-edition/Chemistry%20for%20Engineering%20Students%204th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* البنية الذرية، الروابط الكيميائية، الكيمياء الحرارية، الحركية الكيميائية والاتزان، الكيمياء الكهربائية وتآكل المعادن (Corrosion mechanisms and protection)، والبوليمرات والمواد الهندسية الحديثة.\n📐 *أهم القوانين:* معادلة نرنست E = E0 - (RT/nF)*ln(Q)، وقوانين فاراداي للتحليل الكهربائي m = (Q*M)/(z*F).\n💡 *نصائح امتحانية:* ركز على خلايا الجلفنة وآليات الحماية المهبطية (Cathodic Protection) وتأثير الوسط الحمضي على سرعة التآكل.',
  },
  {
    id: 'doc_mct115_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Engineering Mechanics: Statics (14th/15th Ed.) — R. C. Hibbeler',
    courseCode: 'MCT115',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/engineering-mechanics-statics-14th-edition-rc-hibbeler/Engineering%20Mechanics%20Statics%2014th%20Edition%20-%20R.C.%20Hibbeler.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (ميكانيك هندسي (ستاتيك)) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* جبر المتجهات في البعدين والثلاثة أبعاد، عزم القوة والازدواج، توازن الجسيمات والأجسام الصلبة، تحليل الجملونات بطريقة العقد والمقاطع، قوى الاحتكاك الجاف، والمراكز الهندسية وعزوم القصور الذاتي.\n📐 *أهم القوانين:* معادلات التوازن ΣFx = 0, ΣFy = 0, ΣM = 0، وقوة الاحتكاك القصوى F_max = μs * N.\n💡 *نصائح امتحانية:* ارسم مخطط الجسم الحر (Free Body Diagram) كاملاً متضمناً كافة ردود الأفعال قبل البدء بأي معادلة توازن.',
  },
  {
    id: 'doc_mct115_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Vector Mechanics for Engineers: Statics (12th Ed.) — Ferdinand Beer, E. Russell Johnston',
    courseCode: 'MCT115',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/vector-mechanics-for-engineers-statics-12th-edition/Vector%20Mechanics%20for%20Engineers%20Statics%2012th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (ميكانيك هندسي (ستاتيك)) - جامعة البصرة.\n📌 *الفهرس والمفردات:* جبر المتجهات في البعدين والثلاثة أبعاد، عزم القوة والازدواج، توازن الجسيمات والأجسام الصلبة، تحليل الجملونات بطريقة العقد والمقاطع، قوى الاحتكاك الجاف، والمراكز الهندسية وعزوم القصور الذاتي.\n📐 *أهم القوانين:* معادلات التوازن ΣFx = 0, ΣFy = 0, ΣM = 0، وقوة الاحتكاك القصوى F_max = μs * N.\n💡 *نصائح امتحانية:* ارسم مخطط الجسم الحر (Free Body Diagram) كاملاً متضمناً كافة ردود الأفعال قبل البدء بأي معادلة توازن.',
  },
  {
    id: 'doc_mct115_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (ميكانيك هندسي (ستاتيك))',
    courseCode: 'MCT115',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/engineering-mechanics-statics-14th-edition-rc-hibbeler/Engineering%20Mechanics%20Statics%2014th%20Edition%20-%20R.C.%20Hibbeler.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (ميكانيك هندسي (ستاتيك) - MCT115) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* جبر المتجهات في البعدين والثلاثة أبعاد، عزم القوة والازدواج، توازن الجسيمات والأجسام الصلبة، تحليل الجملونات بطريقة العقد والمقاطع، قوى الاحتكاك الجاف، والمراكز الهندسية وعزوم القصور الذاتي.\n📐 *أهم القوانين:* معادلات التوازن ΣFx = 0, ΣFy = 0, ΣM = 0، وقوة الاحتكاك القصوى F_max = μs * N.\n💡 *نصائح امتحانية:* ارسم مخطط الجسم الحر (Free Body Diagram) كاملاً متضمناً كافة ردود الأفعال قبل البدء بأي معادلة توازن.',
  },
  {
    id: 'doc_mct115_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (ميكانيك هندسي (ستاتيك))',
    courseCode: 'MCT115',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/engineering-mechanics-statics-14th-edition-rc-hibbeler/Engineering%20Mechanics%20Statics%2014th%20Edition%20-%20R.C.%20Hibbeler.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* جبر المتجهات في البعدين والثلاثة أبعاد، عزم القوة والازدواج، توازن الجسيمات والأجسام الصلبة، تحليل الجملونات بطريقة العقد والمقاطع، قوى الاحتكاك الجاف، والمراكز الهندسية وعزوم القصور الذاتي.\n📐 *أهم القوانين:* معادلات التوازن ΣFx = 0, ΣFy = 0, ΣM = 0، وقوة الاحتكاك القصوى F_max = μs * N.\n💡 *نصائح امتحانية:* ارسم مخطط الجسم الحر (Free Body Diagram) كاملاً متضمناً كافة ردود الأفعال قبل البدء بأي معادلة توازن.',
  },
  {
    id: 'doc_mct116_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (اللغة العربية 1)',
    courseCode: 'MCT116',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://raw.githubusercontent.com/uobasrah-mechatronics/academic-archive/main/curriculum/3437Mechatronics%20Engineering.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (اللغة العربية 1 - MCT116) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* قواعد النحو والصرف الأساسية، الأخطاء اللغوية الشائعة في المخاطبات الرسمية، الصياغة القانونية والتقرير الفني، وعلامات الترقيم.\n💡 *نصائح امتحانية:* مراجعة التمييز والعدد وإعراب الأسماء الخمسة والممنوع من الصرف.',
  },
  {
    id: 'doc_mct116_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (اللغة العربية 1)',
    courseCode: 'MCT116',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value: 'https://archive.org/download/mct116-lecture-notes/notes.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* قواعد النحو والصرف الأساسية، الأخطاء اللغوية الشائعة في المخاطبات الرسمية، الصياغة القانونية والتقرير الفني، وعلامات الترقيم.\n💡 *نصائح امتحانية:* مراجعة التمييز والعدد وإعراب الأسماء الخمسة والممنوع من الصرف.',
  },
  {
    id: 'doc_mct117_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Technical Drawing with Engineering Graphics (15th Ed.) — Frederick E. Giesecke et al.',
    courseCode: 'MCT117',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/technical-drawing-with-engineering-graphics-15th-edition/Technical%20Drawing%2015th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (الرسم الهندسي بالحاسوب) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* مبادئ الرسم الهندسي، الإسقاط المتعامد (Orthographic Projection)، رسم المساقط الثلاثة، القطاعات الهندسية (Full & Half Sections)، الأبعاد والتفاوتات، والرسم بمساعدة الحاسوب (AutoCAD).\n💡 *نصائح امتحانية:* الالتزام الصارم بسماكات الخطوط ومحاذاة المساقط وأسهم الأبعاد وفق المعيار القياسي ISO.',
  },
  {
    id: 'doc_mct117_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Engineering Drawing and Design (6th Ed.) — David A. Madsen, David P. Madsen',
    courseCode: 'MCT117',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/engineering-drawing-and-design-6th-madsen/Engineering%20Drawing%20and%20Design%206th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (الرسم الهندسي بالحاسوب) - جامعة البصرة.\n📌 *الفهرس والمفردات:* مبادئ الرسم الهندسي، الإسقاط المتعامد (Orthographic Projection)، رسم المساقط الثلاثة، القطاعات الهندسية (Full & Half Sections)، الأبعاد والتفاوتات، والرسم بمساعدة الحاسوب (AutoCAD).\n💡 *نصائح امتحانية:* الالتزام الصارم بسماكات الخطوط ومحاذاة المساقط وأسهم الأبعاد وفق المعيار القياسي ISO.',
  },
  {
    id: 'doc_mct117_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (الرسم الهندسي بالحاسوب)',
    courseCode: 'MCT117',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/technical-drawing-with-engineering-graphics-15th-edition/Technical%20Drawing%2015th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (الرسم الهندسي بالحاسوب - MCT117) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* مبادئ الرسم الهندسي، الإسقاط المتعامد (Orthographic Projection)، رسم المساقط الثلاثة، القطاعات الهندسية (Full & Half Sections)، الأبعاد والتفاوتات، والرسم بمساعدة الحاسوب (AutoCAD).\n💡 *نصائح امتحانية:* الالتزام الصارم بسماكات الخطوط ومحاذاة المساقط وأسهم الأبعاد وفق المعيار القياسي ISO.',
  },
  {
    id: 'doc_mct117_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (الرسم الهندسي بالحاسوب)',
    courseCode: 'MCT117',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/technical-drawing-with-engineering-graphics-15th-edition/Technical%20Drawing%2015th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* مبادئ الرسم الهندسي، الإسقاط المتعامد (Orthographic Projection)، رسم المساقط الثلاثة، القطاعات الهندسية (Full & Half Sections)، الأبعاد والتفاوتات، والرسم بمساعدة الحاسوب (AutoCAD).\n💡 *نصائح امتحانية:* الالتزام الصارم بسماكات الخطوط ومحاذاة المساقط وأسهم الأبعاد وفق المعيار القياسي ISO.',
  },
  {
    id: 'doc_mct121_textbook_primary',
    title:
      "📖 الكتاب المنهجي الرئيسي: Thomas' Calculus (14th/15th Ed.) — George B. Thomas, Maurice D. Weir, Joel Hass",
    courseCode: 'MCT121',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/thomas-calculus-14th-edition/Thomas%20Calculus%2014th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (الرياضيات II) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* تقنيات التكامل المتقدمة (التجزئة، التعويض المثلثي، الكسور الجزئية)، المتسلسلات اللانهائية واختبارات التقارب (Ratio, Root, Integral Tests)، متسلسلات تايلور وماكلورين، والإحداثيات القطبية والمتجهات الفضائية.\n📐 *أهم القوانين:* التكامل بالتجزئة ∫u dv = uv - ∫v du، ومتسلسلة تايلور f(x) = Σ [f^(n)(a)/n!]*(x-a)^n.\n💡 *نصائح امتحانية:* تحقق دائماً من شرط تقارب المتسلسلة وفترة التقارب (Interval of Convergence).',
  },
  {
    id: 'doc_mct121_textbook_secondary',
    title: '📚 الكتاب المساعد المعتمد: Calculus: Early Transcendentals (9th Ed.) — James Stewart',
    courseCode: 'MCT121',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/calculus-early-transcendentals-9th-edition/Calculus%20Early%20Transcendentals%209th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (الرياضيات II) - جامعة البصرة.\n📌 *الفهرس والمفردات:* تقنيات التكامل المتقدمة (التجزئة، التعويض المثلثي، الكسور الجزئية)، المتسلسلات اللانهائية واختبارات التقارب (Ratio, Root, Integral Tests)، متسلسلات تايلور وماكلورين، والإحداثيات القطبية والمتجهات الفضائية.\n📐 *أهم القوانين:* التكامل بالتجزئة ∫u dv = uv - ∫v du، ومتسلسلة تايلور f(x) = Σ [f^(n)(a)/n!]*(x-a)^n.\n💡 *نصائح امتحانية:* تحقق دائماً من شرط تقارب المتسلسلة وفترة التقارب (Interval of Convergence).',
  },
  {
    id: 'doc_mct121_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (الرياضيات II)',
    courseCode: 'MCT121',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/thomas-calculus-14th-edition/Thomas%20Calculus%2014th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (الرياضيات II - MCT121) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* تقنيات التكامل المتقدمة (التجزئة، التعويض المثلثي، الكسور الجزئية)، المتسلسلات اللانهائية واختبارات التقارب (Ratio, Root, Integral Tests)، متسلسلات تايلور وماكلورين، والإحداثيات القطبية والمتجهات الفضائية.\n📐 *أهم القوانين:* التكامل بالتجزئة ∫u dv = uv - ∫v du، ومتسلسلة تايلور f(x) = Σ [f^(n)(a)/n!]*(x-a)^n.\n💡 *نصائح امتحانية:* تحقق دائماً من شرط تقارب المتسلسلة وفترة التقارب (Interval of Convergence).',
  },
  {
    id: 'doc_mct121_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (الرياضيات II)',
    courseCode: 'MCT121',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/thomas-calculus-14th-edition/Thomas%20Calculus%2014th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* تقنيات التكامل المتقدمة (التجزئة، التعويض المثلثي، الكسور الجزئية)، المتسلسلات اللانهائية واختبارات التقارب (Ratio, Root, Integral Tests)، متسلسلات تايلور وماكلورين، والإحداثيات القطبية والمتجهات الفضائية.\n📐 *أهم القوانين:* التكامل بالتجزئة ∫u dv = uv - ∫v du، ومتسلسلة تايلور f(x) = Σ [f^(n)(a)/n!]*(x-a)^n.\n💡 *نصائح امتحانية:* تحقق دائماً من شرط تقارب المتسلسلة وفترة التقارب (Interval of Convergence).',
  },
  {
    id: 'doc_mct122_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Electric Circuits (11th Ed.) — James W. Nilsson, Susan A. Riedel',
    courseCode: 'MCT122',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/electric-circuits-11th-edition-nilsson/Electric%20Circuits%2011th%20Edition%20Nilsson.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (الدوائر الكهربائية 2) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* استجابة دوائر الرتبة الأولى RL و RC العابرة (Transient Response)، دوائر الرتبة الثانية RLC، تحليل دوائر التيار المتناوب AC باستخدام الطوريات (Phasors)، حسابات القدرة الحقيقية والمتفاعلة والمظهرية، والدوائر ثلاثية الأطوار 3-Phase.\n📐 *أهم القوانين:* ثابت الزمن τ = L/R أو τ = R*C، القدرة المركبة S = P + jQ = V_rms * I_rms*.\n💡 *نصائح امتحانية:* ميز بين زاوية الطور للجهد والتيار، وتذكر أن التيار يتقدم على الجهد في المتسعة ويتأخر في الملف (CIVIL).',
  },
  {
    id: 'doc_mct122_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Engineering Circuit Analysis (9th Ed.) — William H. Hayt et al.',
    courseCode: 'MCT122',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/hayt-engineering-circuit-analysis-9th-edition/Engineering%20Circuit%20Analysis%209th%20Edition%20Hayt.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (الدوائر الكهربائية 2) - جامعة البصرة.\n📌 *الفهرس والمفردات:* استجابة دوائر الرتبة الأولى RL و RC العابرة (Transient Response)، دوائر الرتبة الثانية RLC، تحليل دوائر التيار المتناوب AC باستخدام الطوريات (Phasors)، حسابات القدرة الحقيقية والمتفاعلة والمظهرية، والدوائر ثلاثية الأطوار 3-Phase.\n📐 *أهم القوانين:* ثابت الزمن τ = L/R أو τ = R*C، القدرة المركبة S = P + jQ = V_rms * I_rms*.\n💡 *نصائح امتحانية:* ميز بين زاوية الطور للجهد والتيار، وتذكر أن التيار يتقدم على الجهد في المتسعة ويتأخر في الملف (CIVIL).',
  },
  {
    id: 'doc_mct122_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (الدوائر الكهربائية 2)',
    courseCode: 'MCT122',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/electric-circuits-11th-edition-nilsson/Electric%20Circuits%2011th%20Edition%20Nilsson.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (الدوائر الكهربائية 2 - MCT122) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* استجابة دوائر الرتبة الأولى RL و RC العابرة (Transient Response)، دوائر الرتبة الثانية RLC، تحليل دوائر التيار المتناوب AC باستخدام الطوريات (Phasors)، حسابات القدرة الحقيقية والمتفاعلة والمظهرية، والدوائر ثلاثية الأطوار 3-Phase.\n📐 *أهم القوانين:* ثابت الزمن τ = L/R أو τ = R*C، القدرة المركبة S = P + jQ = V_rms * I_rms*.\n💡 *نصائح امتحانية:* ميز بين زاوية الطور للجهد والتيار، وتذكر أن التيار يتقدم على الجهد في المتسعة ويتأخر في الملف (CIVIL).',
  },
  {
    id: 'doc_mct122_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (الدوائر الكهربائية 2)',
    courseCode: 'MCT122',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/electric-circuits-11th-edition-nilsson/Electric%20Circuits%2011th%20Edition%20Nilsson.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* استجابة دوائر الرتبة الأولى RL و RC العابرة (Transient Response)، دوائر الرتبة الثانية RLC، تحليل دوائر التيار المتناوب AC باستخدام الطوريات (Phasors)، حسابات القدرة الحقيقية والمتفاعلة والمظهرية، والدوائر ثلاثية الأطوار 3-Phase.\n📐 *أهم القوانين:* ثابت الزمن τ = L/R أو τ = R*C، القدرة المركبة S = P + jQ = V_rms * I_rms*.\n💡 *نصائح امتحانية:* ميز بين زاوية الطور للجهد والتيار، وتذكر أن التيار يتقدم على الجهد في المتسعة ويتأخر في الملف (CIVIL).',
  },
  {
    id: 'doc_mct123_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Digital Design: With an Introduction to the Verilog HDL (6th Ed.) — M. Morris Mano, Michael D. Ciletti',
    courseCode: 'MCT123',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/digital-design-6th-edition-mano/Digital%20Design%206th%20Edition%20Mano.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (تصميم النظم الرقمية) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* الجبر البولياني وتبسيط الدوال المنطقية بواسطة خرائط كارنوف (K-Maps)، تصميم الدوائر التوافقية (Adders, Multiplexers, Encoders, Decoders)، والدوائر التتابعية المتزامنة (Flip-Flops, Counters, FSM Design).\n📐 *أهم القوانين:* نظريات دي مورغان (A+B)' = A'B' و (AB)' = A'+B'، وتصميم جداول الإثارة للـ JK و D Flip-Flops.\n💡 *نصائح امتحانية:* انتبه لحالات الإهمال (Don't Care conditions) في K-Maps لتحقيق أقصى تبسيط منطقي.",
  },
  {
    id: 'doc_mct123_textbook_secondary',
    title: '📚 الكتاب المساعد المعتمد: Digital Fundamentals (11th Ed.) — Thomas L. Floyd',
    courseCode: 'MCT123',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/digital-fundamentals-11th-edition-floyd/Digital%20Fundamentals%2011th%20Floyd.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "الكتاب المساعد والتمارين المحلولة الداعمة لمادة (تصميم النظم الرقمية) - جامعة البصرة.\n📌 *الفهرس والمفردات:* الجبر البولياني وتبسيط الدوال المنطقية بواسطة خرائط كارنوف (K-Maps)، تصميم الدوائر التوافقية (Adders, Multiplexers, Encoders, Decoders)، والدوائر التتابعية المتزامنة (Flip-Flops, Counters, FSM Design).\n📐 *أهم القوانين:* نظريات دي مورغان (A+B)' = A'B' و (AB)' = A'+B'، وتصميم جداول الإثارة للـ JK و D Flip-Flops.\n💡 *نصائح امتحانية:* انتبه لحالات الإهمال (Don't Care conditions) في K-Maps لتحقيق أقصى تبسيط منطقي.",
  },
  {
    id: 'doc_mct123_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (تصميم النظم الرقمية)',
    courseCode: 'MCT123',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/digital-design-6th-edition-mano/Digital%20Design%206th%20Edition%20Mano.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (تصميم النظم الرقمية - MCT123) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* الجبر البولياني وتبسيط الدوال المنطقية بواسطة خرائط كارنوف (K-Maps)، تصميم الدوائر التوافقية (Adders, Multiplexers, Encoders, Decoders)، والدوائر التتابعية المتزامنة (Flip-Flops, Counters, FSM Design).\n📐 *أهم القوانين:* نظريات دي مورغان (A+B)' = A'B' و (AB)' = A'+B'، وتصميم جداول الإثارة للـ JK و D Flip-Flops.\n💡 *نصائح امتحانية:* انتبه لحالات الإهمال (Don't Care conditions) في K-Maps لتحقيق أقصى تبسيط منطقي.",
  },
  {
    id: 'doc_mct123_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (تصميم النظم الرقمية)',
    courseCode: 'MCT123',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/digital-design-6th-edition-mano/Digital%20Design%206th%20Edition%20Mano.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "📌 *الفهرس والمفردات:* الجبر البولياني وتبسيط الدوال المنطقية بواسطة خرائط كارنوف (K-Maps)، تصميم الدوائر التوافقية (Adders, Multiplexers, Encoders, Decoders)، والدوائر التتابعية المتزامنة (Flip-Flops, Counters, FSM Design).\n📐 *أهم القوانين:* نظريات دي مورغان (A+B)' = A'B' و (AB)' = A'+B'، وتصميم جداول الإثارة للـ JK و D Flip-Flops.\n💡 *نصائح امتحانية:* انتبه لحالات الإهمال (Don't Care conditions) في K-Maps لتحقيق أقصى تبسيط منطقي.",
  },
  {
    id: 'doc_mct124_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Physics for Scientists and Engineers with Modern Physics (10th Ed.) — Raymond A. Serway, John W. Jewett',
    courseCode: 'MCT124',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/physics-for-scientists-and-engineers-serway-10th/Physics%20for%20Scientists%20and%20Engineers%20Serway%2010th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (الفيزياء) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* البصريات الهندسية والموجية (التداخل والحيود والاستقطاب)، المغناطيسية وقانون بيو-سافار، الحث الكهرومغناطيسي وقانون فاراداي، ومعادلات ماكسويل التمهيدية والفيزياء الحديثة ونظرية الكم.\n📐 *أهم القوانين:* قانون سنل n1*sin(θ1) = n2*sin(θ2)، القوة المغناطيسية F = q*(v x B) + q*E.\n💡 *نصائح امتحانية:* التركيز على قاعدة اليد اليمنى لتحديد اتجاه القوة المغناطيسية والمجال الحثي.',
  },
  {
    id: 'doc_mct124_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: University Physics with Modern Physics (15th Ed.) — Hugh D. Young, Roger A. Freedman',
    courseCode: 'MCT124',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/university-physics-with-modern-physics-15th/University%20Physics%2015th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (الفيزياء) - جامعة البصرة.\n📌 *الفهرس والمفردات:* البصريات الهندسية والموجية (التداخل والحيود والاستقطاب)، المغناطيسية وقانون بيو-سافار، الحث الكهرومغناطيسي وقانون فاراداي، ومعادلات ماكسويل التمهيدية والفيزياء الحديثة ونظرية الكم.\n📐 *أهم القوانين:* قانون سنل n1*sin(θ1) = n2*sin(θ2)، القوة المغناطيسية F = q*(v x B) + q*E.\n💡 *نصائح امتحانية:* التركيز على قاعدة اليد اليمنى لتحديد اتجاه القوة المغناطيسية والمجال الحثي.',
  },
  {
    id: 'doc_mct124_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (الفيزياء)',
    courseCode: 'MCT124',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/physics-for-scientists-and-engineers-serway-10th/Physics%20for%20Scientists%20and%20Engineers%20Serway%2010th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (الفيزياء - MCT124) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* البصريات الهندسية والموجية (التداخل والحيود والاستقطاب)، المغناطيسية وقانون بيو-سافار، الحث الكهرومغناطيسي وقانون فاراداي، ومعادلات ماكسويل التمهيدية والفيزياء الحديثة ونظرية الكم.\n📐 *أهم القوانين:* قانون سنل n1*sin(θ1) = n2*sin(θ2)، القوة المغناطيسية F = q*(v x B) + q*E.\n💡 *نصائح امتحانية:* التركيز على قاعدة اليد اليمنى لتحديد اتجاه القوة المغناطيسية والمجال الحثي.',
  },
  {
    id: 'doc_mct124_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (الفيزياء)',
    courseCode: 'MCT124',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/physics-for-scientists-and-engineers-serway-10th/Physics%20for%20Scientists%20and%20Engineers%20Serway%2010th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* البصريات الهندسية والموجية (التداخل والحيود والاستقطاب)، المغناطيسية وقانون بيو-سافار، الحث الكهرومغناطيسي وقانون فاراداي، ومعادلات ماكسويل التمهيدية والفيزياء الحديثة ونظرية الكم.\n📐 *أهم القوانين:* قانون سنل n1*sin(θ1) = n2*sin(θ2)، القوة المغناطيسية F = q*(v x B) + q*E.\n💡 *نصائح امتحانية:* التركيز على قاعدة اليد اليمنى لتحديد اتجاه القوة المغناطيسية والمجال الحثي.',
  },
  {
    id: 'doc_mct125_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Engineering Mechanics: Dynamics (14th/15th Ed.) — R. C. Hibbeler',
    courseCode: 'MCT125',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/engineering-mechanics-dynamics-14th-edition-rc-hibbeler/Engineering%20Mechanics%20Dynamics%2014th%20Edition%20-%20R.C.%20Hibbeler.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (ميكانيك هندسي (داينمك)) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* كينماتيكا وكيناتيكا الجسيمات، معادلات الحركة المستقيمة والمنحنية، قانون نيوتن الثاني (F = ma)، مبدأ الشغل والطاقة، مبدأ الدفع والزخم الخطي والزاوي، وتصادم الأجسام.\n📐 *أهم القوانين:* معادلات الحركة بعجلة ثابتة، T1 + V1 + U1-2 = T2 + V2، ومعامل الارتداد e = (vB2 - vA2)/(vA1 - vB1).\n💡 *نصائح امتحانية:* ميز بين الإحداثيات الكارتيزية والطبيعية (n-t) والقطبية (r-θ) حسب طبيعة مسار الحركة.',
  },
  {
    id: 'doc_mct125_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Vector Mechanics for Engineers: Dynamics (12th Ed.) — Ferdinand Beer, E. Russell Johnston',
    courseCode: 'MCT125',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/vector-mechanics-for-engineers-dynamics-12th-edition/Vector%20Mechanics%20for%20Engineers%20Dynamics%2012th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (ميكانيك هندسي (داينمك)) - جامعة البصرة.\n📌 *الفهرس والمفردات:* كينماتيكا وكيناتيكا الجسيمات، معادلات الحركة المستقيمة والمنحنية، قانون نيوتن الثاني (F = ma)، مبدأ الشغل والطاقة، مبدأ الدفع والزخم الخطي والزاوي، وتصادم الأجسام.\n📐 *أهم القوانين:* معادلات الحركة بعجلة ثابتة، T1 + V1 + U1-2 = T2 + V2، ومعامل الارتداد e = (vB2 - vA2)/(vA1 - vB1).\n💡 *نصائح امتحانية:* ميز بين الإحداثيات الكارتيزية والطبيعية (n-t) والقطبية (r-θ) حسب طبيعة مسار الحركة.',
  },
  {
    id: 'doc_mct125_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (ميكانيك هندسي (داينمك))',
    courseCode: 'MCT125',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/engineering-mechanics-dynamics-14th-edition-rc-hibbeler/Engineering%20Mechanics%20Dynamics%2014th%20Edition%20-%20R.C.%20Hibbeler.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (ميكانيك هندسي (داينمك) - MCT125) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* كينماتيكا وكيناتيكا الجسيمات، معادلات الحركة المستقيمة والمنحنية، قانون نيوتن الثاني (F = ma)، مبدأ الشغل والطاقة، مبدأ الدفع والزخم الخطي والزاوي، وتصادم الأجسام.\n📐 *أهم القوانين:* معادلات الحركة بعجلة ثابتة، T1 + V1 + U1-2 = T2 + V2، ومعامل الارتداد e = (vB2 - vA2)/(vA1 - vB1).\n💡 *نصائح امتحانية:* ميز بين الإحداثيات الكارتيزية والطبيعية (n-t) والقطبية (r-θ) حسب طبيعة مسار الحركة.',
  },
  {
    id: 'doc_mct125_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (ميكانيك هندسي (داينمك))',
    courseCode: 'MCT125',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/engineering-mechanics-dynamics-14th-edition-rc-hibbeler/Engineering%20Mechanics%20Dynamics%2014th%20Edition%20-%20R.C.%20Hibbeler.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* كينماتيكا وكيناتيكا الجسيمات، معادلات الحركة المستقيمة والمنحنية، قانون نيوتن الثاني (F = ma)، مبدأ الشغل والطاقة، مبدأ الدفع والزخم الخطي والزاوي، وتصادم الأجسام.\n📐 *أهم القوانين:* معادلات الحركة بعجلة ثابتة، T1 + V1 + U1-2 = T2 + V2، ومعامل الارتداد e = (vB2 - vA2)/(vA1 - vB1).\n💡 *نصائح امتحانية:* ميز بين الإحداثيات الكارتيزية والطبيعية (n-t) والقطبية (r-θ) حسب طبيعة مسار الحركة.',
  },
  {
    id: 'doc_mct126_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (اللغة الإنكليزية 1)',
    courseCode: 'MCT126',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://raw.githubusercontent.com/uobasrah-mechatronics/academic-archive/main/curriculum/3437Mechatronics%20Engineering.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (اللغة الإنكليزية 1 - MCT126) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* المصطلحات التقنية الهندسية، كتابة التقارير والمذكرات الفنية، قواعد اللغة الإنكليزية المتقدمة، ومهارات قراءة الأوراق البحثية والمراجع الأكاديمية.',
  },
  {
    id: 'doc_mct126_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (اللغة الإنكليزية 1)',
    courseCode: 'MCT126',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value: 'https://archive.org/download/mct126-lecture-notes/notes.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* المصطلحات التقنية الهندسية، كتابة التقارير والمذكرات الفنية، قواعد اللغة الإنكليزية المتقدمة، ومهارات قراءة الأوراق البحثية والمراجع الأكاديمية.',
  },
  {
    id: 'doc_mct127_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (حقوق الإنسان والديمقراطية والحرية)',
    courseCode: 'MCT127',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://raw.githubusercontent.com/uobasrah-mechatronics/academic-archive/main/curriculum/3437Mechatronics%20Engineering.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (حقوق الإنسان والديمقراطية والحرية - MCT127) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* المبادئ الدستورية وحقوق الإنسان، الاتفاقيات الدولية، مفاهيم الديمقراطية والتعددية، والحريات الأكاديمية والمجتمعية في القانون العراقي والدولي.',
  },
  {
    id: 'doc_mct127_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (حقوق الإنسان والديمقراطية والحرية)',
    courseCode: 'MCT127',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value: 'https://archive.org/download/mct127-lecture-notes/notes.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* المبادئ الدستورية وحقوق الإنسان، الاتفاقيات الدولية، مفاهيم الديمقراطية والتعددية، والحريات الأكاديمية والمجتمعية في القانون العراقي والدولي.',
  },
  {
    id: 'doc_mct211_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Advanced Engineering Mathematics (10th Ed.) — Erwin Kreyszig',
    courseCode: 'MCT211',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/advanced-engineering-mathematics-10th-edition-kreyszig/Advanced%20Engineering%20Mathematics%2010th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (الرياضيات III) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* التفاضل الجزئي ومشتقات الاتجاه، التكاملات المتعددة (المزدوجة والثلاثية وتطبيقاتها في حساب الحجوم والمراكز)، حساب المتجهات (Gradient, Divergence, Curl)، ونظريات التكامل المتجهي (Green, Stokes, Divergence Theorems).\n📐 *أهم القوانين:* grad(f) = ∇f, div(F) = ∇·F, curl(F) = ∇xF، نظرية غرين ∮(P dx + Q dy) = ∬(∂Q/∂x - ∂P/∂y) dA.\n💡 *نصائح امتحانية:* تحويل التكاملات إلى الإحداثيات القطبية أو الأسطوانية أو الكروية عند وجود تماثل دائري يختصر الحل بنسبة 80%.',
  },
  {
    id: 'doc_mct211_textbook_secondary',
    title: "📚 الكتاب المساعد المعتمد: Thomas' Calculus (14th Ed.) — George B. Thomas et al.",
    courseCode: 'MCT211',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/thomas-calculus-14th-edition/Thomas%20Calculus%2014th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (الرياضيات III) - جامعة البصرة.\n📌 *الفهرس والمفردات:* التفاضل الجزئي ومشتقات الاتجاه، التكاملات المتعددة (المزدوجة والثلاثية وتطبيقاتها في حساب الحجوم والمراكز)، حساب المتجهات (Gradient, Divergence, Curl)، ونظريات التكامل المتجهي (Green, Stokes, Divergence Theorems).\n📐 *أهم القوانين:* grad(f) = ∇f, div(F) = ∇·F, curl(F) = ∇xF، نظرية غرين ∮(P dx + Q dy) = ∬(∂Q/∂x - ∂P/∂y) dA.\n💡 *نصائح امتحانية:* تحويل التكاملات إلى الإحداثيات القطبية أو الأسطوانية أو الكروية عند وجود تماثل دائري يختصر الحل بنسبة 80%.',
  },
  {
    id: 'doc_mct211_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (الرياضيات III)',
    courseCode: 'MCT211',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/advanced-engineering-mathematics-10th-edition-kreyszig/Advanced%20Engineering%20Mathematics%2010th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (الرياضيات III - MCT211) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* التفاضل الجزئي ومشتقات الاتجاه، التكاملات المتعددة (المزدوجة والثلاثية وتطبيقاتها في حساب الحجوم والمراكز)، حساب المتجهات (Gradient, Divergence, Curl)، ونظريات التكامل المتجهي (Green, Stokes, Divergence Theorems).\n📐 *أهم القوانين:* grad(f) = ∇f, div(F) = ∇·F, curl(F) = ∇xF، نظرية غرين ∮(P dx + Q dy) = ∬(∂Q/∂x - ∂P/∂y) dA.\n💡 *نصائح امتحانية:* تحويل التكاملات إلى الإحداثيات القطبية أو الأسطوانية أو الكروية عند وجود تماثل دائري يختصر الحل بنسبة 80%.',
  },
  {
    id: 'doc_mct211_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (الرياضيات III)',
    courseCode: 'MCT211',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/advanced-engineering-mathematics-10th-edition-kreyszig/Advanced%20Engineering%20Mathematics%2010th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* التفاضل الجزئي ومشتقات الاتجاه، التكاملات المتعددة (المزدوجة والثلاثية وتطبيقاتها في حساب الحجوم والمراكز)، حساب المتجهات (Gradient, Divergence, Curl)، ونظريات التكامل المتجهي (Green, Stokes, Divergence Theorems).\n📐 *أهم القوانين:* grad(f) = ∇f, div(F) = ∇·F, curl(F) = ∇xF، نظرية غرين ∮(P dx + Q dy) = ∬(∂Q/∂x - ∂P/∂y) dA.\n💡 *نصائح امتحانية:* تحويل التكاملات إلى الإحداثيات القطبية أو الأسطوانية أو الكروية عند وجود تماثل دائري يختصر الحل بنسبة 80%.',
  },
  {
    id: 'doc_mct212_textbook_primary',
    title: '📖 الكتاب المنهجي الرئيسي: Mechanics of Materials (10th/11th Ed.) — R. C. Hibbeler',
    courseCode: 'MCT212',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/mechanics-of-materials-10th-edition-hibbeler/Mechanics%20of%20Materials%2010th%20Edition%20-%20Hibbeler.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (مقاومة المواد) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* الإجهاد والانفعال المحوري، قانون هوك والإجهادات الحرارية، التواء الأعمدة الدائرية، قوى القص وعزوم الانحناء في العتبات (SFD & BMD)، إجهادات الانحناء والقص، دائرة مور للإجهادات المركبة، وانبعاج الأعمدة (Buckling).\n📐 *أهم القوانين:* σ = P/A, δ = PL/(AE), τ = Tr/J, σ = My/I, P_cr = π²EI/(KL)².\n💡 *نصائح امتحانية:* ارسم مخططات SFD و BMD بعناية؛ النقطة التي يصفر فيها القص (V = 0) هي موقع أقصى عزم انحناء (M_max).',
  },
  {
    id: 'doc_mct212_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Mechanics of Materials (8th Ed.) — Ferdinand Beer, E. Russell Johnston, John DeWolf',
    courseCode: 'MCT212',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/beer-johnston-mechanics-of-materials-8th-edition/Beer%20Johnston%20Mechanics%20of%20Materials%208th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (مقاومة المواد) - جامعة البصرة.\n📌 *الفهرس والمفردات:* الإجهاد والانفعال المحوري، قانون هوك والإجهادات الحرارية، التواء الأعمدة الدائرية، قوى القص وعزوم الانحناء في العتبات (SFD & BMD)، إجهادات الانحناء والقص، دائرة مور للإجهادات المركبة، وانبعاج الأعمدة (Buckling).\n📐 *أهم القوانين:* σ = P/A, δ = PL/(AE), τ = Tr/J, σ = My/I, P_cr = π²EI/(KL)².\n💡 *نصائح امتحانية:* ارسم مخططات SFD و BMD بعناية؛ النقطة التي يصفر فيها القص (V = 0) هي موقع أقصى عزم انحناء (M_max).',
  },
  {
    id: 'doc_mct212_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (مقاومة المواد)',
    courseCode: 'MCT212',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/mechanics-of-materials-10th-edition-hibbeler/Mechanics%20of%20Materials%2010th%20Edition%20-%20Hibbeler.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (مقاومة المواد - MCT212) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* الإجهاد والانفعال المحوري، قانون هوك والإجهادات الحرارية، التواء الأعمدة الدائرية، قوى القص وعزوم الانحناء في العتبات (SFD & BMD)، إجهادات الانحناء والقص، دائرة مور للإجهادات المركبة، وانبعاج الأعمدة (Buckling).\n📐 *أهم القوانين:* σ = P/A, δ = PL/(AE), τ = Tr/J, σ = My/I, P_cr = π²EI/(KL)².\n💡 *نصائح امتحانية:* ارسم مخططات SFD و BMD بعناية؛ النقطة التي يصفر فيها القص (V = 0) هي موقع أقصى عزم انحناء (M_max).',
  },
  {
    id: 'doc_mct212_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (مقاومة المواد)',
    courseCode: 'MCT212',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/mechanics-of-materials-10th-edition-hibbeler/Mechanics%20of%20Materials%2010th%20Edition%20-%20Hibbeler.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* الإجهاد والانفعال المحوري، قانون هوك والإجهادات الحرارية، التواء الأعمدة الدائرية، قوى القص وعزوم الانحناء في العتبات (SFD & BMD)، إجهادات الانحناء والقص، دائرة مور للإجهادات المركبة، وانبعاج الأعمدة (Buckling).\n📐 *أهم القوانين:* σ = P/A, δ = PL/(AE), τ = Tr/J, σ = My/I, P_cr = π²EI/(KL)².\n💡 *نصائح امتحانية:* ارسم مخططات SFD و BMD بعناية؛ النقطة التي يصفر فيها القص (V = 0) هي موقع أقصى عزم انحناء (M_max).',
  },
  {
    id: 'doc_mct213_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Materials Science and Engineering: An Introduction (10th Ed.) — William D. Callister, Jr., David G. Rethwisch',
    courseCode: 'MCT213',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/materials-science-and-engineering-callister-10th-edition/Materials%20Science%20and%20Engineering%20Callister%2010th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (هندسة المعادن) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* البنى البلورية للمواد المعدنية، العيوب الشبكية والانخلاعات، آليات التقسية، مخططات الاتزان الحراري (Phase Diagrams و Fe-C Diagram)، المعاملات الحرارية (التقسية، المراجعة، التطبيع)، والخواص الميكانيكية والتشغيلية.\n📐 *أهم القوانين:* قاعدة العتلة (Lever Rule) لحساب نسب الأطوار، علاقة هول-بيتش σ_y = σ_0 + k_y * d^(-1/2).\n💡 *نصائح امتحانية:* حفظ النقاط الحرجة في مخطط الحديد والكربون (Eutectic, Eutectoid) ودرجات الحرارة والتراكيب المرافقة لها.',
  },
  {
    id: 'doc_mct213_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: The Science and Engineering of Materials (7th Ed.) — Donald R. Askeland, Wendelin J. Wright',
    courseCode: 'MCT213',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/the-science-and-engineering-of-materials-7th-askeland/Science%20and%20Engineering%20of%20Materials%20Askeland.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (هندسة المعادن) - جامعة البصرة.\n📌 *الفهرس والمفردات:* البنى البلورية للمواد المعدنية، العيوب الشبكية والانخلاعات، آليات التقسية، مخططات الاتزان الحراري (Phase Diagrams و Fe-C Diagram)، المعاملات الحرارية (التقسية، المراجعة، التطبيع)، والخواص الميكانيكية والتشغيلية.\n📐 *أهم القوانين:* قاعدة العتلة (Lever Rule) لحساب نسب الأطوار، علاقة هول-بيتش σ_y = σ_0 + k_y * d^(-1/2).\n💡 *نصائح امتحانية:* حفظ النقاط الحرجة في مخطط الحديد والكربون (Eutectic, Eutectoid) ودرجات الحرارة والتراكيب المرافقة لها.',
  },
  {
    id: 'doc_mct213_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (هندسة المعادن)',
    courseCode: 'MCT213',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/materials-science-and-engineering-callister-10th-edition/Materials%20Science%20and%20Engineering%20Callister%2010th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (هندسة المعادن - MCT213) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* البنى البلورية للمواد المعدنية، العيوب الشبكية والانخلاعات، آليات التقسية، مخططات الاتزان الحراري (Phase Diagrams و Fe-C Diagram)، المعاملات الحرارية (التقسية، المراجعة، التطبيع)، والخواص الميكانيكية والتشغيلية.\n📐 *أهم القوانين:* قاعدة العتلة (Lever Rule) لحساب نسب الأطوار، علاقة هول-بيتش σ_y = σ_0 + k_y * d^(-1/2).\n💡 *نصائح امتحانية:* حفظ النقاط الحرجة في مخطط الحديد والكربون (Eutectic, Eutectoid) ودرجات الحرارة والتراكيب المرافقة لها.',
  },
  {
    id: 'doc_mct213_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (هندسة المعادن)',
    courseCode: 'MCT213',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/materials-science-and-engineering-callister-10th-edition/Materials%20Science%20and%20Engineering%20Callister%2010th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* البنى البلورية للمواد المعدنية، العيوب الشبكية والانخلاعات، آليات التقسية، مخططات الاتزان الحراري (Phase Diagrams و Fe-C Diagram)، المعاملات الحرارية (التقسية، المراجعة، التطبيع)، والخواص الميكانيكية والتشغيلية.\n📐 *أهم القوانين:* قاعدة العتلة (Lever Rule) لحساب نسب الأطوار، علاقة هول-بيتش σ_y = σ_0 + k_y * d^(-1/2).\n💡 *نصائح امتحانية:* حفظ النقاط الحرجة في مخطط الحديد والكربون (Eutectic, Eutectoid) ودرجات الحرارة والتراكيب المرافقة لها.',
  },
  {
    id: 'doc_mct214_textbook_primary',
    title: '📖 الكتاب المنهجي الرئيسي: Python for Data Analysis (3rd Ed.) — Wes McKinney',
    courseCode: 'MCT214',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/python-for-data-analysis-3rd-mckinney/Python%20for%20Data%20Analysis%203rd%20McKinney.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (الحوسبة والذكاء الاصطناعي) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* هياكل البيانات والخوارزميات في بايثون، التحليل الإحصائي للبيانات الهندسية بواسطة NumPy و Pandas، خوارزميات البحث في الذكاء الاصطناعي (BFS, DFS, A* Search)، وخوارزميات تعلم الآلة الأساسية.\n📐 *أهم القوانين:* دالة التكلفة في البحث الذكي f(n) = g(n) + h(n)، مصفوفة الارتباك (Confusion Matrix) ومقاييس الدقة والاستدعاء (Precision & Recall).\n💡 *نصائح امتحانية:* تأكد من شرط ملاءمة الدالة الحدسية (Admissibility) في خوارزمية A* لضمان الحل الأمثل.',
  },
  {
    id: 'doc_mct214_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Artificial Intelligence: A Modern Approach (4th Ed.) — Stuart Russell, Peter Norvig',
    courseCode: 'MCT214',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/artificial-intelligence-a-modern-approach-4th-edition/Artificial%20Intelligence%20A%20Modern%20Approach%204th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (الحوسبة والذكاء الاصطناعي) - جامعة البصرة.\n📌 *الفهرس والمفردات:* هياكل البيانات والخوارزميات في بايثون، التحليل الإحصائي للبيانات الهندسية بواسطة NumPy و Pandas، خوارزميات البحث في الذكاء الاصطناعي (BFS, DFS, A* Search)، وخوارزميات تعلم الآلة الأساسية.\n📐 *أهم القوانين:* دالة التكلفة في البحث الذكي f(n) = g(n) + h(n)، مصفوفة الارتباك (Confusion Matrix) ومقاييس الدقة والاستدعاء (Precision & Recall).\n💡 *نصائح امتحانية:* تأكد من شرط ملاءمة الدالة الحدسية (Admissibility) في خوارزمية A* لضمان الحل الأمثل.',
  },
  {
    id: 'doc_mct214_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (الحوسبة والذكاء الاصطناعي)',
    courseCode: 'MCT214',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/python-for-data-analysis-3rd-mckinney/Python%20for%20Data%20Analysis%203rd%20McKinney.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (الحوسبة والذكاء الاصطناعي - MCT214) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* هياكل البيانات والخوارزميات في بايثون، التحليل الإحصائي للبيانات الهندسية بواسطة NumPy و Pandas، خوارزميات البحث في الذكاء الاصطناعي (BFS, DFS, A* Search)، وخوارزميات تعلم الآلة الأساسية.\n📐 *أهم القوانين:* دالة التكلفة في البحث الذكي f(n) = g(n) + h(n)، مصفوفة الارتباك (Confusion Matrix) ومقاييس الدقة والاستدعاء (Precision & Recall).\n💡 *نصائح امتحانية:* تأكد من شرط ملاءمة الدالة الحدسية (Admissibility) في خوارزمية A* لضمان الحل الأمثل.',
  },
  {
    id: 'doc_mct214_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (الحوسبة والذكاء الاصطناعي)',
    courseCode: 'MCT214',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/python-for-data-analysis-3rd-mckinney/Python%20for%20Data%20Analysis%203rd%20McKinney.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* هياكل البيانات والخوارزميات في بايثون، التحليل الإحصائي للبيانات الهندسية بواسطة NumPy و Pandas، خوارزميات البحث في الذكاء الاصطناعي (BFS, DFS, A* Search)، وخوارزميات تعلم الآلة الأساسية.\n📐 *أهم القوانين:* دالة التكلفة في البحث الذكي f(n) = g(n) + h(n)، مصفوفة الارتباك (Confusion Matrix) ومقاييس الدقة والاستدعاء (Precision & Recall).\n💡 *نصائح امتحانية:* تأكد من شرط ملاءمة الدالة الحدسية (Admissibility) في خوارزمية A* لضمان الحل الأمثل.',
  },
  {
    id: 'doc_mct215_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Electric Machinery Fundamentals (5th Ed.) — Stephen J. Chapman',
    courseCode: 'MCT215',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/electric-machinery-fundamentals-5th-edition-chapman/Electric%20Machinery%20Fundamentals%205th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (مكائن كهربائية (تيار مستمر)) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* النظرية الكهرومغناطيسية للمكائن، مولدات ومحركات التيار المستمر (DC Machines: Shunt, Series, Compound)، دوائر المكافئ، حسابات القوة الدافعة الكهربائية والعزم، تنظيم الجهد، والتحكم بالسرعة بواسطة الجهد وتيار المجال.\n📐 *أهم القوانين:* E = (P·Z·N·Φ)/(60·A), T = (P·Z·Φ·Ia)/(2π·A), V_t = E_a ± I_a·R_a.\n💡 *نصائح امتحانية:* انتبه لمسألة رد فعل عضو الإنتاج (Armature Reaction) وكيفية تعويضه في الآلات الكهربائية.',
  },
  {
    id: 'doc_mct215_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Principles of Electric Machines and Power Electronics (3rd Ed.) — P. C. Sen',
    courseCode: 'MCT215',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/principles-of-electric-machines-power-electronics-sen/Principles%20of%20Electric%20Machines%20Sen.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (مكائن كهربائية (تيار مستمر)) - جامعة البصرة.\n📌 *الفهرس والمفردات:* النظرية الكهرومغناطيسية للمكائن، مولدات ومحركات التيار المستمر (DC Machines: Shunt, Series, Compound)، دوائر المكافئ، حسابات القوة الدافعة الكهربائية والعزم، تنظيم الجهد، والتحكم بالسرعة بواسطة الجهد وتيار المجال.\n📐 *أهم القوانين:* E = (P·Z·N·Φ)/(60·A), T = (P·Z·Φ·Ia)/(2π·A), V_t = E_a ± I_a·R_a.\n💡 *نصائح امتحانية:* انتبه لمسألة رد فعل عضو الإنتاج (Armature Reaction) وكيفية تعويضه في الآلات الكهربائية.',
  },
  {
    id: 'doc_mct215_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (مكائن كهربائية (تيار مستمر))',
    courseCode: 'MCT215',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/electric-machinery-fundamentals-5th-edition-chapman/Electric%20Machinery%20Fundamentals%205th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (مكائن كهربائية (تيار مستمر) - MCT215) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* النظرية الكهرومغناطيسية للمكائن، مولدات ومحركات التيار المستمر (DC Machines: Shunt, Series, Compound)، دوائر المكافئ، حسابات القوة الدافعة الكهربائية والعزم، تنظيم الجهد، والتحكم بالسرعة بواسطة الجهد وتيار المجال.\n📐 *أهم القوانين:* E = (P·Z·N·Φ)/(60·A), T = (P·Z·Φ·Ia)/(2π·A), V_t = E_a ± I_a·R_a.\n💡 *نصائح امتحانية:* انتبه لمسألة رد فعل عضو الإنتاج (Armature Reaction) وكيفية تعويضه في الآلات الكهربائية.',
  },
  {
    id: 'doc_mct215_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (مكائن كهربائية (تيار مستمر))',
    courseCode: 'MCT215',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/electric-machinery-fundamentals-5th-edition-chapman/Electric%20Machinery%20Fundamentals%205th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* النظرية الكهرومغناطيسية للمكائن، مولدات ومحركات التيار المستمر (DC Machines: Shunt, Series, Compound)، دوائر المكافئ، حسابات القوة الدافعة الكهربائية والعزم، تنظيم الجهد، والتحكم بالسرعة بواسطة الجهد وتيار المجال.\n📐 *أهم القوانين:* E = (P·Z·N·Φ)/(60·A), T = (P·Z·Φ·Ia)/(2π·A), V_t = E_a ± I_a·R_a.\n💡 *نصائح امتحانية:* انتبه لمسألة رد فعل عضو الإنتاج (Armature Reaction) وكيفية تعويضه في الآلات الكهربائية.',
  },
  {
    id: 'doc_mct216_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (اللغة الإنكليزية 2)',
    courseCode: 'MCT216',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://raw.githubusercontent.com/uobasrah-mechatronics/academic-archive/main/curriculum/3437Mechatronics%20Engineering.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (اللغة الإنكليزية 2 - MCT216) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* المراسلات التقنية والأكاديمية، كتابة الملخصات والمقترحات الهندسية، والعروض التقديمية الفعالة للمشاريع التقنية.',
  },
  {
    id: 'doc_mct216_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (اللغة الإنكليزية 2)',
    courseCode: 'MCT216',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value: 'https://archive.org/download/mct216-lecture-notes/notes.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* المراسلات التقنية والأكاديمية، كتابة الملخصات والمقترحات الهندسية، والعروض التقديمية الفعالة للمشاريع التقنية.',
  },
  {
    id: 'doc_mct217_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Thermodynamics: An Engineering Approach (9th/10th Ed.) — Yunus A. Cengel, Michael A. Boles',
    courseCode: 'MCT217',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/thermodynamics-an-engineering-approach-cengel-9th/Thermodynamics%20An%20Engineering%20Approach%209th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (ديناميك الحرارة) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* القانون الأول للديناميكا الحرارية للأنظمة المغلقة والمفتوحة (معدلات التدفق)، خواص الغاز المثالي والبخار، القانون الثاني والإنتروبي، الدورات الهوائية القياسية (Carnot, Otto, Diesel, Dual)، والدورات البخارية (Rankine Cycle).\n📐 *أهم القوانين:* Q - W = ΔU, q - w = Δh, W = ∫P dV, والكفاءة الحرارية η = 1 - (Q_out / Q_in).\n💡 *نصائح امتحانية:* عند التعامل مع البخار، تحقق أولاً من حالة المادة (خليط رطب، بخار محمص، ماء مضغوط) باستخدام درجات حرارة وضغوط التشبع من جداول البخار.',
  },
  {
    id: 'doc_mct217_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Fundamentals of Engineering Thermodynamics (9th Ed.) — Michael J. Moran, Howard N. Shapiro',
    courseCode: 'MCT217',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/fundamentals-of-engineering-thermodynamics-moran-shapiro-9th/Fundamentals%20of%20Engineering%20Thermodynamics%209th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (ديناميك الحرارة) - جامعة البصرة.\n📌 *الفهرس والمفردات:* القانون الأول للديناميكا الحرارية للأنظمة المغلقة والمفتوحة (معدلات التدفق)، خواص الغاز المثالي والبخار، القانون الثاني والإنتروبي، الدورات الهوائية القياسية (Carnot, Otto, Diesel, Dual)، والدورات البخارية (Rankine Cycle).\n📐 *أهم القوانين:* Q - W = ΔU, q - w = Δh, W = ∫P dV, والكفاءة الحرارية η = 1 - (Q_out / Q_in).\n💡 *نصائح امتحانية:* عند التعامل مع البخار، تحقق أولاً من حالة المادة (خليط رطب، بخار محمص، ماء مضغوط) باستخدام درجات حرارة وضغوط التشبع من جداول البخار.',
  },
  {
    id: 'doc_mct217_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (ديناميك الحرارة)',
    courseCode: 'MCT217',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/thermodynamics-an-engineering-approach-cengel-9th/Thermodynamics%20An%20Engineering%20Approach%209th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (ديناميك الحرارة - MCT217) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* القانون الأول للديناميكا الحرارية للأنظمة المغلقة والمفتوحة (معدلات التدفق)، خواص الغاز المثالي والبخار، القانون الثاني والإنتروبي، الدورات الهوائية القياسية (Carnot, Otto, Diesel, Dual)، والدورات البخارية (Rankine Cycle).\n📐 *أهم القوانين:* Q - W = ΔU, q - w = Δh, W = ∫P dV, والكفاءة الحرارية η = 1 - (Q_out / Q_in).\n💡 *نصائح امتحانية:* عند التعامل مع البخار، تحقق أولاً من حالة المادة (خليط رطب، بخار محمص، ماء مضغوط) باستخدام درجات حرارة وضغوط التشبع من جداول البخار.',
  },
  {
    id: 'doc_mct217_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (ديناميك الحرارة)',
    courseCode: 'MCT217',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/thermodynamics-an-engineering-approach-cengel-9th/Thermodynamics%20An%20Engineering%20Approach%209th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* القانون الأول للديناميكا الحرارية للأنظمة المغلقة والمفتوحة (معدلات التدفق)، خواص الغاز المثالي والبخار، القانون الثاني والإنتروبي، الدورات الهوائية القياسية (Carnot, Otto, Diesel, Dual)، والدورات البخارية (Rankine Cycle).\n📐 *أهم القوانين:* Q - W = ΔU, q - w = Δh, W = ∫P dV, والكفاءة الحرارية η = 1 - (Q_out / Q_in).\n💡 *نصائح امتحانية:* عند التعامل مع البخار، تحقق أولاً من حالة المادة (خليط رطب، بخار محمص، ماء مضغوط) باستخدام درجات حرارة وضغوط التشبع من جداول البخار.',
  },
  {
    id: 'doc_mct221_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Differential Equations with Boundary-Value Problems (9th Ed.) — Dennis G. Zill',
    courseCode: 'MCT221',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/differential-equations-with-boundary-value-problems-zill-9th/Differential%20Equations%20with%20Boundary-Value%20Problems%209th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (المعادلات التفاضلية) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* المعادلات التفاضلية الاعتيادية من الرتبة الأولى (القابلة للفصل، التامة، الخطية، برنولي)، المعادلات الخطية من الرتب العليا بمعاملات ثابتة، مؤثر D، تحويلات لابلاس وخواصها وتطبيقاتها في حل المعادلات والأنظمة.\n📐 *أهم القوانين:* عامل التكامل e^(∫P dx)، حل المعادلة المميزة ar² + br + c = 0، تحويل لابلاس L{y'''} = s³Y(s) - s²y(0) - sy'(0) - y''(0).\n💡 *نصائح امتحانية:* مراجعة جدول تحويلات لابلاس العكسية وتفكيك الكسور الجزئية بدقة متناهية.",
  },
  {
    id: 'doc_mct221_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Advanced Engineering Mathematics (10th Ed.) — Erwin Kreyszig',
    courseCode: 'MCT221',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/advanced-engineering-mathematics-10th-edition-kreyszig/Advanced%20Engineering%20Mathematics%2010th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "الكتاب المساعد والتمارين المحلولة الداعمة لمادة (المعادلات التفاضلية) - جامعة البصرة.\n📌 *الفهرس والمفردات:* المعادلات التفاضلية الاعتيادية من الرتبة الأولى (القابلة للفصل، التامة، الخطية، برنولي)، المعادلات الخطية من الرتب العليا بمعاملات ثابتة، مؤثر D، تحويلات لابلاس وخواصها وتطبيقاتها في حل المعادلات والأنظمة.\n📐 *أهم القوانين:* عامل التكامل e^(∫P dx)، حل المعادلة المميزة ar² + br + c = 0، تحويل لابلاس L{y'''} = s³Y(s) - s²y(0) - sy'(0) - y''(0).\n💡 *نصائح امتحانية:* مراجعة جدول تحويلات لابلاس العكسية وتفكيك الكسور الجزئية بدقة متناهية.",
  },
  {
    id: 'doc_mct221_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (المعادلات التفاضلية)',
    courseCode: 'MCT221',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/differential-equations-with-boundary-value-problems-zill-9th/Differential%20Equations%20with%20Boundary-Value%20Problems%209th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (المعادلات التفاضلية - MCT221) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* المعادلات التفاضلية الاعتيادية من الرتبة الأولى (القابلة للفصل، التامة، الخطية، برنولي)، المعادلات الخطية من الرتب العليا بمعاملات ثابتة، مؤثر D، تحويلات لابلاس وخواصها وتطبيقاتها في حل المعادلات والأنظمة.\n📐 *أهم القوانين:* عامل التكامل e^(∫P dx)، حل المعادلة المميزة ar² + br + c = 0، تحويل لابلاس L{y'''} = s³Y(s) - s²y(0) - sy'(0) - y''(0).\n💡 *نصائح امتحانية:* مراجعة جدول تحويلات لابلاس العكسية وتفكيك الكسور الجزئية بدقة متناهية.",
  },
  {
    id: 'doc_mct221_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (المعادلات التفاضلية)',
    courseCode: 'MCT221',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/differential-equations-with-boundary-value-problems-zill-9th/Differential%20Equations%20with%20Boundary-Value%20Problems%209th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "📌 *الفهرس والمفردات:* المعادلات التفاضلية الاعتيادية من الرتبة الأولى (القابلة للفصل، التامة، الخطية، برنولي)، المعادلات الخطية من الرتب العليا بمعاملات ثابتة، مؤثر D، تحويلات لابلاس وخواصها وتطبيقاتها في حل المعادلات والأنظمة.\n📐 *أهم القوانين:* عامل التكامل e^(∫P dx)، حل المعادلة المميزة ar² + br + c = 0، تحويل لابلاس L{y'''} = s³Y(s) - s²y(0) - sy'(0) - y''(0).\n💡 *نصائح امتحانية:* مراجعة جدول تحويلات لابلاس العكسية وتفكيك الكسور الجزئية بدقة متناهية.",
  },
  {
    id: 'doc_mct222_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Electric Machinery Fundamentals (5th Ed.) — Stephen J. Chapman',
    courseCode: 'MCT222',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/electric-machinery-fundamentals-5th-edition-chapman/Electric%20Machinery%20Fundamentals%205th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (مكائن كهربائية (تيار متناوب)) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* المحولات أحادية وثلاثية الأطوار (دائرة المكافئ، الكفاءة، تنظيم الجهد)، المحركات الحثية ثلاثية الأطوار (Induction Motors: بنية القفص السنجابي والملفوف، منحنى العزم والسرعة، بدء التشغيل)، والمولدات والمحركات التزامنية.\n📐 *أهم القوانين:* السرعة التزامنية Ns = 120·f / P, الانزلاق s = (Ns - N)/Ns, وعزم المحرك الحثي T ∝ s·E2²·R2 / (R2² + (s·X2)²).\n💡 *نصائح امتحانية:* انتبه لشرط أقصى عزم للمحرك الحثي الذي يحدث عندما R2 = s_max * X2.',
  },
  {
    id: 'doc_mct222_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Principles of Electric Machines and Power Electronics (3rd Ed.) — P. C. Sen',
    courseCode: 'MCT222',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/principles-of-electric-machines-power-electronics-sen/Principles%20of%20Electric%20Machines%20Sen.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (مكائن كهربائية (تيار متناوب)) - جامعة البصرة.\n📌 *الفهرس والمفردات:* المحولات أحادية وثلاثية الأطوار (دائرة المكافئ، الكفاءة، تنظيم الجهد)، المحركات الحثية ثلاثية الأطوار (Induction Motors: بنية القفص السنجابي والملفوف، منحنى العزم والسرعة، بدء التشغيل)، والمولدات والمحركات التزامنية.\n📐 *أهم القوانين:* السرعة التزامنية Ns = 120·f / P, الانزلاق s = (Ns - N)/Ns, وعزم المحرك الحثي T ∝ s·E2²·R2 / (R2² + (s·X2)²).\n💡 *نصائح امتحانية:* انتبه لشرط أقصى عزم للمحرك الحثي الذي يحدث عندما R2 = s_max * X2.',
  },
  {
    id: 'doc_mct222_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (مكائن كهربائية (تيار متناوب))',
    courseCode: 'MCT222',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/electric-machinery-fundamentals-5th-edition-chapman/Electric%20Machinery%20Fundamentals%205th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (مكائن كهربائية (تيار متناوب) - MCT222) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* المحولات أحادية وثلاثية الأطوار (دائرة المكافئ، الكفاءة، تنظيم الجهد)، المحركات الحثية ثلاثية الأطوار (Induction Motors: بنية القفص السنجابي والملفوف، منحنى العزم والسرعة، بدء التشغيل)، والمولدات والمحركات التزامنية.\n📐 *أهم القوانين:* السرعة التزامنية Ns = 120·f / P, الانزلاق s = (Ns - N)/Ns, وعزم المحرك الحثي T ∝ s·E2²·R2 / (R2² + (s·X2)²).\n💡 *نصائح امتحانية:* انتبه لشرط أقصى عزم للمحرك الحثي الذي يحدث عندما R2 = s_max * X2.',
  },
  {
    id: 'doc_mct222_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (مكائن كهربائية (تيار متناوب))',
    courseCode: 'MCT222',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/electric-machinery-fundamentals-5th-edition-chapman/Electric%20Machinery%20Fundamentals%205th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* المحولات أحادية وثلاثية الأطوار (دائرة المكافئ، الكفاءة، تنظيم الجهد)، المحركات الحثية ثلاثية الأطوار (Induction Motors: بنية القفص السنجابي والملفوف، منحنى العزم والسرعة، بدء التشغيل)، والمولدات والمحركات التزامنية.\n📐 *أهم القوانين:* السرعة التزامنية Ns = 120·f / P, الانزلاق s = (Ns - N)/Ns, وعزم المحرك الحثي T ∝ s·E2²·R2 / (R2² + (s·X2)²).\n💡 *نصائح امتحانية:* انتبه لشرط أقصى عزم للمحرك الحثي الذي يحدث عندما R2 = s_max * X2.',
  },
  {
    id: 'doc_mct223_textbook_primary',
    title: '📖 الكتاب المنهجي الرئيسي: C++ How to Program (10th Ed.) — Paul Deitel, Harvey Deitel',
    courseCode: 'MCT223',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/c-how-to-program-10th-edition-deitel/C%2B%2B%20How%20to%20Program%2010th%20Deitel.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (البرمجة الكيانية) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* البرمجة الموجهة للكائنات (OOP) بلغة C++: الفئات والكائنات، التغليف (Encapsulation)، الوراثة المفردة والمتعددة، تعدد الأشكال (Polymorphism) والدوال الافتراضية (Virtual Functions)، التحميل الزائد للمؤثرات، والقوالب (Templates).\n📐 *أهم المفاهيم:* مؤشرات الكائنات، Virtual Destructors، وإدارة الذاكرة الديناميكية (new/delete).\n💡 *نصائح امتحانية:* احرص على فهم جدول الدوال الافتراضية (V-Table) وكيف يحل الـ Dynamic Dispatch في وقت التشغيل.',
  },
  {
    id: 'doc_mct223_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Object-Oriented Programming in C++ (4th Ed.) — Robert Lafore',
    courseCode: 'MCT223',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/object-oriented-programming-in-c-4th-lafore/Object%20Oriented%20Programming%20in%20C%2B%2B%20Lafore.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (البرمجة الكيانية) - جامعة البصرة.\n📌 *الفهرس والمفردات:* البرمجة الموجهة للكائنات (OOP) بلغة C++: الفئات والكائنات، التغليف (Encapsulation)، الوراثة المفردة والمتعددة، تعدد الأشكال (Polymorphism) والدوال الافتراضية (Virtual Functions)، التحميل الزائد للمؤثرات، والقوالب (Templates).\n📐 *أهم المفاهيم:* مؤشرات الكائنات، Virtual Destructors، وإدارة الذاكرة الديناميكية (new/delete).\n💡 *نصائح امتحانية:* احرص على فهم جدول الدوال الافتراضية (V-Table) وكيف يحل الـ Dynamic Dispatch في وقت التشغيل.',
  },
  {
    id: 'doc_mct223_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (البرمجة الكيانية)',
    courseCode: 'MCT223',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/c-how-to-program-10th-edition-deitel/C%2B%2B%20How%20to%20Program%2010th%20Deitel.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (البرمجة الكيانية - MCT223) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* البرمجة الموجهة للكائنات (OOP) بلغة C++: الفئات والكائنات، التغليف (Encapsulation)، الوراثة المفردة والمتعددة، تعدد الأشكال (Polymorphism) والدوال الافتراضية (Virtual Functions)، التحميل الزائد للمؤثرات، والقوالب (Templates).\n📐 *أهم المفاهيم:* مؤشرات الكائنات، Virtual Destructors، وإدارة الذاكرة الديناميكية (new/delete).\n💡 *نصائح امتحانية:* احرص على فهم جدول الدوال الافتراضية (V-Table) وكيف يحل الـ Dynamic Dispatch في وقت التشغيل.',
  },
  {
    id: 'doc_mct223_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (البرمجة الكيانية)',
    courseCode: 'MCT223',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/c-how-to-program-10th-edition-deitel/C%2B%2B%20How%20to%20Program%2010th%20Deitel.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* البرمجة الموجهة للكائنات (OOP) بلغة C++: الفئات والكائنات، التغليف (Encapsulation)، الوراثة المفردة والمتعددة، تعدد الأشكال (Polymorphism) والدوال الافتراضية (Virtual Functions)، التحميل الزائد للمؤثرات، والقوالب (Templates).\n📐 *أهم المفاهيم:* مؤشرات الكائنات، Virtual Destructors، وإدارة الذاكرة الديناميكية (new/delete).\n💡 *نصائح امتحانية:* احرص على فهم جدول الدوال الافتراضية (V-Table) وكيف يحل الـ Dynamic Dispatch في وقت التشغيل.',
  },
  {
    id: 'doc_mct224_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Theory of Machines and Mechanisms (5th Ed.) — John J. Uicker, Gordon R. Pennock, Joseph E. Shigley',
    courseCode: 'MCT224',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/theory-of-machines-and-mechanisms-5th-uicker/Theory%20of%20Machines%20and%20Mechanisms%205th%20Uicker.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (نظرية الآلات) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* كينماتيكا الآليات المستوية، درجات الحرية ومعادلة كوتزباخ (Grubler's Criterion)، آليات الأربع وصلات (Four-Bar Linkages)، مراكز السرعة اللحظية، مضلعات السرعة والعجلة، الكامات ومنحنيات الحركة، وقطارات المسننات البسيطة والكوكبية (Epicyclic Gear Trains).\n📐 *أهم القوانين:* DOF = 3(n - 1) - 2j1 - j2، ومعادلة قطار المسننات الكوكبي (ω_L - ω_arm) / (ω_F - ω_arm) = e.\n💡 *نصائح امتحانية:* استخدام طريقة مراكز السرعة اللحظية (Instant Centers / Kennedy's Theorem) يوفر وقتاً كبيراً في إيجاد سرعات الأذرع.",
  },
  {
    id: 'doc_mct224_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Mechanics of Machines (2nd Ed.) — William L. Cleghorn, Nikolai Dechev',
    courseCode: 'MCT224',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/mechanics-of-machines-cleghorn-2nd/Mechanics%20of%20Machines%20Cleghorn.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "الكتاب المساعد والتمارين المحلولة الداعمة لمادة (نظرية الآلات) - جامعة البصرة.\n📌 *الفهرس والمفردات:* كينماتيكا الآليات المستوية، درجات الحرية ومعادلة كوتزباخ (Grubler's Criterion)، آليات الأربع وصلات (Four-Bar Linkages)، مراكز السرعة اللحظية، مضلعات السرعة والعجلة، الكامات ومنحنيات الحركة، وقطارات المسننات البسيطة والكوكبية (Epicyclic Gear Trains).\n📐 *أهم القوانين:* DOF = 3(n - 1) - 2j1 - j2، ومعادلة قطار المسننات الكوكبي (ω_L - ω_arm) / (ω_F - ω_arm) = e.\n💡 *نصائح امتحانية:* استخدام طريقة مراكز السرعة اللحظية (Instant Centers / Kennedy's Theorem) يوفر وقتاً كبيراً في إيجاد سرعات الأذرع.",
  },
  {
    id: 'doc_mct224_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (نظرية الآلات)',
    courseCode: 'MCT224',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/theory-of-machines-and-mechanisms-5th-uicker/Theory%20of%20Machines%20and%20Mechanisms%205th%20Uicker.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (نظرية الآلات - MCT224) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* كينماتيكا الآليات المستوية، درجات الحرية ومعادلة كوتزباخ (Grubler's Criterion)، آليات الأربع وصلات (Four-Bar Linkages)، مراكز السرعة اللحظية، مضلعات السرعة والعجلة، الكامات ومنحنيات الحركة، وقطارات المسننات البسيطة والكوكبية (Epicyclic Gear Trains).\n📐 *أهم القوانين:* DOF = 3(n - 1) - 2j1 - j2، ومعادلة قطار المسننات الكوكبي (ω_L - ω_arm) / (ω_F - ω_arm) = e.\n💡 *نصائح امتحانية:* استخدام طريقة مراكز السرعة اللحظية (Instant Centers / Kennedy's Theorem) يوفر وقتاً كبيراً في إيجاد سرعات الأذرع.",
  },
  {
    id: 'doc_mct224_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (نظرية الآلات)',
    courseCode: 'MCT224',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/theory-of-machines-and-mechanisms-5th-uicker/Theory%20of%20Machines%20and%20Mechanisms%205th%20Uicker.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "📌 *الفهرس والمفردات:* كينماتيكا الآليات المستوية، درجات الحرية ومعادلة كوتزباخ (Grubler's Criterion)، آليات الأربع وصلات (Four-Bar Linkages)، مراكز السرعة اللحظية، مضلعات السرعة والعجلة، الكامات ومنحنيات الحركة، وقطارات المسننات البسيطة والكوكبية (Epicyclic Gear Trains).\n📐 *أهم القوانين:* DOF = 3(n - 1) - 2j1 - j2، ومعادلة قطار المسننات الكوكبي (ω_L - ω_arm) / (ω_F - ω_arm) = e.\n💡 *نصائح امتحانية:* استخدام طريقة مراكز السرعة اللحظية (Instant Centers / Kennedy's Theorem) يوفر وقتاً كبيراً في إيجاد سرعات الأذرع.",
  },
  {
    id: 'doc_mct225_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Electronic Devices and Circuit Theory (11th Ed.) — Robert L. Boylestad, Louis Nashelsky',
    courseCode: 'MCT225',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/electronic-devices-and-circuit-theory-boylestad-11th/Electronic%20Devices%20and%20Circuit%20Theory%2011th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (الإلكترونيات) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* فيزياء أشباه الموصلات، ثنائي الوصلة (Diode) وتطبيقاته (المقومات والدوائر المحددة)، ترانزستور ثنائي القطبية (BJT: انحياز DC ونماذج الإشارات الصغيرة AC)، وترانزستور تأثير المجال (MOSFET & JFET)، والمكبرات التشغيلية (Op-Amps) وتطبيقاتها الخطية وغير الخطية.\n📐 *أهم القوانين:* تيار الصمام الثنائي I = Is*(e^(V/Vt) - 1)، تيار المجمع Ic = β*Ib, كسب المكبر العاكس Av = -Rf / R1.\n💡 *نصائح امتحانية:* افتراض مكبر العمليات مثالي (Ideal Op-Amp): التيارات الداخلة صفرية (I+ = I- = 0) والجهد التفاضلي معدوم (V+ = V-).',
  },
  {
    id: 'doc_mct225_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Microelectronic Circuits (8th Ed.) — Adel S. Sedra, Kenneth C. Smith',
    courseCode: 'MCT225',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/sedra-smith-microelectronic-circuits-8th-edition/Microelectronic%20Circuits%208th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (الإلكترونيات) - جامعة البصرة.\n📌 *الفهرس والمفردات:* فيزياء أشباه الموصلات، ثنائي الوصلة (Diode) وتطبيقاته (المقومات والدوائر المحددة)، ترانزستور ثنائي القطبية (BJT: انحياز DC ونماذج الإشارات الصغيرة AC)، وترانزستور تأثير المجال (MOSFET & JFET)، والمكبرات التشغيلية (Op-Amps) وتطبيقاتها الخطية وغير الخطية.\n📐 *أهم القوانين:* تيار الصمام الثنائي I = Is*(e^(V/Vt) - 1)، تيار المجمع Ic = β*Ib, كسب المكبر العاكس Av = -Rf / R1.\n💡 *نصائح امتحانية:* افتراض مكبر العمليات مثالي (Ideal Op-Amp): التيارات الداخلة صفرية (I+ = I- = 0) والجهد التفاضلي معدوم (V+ = V-).',
  },
  {
    id: 'doc_mct225_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (الإلكترونيات)',
    courseCode: 'MCT225',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/electronic-devices-and-circuit-theory-boylestad-11th/Electronic%20Devices%20and%20Circuit%20Theory%2011th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (الإلكترونيات - MCT225) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* فيزياء أشباه الموصلات، ثنائي الوصلة (Diode) وتطبيقاته (المقومات والدوائر المحددة)، ترانزستور ثنائي القطبية (BJT: انحياز DC ونماذج الإشارات الصغيرة AC)، وترانزستور تأثير المجال (MOSFET & JFET)، والمكبرات التشغيلية (Op-Amps) وتطبيقاتها الخطية وغير الخطية.\n📐 *أهم القوانين:* تيار الصمام الثنائي I = Is*(e^(V/Vt) - 1)، تيار المجمع Ic = β*Ib, كسب المكبر العاكس Av = -Rf / R1.\n💡 *نصائح امتحانية:* افتراض مكبر العمليات مثالي (Ideal Op-Amp): التيارات الداخلة صفرية (I+ = I- = 0) والجهد التفاضلي معدوم (V+ = V-).',
  },
  {
    id: 'doc_mct225_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (الإلكترونيات)',
    courseCode: 'MCT225',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/electronic-devices-and-circuit-theory-boylestad-11th/Electronic%20Devices%20and%20Circuit%20Theory%2011th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* فيزياء أشباه الموصلات، ثنائي الوصلة (Diode) وتطبيقاته (المقومات والدوائر المحددة)، ترانزستور ثنائي القطبية (BJT: انحياز DC ونماذج الإشارات الصغيرة AC)، وترانزستور تأثير المجال (MOSFET & JFET)، والمكبرات التشغيلية (Op-Amps) وتطبيقاتها الخطية وغير الخطية.\n📐 *أهم القوانين:* تيار الصمام الثنائي I = Is*(e^(V/Vt) - 1)، تيار المجمع Ic = β*Ib, كسب المكبر العاكس Av = -Rf / R1.\n💡 *نصائح امتحانية:* افتراض مكبر العمليات مثالي (Ideal Op-Amp): التيارات الداخلة صفرية (I+ = I- = 0) والجهد التفاضلي معدوم (V+ = V-).',
  },
  {
    id: 'doc_mct226_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (جرائم حزب البعث)',
    courseCode: 'MCT226',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://raw.githubusercontent.com/uobasrah-mechatronics/academic-archive/main/curriculum/3437Mechatronics%20Engineering.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (جرائم حزب البعث - MCT226) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* التوثيق التاريخي للانتهاكات، العدالة الانتقالية، القوانين والمواثيق الوطنية والدولية، وحفظ الذاكرة المجتمعية ودور القانون في ترسيخ حقوق المواطنة.',
  },
  {
    id: 'doc_mct226_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (جرائم حزب البعث)',
    courseCode: 'MCT226',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value: 'https://archive.org/download/mct226-lecture-notes/notes.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* التوثيق التاريخي للانتهاكات، العدالة الانتقالية، القوانين والمواثيق الوطنية والدولية، وحفظ الذاكرة المجتمعية ودور القانون في ترسيخ حقوق المواطنة.',
  },
  {
    id: 'doc_mct227_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (اللغة العربية 2)',
    courseCode: 'MCT227',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://raw.githubusercontent.com/uobasrah-mechatronics/academic-archive/main/curriculum/3437Mechatronics%20Engineering.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (اللغة العربية 2 - MCT227) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* مهارات الإلقاء والتحدث، التحليل البلاغي والأدبي، كتابة الأبحاث الأكاديمية وصياغة الخلاصات والمصادر باللغة العربية الفصحى.',
  },
  {
    id: 'doc_mct227_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (اللغة العربية 2)',
    courseCode: 'MCT227',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value: 'https://archive.org/download/mct227-lecture-notes/notes.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* مهارات الإلقاء والتحدث، التحليل البلاغي والأدبي، كتابة الأبحاث الأكاديمية وصياغة الخلاصات والمصادر باللغة العربية الفصحى.',
  },
  {
    id: 'doc_mct311_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Linear Algebra and Its Applications (5th/6th Ed.) — David C. Lay, Steven R. Lay, Judi J. McDonald',
    courseCode: 'MCT311',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/linear-algebra-and-its-applications-5th-lay/Linear%20Algebra%205th%20Lay.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (الجبر الخطي) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* الفضاءات الاتجاهية والفضاءات الجزئية، الاستقلال الخطي والأساس والبعد، التحويلات الخطية والمصفوفات المرافقة، المحددات والمصفوفات المعكوسة، القيم والمتجهات الذاتية (Eigenvalues & Eigenvectors)، والقطرية (Diagonalization) وتحليل القيمة المفردة (SVD).\n📐 *أهم القوانين:* المعادلة المميزة det(A - λI) = 0, A = P·D·P^(-1), وتفكيك SVD: A = U·Σ·V^T.\n💡 *نصائح امتحانية:* عند حساب القيم الذاتية، تحقق من أن مجموع القيم الذاتية يساوي أثر المصفوفة (Trace) وحاصل ضربها يساوي المحدد (Determinant).',
  },
  {
    id: 'doc_mct311_textbook_secondary',
    title: '📚 الكتاب المساعد المعتمد: Introduction to Linear Algebra (5th Ed.) — Gilbert Strang',
    courseCode: 'MCT311',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/introduction-to-linear-algebra-strang-5th/Introduction%20to%20Linear%20Algebra%20Strang.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (الجبر الخطي) - جامعة البصرة.\n📌 *الفهرس والمفردات:* الفضاءات الاتجاهية والفضاءات الجزئية، الاستقلال الخطي والأساس والبعد، التحويلات الخطية والمصفوفات المرافقة، المحددات والمصفوفات المعكوسة، القيم والمتجهات الذاتية (Eigenvalues & Eigenvectors)، والقطرية (Diagonalization) وتحليل القيمة المفردة (SVD).\n📐 *أهم القوانين:* المعادلة المميزة det(A - λI) = 0, A = P·D·P^(-1), وتفكيك SVD: A = U·Σ·V^T.\n💡 *نصائح امتحانية:* عند حساب القيم الذاتية، تحقق من أن مجموع القيم الذاتية يساوي أثر المصفوفة (Trace) وحاصل ضربها يساوي المحدد (Determinant).',
  },
  {
    id: 'doc_mct311_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (الجبر الخطي)',
    courseCode: 'MCT311',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/linear-algebra-and-its-applications-5th-lay/Linear%20Algebra%205th%20Lay.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (الجبر الخطي - MCT311) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* الفضاءات الاتجاهية والفضاءات الجزئية، الاستقلال الخطي والأساس والبعد، التحويلات الخطية والمصفوفات المرافقة، المحددات والمصفوفات المعكوسة، القيم والمتجهات الذاتية (Eigenvalues & Eigenvectors)، والقطرية (Diagonalization) وتحليل القيمة المفردة (SVD).\n📐 *أهم القوانين:* المعادلة المميزة det(A - λI) = 0, A = P·D·P^(-1), وتفكيك SVD: A = U·Σ·V^T.\n💡 *نصائح امتحانية:* عند حساب القيم الذاتية، تحقق من أن مجموع القيم الذاتية يساوي أثر المصفوفة (Trace) وحاصل ضربها يساوي المحدد (Determinant).',
  },
  {
    id: 'doc_mct311_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (الجبر الخطي)',
    courseCode: 'MCT311',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/linear-algebra-and-its-applications-5th-lay/Linear%20Algebra%205th%20Lay.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* الفضاءات الاتجاهية والفضاءات الجزئية، الاستقلال الخطي والأساس والبعد، التحويلات الخطية والمصفوفات المرافقة، المحددات والمصفوفات المعكوسة، القيم والمتجهات الذاتية (Eigenvalues & Eigenvectors)، والقطرية (Diagonalization) وتحليل القيمة المفردة (SVD).\n📐 *أهم القوانين:* المعادلة المميزة det(A - λI) = 0, A = P·D·P^(-1), وتفكيك SVD: A = U·Σ·V^T.\n💡 *نصائح امتحانية:* عند حساب القيم الذاتية، تحقق من أن مجموع القيم الذاتية يساوي أثر المصفوفة (Trace) وحاصل ضربها يساوي المحدد (Determinant).',
  },
  {
    id: 'doc_mct312_textbook_primary',
    title: '📖 الكتاب المنهجي الرئيسي: Mechanical Vibrations (6th Ed.) — Singiresu S. Rao',
    courseCode: 'MCT312',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/mechanical-vibrations-6th-edition-rao/Mechanical%20Vibrations%206th%20Edition%20Rao.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (الاهتزازات الميكانيكية) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* الاهتزاز الحر والقسري للمنظومات أحادية درجة الحرية (SDOF) مع التخميد اللزج، الاستجابة التوافقية وقوى عدم الاتزان الدوراني، عزل الاهتزازات وقابلية الانتقال (Transmissibility)، منظومات درجتي حرية (2-DOF) وماصات الاهتزاز (Vibration Absorbers)، والمنظومات متعددة الدرجات.\n📐 *أهم القوانين:* التردد الطبيعي ωn = √(k/m)، نسبة التخميد ζ = c / (2√(k·m))، ومعادلة الانتقالية TR = √((1 + (2ζr)²) / ((1 - r²)² + (2ζr)²)).\n💡 *نصائح امتحانية:* عند تصميم ماص الاهتزاز الديناميكي، اضبط التردد الطبيعي للماص ليتطابق تماماً مع تردد القوة المهيجة (ωa = ω) لإلغاء حركة الكتلة الرئيسية.',
  },
  {
    id: 'doc_mct312_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Theory of Vibration with Applications (5th Ed.) — William T. Thomson, Marie Dillon Dahleh',
    courseCode: 'MCT312',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/theory-of-vibration-with-applications-thomson-5th/Theory%20of%20Vibration%20with%20Applications%20Thomson.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (الاهتزازات الميكانيكية) - جامعة البصرة.\n📌 *الفهرس والمفردات:* الاهتزاز الحر والقسري للمنظومات أحادية درجة الحرية (SDOF) مع التخميد اللزج، الاستجابة التوافقية وقوى عدم الاتزان الدوراني، عزل الاهتزازات وقابلية الانتقال (Transmissibility)، منظومات درجتي حرية (2-DOF) وماصات الاهتزاز (Vibration Absorbers)، والمنظومات متعددة الدرجات.\n📐 *أهم القوانين:* التردد الطبيعي ωn = √(k/m)، نسبة التخميد ζ = c / (2√(k·m))، ومعادلة الانتقالية TR = √((1 + (2ζr)²) / ((1 - r²)² + (2ζr)²)).\n💡 *نصائح امتحانية:* عند تصميم ماص الاهتزاز الديناميكي، اضبط التردد الطبيعي للماص ليتطابق تماماً مع تردد القوة المهيجة (ωa = ω) لإلغاء حركة الكتلة الرئيسية.',
  },
  {
    id: 'doc_mct312_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (الاهتزازات الميكانيكية)',
    courseCode: 'MCT312',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/mechanical-vibrations-6th-edition-rao/Mechanical%20Vibrations%206th%20Edition%20Rao.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (الاهتزازات الميكانيكية - MCT312) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* الاهتزاز الحر والقسري للمنظومات أحادية درجة الحرية (SDOF) مع التخميد اللزج، الاستجابة التوافقية وقوى عدم الاتزان الدوراني، عزل الاهتزازات وقابلية الانتقال (Transmissibility)، منظومات درجتي حرية (2-DOF) وماصات الاهتزاز (Vibration Absorbers)، والمنظومات متعددة الدرجات.\n📐 *أهم القوانين:* التردد الطبيعي ωn = √(k/m)، نسبة التخميد ζ = c / (2√(k·m))، ومعادلة الانتقالية TR = √((1 + (2ζr)²) / ((1 - r²)² + (2ζr)²)).\n💡 *نصائح امتحانية:* عند تصميم ماص الاهتزاز الديناميكي، اضبط التردد الطبيعي للماص ليتطابق تماماً مع تردد القوة المهيجة (ωa = ω) لإلغاء حركة الكتلة الرئيسية.',
  },
  {
    id: 'doc_mct312_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (الاهتزازات الميكانيكية)',
    courseCode: 'MCT312',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/mechanical-vibrations-6th-edition-rao/Mechanical%20Vibrations%206th%20Edition%20Rao.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* الاهتزاز الحر والقسري للمنظومات أحادية درجة الحرية (SDOF) مع التخميد اللزج، الاستجابة التوافقية وقوى عدم الاتزان الدوراني، عزل الاهتزازات وقابلية الانتقال (Transmissibility)، منظومات درجتي حرية (2-DOF) وماصات الاهتزاز (Vibration Absorbers)، والمنظومات متعددة الدرجات.\n📐 *أهم القوانين:* التردد الطبيعي ωn = √(k/m)، نسبة التخميد ζ = c / (2√(k·m))، ومعادلة الانتقالية TR = √((1 + (2ζr)²) / ((1 - r²)² + (2ζr)²)).\n💡 *نصائح امتحانية:* عند تصميم ماص الاهتزاز الديناميكي، اضبط التردد الطبيعي للماص ليتطابق تماماً مع تردد القوة المهيجة (ωa = ω) لإلغاء حركة الكتلة الرئيسية.',
  },
  {
    id: 'doc_mct313_textbook_primary',
    title: '📖 الكتاب المنهجي الرئيسي: Fluid Mechanics (9th Ed.) — Frank M. White, Henry Xue',
    courseCode: 'MCT313',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/fluid-mechanics-frank-white-9th-edition/Fluid%20Mechanics%209th%20Edition%20White.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (ميكانيك ومنظومات الموائع) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* خواص الموائع، استاتيكا الموائع والقوى الهيدروستاتيكية على السطوح المغمورة، معادلة الاستمرارية والزخم، معادلة برنولي وتطبيقاتها، الجريان الطباقي والمضطرب في الأنابيب وحساب الفواقد الرئيسية والثانوية، والمنظومات الهيدروليكية والصمامات.\n📐 *أهم القوانين:* معادلة برنولي P1/γ + V1²/(2g) + z1 = P2/γ + V2²/(2g) + z2 + h_L، وفواقد الاحتكاك h_f = f·(L/D)·(V²/(2g)).\n💡 *نصائح امتحانية:* احسب رقم رينولدز Re أولاً لتحديد نمط الجريان (Re < 2000 طباقي laminar، Re > 4000 مضطرب turbulent) قبل اختيار معادلة معامل الاحتكاك f.',
  },
  {
    id: 'doc_mct313_textbook_secondary',
    title: '📚 الكتاب المساعد المعتمد: Fluid Power with Applications (7th Ed.) — Anthony Esposito',
    courseCode: 'MCT313',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/fluid-power-with-applications-esposito-7th/Fluid%20Power%20with%20Applications%20Esposito.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (ميكانيك ومنظومات الموائع) - جامعة البصرة.\n📌 *الفهرس والمفردات:* خواص الموائع، استاتيكا الموائع والقوى الهيدروستاتيكية على السطوح المغمورة، معادلة الاستمرارية والزخم، معادلة برنولي وتطبيقاتها، الجريان الطباقي والمضطرب في الأنابيب وحساب الفواقد الرئيسية والثانوية، والمنظومات الهيدروليكية والصمامات.\n📐 *أهم القوانين:* معادلة برنولي P1/γ + V1²/(2g) + z1 = P2/γ + V2²/(2g) + z2 + h_L، وفواقد الاحتكاك h_f = f·(L/D)·(V²/(2g)).\n💡 *نصائح امتحانية:* احسب رقم رينولدز Re أولاً لتحديد نمط الجريان (Re < 2000 طباقي laminar، Re > 4000 مضطرب turbulent) قبل اختيار معادلة معامل الاحتكاك f.',
  },
  {
    id: 'doc_mct313_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (ميكانيك ومنظومات الموائع)',
    courseCode: 'MCT313',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/fluid-mechanics-frank-white-9th-edition/Fluid%20Mechanics%209th%20Edition%20White.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (ميكانيك ومنظومات الموائع - MCT313) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* خواص الموائع، استاتيكا الموائع والقوى الهيدروستاتيكية على السطوح المغمورة، معادلة الاستمرارية والزخم، معادلة برنولي وتطبيقاتها، الجريان الطباقي والمضطرب في الأنابيب وحساب الفواقد الرئيسية والثانوية، والمنظومات الهيدروليكية والصمامات.\n📐 *أهم القوانين:* معادلة برنولي P1/γ + V1²/(2g) + z1 = P2/γ + V2²/(2g) + z2 + h_L، وفواقد الاحتكاك h_f = f·(L/D)·(V²/(2g)).\n💡 *نصائح امتحانية:* احسب رقم رينولدز Re أولاً لتحديد نمط الجريان (Re < 2000 طباقي laminar، Re > 4000 مضطرب turbulent) قبل اختيار معادلة معامل الاحتكاك f.',
  },
  {
    id: 'doc_mct313_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (ميكانيك ومنظومات الموائع)',
    courseCode: 'MCT313',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/fluid-mechanics-frank-white-9th-edition/Fluid%20Mechanics%209th%20Edition%20White.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* خواص الموائع، استاتيكا الموائع والقوى الهيدروستاتيكية على السطوح المغمورة، معادلة الاستمرارية والزخم، معادلة برنولي وتطبيقاتها، الجريان الطباقي والمضطرب في الأنابيب وحساب الفواقد الرئيسية والثانوية، والمنظومات الهيدروليكية والصمامات.\n📐 *أهم القوانين:* معادلة برنولي P1/γ + V1²/(2g) + z1 = P2/γ + V2²/(2g) + z2 + h_L، وفواقد الاحتكاك h_f = f·(L/D)·(V²/(2g)).\n💡 *نصائح امتحانية:* احسب رقم رينولدز Re أولاً لتحديد نمط الجريان (Re < 2000 طباقي laminar، Re > 4000 مضطرب turbulent) قبل اختيار معادلة معامل الاحتكاك f.',
  },
  {
    id: 'doc_mct314_textbook_primary',
    title: '📖 الكتاب المنهجي الرئيسي: Modern Control Engineering (5th Ed.) — Katsuhiko Ogata',
    courseCode: 'MCT314',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/modern-control-engineering-ogata-5th-edition/Modern%20Control%20Engineering%20Ogata%205th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (أنظمة السيطرة 1) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* نمذجة الأنظمة الكهروميكانيكية في الحيز الترددي، مخططات تدفق الإشارة، الاستجابة الزمنية العابرة لأنظمة الدرجة الأولى والثانية، معيار راوث للاستقرارية (Routh-Hurwitz)، طريقة المحل الهندسي للجذور (Root Locus)، وتصميم دوائر التحكم التناسبي التكاملي التفاضلي (PID Controllers).\n📐 *أهم القوانين:* دالة التحويل لنظام الدرجة الثانية T(s) = ωn² / (s² + 2ζωn·s + ωn²)، زمن الاستقرار Ts = 4 / (ζ·ωn) لمعيار 2%، وأقصى تجاوز Mp = e^(-πζ / √(1 - ζ²)).\n💡 *نصائح امتحانية:* احفظ نقاط تقاطع ومحاذيات الـ Root Locus: زوايا المحاذيات θ = (2k+1)·180° / (n - m) ونقطة المركز σa = (ΣP - ΣZ) / (n - m).',
  },
  {
    id: 'doc_mct314_textbook_secondary',
    title: '📚 الكتاب المساعد المعتمد: Control Systems Engineering (8th Ed.) — Norman S. Nise',
    courseCode: 'MCT314',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/control-systems-engineering-norman-nise-8th-edition/Control%20Systems%20Engineering%208th%20Nise.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (أنظمة السيطرة 1) - جامعة البصرة.\n📌 *الفهرس والمفردات:* نمذجة الأنظمة الكهروميكانيكية في الحيز الترددي، مخططات تدفق الإشارة، الاستجابة الزمنية العابرة لأنظمة الدرجة الأولى والثانية، معيار راوث للاستقرارية (Routh-Hurwitz)، طريقة المحل الهندسي للجذور (Root Locus)، وتصميم دوائر التحكم التناسبي التكاملي التفاضلي (PID Controllers).\n📐 *أهم القوانين:* دالة التحويل لنظام الدرجة الثانية T(s) = ωn² / (s² + 2ζωn·s + ωn²)، زمن الاستقرار Ts = 4 / (ζ·ωn) لمعيار 2%، وأقصى تجاوز Mp = e^(-πζ / √(1 - ζ²)).\n💡 *نصائح امتحانية:* احفظ نقاط تقاطع ومحاذيات الـ Root Locus: زوايا المحاذيات θ = (2k+1)·180° / (n - m) ونقطة المركز σa = (ΣP - ΣZ) / (n - m).',
  },
  {
    id: 'doc_mct314_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (أنظمة السيطرة 1)',
    courseCode: 'MCT314',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/modern-control-engineering-ogata-5th-edition/Modern%20Control%20Engineering%20Ogata%205th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (أنظمة السيطرة 1 - MCT314) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* نمذجة الأنظمة الكهروميكانيكية في الحيز الترددي، مخططات تدفق الإشارة، الاستجابة الزمنية العابرة لأنظمة الدرجة الأولى والثانية، معيار راوث للاستقرارية (Routh-Hurwitz)، طريقة المحل الهندسي للجذور (Root Locus)، وتصميم دوائر التحكم التناسبي التكاملي التفاضلي (PID Controllers).\n📐 *أهم القوانين:* دالة التحويل لنظام الدرجة الثانية T(s) = ωn² / (s² + 2ζωn·s + ωn²)، زمن الاستقرار Ts = 4 / (ζ·ωn) لمعيار 2%، وأقصى تجاوز Mp = e^(-πζ / √(1 - ζ²)).\n💡 *نصائح امتحانية:* احفظ نقاط تقاطع ومحاذيات الـ Root Locus: زوايا المحاذيات θ = (2k+1)·180° / (n - m) ونقطة المركز σa = (ΣP - ΣZ) / (n - m).',
  },
  {
    id: 'doc_mct314_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (أنظمة السيطرة 1)',
    courseCode: 'MCT314',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/modern-control-engineering-ogata-5th-edition/Modern%20Control%20Engineering%20Ogata%205th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* نمذجة الأنظمة الكهروميكانيكية في الحيز الترددي، مخططات تدفق الإشارة، الاستجابة الزمنية العابرة لأنظمة الدرجة الأولى والثانية، معيار راوث للاستقرارية (Routh-Hurwitz)، طريقة المحل الهندسي للجذور (Root Locus)، وتصميم دوائر التحكم التناسبي التكاملي التفاضلي (PID Controllers).\n📐 *أهم القوانين:* دالة التحويل لنظام الدرجة الثانية T(s) = ωn² / (s² + 2ζωn·s + ωn²)، زمن الاستقرار Ts = 4 / (ζ·ωn) لمعيار 2%، وأقصى تجاوز Mp = e^(-πζ / √(1 - ζ²)).\n💡 *نصائح امتحانية:* احفظ نقاط تقاطع ومحاذيات الـ Root Locus: زوايا المحاذيات θ = (2k+1)·180° / (n - m) ونقطة المركز σa = (ΣP - ΣZ) / (n - m).',
  },
  {
    id: 'doc_mct315_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Computer Organization and Architecture (11th Ed.) — William Stallings',
    courseCode: 'MCT315',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/computer-organization-and-architecture-11th-stallings/Computer%20Organization%2011th%20Stallings.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (تنظيم الحاسبة) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* معمارية الحاسوب وتنظيمه، مجموعة التعليمات (ISA) ومسجلات المعالج، مسار البيانات ووحدة التحكم (Datapath & Control Unit)، تقنية خطوط التجميع (Pipelining) ومخاطرها (Hazards)، هرمية الذاكرة والذاكرة المخبأة (Cache Mapping Techniques)، ونواقل الإدخال والإخراج.\n📐 *أهم القوانين:* معادلة أداء المعالج CPU Time = IC × CPI × Clock Cycle Time، وحساب معدل الإصابة في الكاش ومعدل الوصول الفعال EAT.\n💡 *نصائح امتحانية:* فهم كيفية معالجة فقاعات خط التجميع (Pipeline Stalls) والقفز الشرطي (Branch Prediction).',
  },
  {
    id: 'doc_mct315_textbook_secondary',
    title: '📚 الكتاب المساعد المعتمد: Computer System Architecture (3rd Ed.) — M. Morris Mano',
    courseCode: 'MCT315',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/computer-system-architecture-mano-3rd/Computer%20System%20Architecture%20Mano.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (تنظيم الحاسبة) - جامعة البصرة.\n📌 *الفهرس والمفردات:* معمارية الحاسوب وتنظيمه، مجموعة التعليمات (ISA) ومسجلات المعالج، مسار البيانات ووحدة التحكم (Datapath & Control Unit)، تقنية خطوط التجميع (Pipelining) ومخاطرها (Hazards)، هرمية الذاكرة والذاكرة المخبأة (Cache Mapping Techniques)، ونواقل الإدخال والإخراج.\n📐 *أهم القوانين:* معادلة أداء المعالج CPU Time = IC × CPI × Clock Cycle Time، وحساب معدل الإصابة في الكاش ومعدل الوصول الفعال EAT.\n💡 *نصائح امتحانية:* فهم كيفية معالجة فقاعات خط التجميع (Pipeline Stalls) والقفز الشرطي (Branch Prediction).',
  },
  {
    id: 'doc_mct315_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (تنظيم الحاسبة)',
    courseCode: 'MCT315',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/computer-organization-and-architecture-11th-stallings/Computer%20Organization%2011th%20Stallings.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (تنظيم الحاسبة - MCT315) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* معمارية الحاسوب وتنظيمه، مجموعة التعليمات (ISA) ومسجلات المعالج، مسار البيانات ووحدة التحكم (Datapath & Control Unit)، تقنية خطوط التجميع (Pipelining) ومخاطرها (Hazards)، هرمية الذاكرة والذاكرة المخبأة (Cache Mapping Techniques)، ونواقل الإدخال والإخراج.\n📐 *أهم القوانين:* معادلة أداء المعالج CPU Time = IC × CPI × Clock Cycle Time، وحساب معدل الإصابة في الكاش ومعدل الوصول الفعال EAT.\n💡 *نصائح امتحانية:* فهم كيفية معالجة فقاعات خط التجميع (Pipeline Stalls) والقفز الشرطي (Branch Prediction).',
  },
  {
    id: 'doc_mct315_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (تنظيم الحاسبة)',
    courseCode: 'MCT315',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/computer-organization-and-architecture-11th-stallings/Computer%20Organization%2011th%20Stallings.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* معمارية الحاسوب وتنظيمه، مجموعة التعليمات (ISA) ومسجلات المعالج، مسار البيانات ووحدة التحكم (Datapath & Control Unit)، تقنية خطوط التجميع (Pipelining) ومخاطرها (Hazards)، هرمية الذاكرة والذاكرة المخبأة (Cache Mapping Techniques)، ونواقل الإدخال والإخراج.\n📐 *أهم القوانين:* معادلة أداء المعالج CPU Time = IC × CPI × Clock Cycle Time، وحساب معدل الإصابة في الكاش ومعدل الوصول الفعال EAT.\n💡 *نصائح امتحانية:* فهم كيفية معالجة فقاعات خط التجميع (Pipeline Stalls) والقفز الشرطي (Branch Prediction).',
  },
  {
    id: 'doc_mct316_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Power Electronics: Circuits, Devices, and Applications (4th Ed.) — Muhammad H. Rashid',
    courseCode: 'MCT316',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/power-electronics-circuits-devices-applications-rashid-4th/Power%20Electronics%20Rashid%204th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (إلكترونيات القدرة) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* عناصر أشباه الموصلات لقدرة عالية (SCR, TRIAC, MOSFET, IGBT)، دوائر المقومات المحكومة أحادية وثلاثية الأطوار، مقطعات التيار المستمر (Buck, Boost, Buck-Boost Converters)، والمبدلات العاكسة (Inverters) وتقنيات PWM للتحكم في محركات التيار المتناوب.\n📐 *أهم القوانين:* نسبة التحويل في مقطع الخافض V_out = D · V_in، وفي مقطع الرافع V_out = V_in / (1 - D)، حيث D هي دورة التشغيل (Duty Cycle).\n💡 *نصائح امتحانية:* انتبه لحساب المحاثة الحرجة (Critical Inductance L_min) لضمان عمل المقطع في وضع التوصيل المستمر (CCM).',
  },
  {
    id: 'doc_mct316_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Power Electronics: Converters, Applications, and Design (3rd Ed.) — Ned Mohan, Tore Undeland',
    courseCode: 'MCT316',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/power-electronics-converters-applications-design-mohan/Power%20Electronics%20Mohan.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (إلكترونيات القدرة) - جامعة البصرة.\n📌 *الفهرس والمفردات:* عناصر أشباه الموصلات لقدرة عالية (SCR, TRIAC, MOSFET, IGBT)، دوائر المقومات المحكومة أحادية وثلاثية الأطوار، مقطعات التيار المستمر (Buck, Boost, Buck-Boost Converters)، والمبدلات العاكسة (Inverters) وتقنيات PWM للتحكم في محركات التيار المتناوب.\n📐 *أهم القوانين:* نسبة التحويل في مقطع الخافض V_out = D · V_in، وفي مقطع الرافع V_out = V_in / (1 - D)، حيث D هي دورة التشغيل (Duty Cycle).\n💡 *نصائح امتحانية:* انتبه لحساب المحاثة الحرجة (Critical Inductance L_min) لضمان عمل المقطع في وضع التوصيل المستمر (CCM).',
  },
  {
    id: 'doc_mct316_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (إلكترونيات القدرة)',
    courseCode: 'MCT316',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/power-electronics-circuits-devices-applications-rashid-4th/Power%20Electronics%20Rashid%204th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (إلكترونيات القدرة - MCT316) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* عناصر أشباه الموصلات لقدرة عالية (SCR, TRIAC, MOSFET, IGBT)، دوائر المقومات المحكومة أحادية وثلاثية الأطوار، مقطعات التيار المستمر (Buck, Boost, Buck-Boost Converters)، والمبدلات العاكسة (Inverters) وتقنيات PWM للتحكم في محركات التيار المتناوب.\n📐 *أهم القوانين:* نسبة التحويل في مقطع الخافض V_out = D · V_in، وفي مقطع الرافع V_out = V_in / (1 - D)، حيث D هي دورة التشغيل (Duty Cycle).\n💡 *نصائح امتحانية:* انتبه لحساب المحاثة الحرجة (Critical Inductance L_min) لضمان عمل المقطع في وضع التوصيل المستمر (CCM).',
  },
  {
    id: 'doc_mct316_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (إلكترونيات القدرة)',
    courseCode: 'MCT316',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/power-electronics-circuits-devices-applications-rashid-4th/Power%20Electronics%20Rashid%204th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* عناصر أشباه الموصلات لقدرة عالية (SCR, TRIAC, MOSFET, IGBT)، دوائر المقومات المحكومة أحادية وثلاثية الأطوار، مقطعات التيار المستمر (Buck, Boost, Buck-Boost Converters)، والمبدلات العاكسة (Inverters) وتقنيات PWM للتحكم في محركات التيار المتناوب.\n📐 *أهم القوانين:* نسبة التحويل في مقطع الخافض V_out = D · V_in، وفي مقطع الرافع V_out = V_in / (1 - D)، حيث D هي دورة التشغيل (Duty Cycle).\n💡 *نصائح امتحانية:* انتبه لحساب المحاثة الحرجة (Critical Inductance L_min) لضمان عمل المقطع في وضع التوصيل المستمر (CCM).',
  },
  {
    id: 'doc_mct317_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Fundamentals of Heat and Mass Transfer (8th Ed.) — Theodore L. Bergman, Adrienne Lavine, Frank P. Incropera',
    courseCode: 'MCT317',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/fundamentals-of-heat-and-mass-transfer-incropera-8th/Fundamentals%20of%20Heat%20and%20Mass%20Transfer%208th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (انتقال الحرارة) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* آليات انتقال الحرارة (التوصيل، الحمل، الإشعاع)، قانون فورييه للتوصيل الحراري في الإحداثيات المستوية والأسطوانية والكروية، المقاومة الحرارية وجدران العزل، الأسطح الممتدة (الزعانف)، الحمل القسري والحر، الإشعاع الحراري ومعامل الرؤية (View Factor)، والمبادلات الحرارية.\n📐 *أهم القوانين:* قانون فورييه q = -k·A·dT/dx، المقاومة الحرارية للتوصيل R = L/(k·A) وللحمل R = 1/(h·A)، الإشعاع q = ε·σ·A·(T1⁴ - T2⁴).\n💡 *نصائح امتحانية:* ارسم الدائرة المكافئة للمقاومات الحرارية التوالي والتوازي لتبسيط أعقد مسائل التوصيل والحمل المشترك.',
  },
  {
    id: 'doc_mct317_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Heat and Mass Transfer: Fundamentals and Applications (6th Ed.) — Yunus A. Cengel, Afshin J. Ghajar',
    courseCode: 'MCT317',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/heat-and-mass-transfer-cengel-6th/Heat%20and%20Mass%20Transfer%20Cengel.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (انتقال الحرارة) - جامعة البصرة.\n📌 *الفهرس والمفردات:* آليات انتقال الحرارة (التوصيل، الحمل، الإشعاع)، قانون فورييه للتوصيل الحراري في الإحداثيات المستوية والأسطوانية والكروية، المقاومة الحرارية وجدران العزل، الأسطح الممتدة (الزعانف)، الحمل القسري والحر، الإشعاع الحراري ومعامل الرؤية (View Factor)، والمبادلات الحرارية.\n📐 *أهم القوانين:* قانون فورييه q = -k·A·dT/dx، المقاومة الحرارية للتوصيل R = L/(k·A) وللحمل R = 1/(h·A)، الإشعاع q = ε·σ·A·(T1⁴ - T2⁴).\n💡 *نصائح امتحانية:* ارسم الدائرة المكافئة للمقاومات الحرارية التوالي والتوازي لتبسيط أعقد مسائل التوصيل والحمل المشترك.',
  },
  {
    id: 'doc_mct317_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (انتقال الحرارة)',
    courseCode: 'MCT317',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/fundamentals-of-heat-and-mass-transfer-incropera-8th/Fundamentals%20of%20Heat%20and%20Mass%20Transfer%208th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (انتقال الحرارة - MCT317) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* آليات انتقال الحرارة (التوصيل، الحمل، الإشعاع)، قانون فورييه للتوصيل الحراري في الإحداثيات المستوية والأسطوانية والكروية، المقاومة الحرارية وجدران العزل، الأسطح الممتدة (الزعانف)، الحمل القسري والحر، الإشعاع الحراري ومعامل الرؤية (View Factor)، والمبادلات الحرارية.\n📐 *أهم القوانين:* قانون فورييه q = -k·A·dT/dx، المقاومة الحرارية للتوصيل R = L/(k·A) وللحمل R = 1/(h·A)، الإشعاع q = ε·σ·A·(T1⁴ - T2⁴).\n💡 *نصائح امتحانية:* ارسم الدائرة المكافئة للمقاومات الحرارية التوالي والتوازي لتبسيط أعقد مسائل التوصيل والحمل المشترك.',
  },
  {
    id: 'doc_mct317_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (انتقال الحرارة)',
    courseCode: 'MCT317',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/fundamentals-of-heat-and-mass-transfer-incropera-8th/Fundamentals%20of%20Heat%20and%20Mass%20Transfer%208th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* آليات انتقال الحرارة (التوصيل، الحمل، الإشعاع)، قانون فورييه للتوصيل الحراري في الإحداثيات المستوية والأسطوانية والكروية، المقاومة الحرارية وجدران العزل، الأسطح الممتدة (الزعانف)، الحمل القسري والحر، الإشعاع الحراري ومعامل الرؤية (View Factor)، والمبادلات الحرارية.\n📐 *أهم القوانين:* قانون فورييه q = -k·A·dT/dx، المقاومة الحرارية للتوصيل R = L/(k·A) وللحمل R = 1/(h·A)، الإشعاع q = ε·σ·A·(T1⁴ - T2⁴).\n💡 *نصائح امتحانية:* ارسم الدائرة المكافئة للمقاومات الحرارية التوالي والتوازي لتبسيط أعقد مسائل التوصيل والحمل المشترك.',
  },
  {
    id: 'doc_mct321_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Numerical Methods for Engineers (8th Ed.) — Steven C. Chapra, Raymond P. Canale',
    courseCode: 'MCT321',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/numerical-methods-for-engineers-chapra-8th/Numerical%20Methods%20for%20Engineers%208th%20Chapra.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (التحليلات العددية والإحصاء) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* التحليلات العددية: حل المعادلات غير الخطية (Bisection, Newton-Raphson)، حل أنظمة المعادلات الخطية (Gauss Elimination, Gauss-Seidel)، الاستيفاء والتقريب (Lagrange & Newton Interpolation)، التفاضل والتكامل العددي (Trapezoidal, Simpson's Rules)، حل المعادلات التفاضلية عددياً (Runge-Kutta 4th Order)، والإحصاء الهندسي ونظرية الاحتمالات.\n📐 *أهم القوانين:* صيغة نيوتن-رافسون x_(n+1) = x_n - f(x_n)/f'(x_n)، وطريقة سمبسون 1/3: I = (h/3)·[f0 + 4Σf_odd + 2Σf_even + fn].\n💡 *نصائح امتحانية:* احرص على ضبط الآلة الحاسبة على نظام الراديان (Radian) عند التعامل مع الدوال المثلثية في الطرق العددية.",
  },
  {
    id: 'doc_mct321_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Applied Statistics and Probability for Engineers (7th Ed.) — Douglas C. Montgomery, George C. Runger',
    courseCode: 'MCT321',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/applied-statistics-and-probability-for-engineers-montgomery/Applied%20Statistics%20Montgomery.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "الكتاب المساعد والتمارين المحلولة الداعمة لمادة (التحليلات العددية والإحصاء) - جامعة البصرة.\n📌 *الفهرس والمفردات:* التحليلات العددية: حل المعادلات غير الخطية (Bisection, Newton-Raphson)، حل أنظمة المعادلات الخطية (Gauss Elimination, Gauss-Seidel)، الاستيفاء والتقريب (Lagrange & Newton Interpolation)، التفاضل والتكامل العددي (Trapezoidal, Simpson's Rules)، حل المعادلات التفاضلية عددياً (Runge-Kutta 4th Order)، والإحصاء الهندسي ونظرية الاحتمالات.\n📐 *أهم القوانين:* صيغة نيوتن-رافسون x_(n+1) = x_n - f(x_n)/f'(x_n)، وطريقة سمبسون 1/3: I = (h/3)·[f0 + 4Σf_odd + 2Σf_even + fn].\n💡 *نصائح امتحانية:* احرص على ضبط الآلة الحاسبة على نظام الراديان (Radian) عند التعامل مع الدوال المثلثية في الطرق العددية.",
  },
  {
    id: 'doc_mct321_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (التحليلات العددية والإحصاء)',
    courseCode: 'MCT321',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/numerical-methods-for-engineers-chapra-8th/Numerical%20Methods%20for%20Engineers%208th%20Chapra.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (التحليلات العددية والإحصاء - MCT321) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* التحليلات العددية: حل المعادلات غير الخطية (Bisection, Newton-Raphson)، حل أنظمة المعادلات الخطية (Gauss Elimination, Gauss-Seidel)، الاستيفاء والتقريب (Lagrange & Newton Interpolation)، التفاضل والتكامل العددي (Trapezoidal, Simpson's Rules)، حل المعادلات التفاضلية عددياً (Runge-Kutta 4th Order)، والإحصاء الهندسي ونظرية الاحتمالات.\n📐 *أهم القوانين:* صيغة نيوتن-رافسون x_(n+1) = x_n - f(x_n)/f'(x_n)، وطريقة سمبسون 1/3: I = (h/3)·[f0 + 4Σf_odd + 2Σf_even + fn].\n💡 *نصائح امتحانية:* احرص على ضبط الآلة الحاسبة على نظام الراديان (Radian) عند التعامل مع الدوال المثلثية في الطرق العددية.",
  },
  {
    id: 'doc_mct321_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (التحليلات العددية والإحصاء)',
    courseCode: 'MCT321',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/numerical-methods-for-engineers-chapra-8th/Numerical%20Methods%20for%20Engineers%208th%20Chapra.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "📌 *الفهرس والمفردات:* التحليلات العددية: حل المعادلات غير الخطية (Bisection, Newton-Raphson)، حل أنظمة المعادلات الخطية (Gauss Elimination, Gauss-Seidel)، الاستيفاء والتقريب (Lagrange & Newton Interpolation)، التفاضل والتكامل العددي (Trapezoidal, Simpson's Rules)، حل المعادلات التفاضلية عددياً (Runge-Kutta 4th Order)، والإحصاء الهندسي ونظرية الاحتمالات.\n📐 *أهم القوانين:* صيغة نيوتن-رافسون x_(n+1) = x_n - f(x_n)/f'(x_n)، وطريقة سمبسون 1/3: I = (h/3)·[f0 + 4Σf_odd + 2Σf_even + fn].\n💡 *نصائح امتحانية:* احرص على ضبط الآلة الحاسبة على نظام الراديان (Radian) عند التعامل مع الدوال المثلثية في الطرق العددية.",
  },
  {
    id: 'doc_mct322_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Engineering Economy (8th Ed.) — Leland Blank, Anthony Tarquin',
    courseCode: 'MCT322',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/engineering-economy-blank-tarquin-8th/Engineering%20Economy%20Blank%20Tarquin.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (الاقتصاد الهندسي) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* أساسيات الاقتصاد الهندسي، القيمة الزمنية للنقود والفوائد البسيطة والمركبة، مخططات التدفق النقدي (Cash Flow Diagrams)، القيمة الحالية (Present Worth) والسنوية (Annual Worth) والمستقبلية (Future Worth)، معدل العائد الداخلي (IRR)، وتحليل التكلفة والفائدة والاندثار والضرائب.\n📐 *أهم القوانين:* F = P·(1 + i)^n, P = A·[((1 + i)^n - 1) / (i·(1 + i)^n)].\n💡 *نصائح امتحانية:* رسم مخطط التدفق النقدي وتحديد اتجاهات الأسهم بدقة (الداخل موجب والخارج سالب) هو المفتاح لمنع الخطأ في الإشارة.',
  },
  {
    id: 'doc_mct322_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Basics of Engineering Economy (2nd Ed.) — Leland Blank, Anthony Tarquin',
    courseCode: 'MCT322',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/basics-of-engineering-economy-blank-2nd/Basics%20of%20Engineering%20Economy%20Blank.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (الاقتصاد الهندسي) - جامعة البصرة.\n📌 *الفهرس والمفردات:* أساسيات الاقتصاد الهندسي، القيمة الزمنية للنقود والفوائد البسيطة والمركبة، مخططات التدفق النقدي (Cash Flow Diagrams)، القيمة الحالية (Present Worth) والسنوية (Annual Worth) والمستقبلية (Future Worth)، معدل العائد الداخلي (IRR)، وتحليل التكلفة والفائدة والاندثار والضرائب.\n📐 *أهم القوانين:* F = P·(1 + i)^n, P = A·[((1 + i)^n - 1) / (i·(1 + i)^n)].\n💡 *نصائح امتحانية:* رسم مخطط التدفق النقدي وتحديد اتجاهات الأسهم بدقة (الداخل موجب والخارج سالب) هو المفتاح لمنع الخطأ في الإشارة.',
  },
  {
    id: 'doc_mct322_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (الاقتصاد الهندسي)',
    courseCode: 'MCT322',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/engineering-economy-blank-tarquin-8th/Engineering%20Economy%20Blank%20Tarquin.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (الاقتصاد الهندسي - MCT322) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* أساسيات الاقتصاد الهندسي، القيمة الزمنية للنقود والفوائد البسيطة والمركبة، مخططات التدفق النقدي (Cash Flow Diagrams)، القيمة الحالية (Present Worth) والسنوية (Annual Worth) والمستقبلية (Future Worth)، معدل العائد الداخلي (IRR)، وتحليل التكلفة والفائدة والاندثار والضرائب.\n📐 *أهم القوانين:* F = P·(1 + i)^n, P = A·[((1 + i)^n - 1) / (i·(1 + i)^n)].\n💡 *نصائح امتحانية:* رسم مخطط التدفق النقدي وتحديد اتجاهات الأسهم بدقة (الداخل موجب والخارج سالب) هو المفتاح لمنع الخطأ في الإشارة.',
  },
  {
    id: 'doc_mct322_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (الاقتصاد الهندسي)',
    courseCode: 'MCT322',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/engineering-economy-blank-tarquin-8th/Engineering%20Economy%20Blank%20Tarquin.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* أساسيات الاقتصاد الهندسي، القيمة الزمنية للنقود والفوائد البسيطة والمركبة، مخططات التدفق النقدي (Cash Flow Diagrams)، القيمة الحالية (Present Worth) والسنوية (Annual Worth) والمستقبلية (Future Worth)، معدل العائد الداخلي (IRR)، وتحليل التكلفة والفائدة والاندثار والضرائب.\n📐 *أهم القوانين:* F = P·(1 + i)^n, P = A·[((1 + i)^n - 1) / (i·(1 + i)^n)].\n💡 *نصائح امتحانية:* رسم مخطط التدفق النقدي وتحديد اتجاهات الأسهم بدقة (الداخل موجب والخارج سالب) هو المفتاح لمنع الخطأ في الإشارة.',
  },
  {
    id: 'doc_mct323_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Introduction to Mechatronics and Measurement Systems (5th Ed.) — David G. Alciatore',
    courseCode: 'MCT323',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/introduction-to-mechatronics-measurement-systems-alciatore-5th/Introduction%20to%20Mechatronics%205th%20Alciatore.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (المتحسسات والآلات الدقيقة) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* مبادئ أجهزة القياس والمتحسسات (Sensors & Transducers)، مواصفات الحساسات الساكنة والديناميكية (الحساسية، الخطية، التكرارية، زمن الاستجابة)، حساسات الإزاحة والسرعة والقوة والحرارة والضغط والتدفق، دوائر تهيئة الإشارة (Signal Conditioning: جسور ويتستون، المرشحات، ومكبرات القياس Instrumentation Amplifiers).\n📐 *أهم القوانين:* معادلة جسر ويتستون غير المتزن V_out = V_in · [R1/(R1+R2) - R3/(R3+R4)]، وحساب حساسية مقياس الانفعال Gauge Factor.\n💡 *نصائح امتحانية:* انتبه لمشكلة التحميل (Loading Effect) عند ربط الحساسات بدارات المعالجة وكيف يحل عازل الجهد (Buffer) هذه المشكلة.',
  },
  {
    id: 'doc_mct323_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Sensors and Actuators: Control System Instrumentation — Clarence W. de Silva',
    courseCode: 'MCT323',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/sensors-and-actuators-control-system-instrumentation-de-silva/Sensors%20and%20Actuators%20De%20Silva.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (المتحسسات والآلات الدقيقة) - جامعة البصرة.\n📌 *الفهرس والمفردات:* مبادئ أجهزة القياس والمتحسسات (Sensors & Transducers)، مواصفات الحساسات الساكنة والديناميكية (الحساسية، الخطية، التكرارية، زمن الاستجابة)، حساسات الإزاحة والسرعة والقوة والحرارة والضغط والتدفق، دوائر تهيئة الإشارة (Signal Conditioning: جسور ويتستون، المرشحات، ومكبرات القياس Instrumentation Amplifiers).\n📐 *أهم القوانين:* معادلة جسر ويتستون غير المتزن V_out = V_in · [R1/(R1+R2) - R3/(R3+R4)]، وحساب حساسية مقياس الانفعال Gauge Factor.\n💡 *نصائح امتحانية:* انتبه لمشكلة التحميل (Loading Effect) عند ربط الحساسات بدارات المعالجة وكيف يحل عازل الجهد (Buffer) هذه المشكلة.',
  },
  {
    id: 'doc_mct323_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (المتحسسات والآلات الدقيقة)',
    courseCode: 'MCT323',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/introduction-to-mechatronics-measurement-systems-alciatore-5th/Introduction%20to%20Mechatronics%205th%20Alciatore.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (المتحسسات والآلات الدقيقة - MCT323) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* مبادئ أجهزة القياس والمتحسسات (Sensors & Transducers)، مواصفات الحساسات الساكنة والديناميكية (الحساسية، الخطية، التكرارية، زمن الاستجابة)، حساسات الإزاحة والسرعة والقوة والحرارة والضغط والتدفق، دوائر تهيئة الإشارة (Signal Conditioning: جسور ويتستون، المرشحات، ومكبرات القياس Instrumentation Amplifiers).\n📐 *أهم القوانين:* معادلة جسر ويتستون غير المتزن V_out = V_in · [R1/(R1+R2) - R3/(R3+R4)]، وحساب حساسية مقياس الانفعال Gauge Factor.\n💡 *نصائح امتحانية:* انتبه لمشكلة التحميل (Loading Effect) عند ربط الحساسات بدارات المعالجة وكيف يحل عازل الجهد (Buffer) هذه المشكلة.',
  },
  {
    id: 'doc_mct323_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (المتحسسات والآلات الدقيقة)',
    courseCode: 'MCT323',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/introduction-to-mechatronics-measurement-systems-alciatore-5th/Introduction%20to%20Mechatronics%205th%20Alciatore.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* مبادئ أجهزة القياس والمتحسسات (Sensors & Transducers)، مواصفات الحساسات الساكنة والديناميكية (الحساسية، الخطية، التكرارية، زمن الاستجابة)، حساسات الإزاحة والسرعة والقوة والحرارة والضغط والتدفق، دوائر تهيئة الإشارة (Signal Conditioning: جسور ويتستون، المرشحات، ومكبرات القياس Instrumentation Amplifiers).\n📐 *أهم القوانين:* معادلة جسر ويتستون غير المتزن V_out = V_in · [R1/(R1+R2) - R3/(R3+R4)]، وحساب حساسية مقياس الانفعال Gauge Factor.\n💡 *نصائح امتحانية:* انتبه لمشكلة التحميل (Loading Effect) عند ربط الحساسات بدارات المعالجة وكيف يحل عازل الجهد (Buffer) هذه المشكلة.',
  },
  {
    id: 'doc_mct324_textbook_primary',
    title: '📖 الكتاب المنهجي الرئيسي: Modern Control Engineering (5th Ed.) — Katsuhiko Ogata',
    courseCode: 'MCT324',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/modern-control-engineering-ogata-5th-edition/Modern%20Control%20Engineering%20Ogata%205th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (أنظمة السيطرة 2) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* أساليب الاستجابة الترددية لأنظمة التحكم (Bode Plots, Nyquist Stability Criterion, Nichols Chart)، هوامش الكسب والطور (Gain & Phase Margins)، تصميم معدلات الطور (Lead, Lag, Lead-Lag Compensators)، فضاء الحالة (State-Space): مصفوفات A, B, C, D، القابلية للتحكم والقابلية للملاحظة (Controllability & Observability)، وتصميم متحكمات التغذية الراجعة للحالة (Pole Placement).\n📐 *أهم القوانين:* مصفوفة القابلية للتحكم Co = [B AB A²B ... A^(n-1)B] بشرط rank(Co) = n، ومعادلة أكرمان لحساب مصفوفة الكسب K.\n💡 *نصائح امتحانية:* رسم مخطط بودي: تحديد ترددات الزوايا (Corner Frequencies) وتأثير الأقطاب (-20 dB/dec) والأصفار (+20 dB/dec).',
  },
  {
    id: 'doc_mct324_textbook_secondary',
    title: '📚 الكتاب المساعد المعتمد: Control Systems Engineering (8th Ed.) — Norman S. Nise',
    courseCode: 'MCT324',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/control-systems-engineering-norman-nise-8th-edition/Control%20Systems%20Engineering%208th%20Nise.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (أنظمة السيطرة 2) - جامعة البصرة.\n📌 *الفهرس والمفردات:* أساليب الاستجابة الترددية لأنظمة التحكم (Bode Plots, Nyquist Stability Criterion, Nichols Chart)، هوامش الكسب والطور (Gain & Phase Margins)، تصميم معدلات الطور (Lead, Lag, Lead-Lag Compensators)، فضاء الحالة (State-Space): مصفوفات A, B, C, D، القابلية للتحكم والقابلية للملاحظة (Controllability & Observability)، وتصميم متحكمات التغذية الراجعة للحالة (Pole Placement).\n📐 *أهم القوانين:* مصفوفة القابلية للتحكم Co = [B AB A²B ... A^(n-1)B] بشرط rank(Co) = n، ومعادلة أكرمان لحساب مصفوفة الكسب K.\n💡 *نصائح امتحانية:* رسم مخطط بودي: تحديد ترددات الزوايا (Corner Frequencies) وتأثير الأقطاب (-20 dB/dec) والأصفار (+20 dB/dec).',
  },
  {
    id: 'doc_mct324_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (أنظمة السيطرة 2)',
    courseCode: 'MCT324',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/modern-control-engineering-ogata-5th-edition/Modern%20Control%20Engineering%20Ogata%205th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (أنظمة السيطرة 2 - MCT324) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* أساليب الاستجابة الترددية لأنظمة التحكم (Bode Plots, Nyquist Stability Criterion, Nichols Chart)، هوامش الكسب والطور (Gain & Phase Margins)، تصميم معدلات الطور (Lead, Lag, Lead-Lag Compensators)، فضاء الحالة (State-Space): مصفوفات A, B, C, D، القابلية للتحكم والقابلية للملاحظة (Controllability & Observability)، وتصميم متحكمات التغذية الراجعة للحالة (Pole Placement).\n📐 *أهم القوانين:* مصفوفة القابلية للتحكم Co = [B AB A²B ... A^(n-1)B] بشرط rank(Co) = n، ومعادلة أكرمان لحساب مصفوفة الكسب K.\n💡 *نصائح امتحانية:* رسم مخطط بودي: تحديد ترددات الزوايا (Corner Frequencies) وتأثير الأقطاب (-20 dB/dec) والأصفار (+20 dB/dec).',
  },
  {
    id: 'doc_mct324_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (أنظمة السيطرة 2)',
    courseCode: 'MCT324',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/modern-control-engineering-ogata-5th-edition/Modern%20Control%20Engineering%20Ogata%205th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* أساليب الاستجابة الترددية لأنظمة التحكم (Bode Plots, Nyquist Stability Criterion, Nichols Chart)، هوامش الكسب والطور (Gain & Phase Margins)، تصميم معدلات الطور (Lead, Lag, Lead-Lag Compensators)، فضاء الحالة (State-Space): مصفوفات A, B, C, D، القابلية للتحكم والقابلية للملاحظة (Controllability & Observability)، وتصميم متحكمات التغذية الراجعة للحالة (Pole Placement).\n📐 *أهم القوانين:* مصفوفة القابلية للتحكم Co = [B AB A²B ... A^(n-1)B] بشرط rank(Co) = n، ومعادلة أكرمان لحساب مصفوفة الكسب K.\n💡 *نصائح امتحانية:* رسم مخطط بودي: تحديد ترددات الزوايا (Corner Frequencies) وتأثير الأقطاب (-20 dB/dec) والأصفار (+20 dB/dec).',
  },
  {
    id: 'doc_mct325_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Programmable Logic Controllers (5th Ed.) — Frank D. Petruzella',
    courseCode: 'MCT325',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/programmable-logic-controllers-petruzella-5th/Programmable%20Logic%20Controllers%205th%20Petruzella.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (منظومات الأتمتة) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* البنية المعمارية للمتحكمات المنطقية القابلة للبرمجة (PLC)، وحدات الإدخال والإخراج الرقمية والتماثلية، البرمجة بمخطط السلم (Ladder Diagram) وقوائم التعليمات والمخططات الوظيفية SFC، دوائر التثبيت (Latch/Unlatch)، المؤقتات والعدادات، المقارنات والعمليات الحسابية، وأساسيات شبكات التحكم الصناعي (Modbus, Profibus, Industrial Ethernet).\n💡 *نصائح امتحانية:* تدرب على برمجة دورات الإشارات المرورية والمصاعد والتحكم بدرجات الحرارة والمضخات بالتتابع الزمني الصارم.',
  },
  {
    id: 'doc_mct325_textbook_secondary',
    title: '📚 الكتاب المساعد المعتمد: Automating Manufacturing Systems with PLCs — Hugh Jack',
    courseCode: 'MCT325',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/automating-manufacturing-systems-with-plcs-hugh-jack/Automating%20Manufacturing%20Systems%20with%20PLCs%20Hugh%20Jack.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (منظومات الأتمتة) - جامعة البصرة.\n📌 *الفهرس والمفردات:* البنية المعمارية للمتحكمات المنطقية القابلة للبرمجة (PLC)، وحدات الإدخال والإخراج الرقمية والتماثلية، البرمجة بمخطط السلم (Ladder Diagram) وقوائم التعليمات والمخططات الوظيفية SFC، دوائر التثبيت (Latch/Unlatch)، المؤقتات والعدادات، المقارنات والعمليات الحسابية، وأساسيات شبكات التحكم الصناعي (Modbus, Profibus, Industrial Ethernet).\n💡 *نصائح امتحانية:* تدرب على برمجة دورات الإشارات المرورية والمصاعد والتحكم بدرجات الحرارة والمضخات بالتتابع الزمني الصارم.',
  },
  {
    id: 'doc_mct325_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (منظومات الأتمتة)',
    courseCode: 'MCT325',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/programmable-logic-controllers-petruzella-5th/Programmable%20Logic%20Controllers%205th%20Petruzella.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (منظومات الأتمتة - MCT325) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* البنية المعمارية للمتحكمات المنطقية القابلة للبرمجة (PLC)، وحدات الإدخال والإخراج الرقمية والتماثلية، البرمجة بمخطط السلم (Ladder Diagram) وقوائم التعليمات والمخططات الوظيفية SFC، دوائر التثبيت (Latch/Unlatch)، المؤقتات والعدادات، المقارنات والعمليات الحسابية، وأساسيات شبكات التحكم الصناعي (Modbus, Profibus, Industrial Ethernet).\n💡 *نصائح امتحانية:* تدرب على برمجة دورات الإشارات المرورية والمصاعد والتحكم بدرجات الحرارة والمضخات بالتتابع الزمني الصارم.',
  },
  {
    id: 'doc_mct325_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (منظومات الأتمتة)',
    courseCode: 'MCT325',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/programmable-logic-controllers-petruzella-5th/Programmable%20Logic%20Controllers%205th%20Petruzella.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* البنية المعمارية للمتحكمات المنطقية القابلة للبرمجة (PLC)، وحدات الإدخال والإخراج الرقمية والتماثلية، البرمجة بمخطط السلم (Ladder Diagram) وقوائم التعليمات والمخططات الوظيفية SFC، دوائر التثبيت (Latch/Unlatch)، المؤقتات والعدادات، المقارنات والعمليات الحسابية، وأساسيات شبكات التحكم الصناعي (Modbus, Profibus, Industrial Ethernet).\n💡 *نصائح امتحانية:* تدرب على برمجة دورات الإشارات المرورية والمصاعد والتحكم بدرجات الحرارة والمضخات بالتتابع الزمني الصارم.',
  },
  {
    id: 'doc_mct326_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Digital Signal Processing: Principles, Algorithms, and Applications (5th Ed.) — John G. Proakis, Dimitris G. Manolakis',
    courseCode: 'MCT326',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/digital-signal-processing-proakis-5th/Digital%20Signal%20Processing%205th%20Proakis.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (معالجة الإشارة الرقمية) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* معالجة الإشارة الرقمية: الإشارات والأنظمة المتقطعة زمنياً، تحويل Z (Z-Transform) ومنطقة التقارب ROC، تحويل فورييه المتقطع (DFT) وخوارزمية فورييه السريع (FFT)، تصميم المرشحات الرقمية ذات الاستجابة النبضية المحدودة (FIR) وغير المحدودة (IIR: Butterworth, Chebyshev)، وتطبيقات معالجة الإشارة الصوتية والاهتزازية.\n📐 *أهم القوانين:* تحويل Z: X(z) = Σ x[n]·z^(-n)، التحويل الثنائي الخطي (Bilinear Transformation) s = (2/T)·(z-1)/(z+1).\n💡 *نصائح امتحانية:* شرط استقرار النظام الرقمي في حيز Z: يجب أن تقع جميع أقطاب دالة التحويل H(z) داخل دائرة الوحدة (|z| < 1).',
  },
  {
    id: 'doc_mct326_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Discrete-Time Signal Processing (3rd Ed.) — Alan V. Oppenheim, Ronald W. Schafer',
    courseCode: 'MCT326',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/discrete-time-signal-processing-oppenheim-3rd/Discrete%20Time%20Signal%20Processing%20Oppenheim.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (معالجة الإشارة الرقمية) - جامعة البصرة.\n📌 *الفهرس والمفردات:* معالجة الإشارة الرقمية: الإشارات والأنظمة المتقطعة زمنياً، تحويل Z (Z-Transform) ومنطقة التقارب ROC، تحويل فورييه المتقطع (DFT) وخوارزمية فورييه السريع (FFT)، تصميم المرشحات الرقمية ذات الاستجابة النبضية المحدودة (FIR) وغير المحدودة (IIR: Butterworth, Chebyshev)، وتطبيقات معالجة الإشارة الصوتية والاهتزازية.\n📐 *أهم القوانين:* تحويل Z: X(z) = Σ x[n]·z^(-n)، التحويل الثنائي الخطي (Bilinear Transformation) s = (2/T)·(z-1)/(z+1).\n💡 *نصائح امتحانية:* شرط استقرار النظام الرقمي في حيز Z: يجب أن تقع جميع أقطاب دالة التحويل H(z) داخل دائرة الوحدة (|z| < 1).',
  },
  {
    id: 'doc_mct326_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (معالجة الإشارة الرقمية)',
    courseCode: 'MCT326',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/digital-signal-processing-proakis-5th/Digital%20Signal%20Processing%205th%20Proakis.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (معالجة الإشارة الرقمية - MCT326) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* معالجة الإشارة الرقمية: الإشارات والأنظمة المتقطعة زمنياً، تحويل Z (Z-Transform) ومنطقة التقارب ROC، تحويل فورييه المتقطع (DFT) وخوارزمية فورييه السريع (FFT)، تصميم المرشحات الرقمية ذات الاستجابة النبضية المحدودة (FIR) وغير المحدودة (IIR: Butterworth, Chebyshev)، وتطبيقات معالجة الإشارة الصوتية والاهتزازية.\n📐 *أهم القوانين:* تحويل Z: X(z) = Σ x[n]·z^(-n)، التحويل الثنائي الخطي (Bilinear Transformation) s = (2/T)·(z-1)/(z+1).\n💡 *نصائح امتحانية:* شرط استقرار النظام الرقمي في حيز Z: يجب أن تقع جميع أقطاب دالة التحويل H(z) داخل دائرة الوحدة (|z| < 1).',
  },
  {
    id: 'doc_mct326_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (معالجة الإشارة الرقمية)',
    courseCode: 'MCT326',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/digital-signal-processing-proakis-5th/Digital%20Signal%20Processing%205th%20Proakis.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* معالجة الإشارة الرقمية: الإشارات والأنظمة المتقطعة زمنياً، تحويل Z (Z-Transform) ومنطقة التقارب ROC، تحويل فورييه المتقطع (DFT) وخوارزمية فورييه السريع (FFT)، تصميم المرشحات الرقمية ذات الاستجابة النبضية المحدودة (FIR) وغير المحدودة (IIR: Butterworth, Chebyshev)، وتطبيقات معالجة الإشارة الصوتية والاهتزازية.\n📐 *أهم القوانين:* تحويل Z: X(z) = Σ x[n]·z^(-n)، التحويل الثنائي الخطي (Bilinear Transformation) s = (2/T)·(z-1)/(z+1).\n💡 *نصائح امتحانية:* شرط استقرار النظام الرقمي في حيز Z: يجب أن تقع جميع أقطاب دالة التحويل H(z) داخل دائرة الوحدة (|z| < 1).',
  },
  {
    id: 'doc_mct327_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Renewable and Efficient Electric Power Systems (2nd Ed.) — Gilbert M. Masters',
    courseCode: 'MCT327',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/renewable-and-efficient-electric-power-systems-masters/Renewable%20and%20Efficient%20Power%20Masters.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (الطاقة المتجددة) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* مصادر الطاقة المتجددة: الطاقة الشمسية الكهروضوئية (PV Systems: خلايا، مصفوفات، نقطة القدرة القصوى MPPT)، الطاقة الشمسية الحرارية، طاقة الرياح (توربينات الرياح، ديناميكا الهواء، حد بيتز Betz Limit)، طاقة الكتلة الحيوية والهيدروجين، وربط مصادر الطاقة المتجددة بالشبكة الكهربائية وتخزين الطاقة.\n📐 *أهم القوانين:* قدرة الرياح P = 0.5·ρ·A·V³·Cp، أقصى معامل قدرة نظري للرياح Cp_max = 16/27 ≈ 59.3%.\n💡 *نصائح امتحانية:* فهم خوارزميات تتبع نقطة القدرة القصوى (Perturb & Observe و Incremental Conductance) في الخلايا الشمسية.',
  },
  {
    id: 'doc_mct327_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Solar Engineering of Thermal Processes, Photovoltaics and Wind — John A. Duffie, William A. Beckman',
    courseCode: 'MCT327',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/solar-engineering-of-thermal-processes-duffie/Solar%20Engineering%20Duffie.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (الطاقة المتجددة) - جامعة البصرة.\n📌 *الفهرس والمفردات:* مصادر الطاقة المتجددة: الطاقة الشمسية الكهروضوئية (PV Systems: خلايا، مصفوفات، نقطة القدرة القصوى MPPT)، الطاقة الشمسية الحرارية، طاقة الرياح (توربينات الرياح، ديناميكا الهواء، حد بيتز Betz Limit)، طاقة الكتلة الحيوية والهيدروجين، وربط مصادر الطاقة المتجددة بالشبكة الكهربائية وتخزين الطاقة.\n📐 *أهم القوانين:* قدرة الرياح P = 0.5·ρ·A·V³·Cp، أقصى معامل قدرة نظري للرياح Cp_max = 16/27 ≈ 59.3%.\n💡 *نصائح امتحانية:* فهم خوارزميات تتبع نقطة القدرة القصوى (Perturb & Observe و Incremental Conductance) في الخلايا الشمسية.',
  },
  {
    id: 'doc_mct327_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (الطاقة المتجددة)',
    courseCode: 'MCT327',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/renewable-and-efficient-electric-power-systems-masters/Renewable%20and%20Efficient%20Power%20Masters.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (الطاقة المتجددة - MCT327) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* مصادر الطاقة المتجددة: الطاقة الشمسية الكهروضوئية (PV Systems: خلايا، مصفوفات، نقطة القدرة القصوى MPPT)، الطاقة الشمسية الحرارية، طاقة الرياح (توربينات الرياح، ديناميكا الهواء، حد بيتز Betz Limit)، طاقة الكتلة الحيوية والهيدروجين، وربط مصادر الطاقة المتجددة بالشبكة الكهربائية وتخزين الطاقة.\n📐 *أهم القوانين:* قدرة الرياح P = 0.5·ρ·A·V³·Cp، أقصى معامل قدرة نظري للرياح Cp_max = 16/27 ≈ 59.3%.\n💡 *نصائح امتحانية:* فهم خوارزميات تتبع نقطة القدرة القصوى (Perturb & Observe و Incremental Conductance) في الخلايا الشمسية.',
  },
  {
    id: 'doc_mct327_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (الطاقة المتجددة)',
    courseCode: 'MCT327',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/renewable-and-efficient-electric-power-systems-masters/Renewable%20and%20Efficient%20Power%20Masters.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* مصادر الطاقة المتجددة: الطاقة الشمسية الكهروضوئية (PV Systems: خلايا، مصفوفات، نقطة القدرة القصوى MPPT)، الطاقة الشمسية الحرارية، طاقة الرياح (توربينات الرياح، ديناميكا الهواء، حد بيتز Betz Limit)، طاقة الكتلة الحيوية والهيدروجين، وربط مصادر الطاقة المتجددة بالشبكة الكهربائية وتخزين الطاقة.\n📐 *أهم القوانين:* قدرة الرياح P = 0.5·ρ·A·V³·Cp، أقصى معامل قدرة نظري للرياح Cp_max = 16/27 ≈ 59.3%.\n💡 *نصائح امتحانية:* فهم خوارزميات تتبع نقطة القدرة القصوى (Perturb & Observe و Incremental Conductance) في الخلايا الشمسية.',
  },
  {
    id: 'doc_mct411_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: The Definitive Guide to ARM Cortex-M3 and Cortex-M4 Processors (3rd Ed.) — Joseph Yiu',
    courseCode: 'MCT411',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/the-definitive-guide-to-arm-cortex-m3-m4-joseph-yiu/The%20Definitive%20Guide%20to%20ARM%20Cortex-M3%20and%20Cortex-M4.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (الأنظمة المضمنة) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* معمارية معالجات ARM Cortex-M المتقدمة، إدارة المقاطعات وبرمجتها بواسطة NVIC، منافذ الإدخال والإخراج والمؤقتات المتقدمة و PWM، الاتصالات التسلسلية الصناعية (UART, SPI, I2C, CAN Bus)، أنظمة التشغيل بالزمن الحقيقي (FreeRTOS: مهام، طوابير، إشارات، كواتم الاستبعاد المتبادل Mutex)، وإدارة الطاقة في الأنظمة المضمنة.\n📐 *أهم المفاهيم:* جدول المقاطعات المتجهي، تبديل السياق (Context Switching)، ومسائل انعكاس الأولوية (Priority Inversion) وحلها بواسطة Priority Inheritance.\n💡 *نصائح امتحانية:* احرص على تجنب استدعاء دوال حظر المهام (Blocking APIs) داخل روتين خدمة المقاطعة ISR.',
  },
  {
    id: 'doc_mct411_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Embedded Systems: Real-Time Interfacing to ARM Cortex-M Microcontrollers — Jonathan W. Valvano',
    courseCode: 'MCT411',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value: 'https://ptolemy.berkeley.edu/books/leeseshia/releases/LeeSeshia_DigitalV1_08.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (الأنظمة المضمنة) - جامعة البصرة.\n📌 *الفهرس والمفردات:* معمارية معالجات ARM Cortex-M المتقدمة، إدارة المقاطعات وبرمجتها بواسطة NVIC، منافذ الإدخال والإخراج والمؤقتات المتقدمة و PWM، الاتصالات التسلسلية الصناعية (UART, SPI, I2C, CAN Bus)، أنظمة التشغيل بالزمن الحقيقي (FreeRTOS: مهام، طوابير، إشارات، كواتم الاستبعاد المتبادل Mutex)، وإدارة الطاقة في الأنظمة المضمنة.\n📐 *أهم المفاهيم:* جدول المقاطعات المتجهي، تبديل السياق (Context Switching)، ومسائل انعكاس الأولوية (Priority Inversion) وحلها بواسطة Priority Inheritance.\n💡 *نصائح امتحانية:* احرص على تجنب استدعاء دوال حظر المهام (Blocking APIs) داخل روتين خدمة المقاطعة ISR.',
  },
  {
    id: 'doc_mct411_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (الأنظمة المضمنة)',
    courseCode: 'MCT411',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/the-definitive-guide-to-arm-cortex-m3-m4-joseph-yiu/The%20Definitive%20Guide%20to%20ARM%20Cortex-M3%20and%20Cortex-M4.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (الأنظمة المضمنة - MCT411) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* معمارية معالجات ARM Cortex-M المتقدمة، إدارة المقاطعات وبرمجتها بواسطة NVIC، منافذ الإدخال والإخراج والمؤقتات المتقدمة و PWM، الاتصالات التسلسلية الصناعية (UART, SPI, I2C, CAN Bus)، أنظمة التشغيل بالزمن الحقيقي (FreeRTOS: مهام، طوابير، إشارات، كواتم الاستبعاد المتبادل Mutex)، وإدارة الطاقة في الأنظمة المضمنة.\n📐 *أهم المفاهيم:* جدول المقاطعات المتجهي، تبديل السياق (Context Switching)، ومسائل انعكاس الأولوية (Priority Inversion) وحلها بواسطة Priority Inheritance.\n💡 *نصائح امتحانية:* احرص على تجنب استدعاء دوال حظر المهام (Blocking APIs) داخل روتين خدمة المقاطعة ISR.',
  },
  {
    id: 'doc_mct411_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (الأنظمة المضمنة)',
    courseCode: 'MCT411',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/the-definitive-guide-to-arm-cortex-m3-m4-joseph-yiu/The%20Definitive%20Guide%20to%20ARM%20Cortex-M3%20and%20Cortex-M4.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* معمارية معالجات ARM Cortex-M المتقدمة، إدارة المقاطعات وبرمجتها بواسطة NVIC، منافذ الإدخال والإخراج والمؤقتات المتقدمة و PWM، الاتصالات التسلسلية الصناعية (UART, SPI, I2C, CAN Bus)، أنظمة التشغيل بالزمن الحقيقي (FreeRTOS: مهام، طوابير، إشارات، كواتم الاستبعاد المتبادل Mutex)، وإدارة الطاقة في الأنظمة المضمنة.\n📐 *أهم المفاهيم:* جدول المقاطعات المتجهي، تبديل السياق (Context Switching)، ومسائل انعكاس الأولوية (Priority Inversion) وحلها بواسطة Priority Inheritance.\n💡 *نصائح امتحانية:* احرص على تجنب استدعاء دوال حظر المهام (Blocking APIs) داخل روتين خدمة المقاطعة ISR.',
  },
  {
    id: 'doc_mct412_textbook_primary',
    title:
      "📖 الكتاب المنهجي الرئيسي: Shigley's Mechanical Engineering Design (11th/12th Ed.) — Richard G. Budynas, J. Keith Nisbett",
    courseCode: 'MCT412',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/shigleys-mechanical-engineering-design-11th/Shigleys%20Mechanical%20Engineering%20Design%2011th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (التصميم الميكانيكي 1) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* فلسفة التصميم الميكانيكي ومعامل الأمان، نظريات الإجهادات الساكنة والانهيار للمواد اللدنة والقصيفة، الإجهادات المتغيرة والكلل الدوري (Fatigue Design: معادلات Goodman, Soderberg, Gerber)، تصميم الأعمدة الميكانيكية ونوابض الانضغاط والشد، ومسامير الربط والوصلات الملحومة.\n📐 *أهم القوانين:* معيار غودمان المعدل σa / Se + σm / Sut = 1/n، حد التحمل المعدل Se = ka·kb·kc·kd·ke·Se'.\n💡 *نصائح امتحانية:* ركز على حساب عوامل تركيز الإجهاد (Stress Concentration Factors Kt and Kf) عند التغيرات المفاجئة في مقطع العمود.",
  },
  {
    id: 'doc_mct412_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Fundamentals of Machine Component Design (7th Ed.) — Robert C. Juvinall, Kurt M. Marshek',
    courseCode: 'MCT412',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/fundamentals-of-machine-component-design-juvinall-7th/Fundamentals%20of%20Machine%20Component%20Design%20Juvinall.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "الكتاب المساعد والتمارين المحلولة الداعمة لمادة (التصميم الميكانيكي 1) - جامعة البصرة.\n📌 *الفهرس والمفردات:* فلسفة التصميم الميكانيكي ومعامل الأمان، نظريات الإجهادات الساكنة والانهيار للمواد اللدنة والقصيفة، الإجهادات المتغيرة والكلل الدوري (Fatigue Design: معادلات Goodman, Soderberg, Gerber)، تصميم الأعمدة الميكانيكية ونوابض الانضغاط والشد، ومسامير الربط والوصلات الملحومة.\n📐 *أهم القوانين:* معيار غودمان المعدل σa / Se + σm / Sut = 1/n، حد التحمل المعدل Se = ka·kb·kc·kd·ke·Se'.\n💡 *نصائح امتحانية:* ركز على حساب عوامل تركيز الإجهاد (Stress Concentration Factors Kt and Kf) عند التغيرات المفاجئة في مقطع العمود.",
  },
  {
    id: 'doc_mct412_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (التصميم الميكانيكي 1)',
    courseCode: 'MCT412',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/shigleys-mechanical-engineering-design-11th/Shigleys%20Mechanical%20Engineering%20Design%2011th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (التصميم الميكانيكي 1 - MCT412) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* فلسفة التصميم الميكانيكي ومعامل الأمان، نظريات الإجهادات الساكنة والانهيار للمواد اللدنة والقصيفة، الإجهادات المتغيرة والكلل الدوري (Fatigue Design: معادلات Goodman, Soderberg, Gerber)، تصميم الأعمدة الميكانيكية ونوابض الانضغاط والشد، ومسامير الربط والوصلات الملحومة.\n📐 *أهم القوانين:* معيار غودمان المعدل σa / Se + σm / Sut = 1/n، حد التحمل المعدل Se = ka·kb·kc·kd·ke·Se'.\n💡 *نصائح امتحانية:* ركز على حساب عوامل تركيز الإجهاد (Stress Concentration Factors Kt and Kf) عند التغيرات المفاجئة في مقطع العمود.",
  },
  {
    id: 'doc_mct412_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (التصميم الميكانيكي 1)',
    courseCode: 'MCT412',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/shigleys-mechanical-engineering-design-11th/Shigleys%20Mechanical%20Engineering%20Design%2011th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      "📌 *الفهرس والمفردات:* فلسفة التصميم الميكانيكي ومعامل الأمان، نظريات الإجهادات الساكنة والانهيار للمواد اللدنة والقصيفة، الإجهادات المتغيرة والكلل الدوري (Fatigue Design: معادلات Goodman, Soderberg, Gerber)، تصميم الأعمدة الميكانيكية ونوابض الانضغاط والشد، ومسامير الربط والوصلات الملحومة.\n📐 *أهم القوانين:* معيار غودمان المعدل σa / Se + σm / Sut = 1/n، حد التحمل المعدل Se = ka·kb·kc·kd·ke·Se'.\n💡 *نصائح امتحانية:* ركز على حساب عوامل تركيز الإجهاد (Stress Concentration Factors Kt and Kf) عند التغيرات المفاجئة في مقطع العمود.",
  },
  {
    id: 'doc_mct413_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Artificial Intelligence: A Modern Approach (4th Ed.) — Stuart Russell, Peter Norvig',
    courseCode: 'MCT413',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/artificial-intelligence-a-modern-approach-4th-edition/Artificial%20Intelligence%20A%20Modern%20Approach%204th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (الذكاء الاصطناعي) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* الذكاء الاصطناعي وهندسة المعرفة: بيئات الوكلاء الأذكياء (Intelligent Agents)، خوارزميات البحث التجريبي والخوارزميات الجينية (Genetic Algorithms)، المنطق الضبابي (Fuzzy Logic: دوال الانتماء وقواعد الاستدلال وإزالة الضبابية Defuzzification)، الشبكات العصبية الاصطناعية (ANN: Multi-layer Perceptron, Backpropagation)، والتعلم العميق التمهيدي.\n📐 *أهم القوانين:* دالة التنشيط Sigmoid(z) = 1 / (1 + e^(-z))، وقاعدة تحديث الأوزان في الانحدار التدريجي w = w - η·∂E/∂w.\n💡 *نصائح امتحانية:* فهم خطوات نظام الاستدلال الضبابي لماماداني (Fuzzification -> Rule Evaluation -> Aggregation -> Defuzzification).',
  },
  {
    id: 'doc_mct413_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Fuzzy Logic with Engineering Applications (4th Ed.) — Timothy J. Ross',
    courseCode: 'MCT413',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/fuzzy-logic-with-engineering-applications-ross-4th/Fuzzy%20Logic%20Ross.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (الذكاء الاصطناعي) - جامعة البصرة.\n📌 *الفهرس والمفردات:* الذكاء الاصطناعي وهندسة المعرفة: بيئات الوكلاء الأذكياء (Intelligent Agents)، خوارزميات البحث التجريبي والخوارزميات الجينية (Genetic Algorithms)، المنطق الضبابي (Fuzzy Logic: دوال الانتماء وقواعد الاستدلال وإزالة الضبابية Defuzzification)، الشبكات العصبية الاصطناعية (ANN: Multi-layer Perceptron, Backpropagation)، والتعلم العميق التمهيدي.\n📐 *أهم القوانين:* دالة التنشيط Sigmoid(z) = 1 / (1 + e^(-z))، وقاعدة تحديث الأوزان في الانحدار التدريجي w = w - η·∂E/∂w.\n💡 *نصائح امتحانية:* فهم خطوات نظام الاستدلال الضبابي لماماداني (Fuzzification -> Rule Evaluation -> Aggregation -> Defuzzification).',
  },
  {
    id: 'doc_mct413_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (الذكاء الاصطناعي)',
    courseCode: 'MCT413',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/artificial-intelligence-a-modern-approach-4th-edition/Artificial%20Intelligence%20A%20Modern%20Approach%204th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (الذكاء الاصطناعي - MCT413) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* الذكاء الاصطناعي وهندسة المعرفة: بيئات الوكلاء الأذكياء (Intelligent Agents)، خوارزميات البحث التجريبي والخوارزميات الجينية (Genetic Algorithms)، المنطق الضبابي (Fuzzy Logic: دوال الانتماء وقواعد الاستدلال وإزالة الضبابية Defuzzification)، الشبكات العصبية الاصطناعية (ANN: Multi-layer Perceptron, Backpropagation)، والتعلم العميق التمهيدي.\n📐 *أهم القوانين:* دالة التنشيط Sigmoid(z) = 1 / (1 + e^(-z))، وقاعدة تحديث الأوزان في الانحدار التدريجي w = w - η·∂E/∂w.\n💡 *نصائح امتحانية:* فهم خطوات نظام الاستدلال الضبابي لماماداني (Fuzzification -> Rule Evaluation -> Aggregation -> Defuzzification).',
  },
  {
    id: 'doc_mct413_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (الذكاء الاصطناعي)',
    courseCode: 'MCT413',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/artificial-intelligence-a-modern-approach-4th-edition/Artificial%20Intelligence%20A%20Modern%20Approach%204th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* الذكاء الاصطناعي وهندسة المعرفة: بيئات الوكلاء الأذكياء (Intelligent Agents)، خوارزميات البحث التجريبي والخوارزميات الجينية (Genetic Algorithms)، المنطق الضبابي (Fuzzy Logic: دوال الانتماء وقواعد الاستدلال وإزالة الضبابية Defuzzification)، الشبكات العصبية الاصطناعية (ANN: Multi-layer Perceptron, Backpropagation)، والتعلم العميق التمهيدي.\n📐 *أهم القوانين:* دالة التنشيط Sigmoid(z) = 1 / (1 + e^(-z))، وقاعدة تحديث الأوزان في الانحدار التدريجي w = w - η·∂E/∂w.\n💡 *نصائح امتحانية:* فهم خطوات نظام الاستدلال الضبابي لماماداني (Fuzzification -> Rule Evaluation -> Aggregation -> Defuzzification).',
  },
  {
    id: 'doc_p4mct_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Identity Only: Capstone Mechatronics Engineering Project Guidelines (University of Basrah)',
    courseCode: 'P4MCT',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://raw.githubusercontent.com/uobasrah-mechatronics/academic-archive/main/curriculum/3437Mechatronics%20Engineering.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (المشروع الهندسي) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* دليل مشروع التخرج الكامل لطلبة قسم هندسة الميكاترونكس - جامعة البصرة: معايير اختيار الفكرة، إعداد المقترح الهندسي (Proposal)، مراحل التصميم الكهروميكانيكي والبرمجي، التحليل والمحاكاة، بناء النموذج الأولي واختباره، هيكلة الأطروحة الرسمية وأسلوب التوثيق وفق معيار IEEE، والتحضير للمناقشة الشفوية والعرض التقديمي.',
  },
  {
    id: 'doc_p4mct_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Design of Electromechanical Systems / Senior Design Project Standards',
    courseCode: 'P4MCT',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://raw.githubusercontent.com/uobasrah-mechatronics/academic-archive/main/curriculum/6193mec.%20courses.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (المشروع الهندسي) - جامعة البصرة.\n📌 *الفهرس والمفردات:* دليل مشروع التخرج الكامل لطلبة قسم هندسة الميكاترونكس - جامعة البصرة: معايير اختيار الفكرة، إعداد المقترح الهندسي (Proposal)، مراحل التصميم الكهروميكانيكي والبرمجي، التحليل والمحاكاة، بناء النموذج الأولي واختباره، هيكلة الأطروحة الرسمية وأسلوب التوثيق وفق معيار IEEE، والتحضير للمناقشة الشفوية والعرض التقديمي.',
  },
  {
    id: 'doc_p4mct_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (المشروع الهندسي)',
    courseCode: 'P4MCT',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://raw.githubusercontent.com/uobasrah-mechatronics/academic-archive/main/curriculum/3437Mechatronics%20Engineering.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (المشروع الهندسي - P4MCT) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* دليل مشروع التخرج الكامل لطلبة قسم هندسة الميكاترونكس - جامعة البصرة: معايير اختيار الفكرة، إعداد المقترح الهندسي (Proposal)، مراحل التصميم الكهروميكانيكي والبرمجي، التحليل والمحاكاة، بناء النموذج الأولي واختباره، هيكلة الأطروحة الرسمية وأسلوب التوثيق وفق معيار IEEE، والتحضير للمناقشة الشفوية والعرض التقديمي.',
  },
  {
    id: 'doc_p4mct_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (المشروع الهندسي)',
    courseCode: 'P4MCT',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://raw.githubusercontent.com/uobasrah-mechatronics/academic-archive/main/curriculum/3437Mechatronics%20Engineering.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* دليل مشروع التخرج الكامل لطلبة قسم هندسة الميكاترونكس - جامعة البصرة: معايير اختيار الفكرة، إعداد المقترح الهندسي (Proposal)، مراحل التصميم الكهروميكانيكي والبرمجي، التحليل والمحاكاة، بناء النموذج الأولي واختباره، هيكلة الأطروحة الرسمية وأسلوب التوثيق وفق معيار IEEE، والتحضير للمناقشة الشفوية والعرض التقديمي.',
  },
  {
    id: 'doc_mct414_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Project Management: A Systems Approach to Planning, Scheduling, and Controlling (13th Ed.) — Harold Kerzner',
    courseCode: 'MCT414',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/project-management-systems-approach-kerzner-13th/Project%20Management%20Kerzner.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (إدارة المشاريع) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* إدارة المشاريع الهندسية: دورة حياة المشروع، هيكل تجزئة العمل (WBS)، التخطيط والجدولة باستخدام المخطط الشريطي ومخططات الشبكة (CPM & PERT)، المسار الحرج وتحديد الفترات الحرة، إدارة المخاطر، ومراقبة التكاليف عبر القيمة المكتسبة (Earned Value Management: CPI, SPI, EV, PV, AC).\n📐 *أهم القوانين:* مؤشر أداء التكلفة CPI = EV / AC، مؤشر أداء الجدول SPI = EV / PV، وتوقع التكلفة عند الاكتمال EAC = BAC / CPI.\n💡 *نصائح امتحانية:* حدد المسار الحرج (Critical Path) بدقة؛ أي تأخير في أنشطة المسار الحرج (حيث التعويم الكلي Float = 0) يؤخر موعد تسليم المشروع بالكامل.',
  },
  {
    id: 'doc_mct414_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: A Guide to the Project Management Body of Knowledge (PMBOK Guide) (7th Ed.) — PMI',
    courseCode: 'MCT414',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/pmbok-guide-7th-edition/PMBOK%20Guide%207th%20Edition.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (إدارة المشاريع) - جامعة البصرة.\n📌 *الفهرس والمفردات:* إدارة المشاريع الهندسية: دورة حياة المشروع، هيكل تجزئة العمل (WBS)، التخطيط والجدولة باستخدام المخطط الشريطي ومخططات الشبكة (CPM & PERT)، المسار الحرج وتحديد الفترات الحرة، إدارة المخاطر، ومراقبة التكاليف عبر القيمة المكتسبة (Earned Value Management: CPI, SPI, EV, PV, AC).\n📐 *أهم القوانين:* مؤشر أداء التكلفة CPI = EV / AC، مؤشر أداء الجدول SPI = EV / PV، وتوقع التكلفة عند الاكتمال EAC = BAC / CPI.\n💡 *نصائح امتحانية:* حدد المسار الحرج (Critical Path) بدقة؛ أي تأخير في أنشطة المسار الحرج (حيث التعويم الكلي Float = 0) يؤخر موعد تسليم المشروع بالكامل.',
  },
  {
    id: 'doc_mct414_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (إدارة المشاريع)',
    courseCode: 'MCT414',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/project-management-systems-approach-kerzner-13th/Project%20Management%20Kerzner.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (إدارة المشاريع - MCT414) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* إدارة المشاريع الهندسية: دورة حياة المشروع، هيكل تجزئة العمل (WBS)، التخطيط والجدولة باستخدام المخطط الشريطي ومخططات الشبكة (CPM & PERT)، المسار الحرج وتحديد الفترات الحرة، إدارة المخاطر، ومراقبة التكاليف عبر القيمة المكتسبة (Earned Value Management: CPI, SPI, EV, PV, AC).\n📐 *أهم القوانين:* مؤشر أداء التكلفة CPI = EV / AC، مؤشر أداء الجدول SPI = EV / PV، وتوقع التكلفة عند الاكتمال EAC = BAC / CPI.\n💡 *نصائح امتحانية:* حدد المسار الحرج (Critical Path) بدقة؛ أي تأخير في أنشطة المسار الحرج (حيث التعويم الكلي Float = 0) يؤخر موعد تسليم المشروع بالكامل.',
  },
  {
    id: 'doc_mct414_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (إدارة المشاريع)',
    courseCode: 'MCT414',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/project-management-systems-approach-kerzner-13th/Project%20Management%20Kerzner.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* إدارة المشاريع الهندسية: دورة حياة المشروع، هيكل تجزئة العمل (WBS)، التخطيط والجدولة باستخدام المخطط الشريطي ومخططات الشبكة (CPM & PERT)، المسار الحرج وتحديد الفترات الحرة، إدارة المخاطر، ومراقبة التكاليف عبر القيمة المكتسبة (Earned Value Management: CPI, SPI, EV, PV, AC).\n📐 *أهم القوانين:* مؤشر أداء التكلفة CPI = EV / AC، مؤشر أداء الجدول SPI = EV / PV، وتوقع التكلفة عند الاكتمال EAC = BAC / CPI.\n💡 *نصائح امتحانية:* حدد المسار الحرج (Critical Path) بدقة؛ أي تأخير في أنشطة المسار الحرج (حيث التعويم الكلي Float = 0) يؤخر موعد تسليم المشروع بالكامل.',
  },
  {
    id: 'doc_mct415_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Small Unmanned Aircraft: Theory and Practice — Randal W. Beard, Timothy W. McLain',
    courseCode: 'MCT415',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/small-unmanned-aircraft-beard-mclain/Small%20Unmanned%20Aircraft%20Beard.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (تصميم أنظمة ميكاترونكس – الطائرات بدون طيار) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* تصميم أنظمة الميكاترونكس للطائرات المسيرة (UAVs / Drones): ديناميكا الطيران والإحداثيات الجوية (Euler Angles: Roll, Pitch, Yaw)، النمذجة الرياضية للدرون رباعي المراوح (Quadcopter Dynamics)، منظومة الدفع والمحركات عديمة المسفرات (BLDC) ومتحكمات السرعة ESC، وحدة القياس بالقصور الذاتي (IMU: Accelerometer, Gyroscope, Magnetometer)، مرشح كالمين المدمج (Kalman Filter)، وتصميم متحكمات الطيران Autopilot.\n📐 *أهم القوانين:* معادلات الحركة الدورانية I·ω_dot = τ - ω x (I·ω)، ومصفوفات الدوران بين محاور الطائرة والمحاور الأرضية.\n💡 *نصائح امتحانية:* فهم كيفية دمج بيانات التسارع والجايروسكوب عبر المرشح التكاملي (Complementary Filter) لحساب الزوايا بدقة وبدون انحراف (Drift).',
  },
  {
    id: 'doc_mct415_textbook_secondary',
    title: '📚 الكتاب المساعد المعتمد: Introduction to Multicopter Design and Control — Quan Quan',
    courseCode: 'MCT415',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/introduction-to-multicopter-design-and-control-quan-quan/Multicopter%20Design%20Quan%20Quan.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (تصميم أنظمة ميكاترونكس – الطائرات بدون طيار) - جامعة البصرة.\n📌 *الفهرس والمفردات:* تصميم أنظمة الميكاترونكس للطائرات المسيرة (UAVs / Drones): ديناميكا الطيران والإحداثيات الجوية (Euler Angles: Roll, Pitch, Yaw)، النمذجة الرياضية للدرون رباعي المراوح (Quadcopter Dynamics)، منظومة الدفع والمحركات عديمة المسفرات (BLDC) ومتحكمات السرعة ESC، وحدة القياس بالقصور الذاتي (IMU: Accelerometer, Gyroscope, Magnetometer)، مرشح كالمين المدمج (Kalman Filter)، وتصميم متحكمات الطيران Autopilot.\n📐 *أهم القوانين:* معادلات الحركة الدورانية I·ω_dot = τ - ω x (I·ω)، ومصفوفات الدوران بين محاور الطائرة والمحاور الأرضية.\n💡 *نصائح امتحانية:* فهم كيفية دمج بيانات التسارع والجايروسكوب عبر المرشح التكاملي (Complementary Filter) لحساب الزوايا بدقة وبدون انحراف (Drift).',
  },
  {
    id: 'doc_mct415_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (تصميم أنظمة ميكاترونكس – الطائرات بدون طيار)',
    courseCode: 'MCT415',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/small-unmanned-aircraft-beard-mclain/Small%20Unmanned%20Aircraft%20Beard.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (تصميم أنظمة ميكاترونكس – الطائرات بدون طيار - MCT415) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* تصميم أنظمة الميكاترونكس للطائرات المسيرة (UAVs / Drones): ديناميكا الطيران والإحداثيات الجوية (Euler Angles: Roll, Pitch, Yaw)، النمذجة الرياضية للدرون رباعي المراوح (Quadcopter Dynamics)، منظومة الدفع والمحركات عديمة المسفرات (BLDC) ومتحكمات السرعة ESC، وحدة القياس بالقصور الذاتي (IMU: Accelerometer, Gyroscope, Magnetometer)، مرشح كالمين المدمج (Kalman Filter)، وتصميم متحكمات الطيران Autopilot.\n📐 *أهم القوانين:* معادلات الحركة الدورانية I·ω_dot = τ - ω x (I·ω)، ومصفوفات الدوران بين محاور الطائرة والمحاور الأرضية.\n💡 *نصائح امتحانية:* فهم كيفية دمج بيانات التسارع والجايروسكوب عبر المرشح التكاملي (Complementary Filter) لحساب الزوايا بدقة وبدون انحراف (Drift).',
  },
  {
    id: 'doc_mct415_summary',
    title:
      '📝 ملخص المحاضرات والقوانين الشاملة لمادة (تصميم أنظمة ميكاترونكس – الطائرات بدون طيار)',
    courseCode: 'MCT415',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/small-unmanned-aircraft-beard-mclain/Small%20Unmanned%20Aircraft%20Beard.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* تصميم أنظمة الميكاترونكس للطائرات المسيرة (UAVs / Drones): ديناميكا الطيران والإحداثيات الجوية (Euler Angles: Roll, Pitch, Yaw)، النمذجة الرياضية للدرون رباعي المراوح (Quadcopter Dynamics)، منظومة الدفع والمحركات عديمة المسفرات (BLDC) ومتحكمات السرعة ESC، وحدة القياس بالقصور الذاتي (IMU: Accelerometer, Gyroscope, Magnetometer)، مرشح كالمين المدمج (Kalman Filter)، وتصميم متحكمات الطيران Autopilot.\n📐 *أهم القوانين:* معادلات الحركة الدورانية I·ω_dot = τ - ω x (I·ω)، ومصفوفات الدوران بين محاور الطائرة والمحاور الأرضية.\n💡 *نصائح امتحانية:* فهم كيفية دمج بيانات التسارع والجايروسكوب عبر المرشح التكاملي (Complementary Filter) لحساب الزوايا بدقة وبدون انحراف (Drift).',
  },
  {
    id: 'doc_mct416_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Industrial Communication Systems — Bogdan M. Wilamowski, J. David Irwin',
    courseCode: 'MCT416',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/industrial-communication-systems-wilamowski/Industrial%20Communication%20Systems.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (شبكات الاتصالات الصناعية) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* شبكات الاتصالات الصناعية والبروتوكولات الميدانية: النموذج المرجعي OSI، الاتصالات التسلسلية RS-232/RS-485، شبكة منطقة التحكم في السيارات والمصانع (CAN Bus 2.0A/B & CAN-FD)، بروتوكولات Modbus RTU/TCP، الإيثرنت الصناعي (Profinet, EtherCAT)، وإنترنت الأشياء الصناعي (IIoT: MQTT, OPC-UA).\n📐 *أهم المفاهيم:* تحكيم النواقل غير المدمر (Non-destructive bitwise arbitration) في بروتوكول CAN ومقاومات الإنهاء 120Ω.\n💡 *نصائح امتحانية:* مراجعة هيكل إطار بيانات CAN (Identifier, Control, Data, CRC, ACK) وكيفية التعامل مع تصادم الرسائل.',
  },
  {
    id: 'doc_mct416_textbook_secondary',
    title: '📚 الكتاب المساعد المعتمد: Industrial Ethernet on the Plant Floor — Robert Lounsbury',
    courseCode: 'MCT416',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/industrial-ethernet-on-plant-floor-lounsbury/Industrial%20Ethernet.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (شبكات الاتصالات الصناعية) - جامعة البصرة.\n📌 *الفهرس والمفردات:* شبكات الاتصالات الصناعية والبروتوكولات الميدانية: النموذج المرجعي OSI، الاتصالات التسلسلية RS-232/RS-485، شبكة منطقة التحكم في السيارات والمصانع (CAN Bus 2.0A/B & CAN-FD)، بروتوكولات Modbus RTU/TCP، الإيثرنت الصناعي (Profinet, EtherCAT)، وإنترنت الأشياء الصناعي (IIoT: MQTT, OPC-UA).\n📐 *أهم المفاهيم:* تحكيم النواقل غير المدمر (Non-destructive bitwise arbitration) في بروتوكول CAN ومقاومات الإنهاء 120Ω.\n💡 *نصائح امتحانية:* مراجعة هيكل إطار بيانات CAN (Identifier, Control, Data, CRC, ACK) وكيفية التعامل مع تصادم الرسائل.',
  },
  {
    id: 'doc_mct416_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (شبكات الاتصالات الصناعية)',
    courseCode: 'MCT416',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/industrial-communication-systems-wilamowski/Industrial%20Communication%20Systems.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (شبكات الاتصالات الصناعية - MCT416) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* شبكات الاتصالات الصناعية والبروتوكولات الميدانية: النموذج المرجعي OSI، الاتصالات التسلسلية RS-232/RS-485، شبكة منطقة التحكم في السيارات والمصانع (CAN Bus 2.0A/B & CAN-FD)، بروتوكولات Modbus RTU/TCP، الإيثرنت الصناعي (Profinet, EtherCAT)، وإنترنت الأشياء الصناعي (IIoT: MQTT, OPC-UA).\n📐 *أهم المفاهيم:* تحكيم النواقل غير المدمر (Non-destructive bitwise arbitration) في بروتوكول CAN ومقاومات الإنهاء 120Ω.\n💡 *نصائح امتحانية:* مراجعة هيكل إطار بيانات CAN (Identifier, Control, Data, CRC, ACK) وكيفية التعامل مع تصادم الرسائل.',
  },
  {
    id: 'doc_mct416_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (شبكات الاتصالات الصناعية)',
    courseCode: 'MCT416',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/industrial-communication-systems-wilamowski/Industrial%20Communication%20Systems.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* شبكات الاتصالات الصناعية والبروتوكولات الميدانية: النموذج المرجعي OSI، الاتصالات التسلسلية RS-232/RS-485، شبكة منطقة التحكم في السيارات والمصانع (CAN Bus 2.0A/B & CAN-FD)، بروتوكولات Modbus RTU/TCP، الإيثرنت الصناعي (Profinet, EtherCAT)، وإنترنت الأشياء الصناعي (IIoT: MQTT, OPC-UA).\n📐 *أهم المفاهيم:* تحكيم النواقل غير المدمر (Non-destructive bitwise arbitration) في بروتوكول CAN ومقاومات الإنهاء 120Ω.\n💡 *نصائح امتحانية:* مراجعة هيكل إطار بيانات CAN (Identifier, Control, Data, CRC, ACK) وكيفية التعامل مع تصادم الرسائل.',
  },
  {
    id: 'doc_mct421_textbook_primary',
    title: '📖 الكتاب المنهجي الرئيسي: Biomechatronics — Marko B. Popovic',
    courseCode: 'MCT421',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value: 'https://archive.org/download/biomechatronics-popovic/Biomechatronics%20Popovic.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (الميكاترونكس الأحيائي) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* الميكاترونكس الأحيائي والأنظمة الطبية: ميكانيكا الحركة البشرية وحركية المفاصل، الحساسات الحيوية ومعالجة الإشارات الكهروعضلية (EMG) والكهروقلبية (ECG)، تصميم الأطراف الصناعية الذكية والأجهزة التقويمية (Prosthetics & Orthotics)، الهياكل الخارجية الداعمة للحركة (Exoskeletons)، والمشغلات المتوافقة مرناً (Series Elastic Actuators).\n💡 *نصائح امتحانية:* فهم مراحل استخلاص الخصائص وتصنيف إشارات العضلات EMG للتحكم في الأطراف الصناعية الروبوتية.',
  },
  {
    id: 'doc_mct421_textbook_secondary',
    title: '📚 الكتاب المساعد المعتمد: Wearable Robots: Biomechatronic Exoskeletons — José L. Pons',
    courseCode: 'MCT421',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value: 'https://archive.org/download/wearable-robots-pons/Wearable%20Robots%20Pons.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (الميكاترونكس الأحيائي) - جامعة البصرة.\n📌 *الفهرس والمفردات:* الميكاترونكس الأحيائي والأنظمة الطبية: ميكانيكا الحركة البشرية وحركية المفاصل، الحساسات الحيوية ومعالجة الإشارات الكهروعضلية (EMG) والكهروقلبية (ECG)، تصميم الأطراف الصناعية الذكية والأجهزة التقويمية (Prosthetics & Orthotics)، الهياكل الخارجية الداعمة للحركة (Exoskeletons)، والمشغلات المتوافقة مرناً (Series Elastic Actuators).\n💡 *نصائح امتحانية:* فهم مراحل استخلاص الخصائص وتصنيف إشارات العضلات EMG للتحكم في الأطراف الصناعية الروبوتية.',
  },
  {
    id: 'doc_mct421_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (الميكاترونكس الأحيائي)',
    courseCode: 'MCT421',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value: 'https://archive.org/download/biomechatronics-popovic/Biomechatronics%20Popovic.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (الميكاترونكس الأحيائي - MCT421) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* الميكاترونكس الأحيائي والأنظمة الطبية: ميكانيكا الحركة البشرية وحركية المفاصل، الحساسات الحيوية ومعالجة الإشارات الكهروعضلية (EMG) والكهروقلبية (ECG)، تصميم الأطراف الصناعية الذكية والأجهزة التقويمية (Prosthetics & Orthotics)، الهياكل الخارجية الداعمة للحركة (Exoskeletons)، والمشغلات المتوافقة مرناً (Series Elastic Actuators).\n💡 *نصائح امتحانية:* فهم مراحل استخلاص الخصائص وتصنيف إشارات العضلات EMG للتحكم في الأطراف الصناعية الروبوتية.',
  },
  {
    id: 'doc_mct421_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (الميكاترونكس الأحيائي)',
    courseCode: 'MCT421',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value: 'https://archive.org/download/biomechatronics-popovic/Biomechatronics%20Popovic.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* الميكاترونكس الأحيائي والأنظمة الطبية: ميكانيكا الحركة البشرية وحركية المفاصل، الحساسات الحيوية ومعالجة الإشارات الكهروعضلية (EMG) والكهروقلبية (ECG)، تصميم الأطراف الصناعية الذكية والأجهزة التقويمية (Prosthetics & Orthotics)، الهياكل الخارجية الداعمة للحركة (Exoskeletons)، والمشغلات المتوافقة مرناً (Series Elastic Actuators).\n💡 *نصائح امتحانية:* فهم مراحل استخلاص الخصائص وتصنيف إشارات العضلات EMG للتحكم في الأطراف الصناعية الروبوتية.',
  },
  {
    id: 'doc_mct422_textbook_primary',
    title:
      "📖 الكتاب المنهجي الرئيسي: Shigley's Mechanical Engineering Design (11th/12th Ed.) — Richard G. Budynas, J. Keith Nisbett",
    courseCode: 'MCT422',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/shigleys-mechanical-engineering-design-11th/Shigleys%20Mechanical%20Engineering%20Design%2011th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (التصميم الميكانيكي 2) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* التصميم الميكانيكي المتقدم: تصميم المسننات المستقيمة والحلزونية والمخروطية والدودية وفق معيار AGMA، اختيار وحسابات مدحرجات الكرات والأسطوانات (Rolling Bearings: الحساب الديناميكي للعمر L10)، تصميم القوابض والمكابح (Clutches & Brakes)، وتصميم الأحزمة والسيور وسلاسل نقل الحركة.\n📐 *أهم القوانين:* عمر المدحرجة L10 = (C / P)^p بملايين الدورات (p=3 للكرات و p=10/3 للأسطوانات)، ومعادلة تلامس مسننات AGMA.\n💡 *نصائح امتحانية:* احرص على حساب الحمل الديناميكي المكافئ P = X·Fr + Y·Fa عند تعرض المدحرجة لأحمال قطرية ومحورية مشتركة.',
  },
  {
    id: 'doc_mct422_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Machine Design: An Integrated Approach (6th Ed.) — Robert L. Norton',
    courseCode: 'MCT422',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/machine-design-an-integrated-approach-norton-6th/Machine%20Design%20Norton.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (التصميم الميكانيكي 2) - جامعة البصرة.\n📌 *الفهرس والمفردات:* التصميم الميكانيكي المتقدم: تصميم المسننات المستقيمة والحلزونية والمخروطية والدودية وفق معيار AGMA، اختيار وحسابات مدحرجات الكرات والأسطوانات (Rolling Bearings: الحساب الديناميكي للعمر L10)، تصميم القوابض والمكابح (Clutches & Brakes)، وتصميم الأحزمة والسيور وسلاسل نقل الحركة.\n📐 *أهم القوانين:* عمر المدحرجة L10 = (C / P)^p بملايين الدورات (p=3 للكرات و p=10/3 للأسطوانات)، ومعادلة تلامس مسننات AGMA.\n💡 *نصائح امتحانية:* احرص على حساب الحمل الديناميكي المكافئ P = X·Fr + Y·Fa عند تعرض المدحرجة لأحمال قطرية ومحورية مشتركة.',
  },
  {
    id: 'doc_mct422_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (التصميم الميكانيكي 2)',
    courseCode: 'MCT422',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/shigleys-mechanical-engineering-design-11th/Shigleys%20Mechanical%20Engineering%20Design%2011th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (التصميم الميكانيكي 2 - MCT422) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* التصميم الميكانيكي المتقدم: تصميم المسننات المستقيمة والحلزونية والمخروطية والدودية وفق معيار AGMA، اختيار وحسابات مدحرجات الكرات والأسطوانات (Rolling Bearings: الحساب الديناميكي للعمر L10)، تصميم القوابض والمكابح (Clutches & Brakes)، وتصميم الأحزمة والسيور وسلاسل نقل الحركة.\n📐 *أهم القوانين:* عمر المدحرجة L10 = (C / P)^p بملايين الدورات (p=3 للكرات و p=10/3 للأسطوانات)، ومعادلة تلامس مسننات AGMA.\n💡 *نصائح امتحانية:* احرص على حساب الحمل الديناميكي المكافئ P = X·Fr + Y·Fa عند تعرض المدحرجة لأحمال قطرية ومحورية مشتركة.',
  },
  {
    id: 'doc_mct422_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (التصميم الميكانيكي 2)',
    courseCode: 'MCT422',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/shigleys-mechanical-engineering-design-11th/Shigleys%20Mechanical%20Engineering%20Design%2011th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* التصميم الميكانيكي المتقدم: تصميم المسننات المستقيمة والحلزونية والمخروطية والدودية وفق معيار AGMA، اختيار وحسابات مدحرجات الكرات والأسطوانات (Rolling Bearings: الحساب الديناميكي للعمر L10)، تصميم القوابض والمكابح (Clutches & Brakes)، وتصميم الأحزمة والسيور وسلاسل نقل الحركة.\n📐 *أهم القوانين:* عمر المدحرجة L10 = (C / P)^p بملايين الدورات (p=3 للكرات و p=10/3 للأسطوانات)، ومعادلة تلامس مسننات AGMA.\n💡 *نصائح امتحانية:* احرص على حساب الحمل الديناميكي المكافئ P = X·Fr + Y·Fa عند تعرض المدحرجة لأحمال قطرية ومحورية مشتركة.',
  },
  {
    id: 'doc_mct423_textbook_primary',
    title: '📖 الكتاب المنهجي الرئيسي: Operations Management (14th Ed.) — William J. Stevenson',
    courseCode: 'MCT423',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/operations-management-stevenson-14th/Operations%20Management%20Stevenson.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (الهندسة الصناعية) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* الهندسة الصناعية وإدارة العمليات: دراسة وتصميم نظم العمل وقياس الوقت والحركة، تخطيط الطاقة الإنتاجية وتخطيط موقع المصنع والمنشآت، إدارة ومراقبة المخزون (نموذج الكمية الاقتصادية للطلب EOQ)، تخطيط متطلبات المواد (MRP)، ومبادئ التصنيع الرشيق (Lean Manufacturing و Six Sigma).\n📐 *أهم القوانين:* كمية الطلب الاقتصادية EOQ = √((2·D·S) / H)، وتكلفة الاحتفاظ بالمخزون الإجمالية.\n💡 *نصائح امتحانية:* فهم مخططات تدفق العمليات (Process Flowcharts) ومبادئ القضاء على الهدر الصناعي (Muda).',
  },
  {
    id: 'doc_mct423_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Work Systems: The Methods, Measurement, and Management of Work — Mikell P. Groover',
    courseCode: 'MCT423',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value: 'https://archive.org/download/work-systems-groover/Work%20Systems%20Groover.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (الهندسة الصناعية) - جامعة البصرة.\n📌 *الفهرس والمفردات:* الهندسة الصناعية وإدارة العمليات: دراسة وتصميم نظم العمل وقياس الوقت والحركة، تخطيط الطاقة الإنتاجية وتخطيط موقع المصنع والمنشآت، إدارة ومراقبة المخزون (نموذج الكمية الاقتصادية للطلب EOQ)، تخطيط متطلبات المواد (MRP)، ومبادئ التصنيع الرشيق (Lean Manufacturing و Six Sigma).\n📐 *أهم القوانين:* كمية الطلب الاقتصادية EOQ = √((2·D·S) / H)، وتكلفة الاحتفاظ بالمخزون الإجمالية.\n💡 *نصائح امتحانية:* فهم مخططات تدفق العمليات (Process Flowcharts) ومبادئ القضاء على الهدر الصناعي (Muda).',
  },
  {
    id: 'doc_mct423_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (الهندسة الصناعية)',
    courseCode: 'MCT423',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/operations-management-stevenson-14th/Operations%20Management%20Stevenson.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (الهندسة الصناعية - MCT423) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* الهندسة الصناعية وإدارة العمليات: دراسة وتصميم نظم العمل وقياس الوقت والحركة، تخطيط الطاقة الإنتاجية وتخطيط موقع المصنع والمنشآت، إدارة ومراقبة المخزون (نموذج الكمية الاقتصادية للطلب EOQ)، تخطيط متطلبات المواد (MRP)، ومبادئ التصنيع الرشيق (Lean Manufacturing و Six Sigma).\n📐 *أهم القوانين:* كمية الطلب الاقتصادية EOQ = √((2·D·S) / H)، وتكلفة الاحتفاظ بالمخزون الإجمالية.\n💡 *نصائح امتحانية:* فهم مخططات تدفق العمليات (Process Flowcharts) ومبادئ القضاء على الهدر الصناعي (Muda).',
  },
  {
    id: 'doc_mct423_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (الهندسة الصناعية)',
    courseCode: 'MCT423',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/operations-management-stevenson-14th/Operations%20Management%20Stevenson.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* الهندسة الصناعية وإدارة العمليات: دراسة وتصميم نظم العمل وقياس الوقت والحركة، تخطيط الطاقة الإنتاجية وتخطيط موقع المصنع والمنشآت، إدارة ومراقبة المخزون (نموذج الكمية الاقتصادية للطلب EOQ)، تخطيط متطلبات المواد (MRP)، ومبادئ التصنيع الرشيق (Lean Manufacturing و Six Sigma).\n📐 *أهم القوانين:* كمية الطلب الاقتصادية EOQ = √((2·D·S) / H)، وتكلفة الاحتفاظ بالمخزون الإجمالية.\n💡 *نصائح امتحانية:* فهم مخططات تدفق العمليات (Process Flowcharts) ومبادئ القضاء على الهدر الصناعي (Muda).',
  },
  {
    id: 'doc_mct424_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Introduction to Robotics: Mechanics and Control (4th Ed.) — John J. Craig',
    courseCode: 'MCT424',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/introduction-to-robotics-craig-4th/Introduction%20to%20Robotics%20Craig%204th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (الأنظمة الروبوتية) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* ميكانيكا وتحكم الروبوتات: مصفوفات التحويل المتجانسة، التمثيل الرياضي لـ Denavit-Hartenberg (DH Convention)، الكينماتيكا الأمامية والعكسية للأذرع الروبوتية ذات الوصلات المتعددة، الجاكوبيان الهندسي والمفردات الحركية (Singularities)، كيناتيكا أويلر-لاغرانج، وتخطيط المسارات الحركية في فضاء المفاصل وفضاء العمل.\n📐 *أهم القوانين:* مصفوفة التحويل المتجانسة A_i = Rot_z(θ)·Trans_z(d)·Trans_x(a)·Rot_x(α)، ومعادلة الجاكوبيان v = J(q)·q_dot.\n💡 *نصائح امتحانية:* انتبه لحساب محدد مصفوفة الجاكوبيان det(J)؛ النقاط التي ينعدم فيها المحدد تمثل مواقع المفردات الحركية (Singularities) التي يفقد عندها الروبوت درجات حرية وتصبح السرعات النظرية لانهائية.',
  },
  {
    id: 'doc_mct424_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Robot Modeling and Control (2nd Ed.) — Mark W. Spong, Seth Hutchinson, M. Vidyasagar',
    courseCode: 'MCT424',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/robot-modeling-and-control-spong-2nd/Robot%20Modeling%20and%20Control%20Spong.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (الأنظمة الروبوتية) - جامعة البصرة.\n📌 *الفهرس والمفردات:* ميكانيكا وتحكم الروبوتات: مصفوفات التحويل المتجانسة، التمثيل الرياضي لـ Denavit-Hartenberg (DH Convention)، الكينماتيكا الأمامية والعكسية للأذرع الروبوتية ذات الوصلات المتعددة، الجاكوبيان الهندسي والمفردات الحركية (Singularities)، كيناتيكا أويلر-لاغرانج، وتخطيط المسارات الحركية في فضاء المفاصل وفضاء العمل.\n📐 *أهم القوانين:* مصفوفة التحويل المتجانسة A_i = Rot_z(θ)·Trans_z(d)·Trans_x(a)·Rot_x(α)، ومعادلة الجاكوبيان v = J(q)·q_dot.\n💡 *نصائح امتحانية:* انتبه لحساب محدد مصفوفة الجاكوبيان det(J)؛ النقاط التي ينعدم فيها المحدد تمثل مواقع المفردات الحركية (Singularities) التي يفقد عندها الروبوت درجات حرية وتصبح السرعات النظرية لانهائية.',
  },
  {
    id: 'doc_mct424_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (الأنظمة الروبوتية)',
    courseCode: 'MCT424',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/introduction-to-robotics-craig-4th/Introduction%20to%20Robotics%20Craig%204th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (الأنظمة الروبوتية - MCT424) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* ميكانيكا وتحكم الروبوتات: مصفوفات التحويل المتجانسة، التمثيل الرياضي لـ Denavit-Hartenberg (DH Convention)، الكينماتيكا الأمامية والعكسية للأذرع الروبوتية ذات الوصلات المتعددة، الجاكوبيان الهندسي والمفردات الحركية (Singularities)، كيناتيكا أويلر-لاغرانج، وتخطيط المسارات الحركية في فضاء المفاصل وفضاء العمل.\n📐 *أهم القوانين:* مصفوفة التحويل المتجانسة A_i = Rot_z(θ)·Trans_z(d)·Trans_x(a)·Rot_x(α)، ومعادلة الجاكوبيان v = J(q)·q_dot.\n💡 *نصائح امتحانية:* انتبه لحساب محدد مصفوفة الجاكوبيان det(J)؛ النقاط التي ينعدم فيها المحدد تمثل مواقع المفردات الحركية (Singularities) التي يفقد عندها الروبوت درجات حرية وتصبح السرعات النظرية لانهائية.',
  },
  {
    id: 'doc_mct424_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (الأنظمة الروبوتية)',
    courseCode: 'MCT424',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/introduction-to-robotics-craig-4th/Introduction%20to%20Robotics%20Craig%204th.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* ميكانيكا وتحكم الروبوتات: مصفوفات التحويل المتجانسة، التمثيل الرياضي لـ Denavit-Hartenberg (DH Convention)، الكينماتيكا الأمامية والعكسية للأذرع الروبوتية ذات الوصلات المتعددة، الجاكوبيان الهندسي والمفردات الحركية (Singularities)، كيناتيكا أويلر-لاغرانج، وتخطيط المسارات الحركية في فضاء المفاصل وفضاء العمل.\n📐 *أهم القوانين:* مصفوفة التحويل المتجانسة A_i = Rot_z(θ)·Trans_z(d)·Trans_x(a)·Rot_x(α)، ومعادلة الجاكوبيان v = J(q)·q_dot.\n💡 *نصائح امتحانية:* انتبه لحساب محدد مصفوفة الجاكوبيان det(J)؛ النقاط التي ينعدم فيها المحدد تمثل مواقع المفردات الحركية (Singularities) التي يفقد عندها الروبوت درجات حرية وتصبح السرعات النظرية لانهائية.',
  },
  {
    id: 'doc_mct425_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Engineering Ethics: Concepts and Cases (6th Ed.) — Charles E. Harris, Jr. et al.',
    courseCode: 'MCT425',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/engineering-ethics-concepts-and-cases-harris-6th/Engineering%20Ethics%20Harris.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (أخلاقيات المهنة) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* أخلاقيات مهنة الهندسة: المسؤولية المهنية والقانونية للمهندس، السلامة العامة وحماية البيئة، تضارب المصالح والنزاهة الأكاديمية والمهنية، الملكية الفكرية وبراءات الاختراع، والمسؤولية الأخلاقية في عصر الذكاء الاصطناعي والأنظمة ذاتية القيادة.\n💡 *نصائح امتحانية:* مراجعة ميثاق الشرف الأخلاقي لجمعية مهندسي الكهرباء والإلكترونيات IEEE ومعهد المهندسين الميكانيكيين ASME.',
  },
  {
    id: 'doc_mct425_textbook_secondary',
    title: '📚 الكتاب المساعد المعتمد: Engineering Ethics (4th Ed.) — Charles B. Fleddermann',
    courseCode: 'MCT425',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/engineering-ethics-fleddermann-4th/Engineering%20Ethics%20Fleddermann.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (أخلاقيات المهنة) - جامعة البصرة.\n📌 *الفهرس والمفردات:* أخلاقيات مهنة الهندسة: المسؤولية المهنية والقانونية للمهندس، السلامة العامة وحماية البيئة، تضارب المصالح والنزاهة الأكاديمية والمهنية، الملكية الفكرية وبراءات الاختراع، والمسؤولية الأخلاقية في عصر الذكاء الاصطناعي والأنظمة ذاتية القيادة.\n💡 *نصائح امتحانية:* مراجعة ميثاق الشرف الأخلاقي لجمعية مهندسي الكهرباء والإلكترونيات IEEE ومعهد المهندسين الميكانيكيين ASME.',
  },
  {
    id: 'doc_mct425_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (أخلاقيات المهنة)',
    courseCode: 'MCT425',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/engineering-ethics-concepts-and-cases-harris-6th/Engineering%20Ethics%20Harris.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (أخلاقيات المهنة - MCT425) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* أخلاقيات مهنة الهندسة: المسؤولية المهنية والقانونية للمهندس، السلامة العامة وحماية البيئة، تضارب المصالح والنزاهة الأكاديمية والمهنية، الملكية الفكرية وبراءات الاختراع، والمسؤولية الأخلاقية في عصر الذكاء الاصطناعي والأنظمة ذاتية القيادة.\n💡 *نصائح امتحانية:* مراجعة ميثاق الشرف الأخلاقي لجمعية مهندسي الكهرباء والإلكترونيات IEEE ومعهد المهندسين الميكانيكيين ASME.',
  },
  {
    id: 'doc_mct425_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (أخلاقيات المهنة)',
    courseCode: 'MCT425',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/engineering-ethics-concepts-and-cases-harris-6th/Engineering%20Ethics%20Harris.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* أخلاقيات مهنة الهندسة: المسؤولية المهنية والقانونية للمهندس، السلامة العامة وحماية البيئة، تضارب المصالح والنزاهة الأكاديمية والمهنية، الملكية الفكرية وبراءات الاختراع، والمسؤولية الأخلاقية في عصر الذكاء الاصطناعي والأنظمة ذاتية القيادة.\n💡 *نصائح امتحانية:* مراجعة ميثاق الشرف الأخلاقي لجمعية مهندسي الكهرباء والإلكترونيات IEEE ومعهد المهندسين الميكانيكيين ASME.',
  },
  {
    id: 'doc_mct426_textbook_primary',
    title:
      '📖 الكتاب المنهجي الرئيسي: Digital Image Processing (4th Ed.) — Rafael C. Gonzalez, Richard E. Woods',
    courseCode: 'MCT426',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/digital-image-processing-gonzalez-woods-4th/Digital%20Image%20Processing%204th%20Gonzalez.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المرجع الأكاديمي المعتمد رسمياً لتدريس مادة (معالجة الصور والرؤية الحاسوبية) في قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* معالجة الصور الرقمية والرؤية الحاسوبية: تمثيل الصور والتحويل اللوني (RGB, Grayscale, HSV)، تعديل التباين والمدرج التكراري (Histogram Equalization)، المرشحات المكانية للتشويش والشحذ، كشف الحواف (Sobel, Prewitt, Canny Edge Detector)، استخراج الخصائص (SIFT, SURF, ORB)، التقطيع وفصل الأجسام، وتطبيقات معايرة الكاميرا والرؤية المجسمة (Stereo Vision) في الروبوتات.\n📐 *أهم القوانين:* مصفوفة التواء المرشح (Convolution) g(x,y) = f(x,y) * h(x,y)، وتدرج الصورة |∇f| = √((∂f/∂x)² + (∂f/∂y)²).\n💡 *نصائح امتحانية:* تدرب على خطوات كشف الحواف بمرشح كاني (Canny): التنعيم بغاوس، حساب اتجاه ومقدار التدرج، قمع القيم غير العظمى (Non-maximum suppression)، وتطبيق العتبة المزدوجة (Hysteresis thresholding).',
  },
  {
    id: 'doc_mct426_textbook_secondary',
    title:
      '📚 الكتاب المساعد المعتمد: Computer Vision: Algorithms and Applications (2nd Ed.) — Richard Szeliski',
    courseCode: 'MCT426',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/computer-vision-algorithms-applications-szeliski-2nd/Computer%20Vision%20Szeliski.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'الكتاب المساعد والتمارين المحلولة الداعمة لمادة (معالجة الصور والرؤية الحاسوبية) - جامعة البصرة.\n📌 *الفهرس والمفردات:* معالجة الصور الرقمية والرؤية الحاسوبية: تمثيل الصور والتحويل اللوني (RGB, Grayscale, HSV)، تعديل التباين والمدرج التكراري (Histogram Equalization)، المرشحات المكانية للتشويش والشحذ، كشف الحواف (Sobel, Prewitt, Canny Edge Detector)، استخراج الخصائص (SIFT, SURF, ORB)، التقطيع وفصل الأجسام، وتطبيقات معايرة الكاميرا والرؤية المجسمة (Stereo Vision) في الروبوتات.\n📐 *أهم القوانين:* مصفوفة التواء المرشح (Convolution) g(x,y) = f(x,y) * h(x,y)، وتدرج الصورة |∇f| = √((∂f/∂x)² + (∂f/∂y)²).\n💡 *نصائح امتحانية:* تدرب على خطوات كشف الحواف بمرشح كاني (Canny): التنعيم بغاوس، حساب اتجاه ومقدار التدرج، قمع القيم غير العظمى (Non-maximum suppression)، وتطبيق العتبة المزدوجة (Hysteresis thresholding).',
  },
  {
    id: 'doc_mct426_syllabus',
    title: '📑 مفردات المنهج الرسمي وخطة التدريس (معالجة الصور والرؤية الحاسوبية)',
    courseCode: 'MCT426',
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/digital-image-processing-gonzalez-woods-4th/Digital%20Image%20Processing%204th%20Gonzalez.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      'المنهاج الأسبوعي ومفردات التعليم المعتمدة لمقرر (معالجة الصور والرؤية الحاسوبية - MCT426) الصادرة من مجلس قسم هندسة الميكاترونكس بجامعة البصرة.\n📌 *الفهرس والمفردات:* معالجة الصور الرقمية والرؤية الحاسوبية: تمثيل الصور والتحويل اللوني (RGB, Grayscale, HSV)، تعديل التباين والمدرج التكراري (Histogram Equalization)، المرشحات المكانية للتشويش والشحذ، كشف الحواف (Sobel, Prewitt, Canny Edge Detector)، استخراج الخصائص (SIFT, SURF, ORB)، التقطيع وفصل الأجسام، وتطبيقات معايرة الكاميرا والرؤية المجسمة (Stereo Vision) في الروبوتات.\n📐 *أهم القوانين:* مصفوفة التواء المرشح (Convolution) g(x,y) = f(x,y) * h(x,y)، وتدرج الصورة |∇f| = √((∂f/∂x)² + (∂f/∂y)²).\n💡 *نصائح امتحانية:* تدرب على خطوات كشف الحواف بمرشح كاني (Canny): التنعيم بغاوس، حساب اتجاه ومقدار التدرج، قمع القيم غير العظمى (Non-maximum suppression)، وتطبيق العتبة المزدوجة (Hysteresis thresholding).',
  },
  {
    id: 'doc_mct426_summary',
    title: '📝 ملخص المحاضرات والقوانين الشاملة لمادة (معالجة الصور والرؤية الحاسوبية)',
    courseCode: 'MCT426',
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value:
        'https://archive.org/download/digital-image-processing-gonzalez-woods-4th/Digital%20Image%20Processing%204th%20Gonzalez.pdf',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    notes:
      '📌 *الفهرس والمفردات:* معالجة الصور الرقمية والرؤية الحاسوبية: تمثيل الصور والتحويل اللوني (RGB, Grayscale, HSV)، تعديل التباين والمدرج التكراري (Histogram Equalization)، المرشحات المكانية للتشويش والشحذ، كشف الحواف (Sobel, Prewitt, Canny Edge Detector)، استخراج الخصائص (SIFT, SURF, ORB)، التقطيع وفصل الأجسام، وتطبيقات معايرة الكاميرا والرؤية المجسمة (Stereo Vision) في الروبوتات.\n📐 *أهم القوانين:* مصفوفة التواء المرشح (Convolution) g(x,y) = f(x,y) * h(x,y)، وتدرج الصورة |∇f| = √((∂f/∂x)² + (∂f/∂y)²).\n💡 *نصائح امتحانية:* تدرب على خطوات كشف الحواف بمرشح كاني (Canny): التنعيم بغاوس، حساب اتجاه ومقدار التدرج، قمع القيم غير العظمى (Non-maximum suppression)، وتطبيق العتبة المزدوجة (Hysteresis thresholding).',
  },
];
