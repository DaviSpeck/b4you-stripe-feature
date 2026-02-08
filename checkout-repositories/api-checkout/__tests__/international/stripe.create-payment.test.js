const validateDTO = require('../../middlewares/validate-dto');
const createStripePaymentIntentDTO = require('../../dto/international/createStripePaymentIntent');
const stripeFeatureFlag = require('../../middlewares/stripe-feature-flag');
const {
  createStripePaymentIntentController,
} = require('../../controllers/checkout/international');
const CreateStripePaymentIntent = require('../../useCases/checkout/international/CreateStripePaymentIntent');

const StripePaymentIntentsRepository = require('../../repositories/sequelize/StripePaymentIntentsRepository');
const { incrementPaymentIntentsCreated } = require('../../middlewares/prom');

const mockStripeCreate = jest.fn();
const mockStripeRetrieve = jest.fn();

jest.mock('stripe', () =>
  jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: mockStripeCreate,
      retrieve: mockStripeRetrieve,
    },
  })),
);

jest.mock('../../repositories/sequelize/StripePaymentIntentsRepository', () => ({
  create: jest.fn(),
  findByTransactionId: jest.fn(),
}));

jest.mock('../../middlewares/prom', () => ({
  incrementPaymentIntentsCreated: jest.fn(),
}));

jest.mock('../../services/payment/Pagarme', () => jest.fn());

const buildRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.send = jest.fn(() => res);
  return res;
};

const basePayload = {
  transaction_id: '58c0b82d-1d39-4d9a-9d70-6e0c3c7f4a01',
  order_id: 'order-123',
  sale_id: 'sale-456',
  amount: 1000,
  currency: 'usd',
  payment_method_types: ['card'],
};

describe('Stripe international payment intent - Phase 1', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.STRIPE_INTERNATIONAL_ENABLED = 'true';
  });

  it('creates an international payment intent (happy path)', async () => {
    StripePaymentIntentsRepository.findByTransactionId.mockResolvedValue(null);
    mockStripeCreate.mockResolvedValue({
      id: 'pi_123',
      client_secret: 'secret_123',
    });

    const result = await new CreateStripePaymentIntent().execute(basePayload);

    expect(mockStripeCreate).toHaveBeenCalledWith(
      {
        amount: basePayload.amount,
        currency: basePayload.currency,
        metadata: {
          transaction_id: basePayload.transaction_id,
          order_id: basePayload.order_id,
          sale_id: basePayload.sale_id,
          provider: 'stripe',
        },
        payment_method_types: basePayload.payment_method_types,
      },
      {
        idempotencyKey: basePayload.transaction_id,
      },
    );
    expect(StripePaymentIntentsRepository.create).toHaveBeenCalledWith({
      transaction_id: basePayload.transaction_id,
      order_id: basePayload.order_id,
      sale_id: basePayload.sale_id,
      provider: 'stripe',
      provider_payment_intent_id: 'pi_123',
      amount: basePayload.amount,
      currency: basePayload.currency,
      status: 'pending',
    });
    expect(incrementPaymentIntentsCreated).toHaveBeenCalledWith('stripe');
    expect(result).toMatchObject({
      provider: 'stripe',
      provider_payment_intent_id: 'pi_123',
      status: 'pending',
      idempotent: false,
    });
  });

  it('blocks creation when feature flag is disabled', async () => {
    process.env.STRIPE_INTERNATIONAL_ENABLED = 'false';

    const req = { body: basePayload };
    const res = buildRes();
    const next = jest.fn();

    await stripeFeatureFlag(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({
      message: 'Stripe internacional desabilitado',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('reuses existing payment intent for the same transaction_id (idempotency)', async () => {
    StripePaymentIntentsRepository.findByTransactionId.mockResolvedValue({
      provider_payment_intent_id: 'pi_existing',
    });
    mockStripeRetrieve.mockResolvedValue({
      client_secret: 'secret_existing',
    });

    const result = await new CreateStripePaymentIntent().execute(basePayload);

    expect(mockStripeCreate).not.toHaveBeenCalled();
    expect(mockStripeRetrieve).toHaveBeenCalledWith('pi_existing');
    expect(result).toMatchObject({
      provider: 'stripe',
      provider_payment_intent_id: 'pi_existing',
      status: 'pending',
      idempotent: true,
    });
  });

  it('returns 500 when Stripe fails to create the PaymentIntent', async () => {
    StripePaymentIntentsRepository.findByTransactionId.mockResolvedValue(null);
    mockStripeCreate.mockRejectedValue(new Error('Stripe error'));

    const req = { body: basePayload };
    const res = buildRes();

    await createStripePaymentIntentController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: 'Erro ao criar pagamento internacional',
    });
  });

  it('rejects invalid payloads via DTO validation', async () => {
    const req = { body: { ...basePayload, transaction_id: undefined } };
    const res = buildRes();
    const next = jest.fn();
    const middleware = validateDTO(createStripePaymentIntentDTO);

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('does not trigger national (Pagar.me) flow in the international handler', async () => {
    const Pagarme = require('../../services/payment/Pagarme');

    StripePaymentIntentsRepository.findByTransactionId.mockResolvedValue(null);
    mockStripeCreate.mockResolvedValue({
      id: 'pi_123',
      client_secret: 'secret_123',
    });

    const req = { body: basePayload };
    const res = buildRes();

    await createStripePaymentIntentController(req, res);

    expect(Pagarme).not.toHaveBeenCalled();
  });

  it('handles concurrent idempotent requests without duplicating intents', async () => {
    StripePaymentIntentsRepository.findByTransactionId
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        provider_payment_intent_id: 'pi_race',
      });
    mockStripeCreate.mockResolvedValue({
      id: 'pi_race',
      client_secret: 'secret_race',
    });
    mockStripeRetrieve.mockResolvedValue({
      client_secret: 'secret_race',
    });

    const [first, second] = await Promise.all([
      new CreateStripePaymentIntent().execute(basePayload),
      new CreateStripePaymentIntent().execute(basePayload),
    ]);

    expect(mockStripeCreate).toHaveBeenCalledTimes(1);
    expect(mockStripeRetrieve).toHaveBeenCalledTimes(1);
    expect(first.provider_payment_intent_id).toBe('pi_race');
    expect(second.provider_payment_intent_id).toBe('pi_race');
  });

  it('rejects divergent payload for the same transaction_id', async () => {
    const req = {
      body: {
        ...basePayload,
        amount: 'not-a-number',
        currency: 'us',
      },
    };
    const res = buildRes();
    const next = jest.fn();
    const middleware = validateDTO(createStripePaymentIntentDTO);

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks when feature flag toggles off between retries', async () => {
    StripePaymentIntentsRepository.findByTransactionId.mockResolvedValue(null);
    mockStripeCreate.mockResolvedValue({
      id: 'pi_flag',
      client_secret: 'secret_flag',
    });

    const req = { body: basePayload };
    const res = buildRes();
    const next = jest.fn();

    await stripeFeatureFlag(req, res, next);
    expect(next).toHaveBeenCalled();

    process.env.STRIPE_INTERNATIONAL_ENABLED = 'false';

    const res2 = buildRes();
    const next2 = jest.fn();

    await stripeFeatureFlag(req, res2, next2);
    expect(res2.status).toHaveBeenCalledWith(403);
    expect(next2).not.toHaveBeenCalled();
  });

  it('returns 500 when persistence fails after Stripe creation', async () => {
    StripePaymentIntentsRepository.findByTransactionId.mockResolvedValue(null);
    StripePaymentIntentsRepository.create.mockRejectedValue(
      new Error('db failure'),
    );
    mockStripeCreate.mockResolvedValue({
      id: 'pi_persist',
      client_secret: 'secret_persist',
    });

    const req = { body: basePayload };
    const res = buildRes();

    await createStripePaymentIntentController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: 'Erro ao criar pagamento internacional',
    });
  });
});
