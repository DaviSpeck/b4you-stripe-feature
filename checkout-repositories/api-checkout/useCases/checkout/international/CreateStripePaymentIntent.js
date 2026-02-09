const StripeService = require('../../../services/payment/Stripe');
const StripePaymentIntentsRepository = require('../../../repositories/sequelize/StripePaymentIntentsRepository');
const { createSale } = require('../../../database/controllers/sales');
const { createCharge } = require('../../../database/controllers/charges');
const { createSaleItem } = require('../../../database/controllers/sales_items');
const { createTransaction } = require('../../../database/controllers/transactions');
const {
  createSalesItemsTransactions,
} = require('../../../database/controllers/sales_items_transactions');
const {
  findStudentByEmail,
  updateStudent,
} = require('../../../database/controllers/students');
const SalesItemsCharges = require('../../../database/models/Sales_items_charges');
const CreateStudent = require('../../common/students/CreateStudent');
const SalesFees = require('../sales/SalesFees');
const CostCentralRepository = require('../../../repositories/sequelize/CostCentralRepository');
const SalesSettingsRepository = require('../../../repositories/sequelize/SalesSettingsRepository');
const TaxesRepository = require('../../../repositories/sequelize/TaxesRepository');
const { findSalesStatusByKey } = require('../../../status/salesStatus');
const { findChargeStatusByKey } = require('../../../status/chargeStatus');
const {
  findTransactionStatusByKey,
} = require('../../../status/transactionStatus');
const { findTransactionTypeByKey } = require('../../../types/transactionTypes');
const {
  findSaleItemsType,
  findSaleItemsTypeByKey,
} = require('../../../types/saleItemsTypes');
const { calculateRefund } = require('../sales/common');
const uuid = require('../../../utils/helpers/uuid');
const logger = require('../../../utils/logger');
const { incrementPaymentIntentsCreated } = require('../../../middlewares/prom');
const models = require('../../../database/models/index');

const resolveSaleItemType = (type) => {
  if (typeof type === 'string') {
    return findSaleItemsTypeByKey(type);
  }
  return findSaleItemsType(type);
};

module.exports = class CreateStripePaymentIntent {
  #stripeService;

  constructor() {
    this.#stripeService = new StripeService();
  }

  async execute({
    transaction_id,
    order_id,
    sale_id,
    amount,
    currency,
    payment_method_types,
    id_user,
    customer,
    items,
    brand,
    installments = 1,
    student_pays_interest = false,
    discount = 0,
    coupon = null,
  }) {
    const provider = 'stripe';
    const existing = await StripePaymentIntentsRepository.findByTransactionId(
      transaction_id,
    );

    if (existing) {
      const paymentIntent = await this.#stripeService.retrievePaymentIntent(
        existing.provider_payment_intent_id,
      );
      logger.info(
        JSON.stringify({
          message: 'stripe_payment_intent_reused',
          transaction_id,
          order_id,
          sale_id,
          provider,
          provider_payment_intent_id: existing.provider_payment_intent_id,
        }),
      );
      return {
        transaction_id,
        order_id,
        sale_id,
        provider,
        provider_payment_intent_id: existing.provider_payment_intent_id,
        client_secret: paymentIntent.client_secret,
        status: 'pending',
        idempotent: true,
      };
    }

    const metadata = {
      transaction_id,
      order_id,
      sale_id,
      provider,
    };

    const paymentIntent = await this.#stripeService.createPaymentIntent(
      {
        amount,
        currency,
        metadata,
        payment_method_types,
      },
      transaction_id,
    );

    const [pendingSaleStatus, pendingChargeStatus, pendingTransactionStatus] = [
      findSalesStatusByKey('pending'),
      findChargeStatusByKey('pending'),
      findTransactionStatusByKey('pending'),
    ];

    const salesItemsForFees = items.map((item) => {
      const saleItemType = resolveSaleItemType(item.type);
      if (!saleItemType) {
        throw new Error('Tipo de item de venda inválido');
      }
      return {
        price: item.price,
        type: saleItemType.id,
        subscription_fee: item.subscription_fee || 0,
        shipping_price: item.shipping_price || 0,
      };
    });

    const [costTransaction, ...transactions] = await new SalesFees(
      CostCentralRepository,
      SalesSettingsRepository,
      TaxesRepository,
    ).calculate({
      id_user,
      brand,
      installments,
      student_pays_interest,
      sales_items: salesItemsForFees,
      discount,
      payment_method: 'card',
      coupon,
      document_number: customer.document_number,
    });

    await models.sequelize.transaction(async (t) => {
      const {
        full_name,
        whatsapp,
        document_number,
        email,
        address,
        params,
      } = customer;
      let currentStudent = await findStudentByEmail(email, t);
      if (!currentStudent) {
        const { student } = await new CreateStudent(
          {
            full_name,
            email,
            whatsapp,
            document_number,
            address,
            params,
          },
          t,
        ).execute();
        currentStudent = { ...student, status: 'pending' };
      } else {
        await updateStudent(
          currentStudent.id,
          {
            full_name,
            email,
            whatsapp,
            document_number,
            address,
            params,
          },
          t,
        );
      }

      const sale = await createSale(
        {
          id_student: currentStudent.id,
          id_user,
          params,
          address,
          full_name,
          email,
          whatsapp,
          document_number,
        },
        t,
      );

      const charge = await createCharge(
        {
          uuid: transaction_id,
          id_user,
          id_student: currentStudent.id,
          id_status: pendingChargeStatus.id,
          id_sale: sale.id,
          psp_id: 0,
          payment_method: 'credit_card',
          installments,
          provider,
          provider_id: paymentIntent.id,
          price: costTransaction.price,
          ...costTransaction,
        },
        t,
      );

      const costTransactionRecord = await createTransaction(
        {
          ...costTransaction,
          uuid: transaction_id,
          method: 'card',
          psp_id: 0,
          id_user,
          id_type: findTransactionTypeByKey('cost').id,
          id_status: pendingTransactionStatus.id,
          id_charge: charge.id,
          card_brand: brand,
        },
        t,
      );

      for await (const [index, transactionData] of transactions.entries()) {
        const item = items[index];
        const saleItemType = resolveSaleItemType(item.type);
        if (!saleItemType) {
          throw new Error('Tipo de item de venda inválido');
        }
        const saleItem = await createSaleItem(
          {
            id_sale: sale.id,
            id_product: item.id_product,
            price: transactionData.price_product,
            id_status: pendingSaleStatus.id,
            id_student: currentStudent.id,
            payment_method: 'card',
            type: saleItemType.id,
            quantity: item.quantity || 1,
            id_offer: item.id_offer ?? null,
            id_classroom: item.id_classroom ?? null,
            id_affiliate: item.id_affiliate ?? null,
            is_upsell: item.is_upsell ?? false,
            subscription_fee: item.subscription_fee || 0,
            shipping_price: item.shipping_price || 0,
            valid_refund_until: item.warranty
              ? calculateRefund(item.warranty)
              : null,
            integration_shipping_company:
              item.integration_shipping_company ?? null,
            ...transactionData,
          },
          t,
        );

        await SalesItemsCharges.create(
          {
            id_charge: charge.id,
            id_sale_item: saleItem.id,
          },
          { transaction: t },
        );

        const paymentTransaction = await createTransaction(
          {
            ...transactionData,
            uuid: uuid.v4(),
            method: 'card',
            psp_id: 0,
            id_user,
            id_type: findTransactionTypeByKey('payment').id,
            id_status: pendingTransactionStatus.id,
            id_charge: charge.id,
            card_brand: brand,
          },
          t,
        );

        await createSalesItemsTransactions(
          {
            id_transaction: costTransactionRecord.id,
            id_sale_item: saleItem.id,
          },
          t,
        );

        await createSalesItemsTransactions(
          {
            id_transaction: paymentTransaction.id,
            id_sale_item: saleItem.id,
          },
          t,
        );
      }

      await StripePaymentIntentsRepository.create(
        {
          transaction_id,
          order_id,
          sale_id,
          provider,
          provider_payment_intent_id: paymentIntent.id,
          amount,
          currency,
          status: 'pending',
        },
        t,
      );
    });

    incrementPaymentIntentsCreated(provider);

    logger.info(
      JSON.stringify({
        message: 'stripe_payment_intent_created',
        transaction_id,
        order_id,
        sale_id,
        provider,
        provider_payment_intent_id: paymentIntent.id,
      }),
    );

    return {
      transaction_id,
      order_id,
      sale_id,
      provider,
      provider_payment_intent_id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      status: 'pending',
      idempotent: false,
    };
  }
};
