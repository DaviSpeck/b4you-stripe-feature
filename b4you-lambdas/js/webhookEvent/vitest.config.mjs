import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.base.mjs';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      setupFiles: ['./tests/setup.mjs'],
      coverage: {
        exclude: [...baseConfig.test.coverage.exclude, 'tests/**', 'test.mjs'],
      },
      // Adicione aqui configurações específicas desta lambda se necessário
    },
  })
);
