import { describe, it, expect } from 'vitest';
import { AiInvocationGate } from '@mecha-bot/ai';

describe('AI Invocation Gate (Deterministic Heuristics)', () => {
  const gate = new AiInvocationGate();

  describe('Deterministic Command and Button Bypass', () => {
    it('bypasses system slash commands without calling AI', () => {
      expect(gate.evaluate('/start').shouldInvokeAi).toBe(false);
      expect(gate.evaluate('/menu').shouldInvokeAi).toBe(false);
      expect(gate.evaluate('/courses').shouldInvokeAi).toBe(false);
      expect(gate.evaluate('/where').shouldInvokeAi).toBe(false);
      expect(gate.evaluate('/lost').shouldInvokeAi).toBe(false);
      expect(gate.evaluate('/timetable').shouldInvokeAi).toBe(false);
      expect(gate.evaluate('/reminders').shouldInvokeAi).toBe(false);
      expect(gate.evaluate('/health').shouldInvokeAi).toBe(false);
      expect(gate.evaluate('/help').shouldInvokeAi).toBe(false);
    });

    it('bypasses telegram callback prefixes without calling AI', () => {
      expect(gate.evaluate('m:where:MCT314').shouldInvokeAi).toBe(false);
      expect(gate.evaluate('m1:s:1').shouldInvokeAi).toBe(false);
      expect(gate.evaluate('m:lost:MCT312').shouldInvokeAi).toBe(false);
      expect(gate.evaluate('m:dl:file_123').shouldInvokeAi).toBe(false);
      expect(gate.evaluate('m:qz_sub:quiz_1').shouldInvokeAi).toBe(false);
    });

    it('bypasses empty or too short input', () => {
      expect(gate.evaluate('').shouldInvokeAi).toBe(false);
      expect(gate.evaluate('   ').shouldInvokeAi).toBe(false);
      expect(gate.evaluate('hi').shouldInvokeAi).toBe(false);
      expect(gate.evaluate('أه').shouldInvokeAi).toBe(false);
    });
  });

  describe('Academic Questions Invocation', () => {
    it('invokes AI for explanation and concept questions in Arabic', () => {
      const q1 = gate.evaluate('اشرحلي طريقة المحل الهندسي للجذور Root Locus');
      expect(q1.shouldInvokeAi).toBe(true);
      expect(q1.taskType).toBe('CONCEPT_EXPLANATION');

      const q2 = gate.evaluate('شنو الفرق بين الـ PI والـ PID controller؟');
      expect(q2.shouldInvokeAi).toBe(true);
      expect(q2.taskType).toBe('MULTI_SOURCE_SYNTHESIS');

      const q3 = gate.evaluate('وضحلي قانون الاستقرار لمعيار روث Routh');
      expect(q3.shouldInvokeAi).toBe(true);
      expect(q3.taskType).toBe('CONCEPT_EXPLANATION');

      const q4 = gate.evaluate('لخصلي هاي المحاضرة بخصوص الـ Transfer Function');
      expect(q4.shouldInvokeAi).toBe(true);
      expect(q4.taskType).toBe('MULTI_SOURCE_SYNTHESIS');
    });

    it('invokes AI for English engineering inquiries', () => {
      const q1 = gate.evaluate('Explain the state space representation of a DC motor');
      expect(q1.shouldInvokeAi).toBe(true);

      const q2 = gate.evaluate('How do we calculate the gain margin in a Bode plot?');
      expect(q2.shouldInvokeAi).toBe(true);

      const q3 = gate.evaluate('Compare analog and digital filters');
      expect(q3.shouldInvokeAi).toBe(true);
    });

    it('invokes AI for follow-up questions when active course scope is present', () => {
      const activeCourse = 'MCT314';

      const followUp1 = gate.evaluate('ليش غيرنا الإشارة بهالخطوة؟', activeCourse);
      expect(followUp1.shouldInvokeAi).toBe(true);

      const followUp2 = gate.evaluate('شلون طلعت هاي القيمة؟', activeCourse);
      expect(followUp2.shouldInvokeAi).toBe(true);

      const followUp3 = gate.evaluate('اشرحها أكثر بالتفصيل', activeCourse);
      expect(followUp3.shouldInvokeAi).toBe(true);
    });

    it('does not invoke AI for random non-academic remarks when no active course is selected', () => {
      expect(gate.evaluate('مرحبا شلونك؟').shouldInvokeAi).toBe(false);
      expect(gate.evaluate('شكراً جزيلاً').shouldInvokeAi).toBe(false);
      expect(gate.evaluate('تمام عاشت ايدك').shouldInvokeAi).toBe(false);
    });
  });
});
