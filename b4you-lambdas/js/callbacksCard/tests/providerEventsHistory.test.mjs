import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildEventId, recordProviderEvent } from '../useCases/providerEventsHistory.mjs';

describe('providerEventsHistory', () => {
  it('builds event ids with fallback parts', () => {
    assert.equal(buildEventId('evt_123', ['fallback']), 'evt_123');
    assert.equal(buildEventId(null, ['abc', 'open']), 'abc-open');
  });

  it('skips duplicate events', async () => {
    const ProviderEventsHistory = {
      findOne: async () => ({ id: 1 }),
      create: async () => ({ id: 2 }),
    };
    const result = await recordProviderEvent({
      ProviderEventsHistory,
      eventId: 'evt_123',
      provider: 'pagarme',
      eventType: 'dispute',
      eventAction: 'open',
      occurredAt: new Date(),
      transactionId: '1',
      orderId: null,
      saleId: '2',
      payload: {},
    });

    assert.equal(result.duplicate, true);
  });

  it('records new events', async () => {
    let created = false;
    const ProviderEventsHistory = {
      findOne: async () => null,
      create: async () => {
        created = true;
        return { id: 2 };
      },
    };
    const result = await recordProviderEvent({
      ProviderEventsHistory,
      eventId: 'evt_456',
      provider: 'pagarme',
      eventType: 'dispute',
      eventAction: 'lost',
      occurredAt: new Date(),
      transactionId: '1',
      orderId: null,
      saleId: '2',
      payload: {},
    });

    assert.equal(result.duplicate, false);
    assert.equal(created, true);
  });
});
