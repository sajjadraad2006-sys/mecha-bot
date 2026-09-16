import { describe, it, expect, beforeEach } from 'vitest';
import {
  AIRouter,
  FakeAIProvider,
  ModelHealthRegistry,
  BudgetManager,
  AcademicResponseSchema,
} from '@mecha-bot/ai';

describe('Model Router, Health Registry & Zero-Cost Budget Guard', () => {
  let healthRegistry: ModelHealthRegistry;
  let budgetManager: BudgetManager;

  beforeEach(() => {
    healthRegistry = new ModelHealthRegistry();
    budgetManager = new BudgetManager();
    budgetManager.resetForTesting();
  });

  describe('Zero-Cost Hard Guards & Invariants', () => {
    it('enforces non-negotiable zero-cost flags', () => {
      expect(budgetManager.ALLOW_PAID_AI).toBe(false);
      expect(budgetManager.ALLOW_PAID_STORAGE).toBe(false);
      expect(budgetManager.ALLOW_BILLING_FALLBACK).toBe(false);
    });

    it('transitions budget states: HEALTHY -> CONSERVATIVE -> EXHAUSTED', () => {
      expect(budgetManager.getBudgetState()).toBe('HEALTHY');

      // Record 7100 neurons (exceeds 7000 conservative threshold)
      budgetManager.recordRequest(7100);
      expect(budgetManager.getBudgetState()).toBe('CONSERVATIVE');

      // Record another 3000 neurons (exceeds 10000 daily limit)
      budgetManager.recordRequest(3000);
      expect(budgetManager.getBudgetState()).toBe('EXHAUSTED');
      expect(budgetManager.canInvokeAi()).toBe(false);
    });
  });

  describe('Task-Based Model Routing', () => {
    it('routes simple tasks to lightweight model and concept tasks to primary model', () => {
      const simpleModel = healthRegistry.selectModel('SIMPLE_EXPLANATION');
      expect(simpleModel).toBe(ModelHealthRegistry.AI_MODEL_SECONDARY); // 3b

      const conceptModel = healthRegistry.selectModel('CONCEPT_EXPLANATION');
      expect(conceptModel).toBe(ModelHealthRegistry.AI_MODEL_PRIMARY); // 8b
    });
  });

  describe('Cloudflare Error Classification & Failover', () => {
    it('Error 3040 (Out of Capacity): Cooldowns model and transparently routes to secondary fallback', async () => {
      const primary = new FakeAIProvider('primary-cf');
      const fallback = new FakeAIProvider('fallback-cf');

      primary.setSimulateOutOfCapacity('Out of capacity (3040)');

      const router = new AIRouter(primary, [fallback], healthRegistry, budgetManager);

      const { result, providerId } = await router.generateStructured(
        'Prompt',
        AcademicResponseSchema,
        { taskType: 'CONCEPT_EXPLANATION' },
      );

      expect(providerId).toBe('fallback-cf');
      expect(result.answer).toBeDefined();

      // Primary model was placed in cooldown
      const primaryEntry = healthRegistry.getModel(ModelHealthRegistry.AI_MODEL_PRIMARY);
      expect(primaryEntry?.state).toBe('COOLDOWN');
    });

    it('Error 3036 (Quota Exhausted): Fails closed immediately for the entire day', async () => {
      const primary = new FakeAIProvider('primary-cf');
      const fallback = new FakeAIProvider('fallback-cf');

      primary.setSimulateQuotaExhausted('Cloudflare daily quota exhausted (3036)');

      const router = new AIRouter(primary, [fallback], healthRegistry, budgetManager);

      // Must fail and throw quota exhausted error
      await expect(router.generateStructured('Prompt', AcademicResponseSchema)).rejects.toThrow(
        /Daily Cloudflare Workers AI quota exhausted/,
      );

      // Global quota is marked exhausted
      expect(healthRegistry.isGlobalQuotaExhausted()).toBe(true);
      expect(budgetManager.canInvokeAi()).toBe(false);

      // Any subsequent request immediately fails closed without calling any provider
      await expect(
        router.generateStructured('Second prompt', AcademicResponseSchema),
      ).rejects.toThrow(/AI daily neuron quota is exhausted \(Error 3036\)/);
    });

    it('Error 5035 (Requires Paid): Excludes paid model and falls back to free model under zero-cost mode', async () => {
      const primary = new FakeAIProvider('paid-pro-model', false); // Simulated accidentally configured paid model
      const freeFallback = new FakeAIProvider('free-model', true);

      primary.setSimulatePaidRequired('Requires paid plan (5035)');

      const router = new AIRouter(primary, [freeFallback], healthRegistry, budgetManager);

      const { result, providerId } = await router.generateStructured(
        'Prompt',
        AcademicResponseSchema,
      );

      expect(providerId).toBe('free-model');
      expect(result.answer).toBeDefined();

      const modelEntry = healthRegistry.getModel(ModelHealthRegistry.AI_MODEL_PRIMARY);
      expect(modelEntry?.state).toBe('PAID_ONLY');
    });

    it('Error 3007 (Timeout): Bounded recovery routes to fallback', async () => {
      const primary = new FakeAIProvider('primary-slow');
      const fallback = new FakeAIProvider('fallback-fast');

      primary.setSimulateTimeout('Inference timed out after 15000ms');

      const router = new AIRouter(primary, [fallback], healthRegistry, budgetManager);

      const { result, providerId } = await router.generateStructured(
        'Prompt',
        AcademicResponseSchema,
      );

      expect(providerId).toBe('fallback-fast');
      expect(result.answer).toBeDefined();
    });
  });
});
