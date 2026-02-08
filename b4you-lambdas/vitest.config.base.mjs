import { defineConfig } from 'vitest/config';

/**
 * Configuração base do Vitest para todas as lambdas
 * 
 * Para usar em uma lambda específica, crie um vitest.config.mjs que estende esta configuração:
 * 
 * import { defineConfig, mergeConfig } from 'vitest/config';
 * import baseConfig from '../../vitest.config.base.mjs';
 * 
 * export default mergeConfig(
 *   baseConfig,
 *   defineConfig({
 *     // suas configurações específicas aqui
 *   })
 * );
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        '__tests__/**',
        '__mocks__/**',
        '*.config.{js,mjs}',
        'database/models/**',
        'deploy.sh',
        'Dockerfile',
        '*.md',
      ],
      reportsDirectory: './coverage',
    },
    // Configurações de timeout
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Ignore patterns
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
  },
});

