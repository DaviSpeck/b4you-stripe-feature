const validateDTO = require('../../middlewares/validate-dto');
const createStripePaymentIntentDTO = require('../../dto/international/createStripePaymentIntent');
const stripeFeatureFlag = require('../../middlewares/stripe-feature-flag');
const readStripeFeatureFlag = require('../../services/feature-flags/read-stripe-feature-flag');
const {
  createStripePaymentIntentController,
} = require('../../controllers/checkout/international');
const CreateStripePaymentIntent = require('../../useCases/checkout/international/CreateStripePaymentIntent');

const StripePaymentIntentsRepository = require('../../repositories/sequelize/StripePaymentIntentsRepository');
const { incrementPaymentIntentsCreated } = require('../../middlewares/prom');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const { findChargeStatusByKey } = require('../../status/chargeStatus');
const {
  findTransactionStatusByKey,
} = require('../../status/transactionStatus');
const SalesItemsCharges = require('../../database/models/Sales_items_charges');

const mockStripeCreate = jest.fn();
const mockStripeRetrieve = jest.fn();
const mockCreateSale = jest.fn();
const mockCreateCharge = jest.fn();
const mockCreateSaleItem = jest.fn();
const mockCreateTransaction = jest.fn();
const mockCreateSalesItemsTransactions = jest.fn();
const mockFindStudentByEmail = jest.fn();
const mockUpdateStudent = jest.fn();
const mockCreateStudentExecute = jest.fn();
const mockSalesFeesCalculate = jest.fn();
const mockTransaction = { afterCommit: jest.fn((cb) => cb()) };

jest.mock(
  'stripe',
  () =>
    jest.fn().mockImplementation(() => ({
      paymentIntents: {
        create: mockStripeCreate,
        retrieve: mockStripeRetrieve,
      },
    })),
  { virtual: true },
);

jest.mock('../../repositories/sequelize/StripePaymentIntentsRepository', () => ({
  create: jest.fn(),
  findByTransactionId: jest.fn(),
}));

jest.mock('../../services/feature-flags/read-stripe-feature-flag', () => jest.fn());
jest.mock('../../middlewares/prom', () => ({
  incrementPaymentIntentsCreated: jest.fn(),
}));

jest.mock('../../services/payment/Pagarme', () => jest.fn());
jest.mock('../../database/controllers/sales', () => ({
  createSale: (...args) => mockCreateSale(...args),
}));
jest.mock('../../database/controllers/charges', () => ({
  createCharge: (...args) => mockCreateCharge(...args),
}));
jest.mock('../../database/controllers/sales_items', () => ({
  createSaleItem: (...args) => mockCreateSaleItem(...args),
}));
jest.mock('../../database/controllers/transactions', () => ({
  createTransaction: (...args) => mockCreateTransaction(...args),
}));
jest.mock('../../database/controllers/sales_items_transactions', () => ({
  createSalesItemsTransactions: (...args) =>
    mockCreateSalesItemsTransactions(...args),
}));
jest.mock('../../database/controllers/students', () => ({
  findStudentByEmail: (...args) => mockFindStudentByEmail(...args),
  updateStudent: (...args) => mockUpdateStudent(...args),
}));
jest.mock('../../useCases/common/students/CreateStudent', () =>
  jest.fn().mockImplementation(() => ({
    execute: mockCreateStudentExecute,
  })),
);
jest.mock('../../useCases/checkout/sales/SalesFees', () =>
  jest.fn().mockImplementation(() => ({
    calculate: mockSalesFeesCalculate,
  })),
);
jest.mock('../../database/models/index', () => ({
  sequelize: {
    transaction: async (cb) => cb(mockTransaction),
  },
}));
jest.mock('../../database/models/Sales_items_charges', () => ({
  create: jest.fn(),
}));

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
  id_user: 99,
  brand: 'visa',
  installments: 1,
  student_pays_interest: false,
  discount: 0,
  coupon: null,
  customer: {
    full_name: 'Jane Doe',
    email: 'jane@example.com',
    whatsapp: '5511999999999',
    document_number: '12345678900',
    address: { street: 'Main St' },
    params: { ip: '127.0.0.1' },
  },
  items: [
    {
      id_product: 10,
      type: 'main',
      price: 100,
      quantity: 1,
      id_offer: 20,
      id_classroom: 30,
      id_affiliate: null,
      subscription_fee: 0,
      shipping_price: 0,
      integration_shipping_company: null,
      is_upsell: false,
      warranty: 7,
    },
  ],
};

describe('Stripe international payment intent - Phase 1', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    readStripeFeatureFlag.mockResolvedValue({ enabled: true, source: 'database', reason: null });
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.STRIPE_INTERNATIONAL_ENABLED = 'true';
    mockFindStudentByEmail.mockResolvedValue(null);
    mockCreateStudentExecute.mockResolvedValue({
      student: { id: 123, status: 'pending' },
    });
    mockCreateSale.mockResolvedValue({ id: 456 });
    mockCreateCharge.mockResolvedValue({ id: 789 });
    mockCreateSaleItem.mockResolvedValue({ id: 321 });
    mockCreateTransaction.mockResolvedValue({ id: 654 });
    mockSalesFeesCalculate.mockResolvedValue([
      { price: 100, psp_cost_fixed_amount: 0, psp_cost_variable_amount: 0 },
      { price_product: 100 },
    ]);
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
    }, mockTransaction);
    expect(incrementPaymentIntentsCreated).toHaveBeenCalledWith('stripe');
    expect(result).toMatchObject({
      provider: 'stripe',
      provider_payment_intent_id: 'pi_123',
      status: 'pending',
      idempotent: false,
    });
  });

  it('blocks creation when feature flag is disabled in database source', async () => {
    process.env.STRIPE_INTERNATIONAL_ENABLED = '';
    readStripeFeatureFlag.mockResolvedValue({ enabled: false, source: 'database', reason: 'stripe_international_disabled' });

    const req = { body: basePayload };
    const res = buildRes();
    const next = jest.fn();

    await stripeFeatureFlag(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({
      message: 'Stripe internacional indisponível',
      reason: 'stripe_international_disabled',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks creation with fail-safe when feature flag response is inconsistent', async () => {
    readStripeFeatureFlag.mockResolvedValue({ enabled: false, source: 'fail-safe', reason: 'flag_inconsistent' });

    const req = { body: basePayload };
    const res = buildRes();
    const next = jest.fn();

    await stripeFeatureFlag(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({
      message: 'Stripe internacional indisponível',
      reason: 'flag_inconsistent',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks creation with fail-safe when backoffice is unavailable', async () => {
    readStripeFeatureFlag.mockResolvedValue({ enabled: false, source: 'fail-safe', reason: 'backoffice_unavailable' });

    const req = { body: basePayload };
    const res = buildRes();
    const next = jest.fn();

    await stripeFeatureFlag(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({
      message: 'Stripe internacional indisponível',
      reason: 'backoffice_unavailable',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks creation when env and backoffice flags are inconsistent', async () => {
    process.env.STRIPE_INTERNATIONAL_ENABLED = 'false';
    readStripeFeatureFlag.mockResolvedValue({ enabled: true, source: 'database', reason: null });

    const req = { body: basePayload };
    const res = buildRes();
    const next = jest.fn();

    await stripeFeatureFlag(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({
      message: 'Stripe internacional indisponível',
      reason: 'flag_inconsistent',
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
    expect(mockCreateSale).not.toHaveBeenCalled();
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

  it('creates sale, charge, sale items and transactions with pending status', async () => {
    StripePaymentIntentsRepository.findByTransactionId.mockResolvedValue(null);
    mockStripeCreate.mockResolvedValue({
      id: 'pi_123',
      client_secret: 'secret_123',
    });

    await new CreateStripePaymentIntent().execute(basePayload);

    const pendingSaleStatus = findSalesStatusByKey('pending').id;
    const pendingChargeStatus = findChargeStatusByKey('pending').id;
    const pendingTransactionStatus = findTransactionStatusByKey('pending').id;

    expect(mockCreateSale).toHaveBeenCalledWith(
      expect.objectContaining({
        id_student: 123,
        id_user: basePayload.id_user,
      }),
      mockTransaction,
    );
    expect(mockCreateCharge).toHaveBeenCalledWith(
      expect.objectContaining({
        id_user: basePayload.id_user,
        id_status: pendingChargeStatus,
        provider: 'stripe',
        provider_id: 'pi_123',
        payment_method: 'credit_card',
      }),
      mockTransaction,
    );
    expect(mockCreateSaleItem).toHaveBeenCalledWith(
      expect.objectContaining({
        id_product: basePayload.items[0].id_product,
        id_status: pendingSaleStatus,
        payment_method: 'card',
      }),
      mockTransaction,
    );
    expect(mockCreateTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        id_status: pendingTransactionStatus,
      }),
      mockTransaction,
    );
    expect(mockCreateSalesItemsTransactions).toHaveBeenCalled();
    expect(SalesItemsCharges.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_charge: 789,
        id_sale_item: 321,
      }),
      expect.any(Object),
    );
  });

  it('creates relationships correctly for multiple items', async () => {
    const multiPayload = {
      ...basePayload,
      items: [
        {
          id_product: 10,
          type: 'main',
          price: 100,
          quantity: 1,
          id_offer: 20,
          id_classroom: 30,
          id_affiliate: null,
          subscription_fee: 0,
          shipping_price: 0,
          integration_shipping_company: null,
          is_upsell: false,
          warranty: 7,
        },
        {
          id_product: 11,
          type: 'upsell',
          price: 50,
          quantity: 1,
          id_offer: 21,
          id_classroom: null,
          id_affiliate: 42,
          subscription_fee: 0,
          shipping_price: 0,
          integration_shipping_company: null,
          is_upsell: true,
          warranty: 7,
        },
      ],
    };

    mockCreateSaleItem
      .mockResolvedValueOnce({ id: 1001 })
      .mockResolvedValueOnce({ id: 1002 });
    mockCreateTransaction
      .mockResolvedValueOnce({ id: 500 }) // cost transaction
      .mockResolvedValueOnce({ id: 601 }) // payment transaction item 1
      .mockResolvedValueOnce({ id: 602 }); // payment transaction item 2
    mockSalesFeesCalculate.mockResolvedValue([
      { price: 150, psp_cost_fixed_amount: 0, psp_cost_variable_amount: 0 },
      { price_product: 100 },
      { price_product: 50 },
    ]);
    StripePaymentIntentsRepository.findByTransactionId.mockResolvedValue(null);
    mockStripeCreate.mockResolvedValue({
      id: 'pi_123',
      client_secret: 'secret_123',
    });

    await new CreateStripePaymentIntent().execute(multiPayload);

    expect(mockCreateSaleItem).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ id_product: 10 }),
      mockTransaction,
    );
    expect(mockCreateSaleItem).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ id_product: 11 }),
      mockTransaction,
    );
    expect(SalesItemsCharges.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ id_charge: 789, id_sale_item: 1001 }),
      expect.any(Object),
    );
    expect(SalesItemsCharges.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ id_charge: 789, id_sale_item: 1002 }),
      expect.any(Object),
    );
    expect(mockCreateSalesItemsTransactions).toHaveBeenCalledWith(
      { id_transaction: 500, id_sale_item: 1001 },
      mockTransaction,
    );
    expect(mockCreateSalesItemsTransactions).toHaveBeenCalledWith(
      { id_transaction: 601, id_sale_item: 1001 },
      mockTransaction,
    );
    expect(mockCreateSalesItemsTransactions).toHaveBeenCalledWith(
      { id_transaction: 500, id_sale_item: 1002 },
      mockTransaction,
    );
    expect(mockCreateSalesItemsTransactions).toHaveBeenCalledWith(
      { id_transaction: 602, id_sale_item: 1002 },
      mockTransaction,
    );
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
