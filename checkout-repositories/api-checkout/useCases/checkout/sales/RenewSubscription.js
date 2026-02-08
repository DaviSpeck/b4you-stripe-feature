const { createCharge } = require('../../../database/controllers/charges');
const {
  findSubscriptionRenew,
  updateSubscription,
} = require('../../../database/controllers/subscriptions');
const ApiError = require('../../../error/ApiError');
const { findChargeStatus } = require('../../../status/chargeStatus');
const { DATABASE_DATE_WITHOUT_TIME } = require('../../../types/dateTypes');
const { findRulesTypesByKey } = require('../../../types/integrationRulesTypes');
const { capitalizeName } = require('../../../utils/formatters');
const date = require('../../../utils/helpers/date');
const SQS = require('../../../queues/aws');
const { creditCardBrandParser } = require('../../../utils/card');
const ApprovedPaymentStudentEmail = require('../../membership/approvedPaymentEmails');
const CostCentralRepository = require('../../../repositories/sequelize/CostCentralRepository');
const SalesSettingsRepository = require('../../../repositories/sequelize/SalesSettingsRepository');
const TaxesRepository = require('../../../repositories/sequelize/TaxesRepository');
const SalesFees = require('./SalesFees');
const Sales_items = require('../../../database/models/Sales_items');
const models = require('../../../database/models');
const { createSaleItem } = require('../../../database/controllers/sales_items');
const { cardDataToStore, providerCommissions } = require('./common');
const Sales_items_charges = require('../../../database/models/Sales_items_charges');
const { v4 } = require('../../../utils/helpers/uuid');
const PaymentService = require('../../../services/PaymentService');
const Clients = require('../../../database/models/Clients');
const Affiliates = require('../../../database/models/Affiliates');
const Students = require('../../../database/models/Students');
const Pagarme = require('../../../services/payment/Pagarme');

const chargeResponse = (subscription, charge) => {
  let paymentMethods = {};
  if (charge.payment_method === 'pix') {
    paymentMethods = {
      billet: null,
      pix: {
        amount: charge.price,
        code: charge.pix_code,
        qrcode_url: charge.qrcode_url,
      },
    };
  }

  if (charge.payment_method === 'billet') {
    paymentMethods = {
      pix: null,
      billet: {
        due: charge.due_date,
        line_code: charge.line_code,
        bar_code: charge.billet_code,
        amount: charge.price,
        url: charge.billet_url,
      },
    };
  }
  return {
    subscription_id: subscription.uuid,
    payment_method: charge.payment_method,
    status: findChargeStatus(charge.id_status),
    sale_id: charge.saleItemUuid,
    ...paymentMethods,
  };
};

module.exports = class RenewSubscription {
  #card;

  #payment_method;

  #subscription_id;

  #brand;

  #ip;

  constructor({ payment_method, card, subscription_id, ip }) {
    this.#subscription_id = subscription_id;
    this.#card = card;
    this.#payment_method = payment_method;
    this.#brand = card ? creditCardBrandParser(card.card_number) : null;
    this.#ip = ip;
  }

  async execute() {
    const subscription = await findSubscriptionRenew({
      uuid: this.#subscription_id,
    });
    if (!subscription) throw ApiError.badRequest('Assinatura não encontrada');
    const saleItem = await Sales_items.findOne({
      nest: true,
      where: {
        id_subscription: subscription.id,
        id_status: 1,
      },
      attributes: ['uuid'],
      order: [['id', 'desc']],
      include: [
        {
          association: 'charges',
          where: { id_status: 1 },
        },
      ],
    });

    if (saleItem && !this.#card) {
      return chargeResponse(subscription, {
        ...saleItem.charges[0].toJSON(),
        saleItemUuid: saleItem.uuid,
      });
    }

    const lastSaleItem = await Sales_items.findOne({
      nest: true,
      where: { id_status: 2, id_subscription: subscription.id },
      order: [['id', 'desc']],
      attributes: [
        'id',
        'price_product',
        'price_total',
        'id_product',
        'id_sale',
        'id_offer',
        'id_classroom',
        'customer_paid_interest',
        'credit_card',
        'id_student',
        'shipping_price',
        'quantity',
      ],
      include: [
        {
          association: 'charges',
          order: [['id', 'desc']],
          where: { id_status: 2 },
          attributes: ['installments'],
        },
        {
          association: 'offer',
          attributes: ['shipping_type', 'quantity'],
        },
      ],
    });

    const allDigitalProducts = !![1, 2, 3].includes(
      subscription.product.id_type,
    );

    let id_provider = 4;
    let pagarmeProvider = 'B4YOU_PAGARME_2';
    let user_field_cpf = 'pagarme_recipient_id';
    let user_field_cnpj = 'pagarme_recipient_id_cnpj';
    let user_field_status_cpf = 'verified_pagarme';
    let user_field_status_cnpj = 'verified_company_pagarme';

    if (allDigitalProducts) {
      id_provider = 5;
      pagarmeProvider = 'B4YOU_PAGARME_3';
      user_field_cpf += '_3';
      user_field_cnpj += '_3';
      user_field_status_cpf += '_3';
      user_field_status_cnpj += '_3';
    }

    const paymentProvider = new PaymentService(new Pagarme(pagarmeProvider));

    const [cost, payment] = await new SalesFees(
      CostCentralRepository,
      SalesSettingsRepository,
      TaxesRepository,
    ).calculate({
      id_user: subscription.id_user,
      installments:
        this.#payment_method === 'pix' ? 1 : this.#card.installments,
      student_pays_interest:
        lastSaleItem.price_total > lastSaleItem.price_product,
      brand: this.#brand,
      sales_items: [
        {
          price: subscription.plan.price,
          type: 1,
          subscription_fee: 0,
          shipping_price: Number(lastSaleItem.shipping_price ?? 0),
        },
      ],
      payment_method: this.#payment_method,
      discount: 0,
    });

    const salesItemsToSplit = [
      {
        price: subscription.plan.price,
        type: 1,
        subscription_fee: 0,
        id_offer: lastSaleItem.id_offer,
        product: {
          ...subscription.product.toJSON(),
        },
        ...payment,
        shipping_price: Number(lastSaleItem.shipping_price ?? 0),
      },
    ];

    let affiliate = null;
    if (subscription.id_affiliate) {
      affiliate = await Affiliates.findOne({
        raw: true,
        where: {
          id: subscription.id_affiliate,
        },
      });
    }
    const commissions = await providerCommissions({
      salesItemsToSplit,
      affiliate,
      user_field_status_cnpj,
      user_field_status_cpf,
      user_field_cnpj,
      user_field_cpf,
      product: subscription.product,
      shipping_type: lastSaleItem.offer.get('shipping_type'),
    });

    const student = await Students.findOne({
      raw: true,
      where: { id: lastSaleItem.id_student },
    });

    let client = await Clients.findOne({
      raw: true,
      where: {
        document_number: student.document_number,
        id_provider,
      },
    });
    if (!client) {
      const providerClient = await paymentProvider.createClient(student);
      client = await Clients.create({
        email: student.email,
        document_number: student.document_number,
        address: student.address,
        provider_external_id: providerClient.id,
        id_provider,
      });
    }
    const products = [
      {
        quantity: lastSaleItem.offer.get('quantity') ?? 1,
        description: subscription.product.name,
        code: subscription.product.uuid,
        amount: parseInt((Number(payment.price_total) * 100).toFixed(0), 10),
      },
    ];

    let paymentData;
    const transactionIdentifier = v4();
    if (this.#payment_method === 'card') {
      const [month, year] = this.#card.expiration_date.split('/');
      paymentData = await paymentProvider.generateCardSale(
        {
          products,
          commissions,
          transaction_id: transactionIdentifier,
          price: cost.price,
          statement_descriptor: subscription.product.creditcard_descriptor,
          installments: this.#card.installments,
        },
        {
          provider_external_id: client.provider_external_id,
          ip_client: this.#ip,
        },
        {
          card_number: this.#card.card_number,
          cardholder_name: this.#card.card_holder,
          security_code: this.#card.cvv,
          expiration_month: month,
          expiration_year: year,
        },
      );
    } else {
      paymentData = await paymentProvider.generatePix({
        provider_external_id: client.provider_external_id,
        transaction_id: transactionIdentifier,
        commissions,
        products,
        amount: cost.price,
        ip: this.#ip,
      });
    }

    const {
      status,
      qrcode = null,
      qrcode_url = null,
      provider = null,
      provider_id = null,
    } = paymentData;

    const paid_at = status.label === 'paid' ? date().now() : null;
    let response = null;

    await models.sequelize.transaction(async (t) => {
      const charge = await createCharge(
        {
          uuid: transactionIdentifier,
          id_user: subscription.id_user,
          id_student: subscription.id_student,
          id_status: status.charge,
          id_sale: subscription.id_sale,
          psp_id: paymentData.id,
          payment_method:
            this.#payment_method === 'card'
              ? 'credit_card'
              : this.#payment_method,
          installments:
            this.#payment_method === 'pix' ? 1 : this.#card.installments,
          paid_at,
          pix_code: qrcode,
          qrcode_url,
          provider,
          provider_id,
          card_brand: this.#payment_method === 'card' ? this.#brand : null,
          ...cost,
        },
        t,
      );

      let credit_card = null;
      if (status.label === 'paid') {
        const card = await paymentProvider.createCardToken({
          provider_external_id: client.provider_external_id,
          ...this.#card,
        });
        const { card_number, cvv, expiration_date } = this.#card;
        credit_card = {
          card_token: card.token,
          cvv,
          brand: creditCardBrandParser(card_number),
          last_four_digits: card_number.slice(-4),
          expiration_date,
        };
        const next_charge = date()
          .add(
            subscription.plan.frequency_quantity,
            subscription.plan.payment_frequency,
          )
          .format(DATABASE_DATE_WITHOUT_TIME);

        await updateSubscription(
          { id: subscription.id },
          {
            next_charge,
            next_attempt: null,
            attempt_count: 0,
            renew: false,
            last_notify: null,
            payment_method: this.#payment_method,
            credit_card,
          },
          t,
        );
      }

      const newSaleItem = await createSaleItem(
        {
          id_sale: subscription.id_sale,
          id_product: subscription.product.id,
          is_upsell: false,
          id_status: status.sale,
          id_plan: subscription.id_plan,
          price: payment.price_product,
          id_student: subscription.id_student,
          payment_method: this.#payment_method,
          type: 1,
          credit_card:
            this.#payment_method === 'card'
              ? cardDataToStore(this.#card)
              : null,
          valid_refund_until: null,
          id_affiliate: subscription.id_affiliate,
          paid_at,
          id_offer: lastSaleItem.id_offer,
          id_classroom: lastSaleItem.id_classroom,
          id_subscription: subscription.id,
          ...payment,
        },
        t,
      );

      await Sales_items_charges.create(
        {
          id_sale_item: newSaleItem.id,
          id_charge: charge.id,
        },
        { transaction: t },
      );

      t.afterCommit(async () => {
        await SQS.add('splitCommissions', {
          sale_item_id: newSaleItem.id,
          first_charge: false,
          shipping_type: lastSaleItem.offer.shipping_type,
        });

        await SQS.add('webhookEvent', {
          id_product: subscription.id_product,
          id_sale_item: newSaleItem.id,
          id_user: subscription.id_user,
          id_event: findRulesTypesByKey('renewed-subscription').id,
        });

        await SQS.add('integrations', {
          id_product: subscription.id_product,
          eventName: 'renewedSubscription',
          data: {
            email: subscription.student.email,
            full_name: capitalizeName(subscription.student.email),
            phone: subscription.student.whatsapp,
            sale_uuid: newSaleItem.uuid,
          },
        });

        await new ApprovedPaymentStudentEmail({
          costTransaction: cost,
          currentStudent: subscription.student,
          product: subscription.product,
          saleItem: newSaleItem,
          renew: true,
        }).execute();
      });

      response = {
        ...charge.toJSON(),
        saleItemUuid: newSaleItem.uuid,
        qrcode_url,
      };
    });

    return chargeResponse(subscription, response);
  }
};
