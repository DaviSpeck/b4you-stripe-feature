import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processStripeWebhookEvent } from '../useCases/StripeWebhookProcessor.mjs';

const basePayload = {
  provider: 'stripe',
  provider_event_id: 'evt_123',
  event_type: 'payment_intent.succeeded',
  transaction_id: 'transaction-123',
  provider_payment_intent_id: 'pi_123',
  payload: {
    data: {
      object: {},
    },
  },
};

describe('StripeWebhookProcessor', () => {
  let StripeWebhookEvents;
  let StripePaymentIntents;
  let Sales_items;
  let Products;
  let webhooksEvents;

  beforeEach(() => {
    StripeWebhookEvents = {
      findOne: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue([1]),
    };
    StripePaymentIntents = {
      findOne: vi.fn().mockResolvedValue({
        transaction_id: 'transaction-123',
        sale_id: 'sale-123',
        status: 'pending',
      }),
      update: vi.fn().mockResolvedValue([1]),
    };
    Sales_items = {
      findOne: vi.fn().mockResolvedValue({
        id: 10,
        id_product: 99,
        id_affiliate: null,
      }),
    };
    Products = {
      findOne: vi.fn().mockResolvedValue({
        id: 99,
        id_user: 77,
      }),
    };
    webhooksEvents = {
      send: vi.fn().mockResolvedValue({ ok: true }),
    };
  });

  it('applies valid payment transitions and publishes webhook events', async () => {
    const result = await processStripeWebhookEvent(basePayload, {
      StripeWebhookEvents,
      StripePaymentIntents,
      Sales_items,
      Products,
      webhooksEvents,
    });

    expect(result.ok).toBe(true);
    expect(StripePaymentIntents.update).toHaveBeenCalledWith(
      { status: 'succeeded' },
      { where: { transaction_id: 'transaction-123' } }
    );
    expect(StripeWebhookEvents.update).toHaveBeenCalledWith(
      expect.objectContaining({
        processing_result: 'processed',
        payment_intent_status: 'succeeded',
      }),
      { where: { provider_event_id: 'evt_123' } }
    );
    expect(webhooksEvents.send).toHaveBeenCalled();
  });

  it('ignores out-of-order regression payment events', async () => {
    StripePaymentIntents.findOne.mockResolvedValue({
      transaction_id: 'transaction-123',
      sale_id: 'sale-123',
      status: 'refund_succeeded',
    });

    const result = await processStripeWebhookEvent(
      { ...basePayload, event_type: 'payment_intent.payment_failed' },
      {
        StripeWebhookEvents,
        StripePaymentIntents,
        Sales_items,
        Products,
        webhooksEvents,
      }
    );

    expect(result.ok).toBe(true);
    expect(result.regression).toBe(true);
    expect(StripePaymentIntents.update).not.toHaveBeenCalled();
    expect(StripeWebhookEvents.update).toHaveBeenCalledWith(
      expect.objectContaining({
        processing_result: 'ignored_regression',
        payment_intent_status: 'refund_succeeded',
      }),
      { where: { provider_event_id: 'evt_123' } }
    );
    expect(webhooksEvents.send).not.toHaveBeenCalled();
  });

  it('short-circuits duplicate events', async () => {
    StripeWebhookEvents.findOne.mockResolvedValue({
      provider_event_id: 'evt_123',
      processing_result: 'processed',
    });

    const result = await processStripeWebhookEvent(basePayload, {
      StripeWebhookEvents,
      StripePaymentIntents,
      Sales_items,
      Products,
      webhooksEvents,
    });

    expect(result.ok).toBe(true);
    expect(result.duplicate).toBe(true);
    expect(StripePaymentIntents.update).not.toHaveBeenCalled();
    expect(StripeWebhookEvents.update).not.toHaveBeenCalled();
    expect(webhooksEvents.send).not.toHaveBeenCalled();
  });

  it('marks orphaned events when payment intent is missing', async () => {
    StripePaymentIntents.findOne.mockResolvedValue(null);

    const result = await processStripeWebhookEvent(basePayload, {
      StripeWebhookEvents,
      StripePaymentIntents,
      Sales_items,
      Products,
      webhooksEvents,
    });

    expect(result.ok).toBe(true);
    expect(result.orphaned).toBe(true);
    expect(StripeWebhookEvents.update).toHaveBeenCalledWith(
      expect.objectContaining({ processing_result: 'orphaned' }),
      { where: { provider_event_id: 'evt_123' } }
    );
  });

  it('maps refund request events to refund_requested', async () => {
    const result = await processStripeWebhookEvent(
      {
        ...basePayload,
        event_type: 'charge.refund.updated',
        payload: { data: { object: { status: 'pending' } } },
      },
      {
        StripeWebhookEvents,
        StripePaymentIntents,
        Sales_items,
        Products,
        webhooksEvents,
      }
    );

    expect(result.ok).toBe(true);
    expect(StripePaymentIntents.update).toHaveBeenCalledWith(
      { status: 'refund_requested' },
      { where: { transaction_id: 'transaction-123' } }
    );
  });

  it('maps refund success events to refund_succeeded', async () => {
    const result = await processStripeWebhookEvent(
      {
        ...basePayload,
        event_type: 'charge.refund.updated',
        payload: { data: { object: { status: 'succeeded' } } },
      },
      {
        StripeWebhookEvents,
        StripePaymentIntents,
        Sales_items,
        Products,
        webhooksEvents,
      }
    );

    expect(result.ok).toBe(true);
    expect(StripePaymentIntents.update).toHaveBeenCalledWith(
      { status: 'refund_succeeded' },
      { where: { transaction_id: 'transaction-123' } }
    );
  });

  it('blocks refund regression after success', async () => {
    StripePaymentIntents.findOne.mockResolvedValue({
      transaction_id: 'transaction-123',
      sale_id: 'sale-123',
      status: 'refund_succeeded',
    });

    const result = await processStripeWebhookEvent(
      {
        ...basePayload,
        event_type: 'charge.refund.updated',
        payload: { data: { object: { status: 'pending' } } },
      },
      {
        StripeWebhookEvents,
        StripePaymentIntents,
        Sales_items,
        Products,
        webhooksEvents,
      }
    );

    expect(result.ok).toBe(true);
    expect(result.regression).toBe(true);
    expect(StripePaymentIntents.update).not.toHaveBeenCalled();
  });

  it('maps dispute open events to dispute_open', async () => {
    const result = await processStripeWebhookEvent(
      {
        ...basePayload,
        event_type: 'charge.dispute.created',
        payload: { data: { object: { status: 'needs_response' } } },
      },
      {
        StripeWebhookEvents,
        StripePaymentIntents,
        Sales_items,
        Products,
        webhooksEvents,
      }
    );

    expect(result.ok).toBe(true);
    expect(StripePaymentIntents.update).toHaveBeenCalledWith(
      { status: 'dispute_open' },
      { where: { transaction_id: 'transaction-123' } }
    );
  });

  it('maps dispute closed lost events to dispute_lost', async () => {
    const result = await processStripeWebhookEvent(
      {
        ...basePayload,
        event_type: 'charge.dispute.closed',
        payload: { data: { object: { status: 'lost' } } },
      },
      {
        StripeWebhookEvents,
        StripePaymentIntents,
        Sales_items,
        Products,
        webhooksEvents,
      }
    );

    expect(result.ok).toBe(true);
    expect(StripePaymentIntents.update).toHaveBeenCalledWith(
      { status: 'dispute_lost' },
      { where: { transaction_id: 'transaction-123' } }
    );
  });
});
