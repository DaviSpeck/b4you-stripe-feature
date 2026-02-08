import _ from 'lodash';
import { Op } from 'sequelize';
import { Sales } from '../database/models/Sales.mjs';
import { Invoices } from '../database/models/Invoices.mjs';
import { findSalesStatusByKey } from '../status/salesStatus.mjs';
import { findIntegrationTypeByKey } from '../types/integrationsTypes.mjs';
import { Notazz } from '../services/Notazz.mjs';
import { date as dateHelper } from '../utils/date.mjs';

const userHasInvoicePlugin = ({ plugins }) => plugins.length > 0;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getPluginInfo = ({ plugins }) =>
  plugins.find((plugin) => plugin.id_plugin === findIntegrationTypeByKey('notazz').id);

const getPluginInstance = (plugin) => {
  if (plugin.id_plugin === findIntegrationTypeByKey('notazz').id)
    return new Notazz(plugin.settings.api_key);
};

const findSales = async (offset) => {
  const sales = Sales.findAll({
    nest: true,
    offset,
    limit: 500,
    subQuery: false,
    order: [['id', 'DESC']],
    where: {
      'id_invoice': null,
      '$user.plugins.id$': { [Op.ne]: null },
      'created_at': {
        [Op.gte]: '2024-03-01 00:00:00',
      },
    },
    attributes: [
      'address',
      'full_name',
      'document_number',
      'email',
      'whatsapp',
      'uuid',
      'id',
      'id_user',
    ],
    include: [
      {
        association: 'user',
        attributes: ['id'],
        include: [
          {
            association: 'plugins',
            attributes: ['id', 'id_plugin', 'settings', 'active', 'id_user'],
            where: {
              id_plugin: findIntegrationTypeByKey('notazz').id,
              active: true,
            },
            required: true,
          },
        ],
      },
      {
        association: 'sales_items',
        required: true,
        where: {
          id_status: findSalesStatusByKey('paid').id,
          id_product: { [Op.in]: [7620, 7695, 7696, 7709, 7802, 7803, 7942, 7945] },
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
          { association: 'offer', required: false, attributes: ['name'] },
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
      },
    ],
  });
  return sales;
};

const findSalesAffiliates = async (offset) => {
  const affiliateSales = await Sales.findAll({
    nest: true,
    offset,
    limit: 100,
    subQuery: false,
    where: {
      'id_invoice_affiliate': null,
      '$sales_items.id_status$': findSalesStatusByKey('paid').id,
      '$sales_items.id_affiliate$': {
        [Op.ne]: null,
      },
      '$sales_items.affiliate.user_affiliate.plugins.id$': { [Op.ne]: null },
    },
    attributes: ['id', 'uuid'],
    include: [
      {
        association: 'user',
        attributes: [
          'id',
          'zipcode',
          'street',
          'number',
          'complement',
          'neighborhood',
          'city',
          'state',
          'full_name',
          'document_number',
          'email',
          'whatsapp',
        ],
      },
      {
        association: 'sales_items',
        attributes: ['uuid', 'valid_refund_until'],
        where: { id_product: { [Op.in]: [7620, 7695, 7696, 7709, 7802, 7803, 7942, 7945] } },
        include: [
          {
            association: 'commissions',
            where: { id_role: 3 },
            attributes: ['amount'],
            required: true,
          },
          {
            association: 'product',
            required: true,
            paranoid: false,
            attributes: ['uuid', 'name'],
          },
          {
            association: 'affiliate',
            attributes: ['id', 'id_user'],
            require: true,
            include: [
              {
                association: 'user_affiliate',
                attributes: ['id'],
                include: [
                  {
                    association: 'plugins',
                    attributes: ['id', 'id_plugin', 'settings', 'active', 'id_user'],
                    where: {
                      id_plugin: [findIntegrationTypeByKey('notazz').id],
                      active: true,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  return affiliateSales;
};

const generateInvoice = async (sale) => {
  const { user } = sale;
  let invoiceInstance = null;
  let invoicePluginInfo;
  if (userHasInvoicePlugin(user)) {
    invoicePluginInfo = getPluginInfo(user);
    invoiceInstance = getPluginInstance(invoicePluginInfo);
    try {
      await invoiceInstance.verifyCredentials();
    } catch (error) {
      invoiceInstance = null;
    }
  }
  const { sales_items: saleItems, address } = sale;

  if (
    (Number(invoicePluginInfo.settings.issue_invoice) === 0 &&
      dateHelper(saleItems[0].valid_refund_until).diff(dateHelper(), 'd') <= 0) ||
    Number(invoicePluginInfo.settings.issue_invoice) === 1
  ) {
    const order = {
      name: sale.full_name,
      document_number: sale.document_number,
      email: sale.email,
      phone: sale.whatsapp || '',
      uuid_sale: saleItems[0].uuid,
      sale: saleItems.map((element) => ({
        uuid: element.product.uuid,
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
      })),
    };

    order.total_price = order.sale.reduce((acc, obj) => acc + obj.amount * obj.qtd, 0);

    const freight = order.sale.reduce((acc, obj) => acc + obj.shipping_price, 0);
    if (Object.keys(address).length > 0) {
      order.street = address.street || '';
      order.number = address.number === null || address.number === '0' ? '001' : address.number;
      order.complement = address.complement || '';
      order.neighborhood = address.neighborhood || '';
      order.city = address.city || '';
      order.state = address.state || '';
      order.zipcode = address.zipcode || '';
    } else {
      order.street = 'Avenida Normando Tedesco';
      order.number = '1315';
      order.complement = 'Sala 01';
      order.neighborhood = 'Centro';
      order.city = 'Balneario Camboriu';
      order.state = 'SC';
      order.zipcode = '88330123';
    }
    if (freight > 0) {
      order.freight = freight;
    }

    try {
      console.log('INTEGRATION NOTAZZ ORDER');
      console.log(JSON.stringify(order));
      const response = await invoiceInstance.generateInvoice(order, {
        type: invoicePluginInfo.settings.type,
        send_email: invoicePluginInfo.settings.send_invoice_customer_mail,
        label_description: invoicePluginInfo.settings.service_lavel,
      });
      const invoice = await Invoices.create({
        id_user: user.id,
        id_sale: sale.id,
        id_type: 1,
        integration_response: Object.keys(response).length > 0 ? response : null,
        id_plugin: invoicePluginInfo ? invoicePluginInfo.id_plugin : null,
      });
      await Sales.update(
        { id_invoice: invoice.id, id_order_notazz: response.id },
        { where: { id: sale.id } }
      );
    } catch (error) {
      console.log('ERROR ON NOTAZZ INTEGRATION');
      console.log(error);
      console.log(JSON.stringify(error, null, 4));
    }
  }
};

const generateInvoiceAffiliate = async (sale) => {
  const { user, sales_items } = sale;
  const {
    affiliate: { user_affiliate: affiliateUser },
  } = sales_items[0];

  let invoiceInstance = null;
  let invoicePluginInfo;
  if (userHasInvoicePlugin(affiliateUser)) {
    invoicePluginInfo = getPluginInfo(affiliateUser);
    invoiceInstance = getPluginInstance(invoicePluginInfo);
    try {
      await invoiceInstance.verifyCredentials();
    } catch (error) {
      invoiceInstance = null;
    }
  }
  const { sales_items: saleItems } = sale;
  if (
    (Number(invoicePluginInfo.settings.issue_invoice) === 0 &&
      dateHelper(saleItems[0].valid_refund_until).diff(dateHelper(), 'd') <= 0) ||
    Number(invoicePluginInfo.settings.issue_invoice) === 1
  ) {
    console.log('INTEGRATION AFFILIATE NOTAZZ START');
    const order = {
      uuid_sale: sale.uuid,
      name: user.full_name,
      document_number: user.document_number,
      email: user.email,
      phone: user.whatsapp || '',
      sale: [
        {
          uuid: saleItems[0].uuid,
          name: `${saleItems[0].product.name} - (Afiliado)`,
          qtd: 1,
          amount: saleItems[0].commissions[0].amount,
        },
      ],
    };
    order.total_price = saleItems[0].commissions[0].amount;
    if (
      user.street &&
      user.number &&
      user.neighborhood &&
      user.city &&
      user.state &&
      user.zipcode
    ) {
      order.street = user.street;
      order.number = user.number;
      order.complement = user.complement || '';
      order.neighborhood = user.neighborhood;
      order.city = user.city;
      order.state = user.state;
      order.zipcode = user.zipcode;
    } else {
      order.street = 'Avenida Normando Tedesco';
      order.number = '1315';
      order.complement = 'Sala 01';
      order.neighborhood = 'Centro';
      order.city = 'Balneario Camboriu';
      order.state = 'SC';
      order.zipcode = '88330123';
    }

    try {
      console.log('NOTAZZ AFFILIATE INTEGRATION ORDER');
      console.log(JSON.stringify(order, null, 4));

      const response = await invoiceInstance.generateInvoice(order, {
        type: invoicePluginInfo.settings.type,
        send_email: invoicePluginInfo.settings.send_invoice_customer_mail,
        label_description: invoicePluginInfo.settings.service_lavel,
      });
      const invoice = await Invoices.create({
        id_user: affiliateUser.id_user,
        id_sale: sale.id,
        id_type: 1,
        integration_response: Object.keys(response).length > 0 ? response : null,
        id_plugin: invoicePluginInfo ? invoicePluginInfo.id_plugin : null,
      });
      await Sales.update({ id_invoice_affiliate: invoice.id }, { where: { id: sale.id } });
    } catch (error) {
      console.log('ERROR ON NOTAZZ AFFILIATE INTEGRATION');
      console.log(JSON.stringify(order));
      console.log(error);
    }
  }
};

export const NotazzInvoices = async () => {
  console.log('--INICIANDO--');
  let totalSales = 500;
  let offsetProducer = 0;
  try {
    while (totalSales !== 0) {
      const sales = await findSales(offsetProducer);
      console.log('--TAMANHO PRODUCER SALES--> ', sales.length);
      offsetProducer += 500;
      totalSales = sales.length;
      if (totalSales < 500) {
        totalSales = 0;
      }
      const delaysProducers = sales.map(async (sale, i) => {
        await delay(1000 * (i + 1));
        await generateInvoice(sale);
      });
      await Promise.all(delaysProducers);
    }
  } catch (error) {
    console.log(error);
  }

  let totalSalesAffiliates = 100;
  let offset = 0;
  try {
    while (totalSalesAffiliates !== 0) {
      const affiliateSales = await findSalesAffiliates(offset);
      console.log('--TAMANHO AFFILIATES SALES--> ', affiliateSales.length);
      offset += 100;
      totalSalesAffiliates = affiliateSales.length;
      if (totalSalesAffiliates < 100) {
        totalSalesAffiliates = 0;
      }
      const delaysAffiliates = affiliateSales.map(async (sale, i) => {
        await delay(1000 * (i + 1));
        await generateInvoiceAffiliate(sale);
      });
      await Promise.all(delaysAffiliates);
    }
  } catch (error) {
    console.log(error);
  }
  console.log('--FINALIZADO--');
};
