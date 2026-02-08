import { describe, expect, it, vi } from 'vitest';
import { QueryTypes } from 'sequelize';
import { findBirthdayUsers, formatDateOnly } from '../useCases/findBirthdayUsers.mjs';

describe('findBirthdayUsers use case', () => {
  it('returns payloads using formatted reference date', async () => {
    const sequelize = {
      query: vi.fn().mockResolvedValue([
        {
          id: 2,
          first_name: 'João',
          last_name: 'Souza',
          full_name: '',
          email: 'joao@example.com',
          whatsapp: '5581999999999',
          birth_date: '1990-10-20',
        },
      ]),
    };

    const models = {
      Users: { getTableName: () => 'users' },
    };

    const referenceDate = new Date('2024-10-20T15:00:00Z');
    const result = await findBirthdayUsers(sequelize, models, referenceDate);

    expect(sequelize.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM users'),
      expect.objectContaining({
        replacements: { today: '2024-10-20' },
        type: QueryTypes.SELECT,
      })
    );

    expect(result).toEqual([
      {
        id: 2,
        name: 'João Souza',
        email: 'joao@example.com',
        phone: '5581999999999',
        birthDate: '1990-10-20',
      },
    ]);
  });
});

describe('formatDateOnly', () => {
  it('returns ISO date slice for Date instances', () => {
    expect(formatDateOnly(new Date('2024-01-05T12:00:00Z'))).toBe('2024-01-05');
  });
});
