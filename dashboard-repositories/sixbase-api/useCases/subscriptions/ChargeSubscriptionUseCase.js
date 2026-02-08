/* eslint-disable no-console */
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const date = require('../../utils/helpers/date');
const SalesFees = require('../checkout/sales/SalesFees');
const CalculateCommissions = require('../common/splits/CalculateCommissionsTransactions');
const Charges = require('../../database/models/Charges');
const Clients = require('../../database/models/Clients');
const Coupons = require('../../database/models/Coupons');
const PagarMe = require('../../services/payments/Pagarme');
const PaymentService = require('../../services/PaymentService');
const Products = require('../../database/models/Products');
const Sales_items = require('../../database/models/Sales_items');
const Sales_items_charges = require('../../database/models/Sales_items_charges');
const Subscriptions = require('../../database/models/Subscriptions');
const SubscriptionsLogs = require('../../database/models/SubscriptionsLogs');
const Users = require('../../database/models/Users');
const SQS = require('../../queues/aws');
const { productPhysicalEvents } = require('./physicalIntegrations');
const CostCentralRepository = require('../../repositories/sequelize/CostCentralRepository');
const SalesSettingsRepository = require('../../repositories/sequelize/SalesSettingsRepository');
const TaxesRepository = require('../../repositories/sequelize/TaxesRepository');

function translatePaymentStatus(status) {
  if (status === 0)
    return {
      label: 'created',
      charge: 1,
      transaction: 1,
      sale: 1,
      subscription: 2,
    };
  if (status === 1)
    return {
      label: 'paid',
      charge: 2,
      transaction: 2,
      sale: 2,
      subscription: 1,
    };
  if (status === 2)
    return {
      label: 'rejected',
      charge: 4,
      transaction: 4,
      sale: 3,
      subscription: 3,
    };
  if (status === 3)
    return {
      label: 'expired',
      charge: 3,
      transaction: 7,
      sale: 7,
      subscription: 3,
    };
  return {
    label: 'refunded',
    charge: 5,
    transaction: 8,
    sale: 4,
    subscription: 5,
  };
}

class ChargeSubscriptionUseCase {
  constructor({
    sequelize = null,
    isManualReprocess = false,
    PAY42_URL = process.env.PAY42_URL,
    PAY42_KEY = process.env.PAY42_KEY,
    CALLBACK_URL = process.env.CALLBACK_URL,
  } = {}) {
    this.sequelize = sequelize || Subscriptions.sequelize;
    this.isManualReprocess = isManualReprocess;
    this.PAY42_URL = PAY42_URL;
    this.PAY42_KEY = PAY42_KEY;
    this.CALLBACK_URL = CALLBACK_URL;
  }

  async execute({ subscription, lastSaleItem, plan }) {
    console.log(
      `[ChargeSubscriptionUseCase] Processando assinatura ${subscription.id}${
        this.isManualReprocess ? ' (REPROCESSAMENTO MANUAL)' : ''
      }`,
    );

    if (!lastSaleItem) {
      throw new Error('lastSaleItem não encontrado');
    }

    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    if (subscription.id_coupon) {
      const found = await Coupons.findOne({
        raw: true,
        where: { id: subscription.id_coupon },
      });
      if (found && found.apply_on_every_charge) {
        console.log('[ChargeSubscriptionUseCase] Cupom recorrente encontrado:', found.coupon);
      }
    }

    const product = await Products.findOne({
      raw: true,
      where: { id: lastSaleItem.id_product },
      attributes: [
        'id',
        'uuid',
        'name',
        'creditcard_descriptor',
        'id_user',
        'content_delivery',
      ],
    });

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    const sale = await this.sequelize.query(
      'select full_name, email, document_number from sales where id = :id_sale',
      { replacements: { id_sale: lastSaleItem.id_sale }, plain: true },
    );

    const affiliate = subscription.id_affiliate
      ? await this.sequelize.query(
          'select * from affiliates where id = :id_affiliate',
          {
            replacements: { id_affiliate: subscription.id_affiliate },
            plain: true,
          },
        )
      : null;

    const { charges } = lastSaleItem;
    const [lastCharge] = charges;

    const transactionsToCreate = await new SalesFees(
      CostCentralRepository,
      SalesSettingsRepository,
      TaxesRepository,
    ).calculate({
      id_user: subscription.id_user,
      brand: subscription.credit_card.brand,
      installments: lastCharge.installments,
      student_pays_interest:
        lastSaleItem.price_total > lastSaleItem.price_product,
      sales_items: [
        {
          price: plan.price,
          type: 1,
          shipping_price: lastSaleItem.shipping_price ?? 0,
        },
      ],
      discount: 0,
      coupon_discount: 0,
      payment_method: 'card',
    });

    console.log(
      '[ChargeSubscriptionUseCase] Transações calculadas:',
      transactionsToCreate,
    );

    const [costTransaction, payment] = transactionsToCreate;
    payment.product = product;
    payment.id_offer = lastSaleItem.id_offer;

    const transaction_id = uuidv4();

    let response;
    if (
      ['B4YOU_PAGARME', 'B4YOU_PAGARME_2', 'B4YOU_PAGARME_3'].includes(
        lastCharge.provider,
      )
    ) {
      response = await this.#processPagarmePayment({
        subscription,
        product,
        costTransaction,
        payment,
        lastSaleItem,
        lastCharge,
        affiliate,
        transaction_id,
      });
    } else {
      response = await this.#processPay42Payment({
        subscription,
        product,
        costTransaction,
        lastCharge,
        transaction_id,
        sale,
      });
    }

    const { status, provider, provider_id } = response;
    const psp_id = 0;

    if (status.label === 'paid') {
      return this.#handlePaymentSuccess({
        subscription,
        lastSaleItem,
        plan,
        product,
        sale,
        costTransaction,
        payment,
        transaction_id,
        status,
        provider,
        provider_id,
        psp_id,
        lastCharge,
      });
    }

    return this.#handlePaymentFailure({
      subscription,
      product,
      sale,
      costTransaction,
      transaction_id,
      status,
      provider,
      provider_id,
    });
  }

  async #processPagarmePayment({
    subscription,
    product,
    costTransaction,
    payment,
    lastSaleItem,
    lastCharge,
    affiliate,
    transaction_id,
  }) {
    const products = [
      {
        quantity: 1,
        description: product.name,
        code: product.uuid,
        amount: parseInt((costTransaction.price * 100).toFixed(0), 10),
      },
    ];

    const commissions = await CalculateCommissions.execute({
      affiliate,
      sale_item: payment,
      shipping_type: lastSaleItem.offer?.shipping_type || 0,
      first_charge: false,
    });

    const users = await Users.findAll({
      raw: true,
      attributes: [
        'verified_company',
        'pagarme_recipient_id',
        'pagarme_recipient_id_cnpj',
        'pagarme_recipient_id_3',
        'pagarme_recipient_id_cnpj_3',
        'verified_pagarme',
        'verified_company_pagarme',
        'verified_pagarme_3',
        'verified_company_pagarme_3',
        'id',
      ],
      where: {
        id: commissions.map((e) => e.id_user),
      },
    });

    let id_provider = 4;
    let pagarmeProvider = 'B4YOU_PAGARME_2';
    let user_field_cpf = 'pagarme_recipient_id';
    let user_field_cnpj = 'pagarme_recipient_id_cnpj';
    let user_field_status_cpf = 'verified_pagarme';
    let user_field_status_cnpj = 'verified_company_pagarme';

    if (lastCharge.provider === 'B4YOU_PAGARME_3') {
      id_provider = 5;
      pagarmeProvider = 'B4YOU_PAGARME_3';
      user_field_cpf += '_3';
      user_field_cnpj += '_3';
      user_field_status_cpf += '_3';
      user_field_status_cnpj += '_3';
    }

    const allCommissions = commissions
      .map((item) => {
        const match = users.find((element) => element.id === item.id_user);
        if (match) {
          let idSeller = null;
          
          if (match[user_field_status_cnpj] === 3) {
            idSeller = match[user_field_cnpj];
          } else if (match[user_field_status_cpf] === 3) {
            idSeller = match[user_field_cpf];
          }

          if (idSeller === null) {
            throw new Error('Recebedor não verificado');
          }
          return {
            is_seller: match.id === product.id_user,
            id_user: item.id_user,
            id_seller: idSeller,
            amount: item.amount,
          };
        }

        return null;
      })
      .filter(Boolean);

    const student = await this.sequelize.query(
      'select id, full_name, email, document_number, address, whatsapp from students where id = :id_student',
      {
        replacements: { id_student: subscription.id_student },
        plain: true,
      },
    );

    let client = await Clients.findOne({
      raw: true,
      where: {
        id_provider,
        document_number: student.document_number,
      },
    });

    const paymentProvider = new PaymentService(new PagarMe(pagarmeProvider));

    if (!client) {
      const providerClient = await paymentProvider.createClient({
        full_name: student.full_name,
        email: student.email,
        document_number: student.document_number,
        whatsapp: student.whatsapp,
      });
      client = await Clients.create({
        email: student.email,
        document_number: student.document_number,
        address: student.address,
        provider_external_id: providerClient.id,
        id_provider,
      });
    }

    try {
      const result = await paymentProvider.generateCardSaleWithToken({
        transaction_id,
        price: costTransaction.price,
        token: subscription.credit_card.card_token,
        products,
        commissions: allCommissions,
        installments: lastCharge.installments,
        provider_external_id: client.provider_external_id,
        statement_descriptor: product.creditcard_descriptor,
      });
      return result;
    } catch (error) {
      console.error(
        '[ChargeSubscriptionUseCase] Erro pagamento Pagarme:',
        error.response || error,
      );
      throw error;
    }
  }

  async #processPay42Payment({
    subscription,
    product,
    costTransaction,
    lastCharge,
    transaction_id,
    sale,
  }) {
    try {
      const body = {
        products: [
          {
            qtd: 1,
            amount: costTransaction.price,
            name: product.name,
            uuid: product.uuid,
          },
        ],
        transaction_id,
        currency: 'BRL',
        amount: costTransaction.price,
        installments: lastCharge.installments,
        name: sale.full_name,
        document_number: sale.document_number,
        document_type: 'CPF',
        email: sale.email,
        card: {
          card_token: subscription.credit_card.card_token,
          security_code: subscription.credit_card.cvv,
        },
        soft_descriptor: product.creditcard_descriptor || '',
        webhook: this.CALLBACK_URL,
        description: product.name.substring(0, 30),
      };

      const { data } = await axios.post(this.PAY42_URL, body, {
        headers: {
          Authorization: this.PAY42_KEY,
        },
      });

      return {
        ...data,
        status: translatePaymentStatus(data.status),
      };
    } catch (error) {
      console.error(
        '[ChargeSubscriptionUseCase] Erro pagamento Pay42:',
        error.response || error,
      );
      throw error;
    }
  }

  async #handlePaymentSuccess({
    subscription,
    lastSaleItem,
    plan,
    product,
    sale,
    costTransaction,
    payment,
    transaction_id,
    status,
    provider,
    provider_id,
    psp_id,
    lastCharge,
  }) {
    const paid_at = date().now();

    const result = await this.sequelize.transaction(async (t) => {
      const charge = await Charges.create(
        {
          uuid: transaction_id,
          id_user: subscription.id_user,
          id_student: subscription.id_student,
          id_status: status.charge,
          id_sale: lastSaleItem.id_sale,
          psp_id,
          payment_method: 'credit_card',
          installments: lastCharge.installments,
          paid_at,
          id_subscription: subscription.id,
          provider,
          provider_id,
          revenue: costTransaction.revenue,
          ...costTransaction,
        },
        { transaction: t },
      );

      const saleItem = await Sales_items.create(
        {
          id_sale: lastSaleItem.id_sale,
          id_product: subscription.id_product,
          price: payment.price_product,
          is_upsell: false,
          id_status: status.sale,
          id_plan: subscription.id_plan,
          id_student: subscription.id_student,
          payment_method: 'card',
          type: 1,
          credit_card: lastSaleItem.credit_card,
          valid_refund_until: null,
          id_affiliate: subscription.id_affiliate,
          paid_at,
          id_offer: lastSaleItem.id_offer,
          id_classroom: lastSaleItem.id_classroom,
          id_subscription: subscription.id,
          ...payment,
        },
        { transaction: t },
      );

      await Sales_items_charges.create(
        {
          id_sale_item: saleItem.id,
          id_charge: charge.id,
        },
        { transaction: t },
      );

      const { frequency_quantity, payment_frequency } = plan;
      const next_charge = date()
        .add(frequency_quantity, payment_frequency)
        .format('YYYY-MM-DD');

      await Subscriptions.update(
        { next_charge, next_attempt: null, attempt_count: 0 },
        { where: { id: subscription.id }, transaction: t },
      );

      if (this.isManualReprocess) {
        await SubscriptionsLogs.create(
          {
            id_subscription: subscription.id,
            action: 'manual_reprocess_success',
            email_type: null,
            email_sent_at: null,
            details: {
              charge_id: charge.id,
              sale_item_id: saleItem.id,
              amount: costTransaction.price,
              next_charge,
            },
          },
          { transaction: t },
        );
      }

      t.afterCommit(async () => {
        try {
          await SQS.add('splitCommissions', {
            sale_item_id: saleItem.id,
            shipping_type: lastSaleItem.offer?.shipping_type || 0,
          });

          await SQS.add('studentApprovedPaymentEmails', {
            product: { name: product.name },
            currentStudent: { full_name: sale.full_name, email: sale.email },
            saleItem,
            costTransaction,
            renew: true,
          });

          await SQS.add('webhookEvent', {
            id_product: subscription.id_product,
            id_sale_item: saleItem.id,
            id_user: subscription.id_user,
            id_event: 10,
          });

          if (product.content_delivery === 'physical') {
            await productPhysicalEvents({
              id_sale: lastSaleItem.id_sale,
              id_user: subscription.id_user,
              id_offer: lastSaleItem.id_offer,
              id_sale_item: [saleItem.id],
            });
          }
        } catch (error) {
          console.error(
            '[ChargeSubscriptionUseCase] Erro ao processar eventos:',
            error,
          );
        }
      });

      return {
        success: true,
        charge,
        saleItem,
        next_charge,
      };
    });

    console.log(
      `[ChargeSubscriptionUseCase] Cobrança aprovada - Subscription ${subscription.id}`,
    );
    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  async #handlePaymentFailure({
    subscription,
    product,
    sale,
    costTransaction,
    transaction_id,
    status,
    provider,
    provider_id,
  }) {
    await SubscriptionsLogs.create({
      id_subscription: subscription.id,
      action: 'manual_reprocess_failed',
      email_type: null,
      email_sent_at: null,
      details: {
        email: sale.email,
        full_name: sale.full_name,
        product_name: product.name,
        amount: costTransaction.price,
        status: status.label,
        provider,
        provider_id,
        transaction_id,
        is_manual_reprocess: true,
      },
    });

    console.log(
      `[ChargeSubscriptionUseCase] Cobrança rejeitada - Status: ${status.label} - Subscription ${subscription.id}`,
    );

    return {
      success: false,
      status: status.label,
      message:
        'Pagamento rejeitado. Verifique os dados do cartão e tente novamente.',
      details: {
        transaction_id,
        provider,
        status: status.label,
      },
    };
  }
}

module.exports = ChargeSubscriptionUseCase;
