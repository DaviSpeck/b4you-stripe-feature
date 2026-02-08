const ApiError = require('../../../error/ApiError');
const FindOffer = require('../offers/FindOffer');
const CreateStudent = require('../../common/students/CreateStudent');
const FindAffiliate = require('../affiliates/FindAffiliate');
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
const { createCharge } = require('../../../database/controllers/charges');
const {
  createSubscription,
} = require('../../../database/controllers/subscriptions');
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
const {
  deleteCart,
  updateCart,
} = require('../../../database/controllers/cart');
const CostCentralRepository = require('../../../repositories/sequelize/CostCentralRepository');
const TaxesRepository = require('../../../repositories/sequelize/TaxesRepository');
const SalesSettingsRepository = require('../../../repositories/sequelize/SalesSettingsRepository');
const SalesFees = require('./SalesFees');
const {
  findTransactionStatusByKey,
} = require('../../../status/transactionStatus');
const Cache = require('../../../config/Cache');
const Sales_items_charges = require('../../../database/models/Sales_items_charges');
const models = require('../../../database/models');
const date = require('../../../utils/helpers/date');
const {
  createCouponSale,
} = require('../../../database/controllers/coupons_sales');
const Clients = require('../../../database/models/Clients');
const PaymentService = require('../../../services/PaymentService');
const Pagarme = require('../../../services/payment/Pagarme');
const { v4 } = require('../../../utils/helpers/uuid');
const CouponsUse = require('../../../database/models/CouponsUse');
const Affiliates = require('../../../database/models/Affiliates');
const logger = require('../../../utils/logger');
const Plugins = require('../../../database/models/Plugins');
const { verifyRegionByZipcode } = require('../../../utils/findZipcodeRegion');
const Konduto = require('../../../services/antifraud/Konduto');
const { resolveValidIPv4 } = require('../../../utils/resolveValidIPV4');

const findPlan = (plans, plan_id) => plans.find((p) => p.uuid === plan_id);

const isNotSubscriptionProduct = (product) =>
  product.payment_type !== SUBSCRIPTION;

const FREENET_PLUGIN = 21;

module.exports = class SubscriptionSale {
  constructor(
    {
      offer_id,
      plan_id,
      card,
      cookie,
      payment_method,
      ip = 'Não obtido',
      agent = 'Não obtido',
      order_bumps,
      coupon = null,
      integration_shipping_price = null,
      integration_shipping_company = null,
      b4f,
      visitor_id = null,
    },
    personalData,
  ) {
    this.offer_id = offer_id;
    this.coupon = coupon;
    this.plan_id = plan_id;
    this.card = card;
    this.personalData = personalData;
    this.cookie = cookie;
    this.brand = card ? creditCardBrandParser(card.card_number) : null;
    this.payment_method = payment_method;
    this.ip = resolveValidIPv4(ip);
    this.agent = agent;
    this.order_bumps = order_bumps;
    this.integration_shipping_price = integration_shipping_price;
    this.integration_shipping_company = integration_shipping_company;
    this.b4f = b4f;
    this.visitor_id = visitor_id;
  }

  async execute() {
    const {
      id: id_offer,
      offer_product: product,
      id_classroom,
      plans,
      payment_methods,
      require_address,
      order_bumps,
      thankyou_page_upsell,
      allow_affiliate,
      student_pays_interest,
      discount_card,
      discount_pix,
      shipping_type,
      shipping_price,
      allow_shipping_region,
      shipping_price_no,
      shipping_price_ne,
      shipping_price_co,
      shipping_price_so,
      shipping_price_su,
      has_upsell_native,
    } = await new FindOffer(this.offer_id).execute();

    let hasFreenet = false;
    if (
      this.integration_shipping_price &&
      this.integration_shipping_price > 0
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

    if (isNotSubscriptionProduct(product)) {
      throw ApiError.badRequest('this route is for subscription products');
    }

    if (!this.personalData) {
      throw ApiError.badRequest(
        'Você deve enviar as informações do cliente primeiro',
      );
    }

    if (!payment_methods.includes(this.payment_method)) {
      throw ApiError.badRequest('Método de pagamento não aceito');
    }

    const selectedPlan = findPlan(plans, this.plan_id);

    if (!selectedPlan) {
      throw ApiError.badRequest('Plano de assinatura não encontrado');
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
      require_address ||
      [4, 5].includes(product.id_type) ||
      selectedOrderBumps.some((ob) =>
        [4, 5].includes(ob.offer.offer_product.id_type),
      )
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
      for (const field of requiredFields) {
        if (!address[field]) {
          throw ApiError.badRequest(`Campo ${field} faltando no endereço`);
        }
      }
      saleAddress = {
        ...address,
      };
    }

    let coupon = await findCoupon({
      couponCode: this.coupon,
      id_product: product.id,
      payment_method: this.payment_method,
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
    let shipping_price_sale = 0;
    if (product.content_delivery === 'physical') {
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
      shipping_price_sale = resolveShippingPrice({
        shipping_type,
        integration_shipping_price: this.integration_shipping_price,
        shipping_region_price,
        shipping_price,
        has_freenet: hasFreenet,
      });
    }

    const salesItemsToCreate = [
      {
        price:
          selectedPlan.subscription_fee && !selectedPlan.charge_first
            ? 0
            : selectedPlan.price,
        type: 1,
        subscription_fee: selectedPlan.subscription_fee
          ? selectedPlan.subscription_fee_price
          : 0,
        shipping_price: shipping_price_sale,
        integration_shipping_company: this.integration_shipping_company,
        id_classroom,
        product,
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
        integration_shipping_company: this.integration_shipping_company,
        quantity: ob.offer.quantity,
        id_offer: ob.offer.id,
        id_user: ob.offer.id_user,
      });
    });

    subscriptionOrderBumps.forEach(async (ob) => {
      const obSelectedPlan = findPlan(ob.offer.plans, ob.order_bump_plan);

      logger.info(`\n\nORIGINAL OB -> ${JSON.stringify(obSelectedPlan)}\n\n`);

      salesItemsToCreate.push({
        price:
          obSelectedPlan.subscription_fee && !obSelectedPlan.charge_first
            ? 0
            : obSelectedPlan.price,
        type: 1,
        subscription_fee: obSelectedPlan.subscription_fee
          ? obSelectedPlan.subscription_fee_price
          : 0,
        shipping_price: 0,
        integration_shipping_company: this.integration_shipping_company,
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

    const discount =
      this.payment_method === 'pix' ? discount_pix : discount_card;

    const transactionsToCreate = await new SalesFees(
      CostCentralRepository,
      SalesSettingsRepository,
      TaxesRepository,
    ).calculate({
      id_user: product.id_user,
      brand: this.brand,
      installments: this.payment_method === 'pix' ? 1 : this.card.installments,
      student_pays_interest,
      sales_items: salesItemsToCreate,
      discount,
      payment_method: this.payment_method,
      upsell_url: thankyou_page_upsell,
      coupon,
      document_number: this.personalData.document_number,
    });

    const [costTransaction, ...transactions] = transactionsToCreate;
    const salesItemsToSplit = transactions.map((t, index) => ({
      ...salesItemsToCreate[index],
      ...t,
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
    let paymentData = null;

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
    const transactionIdentifier = v4();
    if (this.payment_method === 'card') {
      const [month, year] = this.card.expiration_date.split('/');
      paymentData = await paymentProvider.generateCardSale(
        {
          price: costTransaction.price,
          products,
          installments: this.card.installments,
          commissions,
          statement_descriptor: product.creditcard_descriptor,
          transaction_id: transactionIdentifier,
          operation_type: 'pre_auth',
        },
        {
          provider_external_id: client.provider_external_id,
          ip_client: this.ip,
        },
        {
          card_number: this.card.card_number,
          cardholder_name: this.card.card_holder,
          security_code: this.card.cvv,
          expiration_month: month,
          expiration_year: year,
        },
        saleAddress,
      );
    } else {
      paymentData = await paymentProvider.generatePix({
        provider_external_id: client.provider_external_id,
        transaction_id: transactionIdentifier,
        commissions,
        products,
        ip: this.ip,
        amount: costTransaction.price,
      });
    }

    const {
      status,
      qrcode = null,
      qrcode_url = null,
      provider = null,
      provider_id = null,
    } = paymentData;

    let score_konduto = 0;
    let uuid_konduto = null;
    let hasProcessedTransaction = false;
    let finalStatus = status;

    // Integração Konduto apenas para pagamento com cartão
    if (this.payment_method === 'card' && status.label === 'created') {
      try {
        const product_provider_type =
          pagarmeProvider === 'B4YOU_PAGARME_2' ? 'PHYSICAL' : 'DIGITAL';
        const konduto = new Konduto(product_provider_type);
        const [month, year] = this.card.expiration_date.split('/');
        const responseKonduto = await konduto.createOrder({
          created_at: dateHelper().now(),
          customer: {
            email: this.personalData.email,
            document_number: this.personalData.document_number,
            full_name: this.personalData.full_name,
            phone: this.personalData.whatsapp,
          },
          card: {
            number: this.card.card_number,
            expiration_date: `${month}20${year}`,
            card_holder: this.card.card_holder,
          },
          address: {
            city: this.personalData.address?.city || '',
            zipcode: this.personalData.address?.zipcode || '',
            state: this.personalData.address?.state || '',
            street: this.personalData.address?.street || '',
            house_number: this.personalData.address?.number || '',
          },
          uuid_sale: provider_id,
          provider_id,
          fingerprint: this.visitor_id || client.provider_external_id,
          total_amount: costTransaction.price,
          shipping_amount: shipping_price_sale || 0,
          installments: this.card.installments,
          ip: this.ip,
          shopping_cart: salesItemsToCreate.map((item) => ({
            sku: item.product.uuid,
            name: item.product.name,
            quantity: item.quantity || 1,
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
        if (responseKonduto && responseKonduto.order) {
          const {
            order: { score, id: id_konduto, recommendation },
          } = responseKonduto;
          // eslint-disable-next-line
          console.log(
            `(ASSINATURA) JSON KONDUTO ${this.personalData.email}`,
            JSON.stringify(responseKonduto),
          );
          score_konduto = score;
          uuid_konduto = id_konduto;
          const approve = recommendation !== 'DECLINE';
          if (approve) {
            const orderUpdated = await paymentProvider.updateOrder({
              approved: true,
              charge_id: provider_id,
            });
            // eslint-disable-next-line
            console.log(
              `(ASSINATURA) order updated approved ${this.personalData.email}`,
              JSON.stringify(orderUpdated),
            );
            finalStatus = orderUpdated.status;
            hasProcessedTransaction = true;
          } else {
            const orderUpdated = await paymentProvider.updateOrder({
              approved: false,
              charge_id: provider_id,
            });
            // eslint-disable-next-line
            console.log(
              `(ASSINATURA) order updated repproved ${this.personalData.email}`,
              JSON.stringify(orderUpdated),
            );
            finalStatus = orderUpdated.status;
            hasProcessedTransaction = true;
          }
        } else {
          // eslint-disable-next-line
          console.log(
            `(ASSINATURA) KONDUTO response inválida para ${this.personalData.email}`,
            JSON.stringify(responseKonduto),
          );
        }
      } catch (error) {
        // eslint-disable-next-line
        console.log(
          `(ASSINATURA) error on konduto ${this.personalData.email}`,
          error,
        );
        if (!hasProcessedTransaction) {
          logger.info(
            '(ASSINATURA) tentando reprocessar na pagarme',
            this.personalData.email,
          );
          const orderUpdated = await paymentProvider.updateOrder({
            approved: true,
            charge_id: provider_id,
          });
          finalStatus = orderUpdated.status;
        }
      }
    }

    let response;

    const paid_at = finalStatus.label === 'paid' ? date().now() : null;

    await models.sequelize.transaction(async (t) => {
      const { full_name, document_number, whatsapp, email } = this.personalData;
      let currentStudent = await findStudentByEmail(email);
      if (!currentStudent) {
        const { student } = await new CreateStudent(
          this.personalData,
          t,
        ).execute();
        currentStudent = student;
      } else {
        await updateStudent(currentStudent.id, this.personalData, t);
      }

      const sale = await createSale(
        {
          id_student: currentStudent.id,
          id_user: product.id_user,
          params: {
            ip: this.ip,
            agent: this.agent,
          },
          address: saleAddress,
          full_name,
          document_number,
          whatsapp,
          email,
          score_konduto,
          id_konduto: uuid_konduto,
        },
        t,
      );

      if (coupon && coupon.is_valid) {
        await createCouponSale(
          {
            id_sale: sale.id,
            percentage: coupon.percentage,
            amount: coupon.amount / salesItemsToSplit.length,
            id_coupon: coupon.id,
            paid: finalStatus.label === 'paid',
          },
          t,
        );
      }

      let credit_card = null;
      if (finalStatus.label === 'paid') {
        const card = await paymentProvider.createCardToken({
          provider_external_id: client.provider_external_id,
          ...this.card,
        });
        const { card_number, cvv, expiration_date } = this.card;
        credit_card = {
          card_token: card.token,
          cvv,
          brand: creditCardBrandParser(card_number),
          last_four_digits: card_number.slice(-4),
          expiration_date,
        };
      }
      const subscription = await createSubscription(
        {
          id_user: product.id_user,
          id_student: currentStudent.id,
          id_product: product.id,
          id_sale: sale.id,
          active: true,
          id_status: finalStatus.subscription,
          id_plan: selectedPlan.id,
          id_affiliate: affiliate ? affiliate.id : null,
          affiliate_commission: affiliate ? affiliate.commission : null,
          payment_method: this.payment_method,
          credit_card,
          next_charge: dateHelper().add(
            selectedPlan.frequency_quantity,
            selectedPlan.payment_frequency,
          ),
          id_coupon: coupon && coupon.is_valid ? coupon.id : null,
        },
        t,
      );
      const charge = await createCharge(
        {
          uuid: transactionIdentifier,
          id_user: product.id_user,
          id_student: currentStudent.id,
          id_status: finalStatus.charge,
          id_sale: sale.id,
          psp_id: paymentData.id,
          payment_method:
            this.payment_method === 'card'
              ? 'credit_card'
              : this.payment_method,
          installments:
            this.payment_method === 'pix' ? 1 : this.card.installments,
          paid_at,
          pix_code: qrcode,
          qrcode_url,
          provider,
          provider_id,
          card_brand: this.payment_method === 'card' ? this.brand : null,
          ...costTransaction,
        },
        t,
      );

      let mainSaleItem;
      const ids_sales_items_created = [];

      for await (const [index, transactionData] of transactions.entries()) {
        const itemToCreate = salesItemsToCreate[index];

        let subscriptionData = {};
        let selectedObPlan = null;

        if (subscriptionOrderBumps.length > 0) {
          const originalOrderBump = subscriptionOrderBumps.find(
            (ob) => ob.offer.id === itemToCreate.id_offer,
          );

          if (originalOrderBump) {
            logger.info(
              `ORIGINAL ORDER BUMP -> ${JSON.stringify(originalOrderBump)}`,
            );
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
              id_status: finalStatus.subscription,
              id_affiliate: affiliate ? affiliate.id : null,
              affiliate_commission: affiliate ? affiliate.commission : null,
              payment_method: this.payment_method,
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
            is_upsell: false,
            id_status: finalStatus.sale,
            id_plan: selectedObPlan
              ? subscriptionData.id_plan
              : selectedPlan.id,
            price: transactionData.price_product,
            id_student: currentStudent.id,
            payment_method: this.payment_method,
            type: findSaleItemsType(itemToCreate.type).id,
            credit_card:
              this.payment_method === 'card'
                ? cardDataToStore(this.card)
                : null,
            valid_refund_until: calculateRefund(product.warranty),
            id_affiliate: affiliate ? affiliate.id : null,
            paid_at,
            src: this.personalData?.params?.src,
            sck: this.personalData?.params?.sck,
            utm_source: this.personalData?.params?.utm_source,
            utm_medium: this.personalData?.params?.utm_medium,
            utm_campaign: this.personalData?.params?.utm_campaign,
            utm_term: this.personalData?.params?.utm_term,
            b1: this.personalData?.params?.b1,
            b2: this.personalData?.params?.b2,
            b3: this.personalData?.params?.b3,
            id_offer: itemToCreate.id_offer,
            id_classroom: itemToCreate.id_classroom,
            integration_shipping_company:
              itemToCreate.integration_shipping_company ?? null,
            id_subscription: selectedObPlan
              ? subscriptionData.id_subscription
              : subscription.id,
            ...transactionData,
          },
          t,
        );
        ids_sales_items_created.push({
          id_sale_item: saleItem.id,
          payment_type: itemToCreate.product.payment_type,
          content_delivery: itemToCreate.product.content_delivery,
        });

        await Sales_items_charges.create(
          {
            id_sale_item: saleItem.id,
            id_charge: charge.id,
          },
          { transaction: t },
        );

        if (index === 0) {
          mainSaleItem = saleItem;
        }

        t.afterCommit(async () => {
          await SQS.add('splitCommissions', {
            sale_item_id: saleItem.id,
            shipping_type,
          });

          if (this.payment_method !== 'pix') {
            await SQS.add('groupSales', {
              id_product: itemToCreate.product.id,
              id_student: currentStudent.id,
              id_sale_item: saleItem.id,
            });
          }
        });

        if (this.payment_method === 'pix') {
          t.afterCommit(async () => {
            await SQS.add('webhookEvent', {
              id_product: product.id,
              id_sale_item: saleItem.id,
              id_user: product.id_user,
              id_event: findRulesTypesByKey('generated-pix').id,
            });

            await SQS.add('integrations', {
              id_product: product.id,
              eventName: 'generatedPix',
              data: {
                email: currentStudent.email,
                full_name: currentStudent.full_name,
                phone: currentStudent.whatsapp,
                sale: {
                  sale_uuid: saleItem.uuid,
                  pix_code: paymentData.base64_qrcode,
                  pix_url: paymentData.qrcode,
                  amount: costTransaction.price_total,
                  created_at: dateHelper().now(),
                  document_number: currentStudent.document_number,
                  products: [
                    {
                      product_name: product.name,
                      quantity: 1,
                      price: costTransaction.price_total,
                    },
                  ],
                },
              },
            });
          });
        }

        if (
          finalStatus.label === 'paid' &&
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
        if (finalStatus.label === 'paid') {
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
            await SQS.add('webhookEvent', {
              id_product: itemToCreate.product.id,
              id_sale_item: saleItem.id,
              id_user: product.id_user,
              id_event: findRulesTypesByKey('approved-payment').id,
            });

            await SQS.add('studentApprovedPaymentEmails', {
              product: itemToCreate.product,
              currentStudent,
              saleItem,
              charge,
            });

            await SQS.add('invision', {
              sale_id: sale.id,
            });

            await SQS.add('generateNotifications', {
              transaction_uuid: paymentData.transactionIdentifier,
              type: 'paid',
              id_status: findTransactionStatusByKey('paid').id,
            });

            await SQS.add('integrations', {
              id_product: itemToCreate.product.id,
              eventName: 'approvedPayment',
              data: {
                payment_method: this.payment_method,
                email: currentStudent.email,
                full_name: currentStudent.full_name,
                phone: currentStudent.whatsapp,
                sale: {
                  amount: charge.price,
                  created_at: saleItem.created_at,
                  document_number: currentStudent.document_number,
                  paid_at: saleItem.paid_at,
                  sale_uuid: saleItem.uuid,
                  products: [
                    {
                      uuid: itemToCreate.product.uuid,
                      product_name: itemToCreate.product.name,
                      quantity: 1,
                      price: charge.price,
                    },
                  ],
                },
              },
            });
          });
        } else if (this.payment_method === 'card') {
          t.afterCommit(async () => {
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
                payment_method: this.payment_method,
                email: currentStudent.email,
                full_name: currentStudent.full_name,
                phone: currentStudent.whatsapp,
                sale: {
                  amount: charge.price,
                  created_at: saleItem.created_at,
                  document_number: currentStudent.document_number,
                  paid_at: saleItem.paid_at,
                  sale_uuid: saleItem.uuid,
                  products: [
                    {
                      uuid: itemToCreate.product.uuid,
                      product_name: itemToCreate.product.name,
                      quantity: 1,
                      price: charge.price,
                    },
                  ],
                },
              },
            });
          });
        }
      }
      let saleInstallments = null;

      if (finalStatus.label === 'paid') {
        saleInstallments = this.card.installments;
      }

      if (this.personalData.id_cart) {
        if (finalStatus.label === 'paid') {
          await deleteCart({ id: this.personalData.id_cart }, true, t);
        } else {
          await updateCart(
            { id: this.personalData.id_cart },
            { id_sale_item: mainSaleItem.id },
            t,
          );
        }
      }

      if (this.payment_method === 'pix') {
        await Cache.set(`sale_status_${mainSaleItem.uuid}`, 'pending', 10);
        if (coupon && coupon.is_valid) {
          await CouponsUse.create(
            {
              id_coupon: coupon.id,
              document_number: this.personalData.document_number,
            },
            { transaction: t },
          );
        }
      }

      t.afterCommit(async () => {
        const subscriptionPhysicalIds = ids_sales_items_created
          .filter(
            (item) =>
              item.payment_type === 'subscription' &&
              item.content_delivery === 'physical',
          )
          .map((item) => item.id_sale_item);
        if (
          finalStatus.label === 'paid' &&
          subscriptionPhysicalIds.length > 0
        ) {
          // eslint-disable-next-line
          console.log(
            'disparando integração de assinatura para produtos fisicos bling e tiny',
            subscriptionPhysicalIds,
          );
          await SQS.add('tinyShipping', {
            sale_id: sale.id,
            is_subscription: true,
            id_sale_item: subscriptionPhysicalIds,
          });
          await SQS.add('blingShipping', {
            sale_id: sale.id,
            is_upsell: false,
            is_subscription: true,
            id_sale_item: subscriptionPhysicalIds,
          });
          SQS.add('shopify', {
            sale_id: sale.id,
            status: 'paid',
          });
        }
      });

      let upsell_url = null;

      upsell_url = resolveUpsellURL(
        thankyou_page_upsell,
        mainSaleItem.uuid,
        saleInstallments,
      );

      response = {
        sale_id: mainSaleItem.uuid,
        status: findStatus(finalStatus.sale),
        pix_code: qrcode,
        qrcode: qrcode_url,
        upsell_url,
        price: costTransaction.price,
        has_upsell_native,
      };
    });

    return response;
  }
};
