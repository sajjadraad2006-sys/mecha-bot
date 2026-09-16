import { describe, it, expect, beforeEach } from 'vitest';
import { ConversationContextManager } from '@mecha-bot/ai';

describe('Conversation Context Manager & Academic Scope Lock', () => {
  let contextMgr: ConversationContextManager;

  beforeEach(() => {
    contextMgr = new ConversationContextManager(30 * 60 * 1000, 4); // 30 min TTL, max 4 messages
  });

  describe('Academic Scope Lock & Follow-ups', () => {
    it('locks follow-up queries to existing course scope when active in a thread', () => {
      const studentKey = 'student_test_1';

      // 1. Initial interaction inside MCT314
      contextMgr.updateContext(studentKey, {
        activeCourseCode: 'MCT314',
        activeTopicKey: 'root_locus',
        userMessage: 'اشرحلي Root Locus',
        assistantMessage: 'هو تمثيل بياني لمسار الأقطاب...',
        confidence: 'EXPLICIT',
      });

      // 2. Follow-up query without mentioning MCT314
      const resolution = contextMgr.resolveScope(studentKey, 'ليش غيرنا الإشارة؟');
      expect(resolution.isLockedToExisting).toBe(true);
      expect(resolution.isScopeTransition).toBe(false);
      expect(resolution.isAmbiguous).toBe(false);
      expect(resolution.scope?.courseCode).toBe('MCT314');
      expect(resolution.scope?.topicKey).toBe('root_locus');
    });

    it('detects explicit scope transitions when student names a different course', () => {
      const studentKey = 'student_test_1';

      contextMgr.updateContext(studentKey, {
        activeCourseCode: 'MCT314',
        userMessage: 'سؤال بالسيطرة',
      });

      // Student explicitly transitions: "خل نروح لـ MCT312"
      const resolution = contextMgr.resolveScope(
        studentKey,
        'خل نروح لمادة MCT312 اشرحلي الترانزستور',
      );

      expect(resolution.isScopeTransition).toBe(true);
      expect(resolution.isLockedToExisting).toBe(false);
      expect(resolution.scope?.courseCode).toBe('MCT312');
    });

    it('flags queries as ambiguous when student has no active course or context', () => {
      const studentKey = 'student_new';

      const resolution = contextMgr.resolveScope(studentKey, 'اشرحلي الاستقرارية والنظام الخطي');
      expect(resolution.isAmbiguous).toBe(true);
      expect(resolution.scope).toBeNull();
    });

    it('uses providedCourseCode from active UI screen when user has no prior context', () => {
      const studentKey = 'student_from_menu';

      const resolution = contextMgr.resolveScope(studentKey, 'اشرحلي قانون كيرشوف', 'MCT111');

      expect(resolution.isAmbiguous).toBe(false);
      expect(resolution.scope?.courseCode).toBe('MCT111');
    });
  });

  describe('Context Security & Isolation', () => {
    it('strictly isolates context between different students (cross-student isolation)', () => {
      const studentA = 'student_key_alpha';
      const studentB = 'student_key_beta';

      contextMgr.updateContext(studentA, {
        activeCourseCode: 'MCT314',
        activeTopicKey: 'pid_controllers',
        userMessage: 'سؤال حول الـ PID',
      });

      contextMgr.updateContext(studentB, {
        activeCourseCode: 'MCT211',
        activeTopicKey: 'dc_motors',
        userMessage: 'سؤال حول المحركات',
      });

      const ctxA = contextMgr.getContext(studentA);
      const ctxB = contextMgr.getContext(studentB);

      expect(ctxA?.activeCourseCode).toBe('MCT314');
      expect(ctxA?.activeTopicKey).toBe('pid_controllers');

      expect(ctxB?.activeCourseCode).toBe('MCT211');
      expect(ctxB?.activeTopicKey).toBe('dc_motors');
    });

    it('enforces TTL expiration and purges stale conversations', () => {
      const shortTtlMgr = new ConversationContextManager(-1000); // Already expired
      const studentKey = 'student_expired';

      shortTtlMgr.updateContext(studentKey, {
        activeCourseCode: 'MCT314',
        userMessage: 'سؤال قديم',
      });

      expect(shortTtlMgr.getContext(studentKey)).toBeNull();
    });

    it('bounds recent messages to sliding window size (compaction)', () => {
      const studentKey = 'student_chatty';

      for (let i = 1; i <= 8; i++) {
        contextMgr.updateContext(studentKey, {
          userMessage: `سؤال ${i}`,
          assistantMessage: `جواب ${i}`,
        });
      }

      const ctx = contextMgr.getContext(studentKey);
      // Window was configured to max 4 messages
      expect(ctx?.recentMessages.length).toBeLessThanOrEqual(4);
    });
  });
});
