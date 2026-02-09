const HandleStripeWebhook = require('../../useCases/checkout/international/HandleStripeWebhook');
const StripeWebhookEventsRepository = require('../../repositories/sequelize/StripeWebhookEventsRepository');
const SQS = require('../../queues/aws');
const Pagarme = require('../../services/payment/Pagarme');

const mockConstructEvent = jest.fn();

jest.mock('../../services/payment/Stripe', () => {
  return jest.fn().mockImplementation(() => ({
    constructEvent: mockConstructEvent,
  }));
});

jest.mock('../../repositories/sequelize/StripeWebhookEventsRepository', () => ({
  findByProviderEventId: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../../queues/aws', () => ({
  add: jest.fn(),
}));
jest.mock('../../services/payment/Pagarme', () => jest.fn());

describe('Stripe webhook processing - Phase 2', () => {
  const baseEvent = {
    id: 'evt_123',
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_123',
        metadata: {
          transaction_id: 'transaction-123',
        },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    expect(Pagarme).not.toHaveBeenCalled();
  });

  it('accepts a valid signature and processes the event', async () => {
    mockConstructEvent.mockReturnValue(baseEvent);
    StripeWebhookEventsRepository.findByProviderEventId.mockResolvedValue(null);

    const result = await new HandleStripeWebhook().execute({
      rawBody: Buffer.from('{"id":"evt_123"}'),
      signature: 'sig',
    });

    expect(result.ok).toBe(true);
    expect(StripeWebhookEventsRepository.create).toHaveBeenCalled();
    expect(SQS.add).toHaveBeenCalledWith('webhookEvent', {
      provider: 'stripe',
      provider_event_id: 'evt_123',
      event_type: 'payment_intent.succeeded',
      transaction_id: 'transaction-123',
      provider_payment_intent_id: 'pi_123',
      payload: baseEvent,
    });
    expect(Pagarme).not.toHaveBeenCalled();
  });

  it('rejects invalid signatures', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const result = await new HandleStripeWebhook().execute({
      rawBody: Buffer.from('{"id":"evt_123"}'),
      signature: 'sig',
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
    expect(StripeWebhookEventsRepository.create).not.toHaveBeenCalled();
  });

  it('ignores duplicated events', async () => {
    mockConstructEvent.mockReturnValue(baseEvent);
    StripeWebhookEventsRepository.findByProviderEventId.mockResolvedValue({
      provider_event_id: 'evt_123',
    });

    const result = await new HandleStripeWebhook().execute({
      rawBody: Buffer.from('{"id":"evt_123"}'),
      signature: 'sig',
    });

    expect(result.ok).toBe(true);
    expect(result.duplicate).toBe(true);
    expect(StripeWebhookEventsRepository.create).not.toHaveBeenCalled();
    expect(SQS.add).not.toHaveBeenCalled();
  });

  it('handles out-of-order events without blocking queueing', async () => {
    mockConstructEvent.mockReturnValue({
      ...baseEvent,
      type: 'payment_intent.payment_failed',
    });
    StripeWebhookEventsRepository.findByProviderEventId.mockResolvedValue(null);

    const result = await new HandleStripeWebhook().execute({
      rawBody: Buffer.from('{"id":"evt_123"}'),
      signature: 'sig',
    });

    expect(result.ok).toBe(true);
    expect(SQS.add).toHaveBeenCalled();
  });

  it('queues charge refund events with payment intent reference', async () => {
    mockConstructEvent.mockReturnValue({
      ...baseEvent,
      type: 'charge.refunded',
      data: {
        object: {
          id: 'ch_123',
          payment_intent: 'pi_123',
        },
      },
    });
    StripeWebhookEventsRepository.findByProviderEventId.mockResolvedValue(null);

    const result = await new HandleStripeWebhook().execute({
      rawBody: Buffer.from('{"id":"evt_123"}'),
      signature: 'sig',
    });

    expect(result.ok).toBe(true);
    expect(SQS.add).toHaveBeenCalledWith(
      'webhookEvent',
      expect.objectContaining({
        provider: 'stripe',
        provider_payment_intent_id: 'pi_123',
        event_type: 'charge.refunded',
      }),
    );
  });

  it('rejects payloads without payment intent identifiers', async () => {
    mockConstructEvent.mockReturnValue({
      id: 'evt_456',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: null,
          metadata: {},
        },
      },
    });
    StripeWebhookEventsRepository.findByProviderEventId.mockResolvedValue(null);

    const result = await new HandleStripeWebhook().execute({
      rawBody: Buffer.from('{"id":"evt_456"}'),
      signature: 'sig',
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
    expect(SQS.add).not.toHaveBeenCalled();
  });
});
