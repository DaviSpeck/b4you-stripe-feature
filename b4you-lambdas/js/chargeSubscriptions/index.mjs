import aws from './queues/aws.mjs';
import { capitalizeName } from './utils/formatters.mjs';
import { Charges } from './database/models/Charges.mjs';
import { Clients } from './database/models/Clients.mjs';
import { CommissionsProvider } from './useCases/Commissions.mjs';
import { Coupons_sales } from './database/models/Coupons_sales.mjs';
import { Coupons } from './database/models/Coupons.mjs';
import { Database } from './database/sequelize.mjs';
import { date } from './utils/date.mjs';
import { DeleteMemberInvision } from './useCases/DeleteMemeberInvision.mjs';
import { Invision } from './services/Invision.mjs';
import { Invoices } from './database/models/Invoices.mjs';
import { MailService } from './services/Mail.mjs';
import { Notazz } from './services/Notazz.mjs';
import { Op } from 'sequelize';
import { Pagarme } from './services/Pagarme.mjs';
import { PaymentService } from './services/PaymentService.mjs';
import { Plugins } from './database/models/Plugins.mjs';
import { Product_Offer } from './database/models/Product_Offer.mjs';
import { Product_plans } from './database/models/Plans.mjs';
import { Products } from './database/models/Products.mjs';
import { Sales } from './database/models/Sales.mjs';
import { Sales_invoices } from './database/models/Sales_invoices.mjs';
import { Sales_items } from './database/models/SalesItems.mjs';
import { Sales_items_charges } from './database/models/SalesItemsCharges.mjs';
import { Sales_items_plugins } from './database/models/Sales_items_plugins.mjs';
import { SalesFees } from './useCases/SalesFees.mjs';
import { sanitizeMailjetResponse } from './utils/mailUtils.mjs';
import { ShopifyNotification } from './services/ShopifyNotification.mjs';
import { StudentProducts } from './database/models/StudentProducts.mjs';
import { SubscriptionCanceled } from './emails/SubscriptionCanceled.mjs';
import { SubscriptionFailed } from './emails/SubscriptionFailed.mjs';
import { SubscriptionReactivationUseCase } from './useCases/SubscriptionReactivation.mjs';
import { Subscriptions } from './database/models/Subscriptions.mjs';
import { SubscriptionsLogs } from './database/models/SubscriptionsLogs.mjs';
import { Users } from './database/models/Users.mjs';
import { v4 } from 'uuid';
import { verifyRegionByZipcode } from './utils/verifyRegionByZipcode.mjs';

const ShopifyId = 19;
const NotazzId = 15;

const splitFullName = (name) => ({
  firstName: name.split(' ')[0],
  lastName: name.substring(name.split(' ')[0].length).trim(),
});

async function sendToShopify({ id_offer, id_sale, plugin, id_sale_item }) {
  const offer = await Product_Offer.findOne({
    where: {
      id: id_offer,
    },
    attributes: ['id', 'metadata'],
  });

  const sale = await Sales.findOne({
    where: {
      id: id_sale,
    },
  });

  const salesItems = await Sales_items.findAll({
    where: { id: id_sale_item },
    include: [
      {
        association: 'product',
        paranoid: false,
        attributes: ['id', 'warranty', 'name', 'content_delivery', 'id_type', 'id_user'],
      },
      {
        association: 'offer',
        attributes: ['id', 'name', 'metadata', 'allow_shipping_region'],
      },
    ],
  });

  const coupon = await Coupons_sales.findOne({
    raw: true,
    where: {
      id_sale: sale.id,
    },
    include: [{ association: 'coupon' }],
  });
  let couponDetails = '';
  let shipping_lines_title = 'Frete';

  if (offer && offer.metadata && Object.keys(offer.metadata).length > 0) {
    const { shopName } = plugin.settings;
    const { accessToken } = plugin.settings;
    const { firstName, lastName } = splitFullName(sale.full_name);

    const itensOrder = salesItems.map((element) => {
      let grams = 1000;
      let width = 0;
      let height = 0;
      let length = 0;

      if (
        element.offer &&
        element.offer.metadata &&
        element.offer.metadata.dimensions &&
        Array.isArray(element.offer.metadata.dimensions) &&
        element.offer.metadata.dimensions.length > 0
      ) {
        const dim = element.offer.metadata.dimensions[0];
        grams = dim.weight || grams;
        width = dim.width || 0;
        height = dim.height || 0;
        length = dim.length || 0;
      }

      return {
        id: element.product.id,
        title: element.offer.name,
        price: element.price,
        grams,
        quantity: element.quantity,
        properties: {
          width,
          height,
          length,
        },
      };
    });
    const totalSaleAmount = salesItems.reduce((acc, obj) => acc + obj.price * obj.quantity, 0);
    const principalSaleItem = salesItems.find((e) => e.type === 1);

    if (principalSaleItem.offer.allow_shipping_region === 1) {
      const cepRegion = verifyRegionByZipcode(sale.address.zipcode);
      switch (cepRegion) {
        case 'NO':
          shipping_lines_title =
            principalSaleItem.offer.metadata &&
              Array.isArray(principalSaleItem.offer.metadata.line_items) &&
              principalSaleItem.offer.metadata.line_items.length > 0 &&
              principalSaleItem.offer.metadata.line_items[0]?.shipping_data?.NO
              ? principalSaleItem.offer.metadata.line_items[0].shipping_data.NO
              : 'Frete';
          break;
        case 'NE':
          shipping_lines_title =
            principalSaleItem.offer.metadata &&
              Array.isArray(principalSaleItem.offer.metadata.line_items) &&
              principalSaleItem.offer.metadata.line_items.length > 0 &&
              principalSaleItem.offer.metadata.line_items[0]?.shipping_data?.NE
              ? principalSaleItem.offer.metadata.line_items[0].shipping_data.NE
              : 'Frete';
          break;
        case 'CO':
          shipping_lines_title =
            principalSaleItem.offer.metadata &&
              Array.isArray(principalSaleItem.offer.metadata.line_items) &&
              principalSaleItem.offer.metadata.line_items.length > 0 &&
              principalSaleItem.offer.metadata.line_items[0]?.shipping_data?.CO
              ? principalSaleItem.offer.metadata.line_items[0].shipping_data.CO
              : 'Frete';

          break;
        case 'SE':
          shipping_lines_title =
            principalSaleItem.offer.metadata &&
              Array.isArray(principalSaleItem.offer.metadata.line_items) &&
              principalSaleItem.offer.metadata.line_items.length > 0 &&
              principalSaleItem.offer.metadata.line_items[0]?.shipping_data?.SE
              ? principalSaleItem.offer.metadata.line_items[0].shipping_data.SE
              : 'Frete';
          break;
        case 'SU':
          shipping_lines_title =
            principalSaleItem.offer.metadata &&
              Array.isArray(principalSaleItem.offer.metadata.line_items) &&
              principalSaleItem.offer.metadata.line_items.length > 0 &&
              principalSaleItem.offer.metadata.line_items[0]?.shipping_data?.SU
              ? principalSaleItem.offer.metadata.line_items[0].shipping_data.SU
              : 'Frete';
          break;
        default:
          break;
      }
    }
    const orderData = {
      line_items: itensOrder,
      transactions: [
        {
          gateway: 'B4You',
          gateway_display_name: 'B4You',
          kind: 'sale',
          status: 'success',
          amount: totalSaleAmount,
        },
      ],
      discount_codes: coupon
        ? [
          {
            code: coupon.coupon.coupon,
            amount: principalSaleItem.discount_amount,
            type: 'fixed_amount',
          },
        ]
        : [],
      discount_application: coupon
        ? [
          {
            discount_applications: {
              type: 'manual',
              value: principalSaleItem.discount_amount,
              value_type: 'fixed_amount',
              allocation_method: 'across',
              target_selection: 'all',
              target_type: 'line_item',
              code: couponDetails.coupon,
            },
          },
        ]
        : [],
      localizationExtensions: {
        nodes: [
          {
            countryCode: 'BR',
            purpose: 'SHIPPING',
            title: 'CPF/CNPJ',
            value: sale.document_number,
          },
        ],
      },
      email: sale.email,
      total_tax: 0,
      currency: 'BRL',
      shipping_address: {
        first_name: capitalizeName(firstName),
        last_name: capitalizeName(lastName),
        address1: `${sale.address.street}, ${sale.address.number}`,
        address2: sale.address.complement,
        phone: sale.whatsapp,
        city: sale.address.city,
        company: sale.document_number,
        province: sale.address.state,
        country: 'Brasil',
        country_code: 'BR',
        zip: sale.address.zipcode,
      },
      billing_address: {
        first_name: capitalizeName(firstName),
        last_name: capitalizeName(lastName),
        address1: `${sale.address.street}, ${sale.address.number}`,
        address2: sale.address.complement,
        city: sale.address.city,
        company: sale.document_number,
        country: 'Brazil',
        phone: sale.whatsapp,
        province: sale.address.state,
        zip: sale.address.zipcode,
        country_code: 'BR',
      },
      shipping_lines: [
        {
          price: principalSaleItem.shipping_price,
          title: principalSaleItem.integration_shipping_company
            ? principalSaleItem.integration_shipping_company
            : shipping_lines_title,
          code: 'Standard',
          source: 'shopify',
          requested_fulfillment_service_id: null,
          delivery_category: null,
          carrier_identifier: null,
          discounted_price: 0,
          phone: sale.whatsapp,
        },
      ],
      note_attributes: [
        {
          name: 'additional_cpf_cnpj',
          value: sale.document_number,
        },
        {
          name: 'additional_info_shipping_number',
          value: sale.address.number,
        },
        {
          name: 'additional_info_shipping_complement',
          value: sale.address.complement,
        },
        {
          name: 'payment_status',
          value: 'paid',
        },
        {
          name: 'payment_method',
          value: 'credit_card',
        },
        {
          name: 'additional_info_shipping_street',
          value: sale.address.street,
        },
      ],
    };

    if (
      principalSaleItem &&
      principalSaleItem.offer &&
      principalSaleItem.offer.metadata &&
      principalSaleItem.offer.metadata.line_items
    ) {
      orderData.line_items = principalSaleItem.offer.metadata.line_items;

      if (coupon) {
        orderData.line_items.properties = {
          Tag: couponDetails.coupon,
        };
        orderData.line_items.discount_allocations = [
          {
            amount: principalSaleItem.discount_amount,
            code: couponDetails.coupon,
            amount_set: {
              shop_money: {
                amount: principalSaleItem.discount_amount,
                currency_code: 'BRL',
              },
              presentment_money: {
                amount: principalSaleItem.discount_amount,
                currency_code: 'BRL',
              },
            },
            discount_application_index: 0,
          },
        ];
      }
      console.log(`[SHOPIFY] ORDER -> ${JSON.stringify(orderData)}`);
      const shopifyNotification = new ShopifyNotification(shopName, accessToken);

      const createdOrder = await shopifyNotification.createOrUpdateOrder(orderData);
      console.log('[SHOPIFY] CREATED ORDER ->', JSON.stringify(createdOrder));
      if (createdOrder?.id) {
        await Sales_items_plugins.create({
          id_sale_item,
          id_shopify: createdOrder.id,
          body: orderData,
          response: Object.keys(createdOrder).length > 0 ? createdOrder : null,
        });
      }
    }
  }
}

async function sendToNotazz({ id_sale, plugin, id_sale_item }) {
  const sale = await Sales.findOne({
    where: {
      id: id_sale,
    },
  });
  const saleItems = await Sales_items.findAll({
    where: {
      id: id_sale_item,
    },
    attributes: [
      'uuid',
      'valid_refund_until',
      'quantity',
      'discount_amount',
      'discount_percentage',
      'price_product',
      'shipping_price',
      'id_status',
    ],
    include: [
      { association: 'charges', attributes: ['discount_amount'] },
      {
        association: 'offer',
        attributes: ['name', 'uuid', 'metadata'],
        paranoid: false,
      },
      {
        association: 'product',
        attributes: ['uuid', 'name'],
        paranoid: false,
        include: [
          {
            association: 'producer',
            attributes: ['full_name', 'email', 'whatsapp', 'document_number'],
          },
        ],
      },
    ],
  });
  const order = {
    name: sale.full_name,
    document_number: sale.document_number,
    email: sale.email,
    phone: sale.whatsapp || '',
    uuid_sale: saleItems[0].uuid,
    sale: saleItems.flatMap((element) => {
      if (element.offer.metadata && Object.keys(element.offer.metadata).length > 0) {
        const metadataItems = element.offer.metadata.line_items || [];
        return metadataItems.map((item) => ({
          uuid: plugin.id_external_notazz ?? element.offer.uuid,
          name: item.title,
          qtd: item.quantity,
          offer_name: element.offer.name || null,
          amount: Number(item.price),
          discount_amount: element.discount_amount,
          shipping_price: element.shipping_price || 0,
        }));
      } else {
        return [
          {
            uuid: plugin.id_external_notazz ?? element.offer.uuid,
            name: element.product.name,
            qtd: element.quantity,
            offer_name: element.offer.name || null,
            amount: Number(
              (
                element.price_product / element.quantity -
                element.discount_amount / element.quantity
              ).toFixed(2)
            ),
            discount_amount: element.discount_amount,
            shipping_price: element.shipping_price || 0,
          },
        ];
      }
    }),
  };

  order.total_price = order.sale.reduce((acc, obj) => acc + obj.amount * obj.qtd, 0);
  const freight = order.sale.reduce((acc, obj) => acc + obj.shipping_price, 0);
  const { address } = sale;
  if (Object.keys(address).length > 0) {
    if (!address.zipcode) {
      await Sales.update({ id_invoice: 0, id_order_notazz: 0 }, { where: { id: sale.id } });
      return;
    }
    order.street = address.street || '';
    order.number = address.number === null || address.number === '0' ? '001' : address.number;
    order.complement = address.complement || '';
    order.neighborhood = address.neighborhood || '';
    order.city = address.city;
    order.state = address.state;
    order.zipcode = address.zipcode || '';
  } else {
    order.street = 'Avenida Pau Brasil';
    order.number = '6';
    order.complement = 'Ed. E-Business, Sala 2211';
    order.neighborhood = 'Aguas Claras';
    order.city = 'Brasilia';
    order.state = 'DF';
    order.zipcode = '71916500';
  }
  if (freight > 0) {
    order.freight = freight;
    //  amostras gratis com preço do frete para produtor -> clariveoficial@gmail.com
    if (order.total_price === 0 && invoicePluginInfo.id_user === 278202) {
      order.total_price = freight;
      const newItems = order.sale.map((item) => ({
        ...item,
        amount: freight,
        discount_amount: freight,
      }));
      order.sale = newItems;
    }
  }
  console.log(`(PRODUCT) INTEGRATION NOTAZZ PRODUCER PRODUCT ORDER ->: ${JSON.stringify(order)}`);
  const invoiceInstance = new Notazz(plugin.settings.api_key);
  const response = await invoiceInstance.generateInvoice(order, {
    type: plugin.settings.type,
    send_email: plugin.settings.send_invoice_customer_mail,
    label_description: plugin.settings.service_label,
    api_key_logistic: plugin.settings.api_key_logistic ?? null,
    generate_invoice: plugin.settings.generate_invoice ?? false,
    is_upsell: false,
  });
  const invoice = await Invoices.create({
    id_user: plugin.id_user,
    id_sale: sale.id,
    id_type: 1,
    integration_response: Object.keys(response).length > 0 ? response : null,
    id_plugin: plugin ? plugin.id_plugin : null,
  });
  await Sales_invoices.create({
    id_sale: sale.id,
    id_user: plugin.id_user,
    id_invoice: invoice.id,
  });
  await Sales_items_plugins.create({
    id_sale_item,
    id_notazz: response.id,
    body: order,
    response: Object.keys(response).length > 0 ? response : null,
  });
}

async function productPhysicalEvents({ id_sale, id_user, id_offer, id_sale_item }) {
  console.log(
    `[PHYSICAL_EVENTS] Iniciando processamento para venda física - Sale: ${id_sale}, User: ${id_user}, Offer: ${id_offer}, SaleItem: ${id_sale_item}`
  );

  // Processamento de envios SQS
  try {
    console.log(
      `[SQS] Enviando pedidos para filas de envio - Sale: ${id_sale}, SaleItem: ${id_sale_item}`
    );
    await aws.add('blingShipping', {
      sale_id: id_sale,
      is_upsell: false,
      is_subscription: true,
      id_sale_item: [id_sale_item],
    });
    console.log(`[SQS] BlingShipping adicionado com sucesso`);

    await aws.add('tinyShipping', {
      sale_id: id_sale,
      is_subscription: true,
      id_sale_item: [id_sale_item],
    });
    console.log(`[SQS] TinyShipping adicionado com sucesso`);
    console.log(`[SQS] Todos os envios SQS processados com sucesso`);
  } catch (error) {
    console.error(`[SQS] Erro ao enviar pedidos para filas:`, {
      error: error.message,
      stack: error.stack,
      sale_id: id_sale,
      sale_item: id_sale_item,
    });
  }

  // Processamento Shopify
  try {
    console.log(`[SHOPIFY] Verificando integração Shopify - User: ${id_user}`);
    const pluginShopify = await Plugins.findOne({
      where: {
        id_user,
        id_plugin: ShopifyId,
        active: true,
      },
      raw: true,
    });

    if (pluginShopify) {
      console.log(`[SHOPIFY] Integração encontrada - Enviando pedido para Shopify`);
      console.log(
        `[SHOPIFY] Dados: Sale: ${id_sale}, Offer: ${id_offer}, Plugin ID: ${pluginShopify.id_plugin}`
      );
      await sendToShopify({ id_offer, id_sale, plugin: pluginShopify, id_sale_item });
      console.log(`[SHOPIFY] Pedido enviado com sucesso para Shopify`);
    } else {
      console.log(`[SHOPIFY] Usuário ${id_user} não possui integração Shopify ativa`);
    }
  } catch (error) {
    console.error(`[SHOPIFY] Erro ao processar pedido Shopify:`, {
      error: error.message,
      stack: error.stack,
      sale_id: id_sale,
      user_id: id_user,
      offer_id: id_offer,
    });
  }

  // Processamento Notazz
  try {
    console.log(`[NOTAZZ] Verificando integração Notazz - User: ${id_user}`);
    const pluginNotazz = await Plugins.findOne({
      where: {
        id_user,
        id_plugin: NotazzId,
        active: true,
      },
      raw: true,
    });

    if (pluginNotazz) {
      console.log(`[NOTAZZ] Integração encontrada - Enviando pedido para Notazz`);
      console.log(
        `[NOTAZZ] Dados: Sale: ${id_sale}, SaleItem: ${id_sale_item}, Plugin ID: ${pluginNotazz.id_plugin}`
      );
      await sendToNotazz({ id_sale, plugin: pluginNotazz, id_sale_item });
      console.log(`[NOTAZZ] Pedido enviado com sucesso para Notazz`);
    } else {
      console.log(`[NOTAZZ] Usuário ${id_user} não possui integração Notazz ativa`);
    }
  } catch (error) {
    console.error(`[NOTAZZ] Erro ao processar pedido Notazz:`, {
      error: error.message,
      stack: error.stack,
      sale_id: id_sale,
      user_id: id_user,
      sale_item: id_sale_item,
    });
  }

  console.log(`[PHYSICAL_EVENTS] Processamento concluído para venda física - Sale: ${id_sale}`);
}

export const handler = async () => {
  const {
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_PORT,
    MYSQL_USERNAME,
    MAILJET_EMAIL_SENDER,
    MAILJET_PASSWORD,
    MAILJET_TEMPLATE_ID,
    MAILJET_USERNAME,
  } = process.env;

  const database = await new Database({
    database: MYSQL_DATABASE,
    host: MYSQL_HOST,
    password: MYSQL_PASSWORD,
    username: MYSQL_USERNAME,
    port: MYSQL_PORT,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      decimalNumbers: true,
    },
  }).connect();

  const DATABASE_DATE = 'YYYY-MM-DD';

  const mailService = new MailService({
    username: MAILJET_USERNAME,
    password: MAILJET_PASSWORD,
    emailSender: MAILJET_EMAIL_SENDER,
    templateID: MAILJET_TEMPLATE_ID,
  });

  try {
    let total = 100;
    let offset = 0;
    while (total !== 0) {
      const subscriptions = await Subscriptions.findAll({
        raw: true,
        limit: 100,
        offset,
        subQuery: false,
        attributes: [
          'id',
          'id_user',
          'credit_card',
          'id_affiliate',
          'id_plan',
          'attempt_count',
          'id_student',
          'id_product',
          'id_coupon',
        ],
        where: {
          active: 1,
          id_status: 1,
          valid_until: null,
          payment_method: 'card',
          created_at: {
            [Op.gte]: '2023-12-29',
          },
          [Op.or]: [
            {
              next_charge: {
                [Op.lte]: date().format(DATABASE_DATE),
              },
            },
            {
              next_attempt: {
                [Op.lte]: date().format(DATABASE_DATE),
              },
              attempt_count: {
                [Op.lt]: 5,
              },
            },
          ],
        },
        include: [
          {
            association: 'product',
            attributes: ['id', 'content_delivery'],
            paranoid: true,
          },
        ],
      });
      total = subscriptions.length;
      offset += 100;
      if (total < 100) {
        total = 0;
      }

      for await (const subscription of subscriptions) {
        console.log('charging -> ');
        console.dir(subscription, { depth: null });
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
            'shipping_price',
            'integration_shipping_company'
          ],
          include: [
            {
              association: 'charges',
              order: [['id', 'desc']],
              where: { id_status: 2 },
              attributes: ['installments', 'provider'],
            },
            {
              association: 'offer',
              attributes: ['shipping_type', 'quantity'],
              paranoid: false,
            },
          ],
        });
        if (!lastSaleItem) {
          console.log('sem sale item ->', subscription);
          await Subscriptions.update(
            {
              active: 0,
              id_status: 3,
            },
            {
              where: {
                id: subscription.id,
              },
            }
          );
          continue;
        }
        const plan = await Product_plans.findOne({
          raw: true,
          where: {
            id: subscription.id_plan,
          },
          paranoid: false,
        });
        if (!plan) {
          console.log('plano não encontrado');
          await Subscriptions.update(
            {
              active: 0,
              id_status: 3,
            },
            {
              where: {
                id: subscription.id,
              },
            }
          );
          continue;
        }
        let appliedCoupon = null;
        if (subscription.id_coupon) {
          const found = await Coupons.findOne({ raw: true, where: { id: subscription.id_coupon } });
          if (found && found.apply_on_every_charge) {
            appliedCoupon = found;
          }
        }
        const product = await Products.findOne({
          raw: true,
          where: { id: lastSaleItem.id_product },
          attributes: ['id', 'uuid', 'name', 'creditcard_descriptor', 'id_user'],
        });
        if (!product) {
          await Subscriptions.update(
            {
              active: 0,
              id_status: 3,
            },
            {
              where: {
                id: subscription.id,
              },
            }
          );
          continue;
        }
        lastSaleItem.product = product;
        const sale = await database.sequelize.query(
          'select full_name, email, document_number from sales where id = :id_sale',
          { replacements: { id_sale: lastSaleItem.id_sale }, plain: true }
        );
        const affiliate = await database.sequelize.query(
          'select * from affiliates where id = :id_affiliate',
          { replacements: { id_affiliate: subscription.id_affiliate }, plain: true }
        );
        const { charges } = lastSaleItem;
        const [lastCharge] = charges;
        const transactionsToCreate = await SalesFees.calculate({
          id_user: subscription.id_user,
          brand: subscription.credit_card.brand,
          installments: lastCharge.installments,
          student_pays_interest: lastSaleItem.price_total > lastSaleItem.price_product,
          sales_items: [
            { price: plan.price, type: 1, shipping_price: lastSaleItem.shipping_price ?? 0 },
          ],
          discount: 0,
          coupon_discount: 0,
          coupon: appliedCoupon,
          database,
        });
        console.dir(transactionsToCreate, { depth: null });

        const [costTransaction, payment] = transactionsToCreate;
        payment.product = product;
        payment.id_offer = lastSaleItem.id_offer;
        const transaction_id = v4();
        let response;
        const products = [
          {
            quantity: lastSaleItem.offer.quantity,
            description: product.name,
            code: product.uuid,
            amount: parseInt((costTransaction.price * 100).toFixed(0), 10),
          },
        ];
        const commissions = await CommissionsProvider.calculate({
          affiliate,
          sale_item: payment,
          shipping_type: 0, // 0 digital, 1 fisico
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
              const idSeller =
                // eslint-disable-next-line
                match[user_field_status_cnpj] === 3
                  ? match[user_field_cnpj]
                  : match[user_field_status_cpf] === 3
                    ? match[user_field_cpf]
                    : null;

              if (idSeller === null) {
                throw ApiError.badRequest('Recebedor não verificado');
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
        const student = await database.sequelize.query(
          'select id, full_name, email, document_number, address, whatsapp from students where id = :id_student',
          {
            replacements: { id_student: subscription.id_student },
            plain: true,
          }
        );
        let client = await Clients.findOne({
          raw: true,
          where: {
            id_provider,
            document_number: student.document_number,
          },
        });
        const paymentProvider = new PaymentService(new Pagarme(pagarmeProvider));
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
          response = await paymentProvider.generateCardSaleWithToken({
            transaction_id,
            price: costTransaction.price,
            token: subscription.credit_card.card_token,
            products,
            commissions: allCommissions,
            installments: lastCharge.installments,
            provider_external_id: client.provider_external_id,
            statement_descriptor: product.creditcard_descriptor,
          });
        } catch (error) {
          console.log('ERRO PAGAMENTO => ', subscription.id);
          console.log(error.response);
          continue;
        }
        console.log('response pagarme -> ', subscription.id);
        console.dir(response, { depth: null });

        const { status, provider, provider_id } = response;

        if (status.label === 'paid') {
          const paid_at = date().now();
          await database.sequelize.transaction(async (t) => {
            const charge = await Charges.create(
              {
                uuid: transaction_id,
                id_user: subscription.id_user,
                id_student: subscription.id_student,
                id_status: status.charge,
                id_sale: lastSaleItem.id_sale,

                payment_method: 'credit_card',
                installments: lastCharge.installments,
                paid_at,
                id_subscription: subscription.id,
                provider,
                provider_id,
                revenue: costTransaction.revenue,
                ...costTransaction,
              },
              { transaction: t }
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
                integration_shipping_company: lastSaleItem.integration_shipping_company,
                ...payment,
              },
              { transaction: t }
            );
            await Sales_items_charges.create(
              {
                id_sale_item: saleItem.id,
                id_charge: charge.id,
              },
              { transaction: t }
            );

            const plan = await database.sequelize.query(
              'select * from product_plans where id = :id_plan',
              { replacements: { id_plan: subscription.id_plan }, plain: true }
            );
            const { frequency_quantity, payment_frequency } = plan;
            const next_charge = date()
              .add(frequency_quantity, payment_frequency)
              .format(DATABASE_DATE);
            await Subscriptions.update(
              { next_charge, next_attempt: null, attempt_count: 0 },
              { where: { id: subscription.id }, transaction: t }
            );

            t.afterCommit(async () => {
              await aws.add('splitCommissions', {
                sale_item_id: saleItem.id,
                shipping_type: lastSaleItem.offer.shipping_type,
              });
              await aws.add('studentApprovedPaymentEmails', {
                product: { name: product.name },
                currentStudent: { full_name: sale.full_name, email: sale.email },
                saleItem,
                costTransaction,
                renew: true,
              });
              await aws.add('webhookEvent', {
                id_product: subscription.id_product,
                id_sale_item: saleItem.id,
                id_user: subscription.id_user,
                id_event: 10, //renewed-subscription,
              });
              try {
                if (subscription['product.content_delivery'] === 'physical') {
                  await productPhysicalEvents({
                    id_sale: lastSaleItem.id_sale,
                    id_user: subscription.id_user,
                    id_offer: lastSaleItem.id_offer,
                    id_sale_item: saleItem.id,
                  });
                }
              } catch (error) {
                console.log('ERROR ON SUBSCRIPTION PHYSICAL');
              }
            });
          });
        } else {
          if (subscription.attempt_count !== 4) {
            await Subscriptions.update(
              {
                attempt_count: subscription.attempt_count + 1,
                next_attempt: date().add(1, 'd'),
              },
              {
                where: {
                  id: subscription.id,
                },
              }
            );
            const newAttemptCount = subscription.attempt_count + 1;
            const emailType = `d${newAttemptCount}`;

            let mailjetResponse = null;
            let emailSent = false;

            try {
              mailjetResponse = await new SubscriptionFailed(mailService).send({
                email: sale.email,
                full_name: sale.full_name,
                product_name: product.name,
                amount: costTransaction.price,
              });
              emailSent = true;
            } catch (error) {
              console.log(
                `Erro ao enviar email de falha para subscription ${subscription.id}:`,
                error
              );
              mailjetResponse = { error: error.message, status: 'failed' };
            }

            const sanitizedMailjetResponse = sanitizeMailjetResponse(mailjetResponse);

            await SubscriptionsLogs.create({
              id_subscription: subscription.id,
              action: 'payment_failed',
              email_type: emailType,
              email_sent_at: emailSent ? date().now() : null,
              mailjet_message_id: mailjetResponse?.body?.Messages?.[0]?.To?.[0]?.MessageID || null,
              mailjet_message_uuid:
                mailjetResponse?.body?.Messages?.[0]?.To?.[0]?.MessageUUID || null,
              mailjet_status: emailSent ? 'success' : 'failed',
              mailjet_response: sanitizedMailjetResponse,
              details: {
                email: sale.email,
                full_name: sale.full_name,
                product_name: product.name,
                amount: costTransaction.price,
                attempt_count: newAttemptCount,
                next_attempt: date().add(1, 'd').format('YYYY-MM-DD'),
              },
            });
            await aws.add('webhookEvent', {
              id_product: subscription.id_product,
              id_sale_item: lastSaleItem.id,
              id_user: subscription.id_user,
              id_event: 9, //late subscription,
            });
          } else {
            await database.sequelize.transaction(async (t) => {
              const charge = await Charges.create(
                {
                  uuid: transaction_id,
                  id_user: subscription.id_user,
                  id_student: subscription.id_student,
                  id_status: status.charge,
                  id_sale: lastSaleItem.id_sale,

                  payment_method: 'credit_card',
                  installments: lastCharge.installments,
                  paid_at: null,
                  id_subscription: subscription.id,
                  provider,
                  provider_id,
                  ...costTransaction,
                },
                { transaction: t }
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
                  paid_at: null,
                  id_offer: lastSaleItem.id_offer,
                  id_classroom: lastSaleItem.id_classroom,
                  id_subscription: subscription.id,
                  ...payment,
                },
                { transaction: t }
              );
              await Sales_items_charges.create(
                {
                  id_sale_item: saleItem.id,
                  id_charge: charge.id,
                },
                { transaction: t }
              );

              await Subscriptions.update(
                { active: false, id_status: 3, canceled_at: date().now() },
                { where: { id: subscription.id }, transaction: t }
              );
              if (subscription['product.content_delivery'] !== 'physical') {
                await StudentProducts.destroy({
                  where: { id_sale_item: saleItem.id },
                  transaction: t,
                });
              }

              let offer_uuid = null;
              if (lastSaleItem?.id_offer) {
                const offer = await database.sequelize.query(
                  'select uuid from product_offer where id = :id_offer',
                  {
                    replacements: { id_offer: lastSaleItem.id_offer },
                    plain: true,
                  }
                );
                offer_uuid = offer?.uuid || null;
              }

              const productSupport = await database.sequelize.query(
                'select support_email, support_whatsapp from products where id = :id_product',
                {
                  replacements: { id_product: subscription.id_product },
                  plain: true,
                }
              );

              t.afterCommit(async () => {
                await aws.add('splitCommissions', {
                  sale_item_id: saleItem.id,
                });

                let cancelMailjetResponse = null;
                let cancelEmailSent = false;

                try {
                  cancelMailjetResponse = await new SubscriptionCanceled(mailService).send({
                    email: sale.email,
                    full_name: sale.full_name,
                    product_name: product.name,
                    amount: costTransaction.price,
                    offer_uuid: offer_uuid,
                    support_email: productSupport?.support_email || null,
                    support_whatsapp: productSupport?.support_whatsapp || null,
                  });
                  cancelEmailSent = true;
                } catch (error) {
                  console.log(
                    `Erro ao enviar email de cancelamento para subscription ${subscription.id}:`,
                    error
                  );
                  cancelMailjetResponse = {
                    error: error.message,
                    status: 'failed',
                  };
                }

                const sanitizedCancelMailjetResponse =
                  sanitizeMailjetResponse(cancelMailjetResponse);

                await SubscriptionsLogs.create({
                  id_subscription: subscription.id,
                  action: 'subscription_canceled',
                  email_type: 'd5',
                  email_sent_at: cancelEmailSent ? date().now() : null,
                  mailjet_message_id:
                    cancelMailjetResponse?.body?.Messages?.[0]?.To?.[0]?.MessageID || null,
                  mailjet_message_uuid:
                    cancelMailjetResponse?.body?.Messages?.[0]?.To?.[0]?.MessageUUID || null,
                  mailjet_status: cancelEmailSent ? 'success' : 'failed',
                  mailjet_response: sanitizedCancelMailjetResponse,
                  details: {
                    email: sale.email,
                    full_name: sale.full_name,
                    product_name: product.name,
                    amount: costTransaction.price,
                    attempt_count: 4,
                    reason: 'max_attempts_reached',
                    cancel_email_sent: cancelEmailSent,
                    id_offer: lastSaleItem?.id_offer || null,
                    offer_uuid: offer_uuid,
                    support_email: productSupport?.support_email || null,
                    support_whatsapp: productSupport?.support_whatsapp || null,
                  },
                });

                try {
                  await new DeleteMemberInvision(Invision, database.sequelize).execute({
                    email: sale.email,
                    id_product: subscription.id_product,
                    id_user: subscription.id_user,
                  });
                } catch (error) {
                  console.log(error);
                  console.log(
                    `ERROR ON INTEGRATION INVISION ID_PRODUCT:${subscription.id_product} - ID_USER:${subscription.id_user}`
                  );
                }
              });
            });
          }
        }
      }
    }
    const subscriptionReactivationUseCase = new SubscriptionReactivationUseCase(
      database,
      mailService
    );
    const reactivationResults = await subscriptionReactivationUseCase.processReactivations();
    console.log('[REACTIVATION] Results:', reactivationResults);
  } catch (error) {
    console.log(error);
    await database.closeConnection();
    throw error;
  } finally {
    await database.closeConnection();
  }

  return {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
};
