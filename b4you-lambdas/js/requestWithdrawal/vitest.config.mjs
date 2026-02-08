import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.base.mjs';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      setupFiles: ['./__tests__/setup.mjs'],
      // Adicione aqui configurações específicas desta lambda se necessário
    },
  })
);
