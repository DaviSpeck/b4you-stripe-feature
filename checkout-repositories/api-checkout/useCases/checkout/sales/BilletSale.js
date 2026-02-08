const ApiError = require('../../../error/ApiError');
const CreateStudent = require('../../common/students/CreateStudent');
const FindOffer = require('../offers/FindOffer');
const PaymentService = require('../../../services/PaymentService');
const Pagarme = require('../../../services/payment/Pagarme');
const uuid = require('../../../utils/helpers/uuid');
const dateHelper = require('../../../utils/helpers/date');
const SQS = require('../../../queues/aws');
const {
  DATABASE_DATE_WITHOUT_TIME,
  FRONTEND_DATE_WITHOUT_TIME,
  DATABASE_DATE,
  BILLET_DUE_DATE,
} = require('../../../types/dateTypes');
const { capitalizeName } = require('../../../utils/formatters');
const { createCharge } = require('../../../database/controllers/charges');
const { createSale } = require('../../../database/controllers/sales');
const { createSaleItem } = require('../../../database/controllers/sales_items');
const {
  findStudentByEmail,
  updateStudent,
} = require('../../../database/controllers/students');
const { findSaleItemsType } = require('../../../types/saleItemsTypes');
const { SUBSCRIPTION } = require('../../../types/productTypes');
const {
  calculateRefund,
  providerCommissions,
  findCoupon,
  resolveShippingPrice,
  ensureCouponOfferAllowed,
} = require('./common');
const FindAffiliate = require('../affiliates/FindAffiliate');
const { findRulesTypesByKey } = require('../../../types/integrationRulesTypes');
const { updateCart } = require('../../../database/controllers/cart');
const {
  createCouponSale,
} = require('../../../database/controllers/coupons_sales');
const SalesFees = require('./SalesFees');
const CostCentralRepository = require('../../../repositories/sequelize/CostCentralRepository');
const TaxesRepository = require('../../../repositories/sequelize/TaxesRepository');
const SalesSettingsRepository = require('../../../repositories/sequelize/SalesSettingsRepository');
const Sales_items_charges = require('../../../database/models/Sales_items_charges');
const models = require('../../../database/models/index');
const Clients = require('../../../database/models/Clients');
const CouponsUse = require('../../../database/models/CouponsUse');
const Affiliates = require('../../../database/models/Affiliates');
const { verifyRegionByZipcode } = require('../../../utils/findZipcodeRegion');
const Plugins = require('../../../database/models/Plugins');

const FREENET_PLUGIN = 21;
const isSubscriptionProduct = (product) =>
  product.payment_type === SUBSCRIPTION;

const paymentMethodNotAllowd = (payment_methods, paymentMethod) =>
  !payment_methods.split(',').includes(paymentMethod);

module.exports = class BilletSale {
  constructor(
    {
      offer_id,
      order_bumps,
      cookie,
      coupon,
      b4f,
      integration_shipping_price,
      integration_shipping_company,
    },
    personalData,
    dbTransaction,
    ip,
  ) {
    this.offer_id = offer_id;
    this.personalData = personalData;
    this.order_bumps = order_bumps;
    this.cookie = cookie;
    this.coupon = coupon;
    this.dbTransaction = dbTransaction;
    this.ip = ip;
    this.b4f = b4f;
    this.integration_shipping_price = integration_shipping_price;
    this.integration_shipping_company = integration_shipping_company;
  }

  async execute() {
    const {
      id: id_offer,
      price,
      offer_product: product,
      order_bumps,
      discount_billet,
      payment_methods,
      require_address,
      shipping_price,
      shipping_type,
      id_classroom,
      quantity,
      allow_affiliate,
      allow_shipping_region,
      shipping_price_no,
      shipping_price_ne,
      shipping_price_co,
      shipping_price_so,
      shipping_price_su,
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
    if (isSubscriptionProduct(product)) {
      throw ApiError.badRequest('Esse local não é para planos de assinatura.');
    }

    if (paymentMethodNotAllowd(payment_methods, 'billet')) {
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
      payment_method: 'billet',
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

    const { full_name, whatsapp, document_number, email } = this.personalData;
    let currentStudent = await findStudentByEmail(email);

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
    const salesItemsToCreate = [
      {
        price,
        type: 1,
        product,
        integration_shipping_company: this.integration_shipping_company,
        shipping_price: resolveShippingPrice({
          shipping_type,
          shipping_price,
          shipping_region_price,
          integration_shipping_price: this.integration_shipping_price,
          has_freenet: hasFreenet,
        }),
        quantity,
        id_offer,
        id_classroom,
      },
    ];
    allowedOrderBumps.forEach((ob) => {
      salesItemsToCreate.push({
        price: ob.offer.price,
        type: 3,
        product: ob.offer.offer_product,
        shipping_price: 0,
        quantity: ob.offer.quantity,
        id_offer: ob.offer.id,
        id_classroom: ob.offer.id_classroom,
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

    const transactionsToCreate = await new SalesFees(
      CostCentralRepository,
      SalesSettingsRepository,
      TaxesRepository,
    ).calculate({
      sales_items: salesItemsToCreate,
      student_pays_interest: false,
      discount: discount_billet,
      payment_method: 'billet',
      id_user: product.id_user,
      document_number: this.personalData.document_number,
      coupon,
    });

    const [costTransaction, ...transactions] = transactionsToCreate;
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
      affiliate,
      salesItemsToSplit,
      user_field_status_cnpj,
      user_field_status_cpf,
      user_field_cnpj,
      user_field_cpf,
      product,
      shipping_type,
    });
    const providerClient = await paymentProvider.createClient(
      this.personalData,
    );
    const client = await Clients.create({
      email: this.personalData.email,
      document_number: this.personalData.document_number,
      address: this.personalData.address,
      provider_external_id: providerClient.id,
      id_provider,
    });

    const transactionIdentifier = uuid.v4();
    const paymentData = await paymentProvider.generateBillet({
      commissions,
      products,
      price: costTransaction.price,
      due_date: dateHelper().add(7, 'd').format(BILLET_DUE_DATE),
      transaction_id: transactionIdentifier,
      ip: this.ip,
      provider_external_id: client.provider_external_id,
    });

    let response = null;
    let mainSaleItem = null;
    await models.sequelize.transaction(async (t) => {
      if (!currentStudent) {
        const { student } = await new CreateStudent(
          this.personalData,
          t,
        ).execute();
        currentStudent = { ...student, status: 'pending' };
      } else {
        await updateStudent(currentStudent.id, this.personalData, t);
      }

      currentStudent = {
        ...currentStudent,
        email,
        full_name,
        document_number,
        whatsapp,
      };

      const sale = await createSale(
        {
          id_student: currentStudent.id,
          id_user: product.id_user,
          address: saleAddress,
          full_name,
          document_number,
          email,
          whatsapp,
        },
        t,
      );
      const charge = await createCharge(
        {
          uuid: transactionIdentifier,
          id_user: product.id_user,
          id_student: currentStudent.id,
          id_status: paymentData.status.charge,
          id_sale: sale.id,
          psp_id: paymentData.id,
          payment_method: 'billet',
          installments: 1,
          billet_code: paymentData.barcode,
          line_code: paymentData.line_code,
          billet_url: paymentData.url,
          qrcode_url: paymentData.qrcode_url,
          due_date: dateHelper(paymentData.due).format(DATABASE_DATE),
          next_business_day: dateHelper().nextBusinessDate(),
          provider_id: paymentData.provider_id,
          provider: paymentData.provider,
          ...costTransaction,
        },
        t,
      );

      for await (const [index, transactionData] of transactions.entries()) {
        const itemToCreate = salesItemsToCreate[index];
        const saleItem = await createSaleItem(
          {
            id_sale: sale.id,
            id_product: itemToCreate.product.id,
            is_upsell: false,
            price: transactionData.price_product,
            id_status: paymentData.status.sale,
            id_student: currentStudent.id,
            payment_method: 'billet',
            type: findSaleItemsType(itemToCreate.type).id,
            valid_refund_until: calculateRefund(product.warranty),
            id_affiliate: affiliate ? affiliate.id : null,
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
            id_classroom: itemToCreate.id_classroom ?? null,
            integration_shipping_company:
              itemToCreate.integration_shipping_company ?? null,
            ...transactionData,
          },
          t,
        );

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
        });
      }
      if (coupon && coupon.is_valid) {
        await CouponsUse.create(
          {
            id_coupon: coupon.id,
            document_number: this.personalData.document_number,
          },
          { transaction: t },
        );

        await createCouponSale(
          {
            id_sale: sale.id,
            percentage: coupon.percentage,
            amount: coupon.amount / salesItemsToSplit.length,
            id_coupon: coupon.id,
            paid: false,
          },
          t,
        );
      }

      if (this.personalData.id_cart) {
        await updateCart(
          { id: this.personalData.id_cart },
          { id_sale_item: mainSaleItem.id },
          t,
        );
      }

      t.afterCommit(async () => {
        await SQS.add('pendingPaymentEmail', {
          payment_method: 'billet',
          email,
          bar_code: paymentData.line_code,
          due_date: paymentData.due,
          amount: costTransaction.price_total,
          student_name: full_name,
          support_email: product.support_email
            ? product.support_email
            : product.producer.email,
          producer_name: product.producer.full_name,
          product_name: product.name,
          url: paymentData.url,
        });

        if (affiliate) {
          await SQS.add('webhookEvent', {
            id_product: product.id,
            id_sale_item: mainSaleItem.id,
            id_user: affiliate.id_user,
            id_event: findRulesTypesByKey('generated-billet').id,
          });
        }

        await SQS.add('webhookEvent', {
          id_product: product.id,
          id_sale_item: mainSaleItem.id,
          id_user: product.id_user,
          id_event: findRulesTypesByKey('generated-billet').id,
        });

        await SQS.add('integrations', {
          id_product: product.id,
          eventName: 'generatedBillet',
          data: {
            email,
            full_name: capitalizeName(currentStudent.full_name),
            phone: currentStudent.whatsapp,
            payment_method: 'billet',
            sale: {
              sale_uuid: mainSaleItem.uuid,
              billet_url: paymentData.url,
              billet_barcode: paymentData.bar_code,
              amount: costTransaction.price_total,
              created_at: dateHelper().now(),
              document_number: currentStudent.document_number,
              products: [
                {
                  uuid: product.uuid,
                  product_name: product.name,
                  quantity: 1,
                  price,
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

      response = {
        sale_id: mainSaleItem.uuid,
        due: dateHelper(paymentData.due, DATABASE_DATE_WITHOUT_TIME).format(
          FRONTEND_DATE_WITHOUT_TIME,
        ),
        line_code: paymentData.line_code,
        bar_code: paymentData.barcode,
        amount: costTransaction.price,
        url: paymentData.url,
      };
    });
    return response;
  }
};
