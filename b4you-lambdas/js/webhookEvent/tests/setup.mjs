import { vi } from 'vitest';

// Mock console methods para evitar poluição nos testes
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  dir: vi.fn(),
};
