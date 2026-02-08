const { Op } = require('sequelize');
const ApiError = require('../../../error/ApiError');
const FindOffer = require('../offers/FindOffer');
const UpsellStudentEmail = require('../../../services/email/student/saleUpsellOrderBump');
const CreditCard = require('../../../utils/helpers/CreditCard');
const PaymentService = require('../../../services/PaymentService');
const Pagarme = require('../../../services/payment/Pagarme');
const dateHelper = require('../../../utils/helpers/date');
const SQS = require('../../../queues/aws');
const { findRulesTypesByKey } = require('../../../types/integrationRulesTypes');
const { findSaleItem } = require('../../../database/controllers/sales_items');
const {
  createStudentProducts,
} = require('../../../database/controllers/student_products');
const {
  findOneAffiliate,
} = require('../../../database/controllers/affiliates');
const { createCharge } = require('../../../database/controllers/charges');
const { createSaleItem } = require('../../../database/controllers/sales_items');
const { findSalesStatusByKey } = require('../../../status/salesStatus');
const uuid = require('../../../utils/helpers/uuid');
const { calculateRefund, providerCommissions } = require('./common');
const { findSaleItemsType } = require('../../../types/saleItemsTypes');
const { findAffiliateStatusByKey } = require('../../../status/affiliateStatus');
const {
  createSubscription,
} = require('../../../database/controllers/subscriptions');
const CostCentralRepository = require('../../../repositories/sequelize/CostCentralRepository');
const TaxesRepository = require('../../../repositories/sequelize/TaxesRepository');
const SalesSettingsRepository = require('../../../repositories/sequelize/SalesSettingsRepository');
const SalesFees = require('./SalesFees');
const Sales_items_charges = require('../../../database/models/Sales_items_charges');
const Sales_items = require('../../../database/models/Sales_items');
const date = require('../../../utils/helpers/date');
const { DATABASE_DATE } = require('../../../types/dateTypes');
const Sales = require('../../../database/models/Sales');
// const createEvents = require('../../../database/controllers/events');
const Charges = require('../../../database/models/Charges');
const Clients = require('../../../database/models/Clients');
const ProductOffer = require('../../../database/models/Product_offer');

module.exports = class UpsellSale {
  #sale_item_id;

  #offer_id;

  #installments;

  #payment_method;

  #card;

  #plan_id;

  #dbTransaction;

  #ip;

  constructor(
    { offer_id, sale_item_id, installments, payment_method, card, plan_id, ip },
    dbTransaction,
  ) {
    this.#offer_id = offer_id;
    this.#sale_item_id = sale_item_id;
    this.#installments = installments;
    this.#payment_method = payment_method;
    this.#card = card;
    this.#plan_id = plan_id;
    this.#dbTransaction = dbTransaction;
    this.#ip = ip;
  }

  async execute() {
    const offerData = await new FindOffer(this.#offer_id).execute();

    const {
      price,
      offer_product: upsellProduct,
      id_classroom: id_classroom_upsell,
      payment_methods,
      quantity,
      id: id_offer,
      student_pays_interest,
      shipping_type,
    } = offerData;

    const offerWithPlans = await ProductOffer.findOne({
      where: { id: id_offer },
      include: [
        {
          association: 'plans',
        },
      ],
    });

    const plans = offerWithPlans.plans.map(p => p.get({ plain: true }));

    if (!upsellProduct) throw ApiError.badRequest('Upsell não encontrado');

    const saleItemMainProduct = await findSaleItem({
      uuid: this.#sale_item_id,
      id_status: findSalesStatusByKey('paid').id,
    });

    if (!saleItemMainProduct) throw ApiError.badRequest('Venda não encontrada');
    const { student, paid_at } = saleItemMainProduct;

    if (saleItemMainProduct.product.id_user !== upsellProduct.id_user)
      throw ApiError.badRequest('Erro ao processar upsell');

    if (!payment_methods.includes(this.#payment_method))
      throw ApiError.badRequest('Método de pagamento inválido');

    const alreadyPurchaseUpsell = await Sales_items.findOne({
      nest: true,
      attributes: ['id', 'id_status', 'uuid'],
      where: {
        id_sale: saleItemMainProduct.id_sale,
        id_student: student.id,
        id_status: [1, 2],
        id_product: upsellProduct.id,
        type: 2,
        created_at: {
          [Op.between]: [
            date().subtract(1, 'h').format(DATABASE_DATE),
            date().format(DATABASE_DATE),
          ],
        },
      },
      include: [
        {
          association: 'charges',
          attributes: ['pix_code', 'qrcode_url'],
        },
      ],
      order: [['id', 'desc']],
    });

    if (alreadyPurchaseUpsell && alreadyPurchaseUpsell.id_status === 1) {
      return {
        sale_item_id: alreadyPurchaseUpsell.uuid,
        status: 'pending',
        qrcode_url: alreadyPurchaseUpsell.charges[0].qrcode_url,
        qrcode: alreadyPurchaseUpsell.charges[0].pix_code,
      };
    }

    if (alreadyPurchaseUpsell) {
      throw ApiError.badRequest('Upsell já adquirido');
    }

    if (
      saleItemMainProduct.payment_method === 'pix' &&
      this.#payment_method === 'card' &&
      !this.#card &&
      !student.credit_card
    ) {
      throw ApiError.badRequest(
        'Nenhum cartão disponível para processar o upsell',
      );
    }

    let { affiliate } = saleItemMainProduct;

    if (affiliate) {
      affiliate = await findOneAffiliate({
        id_user: affiliate.id_user,
        id_product: upsellProduct.id,
        status: findAffiliateStatusByKey('active').id,
      });
    }
    let usedCard = null;
    let cardInfo = null;

    if (this.#payment_method === 'card') {

      const hasTypedCard = !!this.#card;
      const hasSavedToken = !!student?.credit_card?.card_token;

      if (!hasTypedCard && !hasSavedToken) {
        throw ApiError.badRequest(
          'Para upsell com cartão, é necessário informar o cartão novamente',
        );
      }

      if (this.#card) {
        cardInfo = new CreditCard(this.#card);
        usedCard = {
          brand: cardInfo.psp_brand,
          last_four_digits: cardInfo.last_four_digits,
          card_token: cardInfo.card_token,
        };
      }
      else if (saleItemMainProduct.credit_card) {
        usedCard = {
          brand: saleItemMainProduct.credit_card.brand,
          last_four_digits: saleItemMainProduct.credit_card.last_four,
        };
      }
      else if (student.credit_card) {
        usedCard = student.credit_card;
      }

      if (!usedCard) {
        throw ApiError.badRequest('Nenhum cartão disponível para processar o upsell');
      }

      if (!usedCard.brand) {
        throw ApiError.badRequest(
          'Bandeira do cartão não encontrada para processar o upsell',
        );
      }
    }

    const transactionIdentifier = uuid.v4();
    let price_upsell;
    let selectedPlan = null;

    if (this.#plan_id) {
      selectedPlan = plans.find((p) => p.uuid === this.#plan_id);
      if (!selectedPlan) throw ApiError.badRequest('Plano não encontrado');

      price_upsell =
        selectedPlan.subscription_fee && !selectedPlan.charge_first
          ? 0
          : selectedPlan.price;
    } else {
      price_upsell = price;
    }

    const transactionsToCreate = await new SalesFees(
      CostCentralRepository,
      SalesSettingsRepository,
      TaxesRepository,
    ).calculate({
      id_user: upsellProduct.producer.id,
      installments: this.#installments,
      student_pays_interest,
      brand: this.#payment_method === 'card' ? usedCard.brand : null,
      sales_items: [
        {
          price: price_upsell,
          type: 2,
          subscription_fee:
            selectedPlan && selectedPlan.subscription_fee
              ? selectedPlan.subscription_fee_price
              : 0,
        },
      ],
      payment_method: this.#payment_method,
    });

    const [costTransaction, paymentTransaction] = transactionsToCreate;

    let response = {};

    const products = [
      {
        quantity: 1,
        description: upsellProduct.name,
        code: upsellProduct.uuid,
        amount: parseInt((Number(costTransaction.price) * 100).toFixed(0), 10),
      },
    ];

    const saleItemToCreate = {
      id_sale: saleItemMainProduct.id_sale,
      id_product: upsellProduct.id,
      price: paymentTransaction.price_product,
      is_upsell: true,
      id_student: student.id,
      payment_method: this.#payment_method,
      type: findSaleItemsType(2).id,
      valid_refund_until: calculateRefund(upsellProduct.warranty),
      credit_card: usedCard
        ? {
          brand: usedCard.brand,
          last_four: usedCard.last_four_digits,
        }
        : null,
      id_affiliate: affiliate ? affiliate.id : null,
      quantity,
      id_offer,
      integration_shipping_company:
        saleItemMainProduct.integration_shipping_company,
      product: upsellProduct,
      ...paymentTransaction,
    };

    const lastCharge = await Charges.findOne({
      raw: true,
      attributes: ['provider'],
      where: {
        id_sale: saleItemMainProduct.id_sale,
      },
      order: [['id', 'desc']],
    });

    if (!lastCharge?.provider) {
      throw ApiError.badRequest('last charge provider not found');
    }

    const pagarmeProvider = lastCharge.provider;

    const client = await Clients.findOne({
      raw: true,
      where: {
        id_provider: pagarmeProvider === 'B4YOU_PAGARME_3' ? 5 : 4,
        document_number: student.document_number,
      },
    });

    const providerExternalId =
      student?.credit_card?.provider_external_id ??
      saleItemMainProduct?.credit_card?.provider_external_id ??
      client?.provider_external_id ??
      null;

    if (!providerExternalId) {
      throw ApiError.badRequest(
        'Customer (provider_external_id) não encontrado para upsell',
      );
    }

    let user_field_cpf = 'pagarme_recipient_id';
    let user_field_cnpj = 'pagarme_recipient_id_cnpj';
    let user_field_status_cpf = 'verified_pagarme';
    let user_field_status_cnpj = 'verified_company_pagarme';

    if (pagarmeProvider === 'B4YOU_PAGARME_3') {
      user_field_cpf += '_3';
      user_field_cnpj += '_3';
      user_field_status_cpf += '_3';
      user_field_status_cnpj += '_3';
    }

    const paymentProvider = new PaymentService(new Pagarme(pagarmeProvider));

    const allCommissions = await providerCommissions({
      product: upsellProduct,
      affiliate,
      shipping_type,
      user_field_cpf,
      user_field_cnpj,
      salesItemsToSplit: [saleItemToCreate],
      user_field_status_cpf,
      user_field_status_cnpj,
    });

    const sale = await Sales.findOne({
      raw: true,
      attributes: ['address'],
      where: {
        id: saleItemMainProduct.id_sale,
      },
    });

    if (this.#payment_method === 'pix') {
      response = await paymentProvider.generatePix({
        provider_external_id: providerExternalId,
        ip: this.#ip,
        products,
        transaction_id: transactionIdentifier,
        amount: costTransaction.price,
        commissions: allCommissions,
      });
    } else if (this.#card) {
      const [month, year] = this.#card.expiration_date.split('/');
      response = await paymentProvider.generateCardSale(
        {
          price: costTransaction.price,
          products,
          installments: this.#installments,
          commissions: allCommissions,
          statement_descriptor: upsellProduct.creditcard_descriptor,
          transaction_id: transactionIdentifier,
        },
        {
          provider_external_id: providerExternalId,
          ip_client: this.#ip,
        },
        {
          installments: this.#installments,
          card_number: this.#card.card_number,
          security_code: this.#card.cvv,
          cardholder_name: this.#card.card_holder,
          expiration_month: month,
          expiration_year: year,
        },
        sale.address,
      );
    } else {
      const cardToken = student?.credit_card?.card_token;

      if (!cardToken) {
        throw ApiError.badRequest(
          'Cartão salvo não possui token para pagamento one-click',
        );
      }

      response = await paymentProvider.generateCardSaleWithToken({
        transaction_id: transactionIdentifier,
        statement_descriptor: upsellProduct.creditcard_descriptor,
        price: costTransaction.price,
        commissions: allCommissions,
        installments: this.#installments,
        products,
        provider_external_id: providerExternalId,
        ip_client: this.#ip,
        address: sale.address,
        token: cardToken,
      });
    }
    const {
      id: psp_id,
      status,
      qrcode,
      qrcode_url,
      provider,
      provider_id,
    } = response;

    if (status.label === 'rejected' && this.#payment_method === 'card') {
      return {
        sale_item_id: null,
        status: 'rejected',
        qrcode_url,
        qrcode,
      };
    }

    let subscription = null;
    if (selectedPlan) {
      let subscription_card = null;
      if (this.#card) {
        cardInfo = cardInfo.getFullData();
        const card_token = await paymentProvider.createCardToken({
          card_holder: cardInfo.card_holder,
          cvv: cardInfo.cvv,
          provider_external_id: providerExternalId,
          expiration_date: cardInfo.date.full_date,
          card_number: cardInfo.card_number,
        });
        subscription_card = {
          card_token,
          cvv: cardInfo.cvv,
          brand: cardInfo.brand,
          last_four_digits: cardInfo.card_number.slice(-4),
          expiration_date: cardInfo.date.full_date,
        };
      } else {
        subscription_card = student.credit_card;
      }
      subscription = await createSubscription(
        {
          id_user: upsellProduct.id_user,
          id_student: student.id,
          id_product: upsellProduct.id,
          id_sale: saleItemMainProduct.id_sale,
          active: true,
          id_status: status.subscription,
          id_plan: selectedPlan.id,
          id_affiliate: affiliate ? affiliate.id : null,
          affiliate_commission: affiliate ? affiliate.commission : null,
          next_charge: dateHelper().add(
            selectedPlan.frequency_quantity,
            selectedPlan.payment_frequency,
          ),
          credit_card:
            this.#payment_method === 'card' ? subscription_card : null,
          payment_method: this.#payment_method,
        },
        this.#dbTransaction,
      );
    }

    const saleItem = await createSaleItem(
      {
        id_sale: saleItemMainProduct.id_sale,
        id_product: upsellProduct.id,
        id_plan: selectedPlan ? selectedPlan.id : null,
        price: paymentTransaction.price_product,
        id_subscription: subscription ? subscription.id : null,
        is_upsell: true,
        id_status: status.sale,
        id_student: student.id,
        payment_method: this.#payment_method,
        type: findSaleItemsType(2).id,
        valid_refund_until: calculateRefund(upsellProduct.warranty),
        paid_at: status.label === 'paid' ? dateHelper().now() : null,
        credit_card: usedCard
          ? {
            brand: usedCard.brand,
            last_four: usedCard.last_four_digits,
          }
          : null,
        id_affiliate: affiliate ? affiliate.id : null,
        quantity,
        id_offer,
        src: saleItemMainProduct.src,
        sck: saleItemMainProduct.sck,
        utm_source: saleItemMainProduct.utm_source,
        utm_medium: saleItemMainProduct.utm_medium,
        utm_campaign: saleItemMainProduct.utm_campaign,
        utm_term: saleItemMainProduct.utm_term,
        utm_content: saleItemMainProduct.utm_content,
        ...paymentTransaction,
      },
      this.#dbTransaction,
    );
    const charge = await createCharge(
      {
        uuid: transactionIdentifier,
        id_user: upsellProduct.id_user,
        id_student: student.id,
        id_status: status.charge,
        id_sale: saleItemMainProduct.id_sale,
        paid_at: status.label === 'paid' ? dateHelper().now() : null,
        psp_id,
        payment_method: this.#payment_method === 'card' ? 'credit_card' : 'pix',
        installments: this.#installments,
        ...costTransaction,
        provider,
        provider_id,
        card_brand: this.#payment_method === 'card' ? usedCard.brand : null,
        pix_code: qrcode,
        qrcode_url,
      },
      this.#dbTransaction,
    );

    await Sales_items_charges.create(
      {
        id_sale_item: saleItem.id,
        id_charge: charge.id,
      },
      { transaction: this.#dbTransaction },
    );

    if (
      status.label === 'paid' &&
      upsellProduct.content_delivery === 'membership'
    ) {
      await createStudentProducts(
        {
          id_student: student.id,
          id_product: upsellProduct.id,
          id_classroom: id_classroom_upsell ?? null,
          id_sale_item: saleItem.id,
        },
        this.#dbTransaction,
      );
    }

    if (status.label === 'paid') {
      await new UpsellStudentEmail({
        email: student.email,
        student_name: student.full_name,
        product_name: upsellProduct.name,
        producer_name: upsellProduct.producer.full_name,
        sale_uuid: saleItem.uuid,
        amount: charge.price,
      }).send();

      this.#dbTransaction.afterCommit(async () => {
        await SQS.add('webhookEvent', {
          id_product: upsellProduct.id,
          id_sale_item: saleItem.id,
          id_user: upsellProduct.producer.id,
          id_event: findRulesTypesByKey('approved-payment').id,
        });

        await SQS.add('integrations', {
          id_product: upsellProduct.id,
          eventName: 'approvedPayment',
          data: {
            payment_method: this.#payment_method,
            email: student.email,
            full_name: student.full_name,
            phone: student.whatsapp,
            sale: {
              amount: charge.price,
              created_at: saleItem.created_at,
              document_number: student.document_number,
              paid_at,
              sale_uuid: saleItem.uuid,
              products: [
                {
                  product_name: upsellProduct.name,
                  quantity: 1,
                  price: charge.price,
                },
              ],
            },
          },
        });
      });
      try {
        await SQS.add('blingShipping', {
          sale_id: saleItem.id_sale,
          is_upsell: true,
          is_subscription: upsellProduct.payment_type === 'subscription',
          id_sale_item: saleItem.id,
        });
      } catch (error) {
        // erro silencioso
      }
    }

    this.#dbTransaction.afterCommit(async () => {
      await SQS.add('splitCommissions', {
        sale_item_id: saleItem.id,
      });
      if (this.#payment_method === 'card') {
        await SQS.add('groupSales', {
          id_product: upsellProduct.id,
          id_student: student.id,
          id_sale_item: saleItem.id,
        });
      }
    });

    /// Events

    // try {
    //   /// Create event
    //   const event = {
    //     eventType: 'sale_process',
    //     name: 'upsell',
    //     idOffer: this.#offer_id,
    //     saleItemId: saleItem.uuid,
    //     sessionId: this.eventSessionId,
    //     ip: this.ip,
    //   };
    //   await createEvents(event);
    // } catch (error) {
    //   // console.error('Error creating event', error);
    // }

    return {
      sale_item_id: saleItem.uuid,
      status: status.label,
      qrcode_url,
      qrcode,
    };
  }
};
