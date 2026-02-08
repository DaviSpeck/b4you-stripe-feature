import { describe, expect, it, vi } from 'vitest';
import { QueryTypes } from 'sequelize';
import {
  calculateInactiveDays,
  findUsersInactive30Days,
  getInactiveCutoffDate,
} from '../useCases/findUsersInactive30Days.mjs';

describe('findUsersInactive30Days use case', () => {
  it('builds payloads enforcing minimum inactive days', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-30T00:00:00Z'));

    const sequelize = {
      query: vi.fn().mockResolvedValue([
        {
          id: 1,
          first_name: 'Ana',
          last_name: 'Silva',
          full_name: null,
          email: 'ana@example.com',
          whatsapp: '5511999999999',
          lastPaidAt: '2024-05-01T00:00:00.000Z',
        },
      ]),
    };

    const models = {
      Users: { getTableName: () => 'users' },
      SalesItems: { getTableName: () => 'sales_items' },
      Commissions: { getTableName: () => 'commissions' },
    };

    const cutoffDate = new Date('2024-05-30T03:00:00.000Z');

    const result = await findUsersInactive30Days(sequelize, models, {
      cutoffDate,
      minimumInactiveDays: 30,
    });

    expect(sequelize.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM users'),
      expect.objectContaining({
        replacements: { cutoffDate },
        type: QueryTypes.SELECT,
      })
    );

    expect(result).toEqual([
      {
        id: 1,
        name: 'Ana Silva',
        email: 'ana@example.com',
        phone: '5511999999999',
        inactiveDays: 60,
        lastSaleAt: '2024-05-01T00:00:00.000Z',
      },
    ]);

    vi.useRealTimers();
  });
});

describe('calculateInactiveDays', () => {
  it('returns zero when no last sale exists', () => {
    expect(calculateInactiveDays(null)).toBe(30);
  });
});

describe('getInactiveCutoffDate', () => {
  it('computes 30-day cutoff at midnight', () => {
    const reference = new Date('2024-07-15T12:00:00Z');
    const cutoff = getInactiveCutoffDate(reference, 30);

    expect(cutoff.toISOString()).toBe('2024-06-15T03:00:00.000Z');
  });
});
