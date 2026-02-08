import { defineConfig } from 'vitest/config';
import baseConfig from './vitest.config.base.mjs';

/**
 * Configuração principal do Vitest para o workspace
 * 
 * Esta configuração permite executar testes de todas as lambdas de uma vez
 * ou executar testes de uma lambda específica usando a flag --project
 * 
 * Exemplos:
 * - npm test                          # Roda todos os testes
 * - npm run test:watch                # Watch mode para todos
 * - npm run test:lambda requestWithdrawal  # Testa lambda específica
 * - cd js/requestWithdrawal && npm test    # Testa dentro da lambda
 */
export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    // Procura por testes em todas as lambdas
    include: [
      'js/**/__tests__/**/*.{test,spec}.{js,mjs}',
      'js/**/tests/**/*.{test,spec}.{js,mjs}',
    ],
  },
});

