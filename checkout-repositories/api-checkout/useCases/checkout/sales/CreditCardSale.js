const ApiError = require('../../../error/ApiError');
const CreateStudent = require('../../common/students/CreateStudent');
const FindAffiliate = require('../affiliates/FindAffiliate');
const FindOffer = require('../offers/FindOffer');
const dateHelper = require('../../../utils/helpers/date');
const SQS = require('../../../queues/aws');
const { creditCardBrandParser } = require('../../../utils/card');
const {
  calculateRefund,
  cardDataToStore,
  resolveUpsellURL,
  providerCommissions,
  findCoupon,
  resolveShippingPrice,
  ensureCouponOfferAllowed,
} = require('./common');
const Plugins = require('../../../database/models/Plugins');
const { createCharge } = require('../../../database/controllers/charges');
const { createSale } = require('../../../database/controllers/sales');
const { createSaleItem } = require('../../../database/controllers/sales_items');
const {
  findStudentByEmail,
  updateStudent,
} = require('../../../database/controllers/students');
const {
  createStudentProducts,
} = require('../../../database/controllers/student_products');
const { findSaleItemsType } = require('../../../types/saleItemsTypes');
const { SUBSCRIPTION } = require('../../../types/productTypes');
const { findStatus } = require('../../../status/salesStatus');
const { findRulesTypesByKey } = require('../../../types/integrationRulesTypes');
const { deleteCart } = require('../../../database/controllers/cart');
const {
  createCouponSale,
} = require('../../../database/controllers/coupons_sales');
const CostCentralRepository = require('../../../repositories/sequelize/CostCentralRepository');
const TaxesRepository = require('../../../repositories/sequelize/TaxesRepository');
const SalesSettingsRepository = require('../../../repositories/sequelize/SalesSettingsRepository');
const SalesFees = require('./SalesFees');
const SalesItemsCharges = require('../../../database/models/Sales_items_charges');
const models = require('../../../database/models');
const Clients = require('../../../database/models/Clients');
const PaymentService = require('../../../services/PaymentService');
const Pagarme = require('../../../services/payment/Pagarme');
const { v4 } = require('../../../utils/helpers/uuid');
const CouponsUse = require('../../../database/models/CouponsUse');
const Affiliates = require('../../../database/models/Affiliates');

const { verifyRegionByZipcode } = require('../../../utils/findZipcodeRegion');
const Konduto = require('../../../services/antifraud/Konduto');
const {
  createSubscription,
} = require('../../../database/controllers/subscriptions');
const { resolveValidIPv4 } = require('../../../utils/resolveValidIPV4');
const {
  recordEcommerceSaleIfApplicable,
} = require('../../../database/controllers/shopify_catalog');

/**
 * Finds a plan by its UUID
 * @param {Array<Object>} plans - Array of plan objects
 * @param {string} plan_id - UUID of the plan to find
 * @returns {Object|undefined} The found plan or undefined
 */
const findPlan = (plans, plan_id) => plans.find((p) => p.uuid === plan_id);

/**
 * Checks if a product is a subscription product
 * @param {Object} product - Product object
 * @returns {boolean} True if product is a subscription
 */
const isSubscriptionProduct = (product) =>
  product.payment_type === SUBSCRIPTION;

/**
 * Checks if a payment method is not allowed
 * @param {string} payment_methods - Comma-separated string of allowed payment methods
 * @param {string} paymentMethod - Payment method to check
 * @returns {boolean} True if payment method is not allowed
 */
const paymentMethodNotAllowd = (payment_methods, paymentMethod) =>
  !payment_methods.split(',').includes(paymentMethod);

const FREENET_PLUGIN = 21;

async function tokenizeCardIfPaid({
  status,
  cards,
  paymentProvider,
  client,
  personalData,
}) {
  if (status.label !== 'paid') return null;

  try {
    const cardToTokenize = cards[0];

    const card = await paymentProvider.createCardToken({
      provider_external_id: client.provider_external_id,
      ...cardToTokenize,
    });

    return {
      card_token: card.token,
      brand: creditCardBrandParser(cardToTokenize.card_number),
      last_four_digits: cardToTokenize.card_number.slice(-4),
      provider_external_id: client.provider_external_id,
    };
  } catch (error) {
    console.log(`error on create card token ${personalData.email}`, error);
    return null;
  }
}

/**
 * Handles credit card sales processing, including single and multi-card payments
 * Supports order bumps, coupons, affiliates, and upsell tokenization
 * @class CreditCardSale
 */
module.exports = class CreditCardSale {
  /**
   * Creates an instance of CreditCardSale
   * @param {Object} saleData - Sale configuration data
   * @param {string} saleData.offer_id - UUID of the offer
   * @param {Array<Object>} saleData.cards - Array of card objects for payment
   * @param {Array<Object>} [saleData.order_bumps] - Array of order bump offers
   * @param {string} [saleData.cookie] - Cookie identifier for affiliate tracking
   * @param {string} [saleData.ip='Não obtido'] - Client IP address
   * @param {string} [saleData.agent='Não obtido'] - User agent string
   * @param {string|null} [saleData.visitor_id=null] - Visitor identifier
   * @param {string|null} [saleData.coupon=null] - Coupon code
   * @param {string|null} [saleData.session_id=null] - Session identifier
   * @param {string|null} [saleData.eventSessionId=null] - Event session identifier
   * @param {string|null} [saleData.b4f] - B4F identifier
   * @param {number|null} [saleData.integration_shipping_price] - External shipping price
   * @param {string|null} [saleData.integration_shipping_company] - External shipping company
   * @param {Object} personalData - Customer personal information
   * @param {string} personalData.full_name - Customer full name
   * @param {string} personalData.email - Customer email
   * @param {string} personalData.document_number - Customer CPF/CNPJ
   * @param {string} personalData.whatsapp - Customer WhatsApp number
   * @param {Object} [personalData.address] - Customer address object
   * @throws {ApiError} If no cards are provided
   */
  constructor(
    {
      offer_id,
      cards,
      order_bumps,
      cookie,
      ip = 'Não obtido',
      agent = 'Não obtido',
      visitor_id = null,
      coupon = null,
      session_id = null,
      eventSessionId = null,
      b4f,
      integration_shipping_price,
      integration_shipping_company,
    },
    personalData,
  ) {
    this.offer_id = offer_id;
    this.cards = Array.isArray(cards) ? cards.filter(Boolean) : [];
    this.personalData = personalData;
    this.order_bumps = Array.isArray(order_bumps) ? order_bumps : [];
    this.cookie = cookie;
    this.ip = resolveValidIPv4(ip);
    this.agent = agent;
    this.coupon = coupon;
    this.session_id = session_id;
    this.eventSessionId = eventSessionId;
    this.b4f = b4f;
    this.integration_shipping_price = integration_shipping_price;
    this.integration_shipping_company = integration_shipping_company;
    this.visitor_id = visitor_id;

    if (this.cards.length === 0) {
      throw ApiError.badRequest('Necessário informar pelo menos um cartão');
    }

    this.cards = this.cards.map((card) => ({
      ...card,
      installments: card.installments ?? 1,
      amount:
        card.amount !== undefined && card.amount !== null
          ? Number(card.amount)
          : null,
      brand: creditCardBrandParser(card.card_number),
    }));

    if (this.cards.length > 1 && this.order_bumps.length > 0) {
      this.order_bumps = [];
    }

    [this.primaryCard] = this.cards;
    this.brand = this.primaryCard.brand;
    this.installments = this.primaryCard.installments ?? 1;
  }

  /**
   * Executes the credit card sale process
   * Handles offer validation, fee calculation, payment processing, and database operations
   * Supports single and multi-card payments with individual installment plans
   * @returns {Promise<Object>} Sale result object containing payment data, status, and URLs
   * @returns {string} returns.status - Sale status ('paid', 'rejected', 'pending')
   * @returns {string|null} returns.upsell_url - URL for upsell page if available
   * @returns {Object|null} returns.qrcode - QR code data for pending payments
   * @returns {string|null} returns.qrcode_url - QR code URL for pending payments
   * @throws {ApiError} If offer doesn't allow two cards and multiple cards are provided
   * @throws {ApiError} If card amounts don't match offer price
   * @throws {ApiError} If payment processing fails
   */
  async execute() {
    const {
      id: id_offer,
      price,
      offer_product: product,
      order_bumps,
      id_classroom,
      thankyou_page_upsell,
      thankyou_page_card,
      discount_card,
      payment_methods,
      student_pays_interest,
      require_address,
      shipping_price,
      shipping_type,
      quantity,
      allow_affiliate,
      allow_shipping_region,
      shipping_price_no,
      shipping_price_ne,
      shipping_price_co,
      shipping_price_so,
      shipping_price_su,
      enable_two_cards_payment,
    } = await new FindOffer(this.offer_id).execute();

    const twoCardsAllowed = Boolean(enable_two_cards_payment);

    if (this.cards.length > 1 && !twoCardsAllowed) {
      throw ApiError.badRequest('Oferta não aceita pagamento com dois cartões');
    }

    let hasFreenet = false;
    if (
      (this.integration_shipping_price &&
        this.integration_shipping_price > 0) ||
      this.integration_shipping_company
    ) {
      const plugin = await Plugins.findOne({
        where: {
          id_user: product.id_user,
          active: true,
          id_plugin: FREENET_PLUGIN,
        },
      });
      if (plugin) hasFreenet = true;
    }
    if (isSubscriptionProduct(product)) {
      throw ApiError.badRequest('Esse local não é para planos de assinatura.');
    }

    if (paymentMethodNotAllowd(payment_methods, 'credit_card')) {
      throw ApiError.badRequest('Forma de pagamento não permitida.');
    }

    if (!this.personalData) {
      throw ApiError.badRequest(
        'Você deve enviar as informações do cliente primeiro',
      );
    }

    const selectedOrderBumps = [];

    this.order_bumps.forEach((order) => {
      const selectedOrderBump = order_bumps.find((ob) => ob.uuid === order);

      if (selectedOrderBump) {
        const existsOb = selectedOrderBumps.filter(
          (ob) => ob.uuid === selectedOrderBump.uuid,
        );

        if (existsOb.length === selectedOrderBump.max_quantity) {
          throw ApiError.badRequest('Limite de order bump atingido');
        }

        selectedOrderBumps.push(selectedOrderBump);
      }
    });

    let saleAddress = {};
    if (
      (require_address ||
        [4, 5].includes(product.id_type) ||
        selectedOrderBumps.some((ob) =>
          [4, 5].includes(ob.offer.offer_product.id_type),
        )) &&
      this.offer_id !== 'xs8-eRzwvK' &&
      this.offer_id !== 'wnvjZIyykx'
    ) {
      const { address = {} } = this.personalData;
      if (Object.keys(address).length === 0) {
        throw ApiError.badRequest('Necessário enviar o endereço');
      }
      const requiredFields = [
        'zipcode',
        'street',
        'number',
        'neighborhood',
        'city',
        'state',
      ];
      const errorMesessage = {
        zipcode: 'CEP',
        street: 'Rua',
        number: 'Número',
        neighborhood: 'Bairro',
        city: 'Cidade',
        state: 'Estado',
      };
      for (const field of requiredFields) {
        if (!address[field]) {
          throw ApiError.badRequest(
            `Campo ${errorMesessage[field]} faltando no endereço`,
          );
        }
      }
      saleAddress = {
        ...address,
      };
    }

    let coupon = await findCoupon({
      couponCode: this.coupon,
      id_product: product.id,
      payment_method: 'card',
    });

    let affiliate = null;
    if (allow_affiliate) {
      const searchByCoupon =
        coupon &&
        coupon.id_affiliate &&
        (!this.cookie || coupon.override_cookie);
      if (searchByCoupon) {
        affiliate = await Affiliates.findOne({
          raw: true,
          attributes: ['id', 'id_user'],
          where: {
            id: coupon.id_affiliate,
            id_product: product.id,
            status: 2,
          },
        });
      } else {
        affiliate = await new FindAffiliate({
          sixid: this.cookie,
          id_offer,
          affiliate_settings: product.affiliate_settings,
          id_product: product.id,
          b4f: this.b4f,
        }).execute();
      }
    }
    const allowedOrderBumps = [];

    for (const orderBump of selectedOrderBumps) {
      allowedOrderBumps.push(orderBump);
    }

    let shipping_region_price = 0;

    if (allow_shipping_region === 1) {
      const cepRegion = verifyRegionByZipcode(
        this.personalData.address.zipcode,
      );
      switch (cepRegion) {
        case 'NO':
          shipping_region_price = shipping_price_no;
          break;
        case 'NE':
          shipping_region_price = shipping_price_ne;
          break;
        case 'CO':
          shipping_region_price = shipping_price_co;
          break;
        case 'SE':
          shipping_region_price = shipping_price_so;
          break;
        case 'SU':
          shipping_region_price = shipping_price_su;
          break;
        default:
          break;
      }
    }
    const shipping_price_sale = resolveShippingPrice({
      shipping_type,
      integration_shipping_price: this.integration_shipping_price,
      shipping_region_price,
      shipping_price,
      has_freenet: hasFreenet,
    });
    const salesItemsToCreate = [
      {
        price,
        integration_shipping_company: this.integration_shipping_company,
        shipping_price: shipping_price_sale,
        type: 1,
        product,
        id_classroom,
        quantity,
        id_offer,
      },
    ];

    const subscriptionOrderBumps = allowedOrderBumps.filter(
      (ob) => ob.offer.offer_product.payment_type === 'subscription',
    );

    const nonSubscriptionOrderBumps = allowedOrderBumps.filter(
      (ob) => ob.offer.offer_product.payment_type !== 'subscription',
    );

    nonSubscriptionOrderBumps.forEach((ob) => {
      salesItemsToCreate.push({
        price: ob.offer.price,
        type: 3,
        product: ob.offer.offer_product,
        id_classroom: ob.offer.id_classroom,
        shipping_price: 0,
        quantity: ob.offer.quantity,
        id_offer: ob.offer.id,
        id_user: ob.offer.id_user,
        metadata_ob: ob.offer.metadata,
        integration_shipping_company: this.integration_shipping_company,
      });
    });

    subscriptionOrderBumps.forEach(async (ob) => {
      const selectedPlan = findPlan(ob.offer.plans, ob.order_bump_plan);

      salesItemsToCreate.push({
        price:
          selectedPlan.subscription_fee && !selectedPlan.charge_first
            ? 0
            : selectedPlan.price,
        type: 3,
        subscription_fee: selectedPlan.subscription_fee
          ? selectedPlan.subscription_fee_price
          : 0,
        shipping_price: 0,
        product: ob.offer.offer_product,
        id_classroom: ob.offer.id_classroom,
        id_offer: ob.offer.id,
      });
    });

    coupon = ensureCouponOfferAllowed(coupon, id_offer);

    const allDigitalProducts = salesItemsToCreate.every((s) =>
      [1, 2, 3].includes(s.product.id_type),
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

    const cardsWithAmounts = this.cards.map((card) => ({
      ...card,
      installments: card.installments ?? this.installments,
      amount:
        card.amount !== null && card.amount !== undefined
          ? Number(Number(card.amount).toFixed(2))
          : null,
    }));

    const transactionsToCreateForSaleItem = await new SalesFees(
      CostCentralRepository,
      SalesSettingsRepository,
      TaxesRepository,
    ).calculate({
      id_user: product.id_user,
      brand: this.brand,
      installments: this.installments,
      student_pays_interest,
      sales_items: salesItemsToCreate,
      discount: discount_card,
      payment_method: 'card',
      coupon,
      document_number: this.personalData.document_number,
    });
    const [costTransactionForSaleItem, ...transactions] =
      transactionsToCreateForSaleItem;

    const baseOfferAmount = transactions.reduce((sum, item) => {
      const itemPrice = Number(item.price_base || 0);
      return Number((sum + itemPrice).toFixed(2));
    }, 0);

    let totalSaleAmount = Number(
      Number(costTransactionForSaleItem.price).toFixed(2),
    );

    let definedAmountsSum = 0;
    const cardsMissingAmount = [];

    cardsWithAmounts.forEach((card, index) => {
      if (card.amount === null) {
        cardsMissingAmount.push(index);
      } else {
        if (card.amount <= 0) {
          throw ApiError.badRequest(
            'O valor do cartão deve ser maior que zero',
          );
        }
        definedAmountsSum = Number(
          (definedAmountsSum + card.amount).toFixed(2),
        );
      }
    });

    if (cardsMissingAmount.length > 0) {
      if (cardsWithAmounts.length > 1) {
        throw ApiError.badRequest(
          'Informe o valor (amount) para todos os cartões utilizados',
        );
      }
      cardsWithAmounts[0].amount = baseOfferAmount;
      definedAmountsSum = baseOfferAmount;
    }

    const amountDifference = Number(
      (baseOfferAmount - definedAmountsSum).toFixed(2),
    );

    if (Math.abs(amountDifference) >= 0.05) {
      throw ApiError.badRequest(
        `A soma dos valores dos cartões (R$ ${definedAmountsSum.toFixed(
          2,
        )}) deve ser igual ao valor base da oferta (R$ ${baseOfferAmount.toFixed(
          2,
        )})`,
      );
    }

    if (cardsWithAmounts.length > 0) {
      const lastIndex = cardsWithAmounts.length - 1;
      cardsWithAmounts[lastIndex].amount = Number(
        ((cardsWithAmounts[lastIndex].amount || 0) + amountDifference).toFixed(
          2,
        ),
      );
    }

    const amountValidationSum = cardsWithAmounts.reduce((acc, card) => {
      acc += card.amount;
      return Number(acc.toFixed(2));
    }, 0);

    if (Math.abs(amountValidationSum - baseOfferAmount) > 0.1) {
      throw ApiError.badRequest(
        'Falha ao distribuir os valores entre os cartões',
      );
    }

    let transactionsToCreate;
    if (cardsWithAmounts.length > 1) {
      const costTransactionsForCards = [];

      // eslint-disable-next-line no-await-in-loop
      for (const card of cardsWithAmounts) {
        // eslint-disable-next-line no-await-in-loop
        const cardFees = await new SalesFees(
          CostCentralRepository,
          SalesSettingsRepository,
          TaxesRepository,
        ).calculate({
          id_user: product.id_user,
          brand: card.brand,
          installments: card.installments,
          student_pays_interest,
          sales_items: [
            {
              price: card.amount,
              type: 1,
              subscription_fee: 0,
              shipping_price: 0,
            },
          ],
          discount: 0,
          payment_method: 'card',
          coupon: null,
          document_number: this.personalData.document_number,
        });

        const [cardCostTransaction] = cardFees;
        costTransactionsForCards.push(cardCostTransaction);

        // Armazenar o valor com juros calculado para enviar ao payment service
        card.amountWithInterest = cardCostTransaction.price;
      }

      transactionsToCreate = [costTransactionsForCards, ...transactions];
    } else {
      // 1 cartão: usar o cálculo normal
      transactionsToCreate = transactionsToCreateForSaleItem;
      if (cardsWithAmounts.length === 1) {
        cardsWithAmounts[0].amountWithInterest =
          costTransactionForSaleItem.price;
      }
    }

    let costTransactionsFromCreate;

    if (cardsWithAmounts.length > 1) {
      [costTransactionsFromCreate] = transactionsToCreate;
      totalSaleAmount = costTransactionsFromCreate.reduce(
        (sum, ct) => Number((sum + Number(ct.price)).toFixed(2)),
        0,
      );
    } else {
      costTransactionsFromCreate = [transactionsToCreate[0]];
    }

    const totalCardsAmount = cardsWithAmounts.reduce(
      (sum, card) => Number((sum + Number(card.amount || 0)).toFixed(2)),
      0,
    );

    const resolveShare = (cardAmount) => {
      if (totalCardsAmount === 0) {
        return 1 / cardsWithAmounts.length;
      }
      return Number(cardAmount) / totalCardsAmount;
    };

    const products = salesItemsToCreate.map(
      ({ product: { name, uuid: productIdentifier } }, index) => ({
        quantity: 1,
        description: name,
        code: productIdentifier,
        amount: parseInt(
          (Number(transactions[index].price_total) * 100).toFixed(0),
          10,
        ),
      }),
    );
    const salesItemsToSplit = transactions.map((t, index) => ({
      ...t,
      ...salesItemsToCreate[index],
    }));
    const commissions = await providerCommissions({
      salesItemsToSplit,
      affiliate,
      user_field_status_cnpj,
      user_field_status_cpf,
      user_field_cnpj,
      user_field_cpf,
      product,
      shipping_type,
    });

    const commissionsByCard = cardsWithAmounts.map(() => []);

    commissions.forEach((commission, commissionIndex) => {
      let accumulated = 0;
      cardsWithAmounts.forEach((card, cardIndex) => {
        const share = resolveShare(card.amount);
        let amount = Number((commission.amount * share).toFixed(2));

        if (cardIndex === cardsWithAmounts.length - 1) {
          amount = Number((commission.amount - accumulated).toFixed(2));
        }

        if (amount < 0) {
          amount = 0;
        }

        accumulated = Number((accumulated + amount).toFixed(2));

        commissionsByCard[cardIndex][commissionIndex] = {
          ...commission,
          amount,
        };
      });
    });

    const paymentsPayload = cardsWithAmounts.map((card, index) => {
      const [expMonth, expYear] = card.expiration_date.split('/');
      return {
        amount: card.amountWithInterest || card.amount,
        installments: card.installments,
        card_number: card.card_number,
        card_holder: card.card_holder,
        security_code: card.cvv,
        expiration_month: expMonth,
        expiration_year: expYear,
        brand: card.brand,
        commissions: commissionsByCard[index],
      };
    });
    let client = await Clients.findOne({
      raw: true,
      where: {
        document_number: this.personalData.document_number,
        id_provider,
      },
    });
    if (!client) {
      const providerClient = await paymentProvider.createClient(
        this.personalData,
      );
      client = await Clients.create({
        email: this.personalData.email,
        document_number: this.personalData.document_number,
        address: this.personalData.address,
        provider_external_id: providerClient.id,
        id_provider,
      });
    }
    const transactionIdentifier = v4();

    const paymentData = await paymentProvider.generateCardSale(
      {
        transaction_id: transactionIdentifier,
        commissions,
        installments: this.installments,
        products,
        price: totalSaleAmount, // Usar o valor total da venda
        statement_descriptor: product.creditcard_descriptor,
        operation_type: 'pre_auth',
        payments: paymentsPayload,
      },
      {
        provider_external_id: client.provider_external_id,
        ip_client: this.ip,
      },
      null,
      saleAddress,
    );

    const chargesResponse = paymentData?.charges || [];

    if (chargesResponse.length !== cardsWithAmounts.length) {
      throw ApiError.badRequest(
        `Número de charges do provider (${chargesResponse.length}) não corresponde ao número de cartões (${cardsWithAmounts.length})`,
      );
    }

    const providerChargesData = cardsWithAmounts.map((card, index) => ({
      card,
      payment: chargesResponse[index] || null,
      commissions: commissionsByCard[index],
    }));

    const { status: statusOrder, provider = null } = paymentData;

    const mainChargeResponse = providerChargesData[0]?.payment || null;
    let cartao_status =
      mainChargeResponse?.status ?? paymentData?.cartao_status ?? null;
    let provider_id =
      mainChargeResponse?.id ?? paymentData?.provider_id ?? null;
    let provider_response =
      mainChargeResponse?.last_transaction?.acquirer_message ??
      paymentData?.provider_response ??
      null;

    // VERIFICAÇÃO DE TRANSAÇÕES COM STATUS MISTOS
    // Quando houver pagamento com dois cartões, verificar se uma transação foi rejeitada (failed)
    // e outra foi aprovada (paid ou created). Se sim, cancelar a que foi aprovada.
    let shouldRejectSale = false;
    let failedChargeResponse = null;
    if (cardsWithAmounts.length > 1 && chargesResponse.length > 1) {
      const chargeStatuses = chargesResponse.map((charge) => ({
        id: charge.id,
        status: charge.status,
      }));

      const hasFailed = chargeStatuses.some(
        (charge) => charge.status === 'failed',
      );
      const hasSuccessful = chargeStatuses.some(
        (charge) => charge.status === 'paid' || charge.status === 'pending',
      );

      // Se temos uma transação com falha E outra com sucesso, cancelar a bem-sucedida
      if (hasFailed && hasSuccessful) {
        // Encontrar a transação que falhou para pegar a mensagem de erro
        const failedChargeIndex = chargesResponse.findIndex(
          (charge) => charge.status === 'failed',
        );
        if (failedChargeIndex !== -1) {
          failedChargeResponse = chargesResponse[failedChargeIndex];

          // Usar os dados do cartão que negou para o retorno
          cartao_status = failedChargeResponse.status;
          provider_id = failedChargeResponse.id;
          provider_response =
            failedChargeResponse.last_transaction?.acquirer_message ??
            'Transação negada';
        }

        // Encontrar e cancelar as transações bem-sucedidas
        for await (const charge of chargeStatuses) {
          if (charge.status === 'paid' || charge.status === 'pending') {
            try {
              // TODO: USUÁRIO DEVE AJUSTAR ESTA CONDIÇÃO CONFORME NECESSÁRIO
              // Esta é a lógica para cancelar a transação aprovada quando outra falha
              await paymentProvider.cancelCharge(charge.id);
            } catch (cancelError) {
              // Continuar mesmo se o cancelamento falhar
            }
          }
        }

        // Marcar que a venda deve ser rejeitada
        shouldRejectSale = true;
      }
    }

    let response = null;
    let upsell_url = null;
    let status = shouldRejectSale
      ? {
          label: 'rejected',
          charge: 4,
          transaction: 4,
          sale: 3,
          subscription: 3,
        }
      : statusOrder;
    let score_konduto = 0;
    let uuid_konduto = null;
    let hasProcessedTransaction = false;
    let errorCode = '0000';
    let responseMessage = provider_response;
    let kondutoDeniedReason = null;

    // Se houve cancelamento por status misto, garantir que usamos os dados do cartão que negou
    // (já atualizamos cartao_status, provider_id e provider_response acima, agora só precisamos
    // garantir que responseMessage e errorCode também estejam corretos)
    if (shouldRejectSale && failedChargeResponse) {
      const failedTransaction = failedChargeResponse.last_transaction;
      if (failedTransaction) {
        // Usar a mensagem mais específica da transação que falhou
        responseMessage =
          failedTransaction.acquirer_message ||
          provider_response ||
          'Transação negada';
        errorCode = failedTransaction.acquirer_return_code || '0000';
      } else {
        // Se não tiver last_transaction, usar o provider_response que já foi atualizado
        responseMessage = provider_response || 'Transação negada';
      }
    }

    if (paymentData) {
      const lastTransaction = mainChargeResponse?.last_transaction;
      const acquirerMessage = lastTransaction?.acquirer_message;
      const acquirerReturnCode = lastTransaction?.acquirer_return_code;

      // Não sobrescrever se já temos a mensagem da transação que falhou
      if (!shouldRejectSale && acquirerReturnCode) {
        errorCode = acquirerReturnCode;
        responseMessage = acquirerMessage;
      }
    }
    try {
      if (status.label === 'created') {
        const product_provider_type =
          pagarmeProvider === 'B4YOU_PAGARME_2' ? 'PHYSICAL' : 'DIGITAL';
        const konduto = new Konduto(product_provider_type);

        const kondutoPayments = cardsWithAmounts.map((card) => {
          const [month, year] = card.expiration_date.split('/');
          return {
            number: card.card_number,
            expiration_date: `${month}20${year}`,
            card_holder: card.card_holder,
            amount: card.amountWithInterest || card.amount,
          };
        });

        const responseKonduto = await konduto.createOrder({
          created_at: dateHelper().now(),
          customer: {
            email: this.personalData.email,
            document_number: this.personalData.document_number,
            full_name: this.personalData.full_name,
            phone: this.personalData.whatsapp,
          },
          payments: kondutoPayments,
          address: {
            city: this.personalData.address.city,
            zipcode: this.personalData.address.zipcode,
            state: this.personalData.address.state,
            street: this.personalData.address.street,
            house_number: this.personalData.address.number,
          },
          uuid_sale: provider_id,
          provider_id,
          fingerprint: this.visitor_id,
          total_amount: totalSaleAmount,
          shipping_amount: shipping_price_sale || 0,
          installments: this.installments,
          ip: this.ip,
          shopping_cart: salesItemsToCreate.map((item) => ({
            sku: item.product.uuid,
            name: item.product.name,
            quantity: item.quantity,
            unit_cost: item.price,
          })),
          seller: {
            id: product.producer.uuid,
            name: product.producer.full_name,
            created_at: dateHelper(product.producer.created_at)
              .utc()
              .format('YYYY-MM-DD'),
          },
        });
        const {
          order: { score, id: id_konduto, recommendation },
        } = responseKonduto;
        // eslint-disable-next-line no-console
        console.log(
          `JSON KONDUTO ${this.personalData.email}`,
          JSON.stringify(responseKonduto),
        );
        score_konduto = score;
        uuid_konduto = id_konduto;
        const approve = recommendation !== 'DECLINE';
        const providerUpdateCharges = [];

        if (!approve && responseMessage === 'Transação aprovada com sucesso') {
          kondutoDeniedReason = 'Negado pela Konduto';
        }
        for (const charge of providerChargesData) {
          providerUpdateCharges.push(
            paymentProvider.updateOrder({
              approved: approve,
              charge_id: charge.payment.id,
            }),
          );
        }
        const providerResponse = await Promise.allSettled(
          providerUpdateCharges,
        );
        providerResponse.forEach((result) => {
          if (result.status === 'fulfilled') {
            // eslint-disable-next-line no-console
            console.log(
              `order updated ${this.personalData.email}`,
              JSON.stringify(result.value),
            );
            status = result.value.status;
          } else {
            // eslint-disable-next-line no-console
            console.log(
              `order updated failed ${this.personalData.email}`,
              JSON.stringify(result.reason),
            );
          }
        });
        hasProcessedTransaction = true;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`error on konduto ${this.personalData.email}`, error);
      if (!hasProcessedTransaction) {
        // eslint-disable-next-line no-await-in-loop
        const providerUpdateCharges = [];
        for (const charge of providerChargesData) {
          providerUpdateCharges.push(
            paymentProvider.updateOrder({
              approved: true,
              charge_id: charge.payment.id,
            }),
          );
        }
        const providerResponse = await Promise.allSettled(
          providerUpdateCharges,
        );
        providerResponse.forEach((result) => {
          if (result.status === 'fulfilled') {
            // eslint-disable-next-line no-console
            console.log(
              `order updated ${this.personalData.email}`,
              JSON.stringify(result.value),
            );
            status = result.value.status;
          } else {
            // eslint-disable-next-line no-console
            console.log(
              `order updated failed ${this.personalData.email}`,
              JSON.stringify(result.reason),
            );
          }
        });
      }
    }
    // eslint-disable-next-line no-console
    console.log(`${this.personalData.email} -> Client`, client);
    const paid_at = status.label === 'paid' ? dateHelper().now() : null;

    await models.sequelize.transaction(async (t) => {
      const { full_name, document_number, whatsapp, email } = this.personalData;
      let currentStudent = await findStudentByEmail(email, t);
      const credit_card = await tokenizeCardIfPaid({
        status,
        cards: this.cards,
        paymentProvider,
        client,
        personalData: this.personalData,
      });
      if (!currentStudent) {
        const { student } = await new CreateStudent(
          { ...this.personalData, credit_card },
          t,
        ).execute();
        currentStudent = { ...student, status: 'pending' };
      } else {
        await updateStudent(
          currentStudent.id,
          { ...this.personalData, credit_card },
          t,
        );
      }

      const sale = await createSale(
        {
          id_student: currentStudent.id,
          id_user: product.id_user,
          params: { ip: this.ip, agent: this.agent },
          address: saleAddress,
          full_name,
          email,
          whatsapp,
          document_number,
          score_konduto,
          id_konduto: uuid_konduto,
        },
        t,
      );
      const createdCharges = [];

      if (providerChargesData.length !== cardsWithAmounts.length) {
        throw ApiError.badRequest(
          'Número de charges do provider não corresponde ao número de cartões',
        );
      }

      // eslint-disable-next-line no-await-in-loop
      for (const [
        index,
        costTransactionData,
      ] of costTransactionsFromCreate.entries()) {
        const chargeData = providerChargesData[index];
        const { card, payment } = chargeData;

        const chargeCost = {
          price: costTransactionData.price,
          psp_cost_variable_percentage:
            costTransactionData.psp_cost_variable_percentage,
          psp_cost_variable_amount:
            costTransactionData.psp_cost_variable_amount,
          psp_cost_fixed_amount: costTransactionData.psp_cost_fixed_amount,
          psp_cost_total: costTransactionData.psp_cost_total,
          revenue: costTransactionData.revenue,
          interest_installment_percentage:
            costTransactionData.interest_installment_percentage,
          interest_installment_amount:
            costTransactionData.interest_installment_amount,
          tax_interest_percentage: costTransactionData.tax_interest_percentage,
          tax_interest_total: costTransactionData.tax_interest_total,
          installments: costTransactionData.installments,
          monthly_installment_interest:
            costTransactionData.monthly_installment_interest,
          discount_amount: costTransactionData.discount_amount,
          discount_percentage: costTransactionData.discount_percentage,
          original_price: costTransactionData.original_price,
          subscription_fee: costTransactionData.subscription_fee,
        };

        // Se houver cancelamento (status misto), todas as charges devem ser criadas como negadas
        // Só criar como pago após todas as charges serem pagas
        let chargeStatus;
        if (shouldRejectSale) {
          // Quando há cancelamento, todas as charges são criadas como negadas
          chargeStatus = {
            label: 'rejected',
            charge: 4,
            transaction: 4,
            sale: 3,
            subscription: 3,
          };
        } else {
          chargeStatus = status;
        }

        const chargeProviderId = payment?.id || null;
        const chargeProviderResponse =
          payment?.last_transaction?.acquirer_message ??
          paymentData?.provider_response ??
          null;

        const providerResponseDetails =
          chargeStatus.label === 'paid' ? null : chargeProviderResponse;

        // eslint-disable-next-line no-await-in-loop
        const createdCharge = await createCharge(
          {
            uuid: v4(),
            id_user: product.id_user,
            id_student: currentStudent.id,
            id_status: chargeStatus.charge,
            id_sale: sale.id,
            psp_id: paymentData.id,
            payment_method: 'credit_card',
            installments: card.installments,
            paid_at: chargeStatus.label === 'paid' ? dateHelper().now() : null,
            provider,
            provider_id: chargeProviderId,
            card_brand: card.brand,
            provider_response_details:
              kondutoDeniedReason || providerResponseDetails,
            ...chargeCost,
          },
          t,
        );

        createdCharges.push(createdCharge);
      }

      if (createdCharges.length !== cardsWithAmounts.length) {
        throw ApiError.badRequest(
          `Erro ao criar charges. Esperado: ${cardsWithAmounts.length}, Criado: ${createdCharges.length}`,
        );
      }

      const primaryCharge = createdCharges[0];
      let mainSaleItem;

      // eslint-disable-next-line no-await-in-loop
      for await (const [index, transactionData] of transactions.entries()) {
        const itemToCreate = salesItemsToCreate[index];

        let subscriptionData = {};
        let selectedObPlan = null;

        if (subscriptionOrderBumps.length > 0) {
          const originalOrderBump = subscriptionOrderBumps.find(
            (ob) => ob.offer.id === itemToCreate.id_offer,
          );

          if (originalOrderBump) {
            selectedObPlan = findPlan(
              originalOrderBump.offer.plans,
              originalOrderBump.order_bump_plan,
            );

            const subscriptionPayload = {
              id_user: originalOrderBump.offer.offer_product.id_user,
              id_student: currentStudent.id,
              id_product: originalOrderBump.offer.offer_product.id,
              id_sale: sale.id,
              active: true,
              id_plan: selectedObPlan.id,
              id_offer: originalOrderBump.offer.id,
              id_status: status.subscription,
              id_affiliate: affiliate ? affiliate.id : null,
              affiliate_commission: affiliate ? affiliate.commission : null,
              payment_method: 'card',
              credit_card,
              next_charge: dateHelper().add(
                selectedObPlan.frequency_quantity,
                selectedObPlan.payment_frequency,
              ),
            };

            const createdSubscription = await createSubscription(
              subscriptionPayload,
              t,
            );

            subscriptionData = {
              id_plan: selectedObPlan.id,
              id_subscription: createdSubscription.id,
            };
          }
        }

        const saleItem = await createSaleItem(
          {
            id_sale: sale.id,
            id_product: itemToCreate.product.id,
            price: transactionData.price_product,
            id_plan: selectedObPlan ? subscriptionData.id_plan : null,
            id_subscription: selectedObPlan
              ? subscriptionData.id_subscription
              : null,
            is_upsell: false,
            id_status: status.sale,
            id_student: currentStudent.id,
            payment_method: 'card',
            type: findSaleItemsType(itemToCreate.type).id,
            credit_card: cardDataToStore(this.primaryCard),
            valid_refund_until: calculateRefund(product.warranty),
            id_affiliate: affiliate ? affiliate.id : null,
            paid_at,
            src: this.personalData?.params?.src,
            sck: this.personalData?.params?.sck,
            utm_source: this.personalData?.params?.utm_source,
            utm_medium: this.personalData?.params?.utm_medium,
            utm_campaign: this.personalData?.params?.utm_campaign,
            utm_term: this.personalData?.params?.utm_term,
            utm_content: this.personalData?.params?.utm_content,
            b1: this.personalData?.params?.b1,
            b2: this.personalData?.params?.b2,
            b3: this.personalData?.params?.b3,
            quantity: itemToCreate.quantity,
            id_offer: itemToCreate.id_offer,
            integration_shipping_company:
              itemToCreate.integration_shipping_company ?? null,
            ...transactionData,
          },
          t,
        );

        if (index === 0) {
          mainSaleItem = saleItem;
        }

        // eslint-disable-next-line no-await-in-loop
        for (const createdCharge of createdCharges) {
          // eslint-disable-next-line no-await-in-loop
          await SalesItemsCharges.create(
            {
              id_charge: createdCharge.id,
              id_sale_item: saleItem.id,
            },
            { transaction: t },
          );
        }

        t.afterCommit(async () => {
          await SQS.add('splitCommissions', {
            sale_item_id: saleItem.id,
            shipping_type,
          });
        });

        if (
          status.label === 'paid' &&
          product.content_delivery === 'membership'
        ) {
          await createStudentProducts(
            {
              id_student: currentStudent.id,
              id_product: itemToCreate.product.id,
              id_classroom: itemToCreate.id_classroom ?? null,
              id_sale_item: saleItem.id,
            },
            t,
          );
        }

        if (status.label === 'paid') {
          if (coupon && coupon.is_valid) {
            await CouponsUse.create(
              {
                id_coupon: coupon.id,
                document_number: this.personalData.document_number,
              },
              { transaction: t },
            );
          }
          t.afterCommit(async () => {
            SQS.add('shopify', {
              sale_id: sale.id,
              status: 'paid',
            });
            // if (product.id_user !== 96495) {
            await SQS.add('webhookEvent', {
              id_product: itemToCreate.product.id,
              id_sale_item: saleItem.id,
              id_user: product.id_user,
              id_event: findRulesTypesByKey('approved-payment').id,
            });
            // }

            await SQS.add('studentApprovedPaymentEmails', {
              product: itemToCreate.product,
              currentStudent,
              saleItem,
              charge: primaryCharge,
            });

            if (affiliate) {
              await SQS.add('webhookEvent', {
                id_product: itemToCreate.product.id,
                id_sale_item: saleItem.id,
                id_user: affiliate.id_user,
                id_event: findRulesTypesByKey('approved-payment').id,
              });
            }

            await SQS.add('integrations', {
              id_product: itemToCreate.product.id,
              eventName: 'approvedPayment',
              data: {
                payment_method: 'card',
                email: currentStudent.email,
                full_name: currentStudent.full_name,
                phone: currentStudent.whatsapp,
                sale: {
                  amount: saleItem.price_total,
                  created_at: saleItem.created_at,
                  document_number: currentStudent.document_number,
                  paid_at: saleItem.paid_at,
                  sale_uuid: saleItem.uuid,
                  products: [
                    {
                      uuid: itemToCreate.product.uuid,
                      product_name: itemToCreate.product.name,
                      quantity: 1,
                      price: saleItem.price_total,
                    },
                  ],
                },
              },
            });
            await SQS.add('tinyShipping', {
              sale_id: sale.id,
            });
            await SQS.add('blingShipping', {
              sale_id: sale.id,
              is_upsell: false,
            });
            await SQS.add('woocommerce', {
              sale_item_id: saleItem.id,
              sale_id: sale.id,
            });
            await SQS.add('groupSales', {
              id_product: itemToCreate.product.id,
              id_student: currentStudent.id,
              id_sale_item: saleItem.id,
            });
            await SQS.add('zoppy', {
              sale_id: sale.id,
              event_name: 'insertSale',
              cart: null,
              id_user: sale.id_user,
            });
            if (this.personalData.id_cart) {
              await deleteCart({ id: this.personalData.id_cart }, true, null);
            }
            await recordEcommerceSaleIfApplicable(itemToCreate.id_offer);
          });
        } else {
          t.afterCommit(async () => {
            await SQS.add('groupSales', {
              id_product: itemToCreate.product.id,
              id_student: currentStudent.id,
              id_sale_item: saleItem.id,
            });
            if (affiliate) {
              await SQS.add('webhookEvent', {
                id_product: itemToCreate.product.id,
                id_sale_item: saleItem.id,
                id_user: affiliate.id_user,
                id_event: findRulesTypesByKey('refused-payment').id,
              });
            }
            await SQS.add('webhookEvent', {
              id_product: itemToCreate.product.id,
              id_sale_item: saleItem.id,
              id_user: product.id_user,
              id_event: findRulesTypesByKey('refused-payment').id,
            });
            await SQS.add('integrations', {
              id_product: itemToCreate.product.id,
              eventName: 'refusedPayment',
              data: {
                payment_method: 'card',
                email: currentStudent.email,
                full_name: currentStudent.full_name,
                phone: currentStudent.whatsapp,
                sale: {
                  amount: saleItem.price_total,
                  created_at: saleItem.created_at,
                  document_number: currentStudent.document_number,
                  paid_at: saleItem.paid_at,
                  sale_uuid: saleItem.uuid,
                  products: [
                    {
                      uuid: itemToCreate.product.uuid,
                      product_name: itemToCreate.product.name,
                      quantity: 1,
                      price: saleItem.price_total,
                    },
                  ],
                },
              },
            });
            await SQS.add('zoppy', {
              sale_id: sale.id,
              event_name: 'insertSale',
              cart: null,
              id_user: sale.id_user,
            });
          });
        }
      }

      if (createdCharges.length !== costTransactionsFromCreate.length) {
        throw ApiError.badRequest(
          `Número de charges (${createdCharges.length}) não corresponde ao número de cost transactions (${costTransactionsFromCreate.length})`,
        );
      }

      if (coupon && coupon.is_valid) {
        await createCouponSale(
          {
            id_sale: sale.id,
            percentage: coupon.percentage,
            amount: coupon.amount / salesItemsToSplit.length,
            id_coupon: coupon.id,
            paid: status.label === 'paid',
          },
          t,
        );
      }

      if (status.label === 'paid' && thankyou_page_upsell) {
        upsell_url = resolveUpsellURL(
          thankyou_page_upsell,
          mainSaleItem.uuid,
          this.installments,
        );
      }

      if (
        status.label === 'paid' &&
        thankyou_page_card &&
        !thankyou_page_upsell
      ) {
        upsell_url = resolveUpsellURL(
          thankyou_page_card,
          mainSaleItem.uuid,
          this.installments,
        );
      }

      const returnStatus = findStatus(status.sale);
      returnStatus.code = errorCode;
      response = {
        sale_id: mainSaleItem.uuid,
        status: returnStatus,
        upsell_url,
        cartao_status,
        cartao_status_details: responseMessage || provider_response,
      };
    });

    return response;
  }
};
