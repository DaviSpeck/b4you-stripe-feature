/* eslint-disable no-console */
import { Coupons_sales } from '../database/models/Coupons_sales.mjs';
import { Invoices } from '../database/models/Invoices.mjs';
import { Plugins } from '../database/models/Plugins.mjs';
import { Product_offer } from '../database/models/Product_offer.mjs';
import { Sales } from '../database/models/Sales.mjs';
import { Sales_invoices } from '../database/models/Sales_invoices.mjs';
import { Sales_items } from '../database/models/Sales_items.mjs';
import { Sales_items_plugins } from '../database/models/Sales_items_plugins.mjs';
import { ShopifyNotification } from '../services/ShopifyNotification.mjs';
import SQS from '../queues/aws.mjs';
import { findIntegrationTypeByKey } from '../types/integrationTypes.mjs';
import { splitFullName, capitalizeName } from '../utils/formatters.mjs';
// import { Notazz } from ('../services/integrations/notazz');

function verifyRegionByZipcode(zipcode) {
  if (!zipcode || zipcode.length < 8) return 'SE'; // default

  const firstDigit = parseInt(zipcode.charAt(0));

  if (firstDigit >= 1 && firstDigit <= 3) return 'SE'; // Sudeste
  if (firstDigit >= 4 && firstDigit <= 5) return 'NE'; // Nordeste
  if (firstDigit >= 6 && firstDigit <= 7) return 'NO'; // Norte
  if (firstDigit === 8) return 'SU'; // Sul
  if (firstDigit === 9) return 'CO'; // Centro-Oeste

  return 'SE'; // default
}

async function sendToShopify({ id_offer, id_sale, plugin }) {
  const offer = await Product_offer.findOne({
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
    where: { id_sale },
    include: [
      {
        association: 'product',
        paranoid: false,
        attributes: [
          'id',
          'warranty',
          'name',
          'content_delivery',
          'id_type',
          'id_user',
        ],
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
  const couponDetails = '';
  let shipping_lines_title = '';

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
    const totalSaleAmount = salesItems.reduce(
      (acc, obj) => acc + obj.price * obj.quantity,
      0,
    );
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
            : shipping_lines_title, // validar aqui isso ainda
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
      const shopifyNotification = new ShopifyNotification(
        shopName,
        accessToken,
      );

      await shopifyNotification.createOrUpdateOrder(orderData);
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
      if (
        element.offer.metadata &&
        Object.keys(element.offer.metadata).length > 0
      ) {
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
      }
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
            ).toFixed(2),
          ),
          discount_amount: element.discount_amount,
          shipping_price: element.shipping_price || 0,
        },
      ];
    }),
  };

  order.total_price = order.sale.reduce(
    (acc, obj) => acc + obj.amount * obj.qtd,
    0,
  );
  const freight = order.sale.reduce((acc, obj) => acc + obj.shipping_price, 0);
  const { address } = sale;
  if (Object.keys(address).length > 0) {
    if (!address.zipcode) {
      await Sales.update(
        { id_invoice: 0, id_order_notazz: 0 },
        { where: { id: sale.id } },
      );
      return;
    }
    order.street = address.street || '';
    order.number =
      address.number === null || address.number === '0'
        ? '001'
        : address.number;
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
    if (order.total_price === 0 && plugin.id_user === 278202) {
      order.total_price = freight;
      const newItems = order.sale.map((item) => ({
        ...item,
        amount: freight,
        discount_amount: freight,
      }));
      order.sale = newItems;
    }
  }
  console.log(
    `(PRODUCT) INTEGRATION NOTAZZ PRODUCER PRODUCT ORDER ->: ${JSON.stringify(
      order,
    )}`,
  );
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
const productPhysicalEvents = async ({
  id_sale,
  id_user,
  id_offer,
  id_sale_item,
}) => {
  console.log(
    `[PHYSICAL_EVENTS] Iniciando processamento para venda física - Sale: ${id_sale}, User: ${id_user}, Offer: ${id_offer}, SaleItem: ${id_sale_item}`,
  );

  // Processamento de envios SQS
  try {
    console.log(
      `[SQS] Enviando pedidos para filas de envio - Sale: ${id_sale}, SaleItem: ${id_sale_item}`,
    );
    console.log(id_sale_item[0]);
    await SQS.add('blingShipping', {
      sale_id: id_sale,
      is_upsell: false,
      is_subscription: true,
      id_sale_item,
    });
    console.log(`[SQS] BlingShipping adicionado com sucesso`);

    // apenas produtores com shopify e bling vao utilizar até o momento
    // await SQS.add('tinyShipping', {
    //   sale_id: id_sale,
    //   is_subscription: true,
    //   id_sale_item,
    // });
    // console.log(`[SQS] TinyShipping adicionado com sucesso`);
    // console.log(`[SQS] Todos os envios SQS processados com sucesso`);
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
        id_plugin: findIntegrationTypeByKey('shopify').id,
        active: true,
      },
      raw: true,
    });

    if (pluginShopify) {
      console.log(
        `[SHOPIFY] Integração encontrada - Enviando pedido para Shopify`,
      );
      console.log(
        `[SHOPIFY] Dados: Sale: ${id_sale}, Offer: ${id_offer}, Plugin ID: ${pluginShopify.id_plugin}`,
      );
      await sendToShopify({ id_offer, id_sale, plugin: pluginShopify });
      console.log(`[SHOPIFY] Pedido enviado com sucesso para Shopify`);
    } else {
      console.log(
        `[SHOPIFY] Usuário ${id_user} não possui integração Shopify ativa`,
      );
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

  // apenas produtores com shopify e bling vao utilizar até o momento
  // Processamento Notazz
  // try {
  //   console.log(`[NOTAZZ] Verificando integração Notazz - User: ${id_user}`);
  //   const pluginNotazz = await Plugins.findOne({
  //     where: {
  //       id_user,
  //       id_plugin: findIntegrationTypeByKey('notazz').id,
  //       active: true,
  //     },
  //     raw: true,
  //   });

  //   if (pluginNotazz) {
  //     console.log(
  //       `[NOTAZZ] Integração encontrada - Enviando pedido para Notazz`,
  //     );
  //     console.log(
  //       `[NOTAZZ] Dados: Sale: ${id_sale}, SaleItem: ${id_sale_item}, Plugin ID: ${pluginNotazz.id_plugin}`,
  //     );
  //     await sendToNotazz({ id_sale, plugin: pluginNotazz, id_sale_item });
  //     console.log(`[NOTAZZ] Pedido enviado com sucesso para Notazz`);
  //   } else {
  //     console.log(
  //       `[NOTAZZ] Usuário ${id_user} não possui integração Notazz ativa`,
  //     );
  //   }
  // } catch (error) {
  //   console.error(`[NOTAZZ] Erro ao processar pedido Notazz:`, {
  //     error: error.message,
  //     stack: error.stack,
  //     sale_id: id_sale,
  //     user_id: id_user,
  //     sale_item: id_sale_item,
  //   });
  // }

  console.log(
    `[PHYSICAL_EVENTS] Processamento concluído para venda física - Sale: ${id_sale}`,
  );
};

export default productPhysicalEvents;
