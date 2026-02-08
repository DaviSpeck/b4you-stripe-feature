import { Sales } from '../database/models/Sales.mjs';
import { Op } from 'sequelize';
import { Invoices } from '../database/models/Invoices.mjs';
import { findSalesStatusByKey } from '../status/salesStatus.mjs';
import { findIntegrationTypeByKey } from '../types/integrationsTypes.mjs';
import { Enotas } from '../services/eNotas.mjs';
import { date as dateHelper } from '../utils/date.mjs';
const FRONTEND_DATE_WITHOUT_TIME = 'DD/MM/YYYY';
const userHasInvoicePlugin = ({ plugins }) => plugins.length > 0;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getPluginInfo = ({ plugins }) =>
  plugins.find((plugin) => plugin.id_plugin === findIntegrationTypeByKey('enotas').id);

const getPluginInstance = (plugin) => {
  if (plugin.id_plugin === findIntegrationTypeByKey('enotas').id)
    return new Enotas(plugin.settings.api_key);
};

const getInvoiceDueDate = (issue_invoice, validRefundUntil) => {
  if (issue_invoice === 1)
    return dateHelper(validRefundUntil).add(1, 'd').format(FRONTEND_DATE_WITHOUT_TIME);

  return dateHelper().format(FRONTEND_DATE_WITHOUT_TIME);
};

const getPaymentMethod = ({ payment_method }) => {
  if (payment_method === 'billet') return 1;
  if (payment_method === 'card') return 2;
  if (payment_method === 'pix') return 3;
  return 9;
};

const findSales = async () => {
  const sales = Sales.findAll({
    nest: true,
    limit: 100,
    where: {
      id_invoice: null,
    },
    attributes: ['address', 'full_name', 'document_number', 'email', 'whatsapp', 'uuid', 'id'],
    include: [
      {
        association: 'user',
        attributes: ['id'],
        include: [
          {
            association: 'plugins',
            attributes: ['id', 'id_plugin', 'settings', 'active', 'id_user'],
            where: {
              id_plugin: findIntegrationTypeByKey('enotas').id,
              active: true,
            },
            required: true,
          },
        ],
      },
      {
        association: 'sales_items',
        required: true,
        where: { id_status: findSalesStatusByKey('paid').id },
        attributes: [
          'uuid',
          'valid_refund_until',
          'quantity',
          'discount_amount',
          'discount_percentage',
          'price_product',
          'shipping_price',
          'id_status',
          'payment_method',
        ],
        include: [
          { association: 'charges', attributes: ['discount_amount'] },
          { association: 'offer', required: false, attributes: ['name'] },
          {
            association: 'product',
            attributes: ['uuid', 'name', 'warranty'],
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

const findSalesAffiliates = async () => {
  const affiliateSales = await Sales.findAll({
    nest: true,
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
        attributes: ['id', 'full_name', 'document_number', 'email', 'whatsapp'],
      },
      {
        association: 'sales_items',
        attributes: ['uuid', 'valid_refund_until', 'payment_method'],
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
            attributes: ['uuid', 'name', 'warranty'],
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
                      id_plugin: [findIntegrationTypeByKey('enotas').id],
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
  const { sales_items: saleItems } = sale;

  if (
    (Number(invoicePluginInfo.settings.issue_invoice) === 0 &&
      dateHelper(saleItems[0].valid_refund_until).diff(dateHelper(), 'd') <= 0) ||
    Number(invoicePluginInfo.settings.issue_invoice) === 1
  ) {
    try {
      let integration_response = null;
      for await (const saleItem of saleItems) {
        let total_price =
          saleItem.price_product / saleItem.quantity - saleItem.discount_amount / saleItem.quantity;
        let order = {
          client: {
            email: sale.email,
            phone_number: sale.whatsapp || '',
            full_name: sale.full_name,
            document_number: sale.document_number,
          },
          product: {
            name: saleItem.product.name,
            external_id: saleItem.product.uuid,
            price: total_price,
            warranty_days: saleItem.product.warranty,
          },
          date: dateHelper().format(FRONTEND_DATE_WITHOUT_TIME),
          dueDate: getInvoiceDueDate(
            invoicePluginInfo.settings.issue_invoice,
            saleItem.valid_refund_until
          ),
          total_price,
          id_sale: saleItem.uuid,
          description: 'Compra de infoproduto',
          issue_invoice: invoicePluginInfo.settings.issue_invoice,
          tax_over_service: false,
          send_invoice_customer_mail: invoicePluginInfo.settings.send_invoice_customer_mail,
          payment_method: getPaymentMethod(saleItem),
        };
        console.log(order);
        integration_response = await invoiceInstance.createInvoice(order);
        const invoice = await Invoices.create({
          id_user: user.id,
          id_sale: sale.id,
          id_type: 1,
          integration_response:
            Object.keys(integration_response).length > 0 ? integration_response : null,
          id_plugin: invoicePluginInfo ? invoicePluginInfo.id_plugin : null,
        });
        await Sales.update({ id_invoice: invoice.id }, { where: { id: sale.id } });
      }
    } catch (error) {
      console.log('ERROR ON ENOTAS INTEGRATION');
      console.log(error);
      console.log(JSON.stringify(error, null, 4));
    }
  }
};

const generateInvoicesAffiliates = async (sale) => {
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
    console.log('INTEGRATION AFFILIATE ENOTAS START');
    let order = {
      client: {
        email: user.email,
        phone_number: user.whatsapp || '',
        full_name: user.full_name,
        document_number: user.document_number,
      },
      product: {
        name: `${saleItems[0].product.name} - (Afiliado)`,
        external_id: saleItems[0].product.uuid,
        price: saleItems[0].commissions[0].amount,
        warranty_days: saleItems[0].product.warranty,
      },
      date: dateHelper().format(FRONTEND_DATE_WITHOUT_TIME),
      dueDate: getInvoiceDueDate(
        invoicePluginInfo.settings.issue_invoice,
        saleItems[0].valid_refund_until
      ),
      total_price: saleItems[0].commissions[0].amount,
      id_sale: sale.uuid,
      description: 'Compra de infoproduto',
      issue_invoice: invoicePluginInfo.settings.issue_invoice,
      tax_over_service: false,
      send_invoice_customer_mail: invoicePluginInfo.settings.send_invoice_customer_mail,
      payment_method: getPaymentMethod({ payment_method: saleItems[0].payment_method }),
    };
    console.log(order);
    try {
      integration_response = await invoiceInstance.createInvoice(order);
      const invoice = await Invoices.create({
        id_user: affiliateUser.id_user,
        id_sale: sale.id,
        id_type: 1,
        integration_response:
          Object.keys(integration_response).length > 0 ? integration_response : null,
        id_plugin: invoicePluginInfo ? invoicePluginInfo.id_plugin : null,
      });
      await Sales.update({ id_invoice_affiliate: invoice.id }, { where: { id: sale.id } });
    } catch (error) {
      console.log('ERROR ON ENOTAS AFFILIATE INTEGRATION');
      console.log(JSON.stringify(order));
      console.log(error);
    }
  }
};

export const EnotasInvoices = async () => {
  let totalSales = 100;
  try {
    while (totalSales !== 0) {
      const sales = await findSales();
      totalSales = sales.length;
      if (totalSales < 100) {
        totalSales = 0;
      }
      const delaysProducers = sales.map(async (sale, i) => {
        await delay(1000 * (i + 1));
        await generateInvoice(sale);
      });
      await Promises.all(delaysProducers);
    }
  } catch (error) {
    console.log(error);
  }

  let totalSalesAffiliates = 100;
  try {
    while (totalSalesAffiliates !== 0) {
      const saleAffiliates = await findSalesAffiliates();
      totalSalesAffiliates = saleAffiliates.length;
      if (totalSalesAffiliates < 100) {
        totalSalesAffiliates = 0;
      }
      const delaysAffiliates = saleAffiliates.map(async (sale, i) => {
        await delay(1000 * (i + 1));
        await generateInvoicesAffiliates(sale);
      });
      await Promise.all(delaysAffiliates);
    }
  } catch (error) {
    console.log(error);
  }
};
