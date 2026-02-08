import { describe, it, expect } from 'vitest';
import { resolveReleaseDate } from '../utils/dates.mjs';

describe('Date Utils', () => {
  it('should format date correctly for release date for future date', () => {
    const paid_at = '2026-01-02T01:00:00Z'; // no banco seria 2026-01-02 01:00:00 mas para -3h seria 2016-01-01 22:00:00
    const releaseDate = resolveReleaseDate({
      paid_at,
      payment_method: 'card',
      saleSettings: { release_credit_card: 3 },
      status: 2, // paid
    });

    expect(releaseDate).toBe('2026-01-04');
  });
  it('should format date correctly for release date for current date', () => {
    const paid_at = '2026-01-02T15:00:00Z'; // no banco seria 2026-01-02 15:00:00 mas para -3h seria 2016-01-02 12:00:00
    const releaseDate = resolveReleaseDate({
      paid_at,
      payment_method: 'card',
      saleSettings: { release_credit_card: 3 },
      status: 2, // paid
    });

    expect(releaseDate).toBe('2026-01-05');
  });
  it('should return null when status is not paid', () => {
    const paid_at = '2026-01-02T15:00:00Z'; // no banco seria 2026-01-02 15:00:00 mas para -3h seria 2016-01-02 12:00:00
    const releaseDate = resolveReleaseDate({
      paid_at,
      payment_method: 'card',
      saleSettings: { release_credit_card: 3 },
      status: 1, // pending
    });

    expect(releaseDate).toBe(null);
  });
});
