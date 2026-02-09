jest.mock('../../database/models/Provider_events_history', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

const ProviderEventsHistory = require('../../database/models/Provider_events_history');
const {
  buildEventId,
  recordProviderEvent,
} = require('../../useCases/callbacks/providerEventsHistory');

describe('providerEventsHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds event ids with fallback', () => {
    expect(buildEventId('evt_123', ['fallback'])).toBe('evt_123');
    expect(buildEventId(null, ['abc', 'success'])).toBe('abc-success');
  });

  it('skips duplicate events', async () => {
    ProviderEventsHistory.findOne.mockResolvedValue({ id: 1 });
    const result = await recordProviderEvent({
      eventId: 'evt_123',
      provider: 'pagarme',
      eventType: 'refund',
      eventAction: 'success',
      occurredAt: new Date(),
      transactionId: 'tx_1',
      orderId: null,
      saleId: 'sale_1',
      payload: {},
    });

    expect(result.duplicate).toBe(true);
    expect(ProviderEventsHistory.create).not.toHaveBeenCalled();
  });

  it('records new events', async () => {
    ProviderEventsHistory.findOne.mockResolvedValue(null);
    const result = await recordProviderEvent({
      eventId: 'evt_456',
      provider: 'pagarme',
      eventType: 'refund',
      eventAction: 'success',
      occurredAt: new Date(),
      transactionId: 'tx_2',
      orderId: null,
      saleId: 'sale_2',
      payload: {},
    });

    expect(result.duplicate).toBe(false);
    expect(ProviderEventsHistory.create).toHaveBeenCalled();
  });
});
