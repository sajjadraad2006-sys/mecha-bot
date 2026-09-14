import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'packages/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/**/src/**/*.ts', 'apps/**/src/**/*.ts'],
      exclude: ['**/index.ts', '**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@mecha-bot/shared': path.resolve(__dirname, 'packages/shared/src/index.ts'),
      '@mecha-bot/academic': path.resolve(__dirname, 'packages/academic/src/index.ts'),
      '@mecha-bot/database': path.resolve(__dirname, 'packages/database/src/index.ts'),
      '@mecha-bot/ai': path.resolve(__dirname, 'packages/ai/src/index.ts'),
      '@mecha-bot/retrieval': path.resolve(__dirname, 'packages/retrieval/src/index.ts'),
      '@mecha-bot/scheduler': path.resolve(__dirname, 'packages/scheduler/src/index.ts'),
      '@mecha-bot/telegram': path.resolve(__dirname, 'packages/telegram/src/index.ts'),
      '@mecha-bot/search': path.resolve(__dirname, 'packages/search/src/index.ts'),
      '@mecha-bot/navigator': path.resolve(__dirname, 'packages/navigator/src/index.ts'),
      '@mecha-bot/timetable': path.resolve(__dirname, 'packages/timetable/src/index.ts'),
      '@mecha-bot/companion': path.resolve(__dirname, 'packages/companion/src/index.ts'),
      '@mecha-bot/exams': path.resolve(__dirname, 'packages/exams/src/index.ts'),
      '@mecha-bot/admin': path.resolve(__dirname, 'packages/admin/src/index.ts'),
      '@mecha-bot/distribution': path.resolve(__dirname, 'packages/distribution/src/index.ts'),
      '@mecha-bot/wiring': path.resolve(__dirname, 'packages/wiring/src/index.ts'),
    },
  },
});
