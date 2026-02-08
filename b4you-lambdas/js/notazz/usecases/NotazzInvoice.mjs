import _ from 'lodash';
import { Op, Sequelize } from 'sequelize';
import { Sales } from '../database/models/Sales.mjs';
import { Commissions } from '../database/models/Commissions.mjs';
import { Invoices } from '../database/models/Invoices.mjs';
import { findSalesStatusByKey } from '../status/salesStatus.mjs';
import { findIntegrationTypeByKey } from '../types/integrationsTypes.mjs';
import { Notazz } from '../services/Notazz.mjs';
import { date as dateHelper } from '../utils/date.mjs';
import cepPromise from 'cep-promise';
import { Plugins } from '../database/models/Plugins.mjs';
import { Sales_invoices } from '../database/models/Sales_invoices.mjs';
import { v4 as uuidv4 } from 'uuid';
import { Sales_items } from '../database/models/Sales_items.mjs';
const userHasInvoicePlugin = ({ plugins }) => plugins.length > 0;
import fetch from "node-fetch";
import fs from "fs";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getPluginInfo = ({ plugins }) =>
  plugins.find((plugin) => plugin.id_plugin === findIntegrationTypeByKey('notazz').id);

const getPluginInstance = (plugin) => {
  if (plugin.id_plugin === findIntegrationTypeByKey('notazz').id)
    return new Notazz(plugin.settings.api_key);
};

const MAIN_PRODUCT = 1;
const OB_PRODUCT = 3;
const UPSELL_PRODUCT = 2;

// Old version, global account
const findSales = async (offset) => {
  const sales = Sales.findAll({
    nest: true,
    offset,
    limit: 1000,
    subQuery: false,
    order: [['id', 'DESC']],
    where: {
      id_invoice: null,
      '$user.plugins.id$': { [Op.ne]: null },
      '$user.plugins.id_product$': { [Op.eq]: null },
      created_at: {
        [Op.gte]: '2025-08-01 00:00:00',
      },
      id_user: { [Op.notIn]: [1491, 96495] },
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
              id_product: null,
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
            required: false,
            attributes: ['name', 'uuid'],
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
      },
    ],
  });
  return sales;
};

const findSalesAffiliates = async (offset) => {
  const affiliateSales = await Sales.findAll({
    nest: true,
    offset,
    limit: 1000,
    subQuery: false,
    where: {
      id_user: { [Op.notIn]: [1491] },
      id_invoice_affiliate: null,
      '$sales_items.id_status$': findSalesStatusByKey('paid').id,
      '$sales_items.id_affiliate$': {
        [Op.ne]: null,
      },
      '$sales_items.affiliate.user_affiliate.plugins.id$': { [Op.ne]: null },
      created_at: {
        [Op.gte]: '2025-08-01 00:00:00',
      },
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
            where: {
              id_user: { [Op.notIn]: [29866] },
            },
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
                      id_product: null,
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

const findSalesSuppliers = async (offset) => {
  const affiliateSales = await Commissions.findAll({
    nest: true,
    offset,
    limit: 1000,
    subQuery: false,
    where: {
      id_user: { [Op.notIn]: [1491] },
      id_role: 4,
      created_at: {
        [Op.gte]: '2025-08-01 00:00:00',
      },
      '$user.plugins.id$': { [Op.ne]: null },
      '$sale_item.sale.id_invoice_supplier$': null,
    },
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
        include: [
          {
            association: 'plugins',
            attributes: ['id', 'id_plugin', 'settings', 'active', 'id_user'],
            where: {
              id_plugin: findIntegrationTypeByKey('notazz').id,
              active: true,
              id_product: null,
            },
            required: true,
          },
        ],
      },
      {
        association: 'sale_item',
        attributes: [
          'uuid',
          'valid_refund_until',
          'discount_amount',
          'shipping_price',
          'quantity',
          'discount_amount',
          'price_product',
        ],
        where: {
          id_status: findSalesStatusByKey('paid').id,
        },
        include: [
          {
            association: 'product',
            required: true,
            paranoid: false,
            attributes: ['uuid', 'name'],
          },
          {
            association: 'sale',
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
        uuid: element.offer.uuid,
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
      if (!address.zipcode) {
        await Sales.update({ id_invoice: 0, id_order_notazz: 0 }, { where: { id: sale.id } });
        return;
      }
      // const addressComplete = await cepPromise(address.zipcode);

      order.street = address.street || '';
      order.number = address.number === null || address.number === '0' ? '001' : address.number;
      order.complement = address.complement || '';
      order.neighborhood = address.neighborhood || '';
      order.city = address.city;
      order.state = address.state;
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
      console.log('(GLOBAL) INTEGRATION NOTAZZ ORDER');
      console.log(JSON.stringify(order));
      const response = await invoiceInstance.generateInvoice(order, {
        type: invoicePluginInfo.settings.type,
        send_email: invoicePluginInfo.settings.send_invoice_customer_mail,
        label_description: invoicePluginInfo.settings.service_label,
        api_key_logistic: invoicePluginInfo?.settings?.api_key_logistic ?? null,
        generate_invoice: invoicePluginInfo?.settings?.generate_invoice ?? false,
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
      console.log('(GLOBAL) ERROR ON NOTAZZ INTEGRATION');
      if (error && error.response && error.response.data) {
        console.log(JSON.stringify(error.response.data));
        if (error.response.data.motivo === 'Api Key nao liberada para integracao') {
          console.log('desabilitando integração', invoicePluginInfo.id);
          await Plugins.update(
            { active: 0 },
            {
              where: {
                id: invoicePluginInfo.id,
              },
            }
          );
        }
        if (error.response.data.motivo === 'Api Key invalido') {
          console.log('desabilitando integração', invoicePluginInfo.id);
          await Plugins.update(
            { active: 0 },
            {
              where: {
                id: invoicePluginInfo.id,
              },
            }
          );
        }
        if (
          error.response.data.motivo === 'EXTERNAL_ID ja esta vinculado em outro documento fiscal'
        ) {
          console.log('nota fiscal já emitida', sale.id);
          await Sales.update({ id_invoice: 0, id_order_notazz: 0 }, { where: { id: sale.id } });
        }
      } else {
        console.log(error);
      }
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
    console.log('(GLOBAL) INTEGRATION AFFILIATE NOTAZZ START');
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
      order.street = user.street || '';
      order.number = user.number === null || user.number === '0' ? '001' : user.number;
      order.complement = user.complement || '';
      order.neighborhood = user.neighborhood || '';
      order.city = user.city;
      order.state = user.state;
      order.zipcode = user.zipcode || '';
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
      console.log('(GLOBAL) NOTAZZ AFFILIATE INTEGRATION ORDER');
      console.log(JSON.stringify(order, null, 4));

      const response = await invoiceInstance.generateInvoice(order, {
        type: invoicePluginInfo.settings.type,
        send_email: invoicePluginInfo.settings.send_invoice_customer_mail,
        label_description: invoicePluginInfo.settings.service_label,
        generate_invoice: invoicePluginInfo?.settings?.generate_invoice ?? false,
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
      console.log('(GLOBAL) ERROR ON NOTAZZ AFFILIATE INTEGRATION');
      if (error && error.response && error.response.data) {
        console.log(JSON.stringify(error.response.data));
        if (error.response.data.motivo === 'Api Key nao liberada para integracao') {
          console.log('desabilitando integração', invoicePluginInfo.id);
          await Plugins.update(
            { active: 0 },
            {
              where: {
                id: invoicePluginInfo.id,
              },
            }
          );
        }
        if (
          error.response.data.motivo === 'EXTERNAL_ID ja esta vinculado em outro documento fiscal'
        ) {
          console.log('nota fiscal já emitida', sale.id);
          await Sales.update({ id_invoice: 0, id_order_notazz: 0 }, { where: { id: sale.id } });
        }
      } else {
        console.log(error);
      }
    }
  }
};

const generateInvoiceSupplier = async (commission) => {
  const { user } = commission;
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
  const { sale_item } = commission;
  const { sale } = sale_item;
  const { address } = sale;

  if (
    (Number(invoicePluginInfo.settings.issue_invoice) === 0 &&
      dateHelper(sale_item.valid_refund_until).diff(dateHelper(), 'd') <= 0) ||
    Number(invoicePluginInfo.settings.issue_invoice) === 1
  ) {
    console.log('(GLOBAL) INTEGRATION SUPPLIER NOTAZZ START');
    const order = {
      name: sale.full_name,
      document_number: sale.document_number,
      email: sale.email,
      phone: sale.whatsapp || '',
      uuid_sale: sale_item.uuid,
      sale: [
        {
          uuid: sale_item.uuid,
          name: `${sale_item.product.name} - (Fornecedor)`,
          qtd: sale_item.quantity,
          discount_amount: sale_item.discount_amount,
          shipping_price: sale_item.shipping_price || 0,
          amount: Number(
            (
              sale_item.price_product / sale_item.quantity -
              sale_item.discount_amount / sale_item.quantity
            ).toFixed(2)
          ),
        },
      ],
    };

    order.total_price = order.sale.reduce((acc, obj) => acc + obj.amount * obj.qtd, 0);

    const freight = order.sale.reduce((acc, obj) => acc + obj.shipping_price, 0);
    if (Object.keys(address).length > 0) {
      if (!address.zipcode) {
        await Sales.update({ id_invoice: 0, id_invoice_supplier: 0 }, { where: { id: sale.id } });
        return;
      }
      // const addressComplete = await cepPromise(address.zipcode);
      // console.log(addressComplete);
      order.street = address.street || '';
      order.number = address.number === null || address.number === '0' ? '001' : address.number;
      order.complement = address.complement || '';
      order.neighborhood = address.neighborhood || '';
      // order.city = addressComplete.city;
      // order.state = addressComplete.state;
      order.city = address.city;
      order.state = address.state;
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
      console.log('NOTAZZ SUPPLIER INTEGRATION ORDER');
      console.log(JSON.stringify(order, null, 4));
      const danilo = {
        type: invoicePluginInfo.settings.type,
        send_email: invoicePluginInfo.settings.send_invoice_customer_mail,
        label_description: invoicePluginInfo.settings.service_label,
      };

      const response = await invoiceInstance.generateInvoice(order, {
        type: invoicePluginInfo.settings.type,
        send_email: invoicePluginInfo.settings.send_invoice_customer_mail,
        label_description: invoicePluginInfo.settings.service_label,
        generate_invoice: invoicePluginInfo?.settings?.generate_invoice ?? false,
      });

      const invoice = await Invoices.create({
        id_user: user.id,
        id_sale: sale_item.sale.id,
        id_type: 1,
        integration_response: Object.keys(response).length > 0 ? response : null,
        id_plugin: invoicePluginInfo ? invoicePluginInfo.id_plugin : null,
      });
      await Sales.update({ id_invoice_supplier: invoice.id }, { where: { id: sale_item.sale.id } });
    } catch (error) {
      console.log('(GLOBAL) ERROR ON NOTAZZ SUPPLIERS INTEGRATION');
      if (error && error.response && error.response.data) {
        console.log(JSON.stringify(error.response.data));
        if (error.response.data.motivo === 'Api Key nao liberada para integracao') {
          console.log('desabilitando integração', invoicePluginInfo.id);
          await Plugins.update(
            { active: 0 },
            {
              where: {
                id: invoicePluginInfo.id,
              },
            }
          );
        }
        if (
          error.response.data.motivo === 'EXTERNAL_ID ja esta vinculado em outro documento fiscal'
        ) {
          console.log('nota fiscal já emitida', sale.id);
          await Sales.update(
            { id_invoice: 0, id_order_notazz: 0 },
            { where: { id: sale_item.sale.id } }
          );
        }
      } else {
        console.log(error);
      }
    }
  }
};

// new version, by product
const findNewSales = async () => {
  const integrations = await Plugins.findAll({
    where: {
      id_plugin: findIntegrationTypeByKey('notazz').id,
      active: true,
      id_product: {
        [Op.ne]: null,
      },
      is_affiliate: false,
      is_supplier: false,
    },
    order: [['id', 'DESC']],
  });


  for await (const integ of integrations) {

    const order = Number(integ.settings.issue_invoice) === 0 ? [['id', 'asc']] : [['id', 'desc']]

    const sales = await Sales.findAll({
      nest: true,
      limit: 200,
      order,
      where: {
        id_order_notazz: null,
        created_at: {
          [Op.gte]: dateHelper(integ.start_date).add(3, 'h').toISOString(),
        },
        [Op.and]: [
          Sequelize.where(Sequelize.col('id'), {
            [Op.notIn]: Sequelize.literal(
              `(SELECT id_sale FROM sales_invoices WHERE sales_invoices.id_user = sales.id_user)`
            ),
          }),
        ],
      },
      include: [
        {
          association: 'sales_items',
          required: true,
          where: {
            id_status: findSalesStatusByKey('paid').id,
            id_product: integ.id_product,
            type: MAIN_PRODUCT,
            id_offer: {
              [Op.ne]: null,
            },
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
        },
        {
          association: 'invoices',
          required: false,
        },
      ],
    });

    console.log('STARTING (PRODUCT-PRODUCER) INTEG->', integ.id);
    console.log('STARTING (PRODUCT-PRODUCER) INTEG product->', integ.id_product);
    console.log('(PRODUCT) SALES leng->', sales.length);

    const formattedSales = [];
    const formattedUpsellSales = [];
    const GROUP_UPSELL = (integ && integ.settings && integ.settings.group_upsell_order) || false;

    for await (let s of sales) {
      const aux = s.toJSON();
      const OBsales = await Sales_items.findAll({
        where: {
          id_sale: s.id,
          type: OB_PRODUCT,
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
            attributes: ['name', 'uuid'],
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

      const UpsellSales = await Sales_items.findAll({
        where: {
          id_sale: s.id,
          type: UPSELL_PRODUCT,
          id_status: findSalesStatusByKey('paid').id,
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
            attributes: ['name', 'uuid'],
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

      const jsonSales = OBsales.map((item) => item.toJSON());
      const upsellJsonSales = UpsellSales.map((item) => item.toJSON());

      if (upsellJsonSales.length > 0) {
        formattedUpsellSales.push({
          ...aux,
          sales_items: [...upsellJsonSales],
        });
      }

      if (upsellJsonSales.length > 0 && GROUP_UPSELL) {
        formattedSales.push({
          ...aux,
          sales_items: [...jsonSales, ...aux.sales_items, ...upsellJsonSales],
        });
      } else {
        formattedSales.push({
          ...aux,
          sales_items: [...jsonSales, ...aux.sales_items],
        });
      }
    }

    const delaysProducers = formattedSales.map(async (sale, i) => {
      await delay(600 * (i + 1));
      await generateInvoiceProduct(sale, integ);
    });
    await Promise.all(delaysProducers);

    if (formattedUpsellSales.length > 0 && !GROUP_UPSELL) {
      const delaysProducersUpSell = formattedUpsellSales.map(async (sale, i) => {
        await delay(600 * (i + 1));
        await generateInvoiceProduct(sale, integ, true);
      });
      await Promise.all(delaysProducersUpSell);
    }

    console.log('FINISHIN (PRODUCT-PRODUCER) integ->', integ.id);
  }
};

const findAffiliateSales = async () => {
  const integrations = await Plugins.findAll({
    where: {
      id_plugin: findIntegrationTypeByKey('notazz').id,
      active: true,
      id_product: {
        [Op.ne]: null,
      },
      is_affiliate: true,
      is_supplier: false,
    },
  });
  for await (const integration of integrations) {
    const affiliateSales = await Sales.findAll({
      limit: 1000,
      subQuery: false,
      where: {
        created_at: {
          [Op.gte]: dateHelper(integration.start_date).add(3, 'h').toISOString(),
        },
        [Op.and]: [
          Sequelize.where(Sequelize.col('sales.id'), {
            [Op.notIn]: Sequelize.literal(
              `(SELECT id_sale FROM sales_invoices WHERE sales_invoices.id_user = ${integration.id_user})`
            ),
          }),
        ],
      },
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
          attributes: ['uuid', 'valid_refund_until', 'id_status', 'id_product'],
          where: {
            id_product: integration.id_product,
            id_status: findSalesStatusByKey('paid').id,
            id_affiliate: {
              [Op.ne]: null,
            },
          },
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
              where: {
                id_user: { [Op.notIn]: [29866] },
              },
            },
          ],
        },
        {
          association: 'invoices',
          required: false,
        },
      ],
    });
    console.log('STARTING (PRODUCT-AFFILIATE) INTEG->', integration.id);
    console.log('(PRODUCT) SALES leng->', affiliateSales.length);
    const delayAffiliates = affiliateSales.map(async (sale, i) => {
      await delay(300 * (i + 1));
      await generateInvoiceAffiliateProduct(sale, integration);
    });
    await Promise.all(delayAffiliates);
    console.log('FINISHIN (PRODUCT-AFFILIATE) integ->', integration.id);
  }
};

const findSuppliersProducts = async () => {
  const integrations = await Plugins.findAll({
    where: {
      id_plugin: findIntegrationTypeByKey('notazz').id,
      active: true,
      id_product: {
        [Op.ne]: null,
      },
      is_supplier: true,
      is_affiliate: false,
    },
  });
  for await (const integration of integrations) {
    const supplierSales = await Sales.findAll({
      limit: 100,
      subQuery: false,
      where: {
        created_at: {
          [Op.gte]: dateHelper(integration.start_date).add(3, 'h').toISOString(),
        },
        [Op.and]: [
          Sequelize.where(Sequelize.col('sales.id'), {
            [Op.notIn]: Sequelize.literal(
              `(SELECT id_sale FROM sales_invoices WHERE sales_invoices.id_user = ${integration.id_user})`
            ),
          }),
        ],
      },
      include: [
        {
          association: 'sales_items',
          required: true,
          where: {
            id_status: findSalesStatusByKey('paid').id,
            id_product: integration.id_product,
            type: MAIN_PRODUCT,
            id_offer: {
              [Op.ne]: null,
            },
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
              attributes: ['name', 'uuid'],
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
        },
        {
          association: 'invoices',
          required: false,
        },
      ],
    });
    console.log('STARTING (PRODUCT-SUPPLIER) INTEG->', integration.id);
    console.log('(PRODUCT) SALES leng->', supplierSales.length);
    const formattedSales = [];
    const formattedUpsellSales = [];
    const GROUP_UPSELL = (integration && integration.settings && integration.settings.group_upsell_order) || false;
    for await (let s of supplierSales) {
      const aux = s.toJSON();
      const OBsales = await Sales_items.findAll({
        where: {
          id_sale: s.id,
          type: OB_PRODUCT,
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
            attributes: ['name', 'uuid'],
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

      const UpsellSales = await Sales_items.findAll({
        where: {
          id_sale: s.id,
          type: UPSELL_PRODUCT,
          id_status: findSalesStatusByKey('paid').id,
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
            attributes: ['name', 'uuid'],
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
      const jsonSales = OBsales.map((item) => item.toJSON());
      const upsellJsonSales = UpsellSales.map((item) => item.toJSON());
      if (upsellJsonSales.length > 0) {
        formattedUpsellSales.push({
          ...aux,
          sales_items: [...upsellJsonSales],
        });
      }

      if (upsellJsonSales.length > 0 && GROUP_UPSELL) {
        formattedSales.push({
          ...aux,
          sales_items: [...jsonSales, ...aux.sales_items, ...upsellJsonSales],
        });
      } else {
        formattedSales.push({
          ...aux,
          sales_items: [...jsonSales, ...aux.sales_items],
        });
      }
    }


    console.log("formattedSales", formattedSales.length, JSON.stringify(formattedSales))
    console.log("formattedUpsellSales", formattedUpsellSales.length, JSON.stringify(formattedUpsellSales))


    const delaySuppliers = formattedSales.map(async (sale, i) => {
      await delay(600 * (i + 1));
      await generateInvoiceProductSupplier(sale, integration);
    });

    if (formattedUpsellSales.length > 0 && !GROUP_UPSELL) {
      const delaysProducersUpSell = formattedUpsellSales.map(async (sale, i) => {
        await delay(600 * (i + 1));
        await generateInvoiceProductSupplier(sale, integ, true);
      });
      await Promise.all(delaysProducersUpSell);
    }
    await Promise.all(delaySuppliers);
    console.log('FINISHIN (PRODUCT-SUPPLIER) integ->', integration.id);
  }
};

const generateInvoiceProduct = async (sale, invoicePluginInfo, is_upsell = false) => {
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
      uuid_sale: !is_upsell ? sale.uuid : saleItems[0].uuid,
      sale: saleItems.flatMap((element) => {
        if (element.offer.metadata && Object.keys(element.offer.metadata).length > 0) {
          const metadataItems = element.offer.metadata.line_items || [];
          return metadataItems.map((item) => ({
            uuid: invoicePluginInfo.id_external_notazz ?? element.offer.uuid,
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
              uuid: invoicePluginInfo.id_external_notazz ?? element.offer.uuid,
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

    if (Object.keys(address).length > 0) {
      if (!address.zipcode) {
        await Sales.update({ id_invoice: 0, id_order_notazz: 0 }, { where: { id: sale.id } });
        return;
      }
      // const addressComplete = await cepPromise(address.zipcode);
      // console.log(
      //   'address on (PRODUCT) INTEGRATION NOTAZZ PRODUCER PRODUCT ORDER',
      //   addressComplete
      // );
      order.street = address.street || '';
      order.number = address.number === null || address.number === '0' ? '001' : address.number;
      order.complement = address.complement || '';
      order.neighborhood = address.neighborhood || '';
      // order.city = addressComplete.city;
      // order.state = addressComplete.state;
      order.city = address.city;
      order.state = address.state;
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

    try {
      console.log(`(PRODUCT) INTEGRATION NOTAZZ PRODUCER PRODUCT ORDER -> is_upsell: ${is_upsell}`);
      console.log(JSON.stringify(order));
      const invoiceInstance = new Notazz(invoicePluginInfo.settings.api_key);
      const response = await invoiceInstance.generateInvoice(order, {
        type: invoicePluginInfo.settings.type,
        send_email: invoicePluginInfo.settings.send_invoice_customer_mail,
        label_description: invoicePluginInfo.settings.service_label,
        api_key_logistic: invoicePluginInfo.settings.api_key_logistic ?? null,
        generate_invoice: invoicePluginInfo.settings.generate_invoice ?? false,
        is_upsell,
      });
      if (response?.statusProcessamento !== 'erro') {
        const invoice = await Invoices.create({
          id_user: invoicePluginInfo.id_user,
          id_sale: sale.id,
          id_type: 1,
          integration_response: Object.keys(response).length > 0 ? response : null,
          id_plugin: invoicePluginInfo ? invoicePluginInfo.id_plugin : null,
        });
        await Sales_invoices.create({
          id_sale: sale.id,
          id_user: invoicePluginInfo.id_user,
          id_invoice: invoice.id,
        });
        await Sales.update(
          { id_invoice: invoice.id, id_order_notazz: response.id },
          { where: { id: sale.id } }
        );
      } else {
        console.log('erro ao enviar pedido ao notazz -> id_user', invoicePluginInfo.id_user)
      }
    } catch (error) {
      console.error(
        `(PRODUCT) ERROR ON NOTAZZ PRODUCER PRODUCT INTEGRATION id user-> ${invoicePluginInfo.id_user} and id ${invoicePluginInfo.id} and sale_id ${sale.id}`
      );
      if (error && error.response && error.response.data) {
        console.error(JSON.stringify(error.response.data));
        if (error.response.data.motivo === 'Api Key nao liberada para integracao') {
          console.log(`Desabilitando integração notazz, devido a api key não liberada, id user-> ${invoicePluginInfo.id_user}`)
          await Plugins.update(
            { active: 0 },
            { where: { id: invoicePluginInfo.id } }
          );
          return;
        }
      } else {
        console.error(error);
      }
      if (
        error &&
        error.response &&
        error.response.data &&
        error.response.data.motivo === 'EXTERNAL_ID ja esta vinculado em outro documento fiscal'
      ) {
        console.log('external id ja vinculado, atualizado sale');
        await Sales.update(
          { id_invoice: 0, id_order_notazz: '010101' },
          { where: { id: sale.id } }
        );
      }
      if (
        error &&
        error.response &&
        error.response.data &&
        error.response.data.motivo ===
        'Variavel DESTINATION_CITY nao localizada em nossa base de dados | '
      ) {
        console.error('CIDADE INVALIDA, buscando CEP->', address.zipcode);
        try {
          const cepResponse = await fetch(`https://viacep.com.br/ws/${address.zipcode}/json/`);
          const cepData = await cepResponse.json();
          console.log('cep response', cepData)
          if (cepData && cepData.ibge) {
            const data = JSON.parse(fs.readFileSync("./municipios_ibge.json", "utf8"));
            const municipio = data.find(m => m.id === Number(cepData.ibge));
            order.city = municipio.nome;
            console.log('trying update city', order);
            const invoiceInstance = new Notazz(invoicePluginInfo.settings.api_key);
            await delay(1000);
            const response = await invoiceInstance.generateInvoice(order, {
              type: invoicePluginInfo.settings.type,
              send_email: invoicePluginInfo.settings.send_invoice_customer_mail,
              label_description: invoicePluginInfo.settings.service_label,
              api_key_logistic: invoicePluginInfo.settings.api_key_logistic ?? null,
              generate_invoice: invoicePluginInfo.settings.generate_invoice ?? false,
              is_upsell,
            });
            const invoice = await Invoices.create({
              id_user: invoicePluginInfo.id_user,
              id_sale: sale.id,
              id_type: 1,
              integration_response: Object.keys(response).length > 0 ? response : null,
              id_plugin: invoicePluginInfo ? invoicePluginInfo.id_plugin : null,
            });
            await Sales_invoices.create({
              id_sale: sale.id,
              id_user: invoicePluginInfo.id_user,
              id_invoice: invoice.id,
            });
            await Sales.update(
              { id_invoice: invoice.id, id_order_notazz: response.id },
              { where: { id: sale.id } }
            );
          }
        } catch (error) {
          if (error && error.response && error.response.data) {
            console.log('erro ao buscar e atualizar cidade', JSON.stringify(error.response.data));
          } else {
            console.log('erro ao buscar e atualizar cidade', error);
          }
        }
      }
    }
  }
};

const generateInvoiceAffiliateProduct = async (sale, invoicePluginInfo) => {
  const { sales_items: saleItems, user } = sale;
  console.log('invoicePluginInfo', invoicePluginInfo);
  if (
    (Number(invoicePluginInfo.settings.issue_invoice) === 0 &&
      dateHelper(saleItems[0].valid_refund_until).diff(dateHelper(), 'd') <= 0) ||
    Number(invoicePluginInfo.settings.issue_invoice) === 1
  ) {
    console.log('(PRODUCT) INTEGRATION AFFILIATE PRODUCT NOTAZZ START');
    const order = {
      uuid_sale: uuidv4(),
      name: user.full_name,
      document_number: user.document_number,
      email: user.email,
      phone: user.whatsapp || '',
      sale: [
        {
          uuid: invoicePluginInfo.id_external_notazz ?? saleItems[0].uuid,
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
      console.log('(PRODUCT) NOTAZZ AFFILIATE PRODUCT INTEGRATION ORDER');
      console.log(JSON.stringify(order, null, 4));
      const invoiceInstance = new Notazz(invoicePluginInfo.settings.api_key);
      const response = await invoiceInstance.generateInvoice(order, {
        type: invoicePluginInfo.settings.type,
        send_email: invoicePluginInfo.settings.send_invoice_customer_mail,
        label_description: invoicePluginInfo.settings.service_label,
        generate_invoice: invoicePluginInfo?.settings?.generate_invoice ?? false,
      });
      const invoice = await Invoices.create({
        id_user: invoicePluginInfo.id_user,
        id_sale: sale.id,
        id_type: 1,
        integration_response: Object.keys(response).length > 0 ? response : null,
        id_plugin: invoicePluginInfo ? invoicePluginInfo.id_plugin : null,
      });
      await Sales_invoices.create({
        id_sale: sale.id,
        id_user: invoicePluginInfo.id_user,
        id_invoice: invoice.id,
      });
      await Sales.update({ id_invoice_affiliate: invoice.id }, { where: { id: sale.id } });
    } catch (error) {
      console.log('(PRODUCT) ERROR ON NOTAZZ AFFILIATE PRODUCT INTEGRATION');
      if (error && error.response && error.response.data) {
        console.log(JSON.stringify(error.response.data));
      } else {
        console.log(error);
      }
    }
  }
};

const generateInvoiceProductSupplier = async (sale, invoicePluginInfo, is_upsell = false) => {
  const { sales_items: saleItems, address } = sale;
  // console.log('invoicePluginInfo', invoicePluginInfo.id);
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
      uuid_sale: !is_upsell ? sale.uuid : saleItems[0].uuid,
      sale: saleItems.map((element) => ({
        uuid: invoicePluginInfo.id_external_notazz ?? element.offer.uuid,
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
      if (!address.zipcode) {
        await Sales.update({ id_invoice: 0, id_order_notazz: 0 }, { where: { id: sale.id } });
        return;
      }
      // const addressComplete = await cepPromise(address.zipcode);
      // console.log(
      //   'address on (SUPPLIER) INTEGRATION NOTAZZ SUPPLOER PRODUCT ORDER',
      //   addressComplete
      // );
      order.street = address.street || '';
      order.number = address.number === null || address.number === '0' ? '001' : address.number;
      order.complement = address.complement || '';
      order.neighborhood = address.neighborhood || '';
      // order.city = addressComplete.city;
      // order.state = addressComplete.state;
      order.city = address.city;
      order.state = address.state;
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
      console.log('(PRODUCT SUPPLIER) INTEGRATION NOTAZZ ORDER -> is_upsell: ${is_upsell}');
      console.log(JSON.stringify(order));
      const invoiceInstance = new Notazz(invoicePluginInfo.settings.api_key);
      const response = await invoiceInstance.generateInvoice(order, {
        type: invoicePluginInfo.settings.type,
        send_email: invoicePluginInfo.settings.send_invoice_customer_mail,
        label_description: invoicePluginInfo.settings.service_label,
        api_key_logistic: invoicePluginInfo?.settings?.api_key_logistic ?? null,
        generate_invoice: invoicePluginInfo?.settings?.generate_invoice ?? false,
      });
      const invoice = await Invoices.create({
        id_user: invoicePluginInfo.id_user,
        id_sale: sale.id,
        id_type: 1,
        integration_response: Object.keys(response).length > 0 ? response : null,
        id_plugin: invoicePluginInfo ? invoicePluginInfo.id_plugin : null,
      });
      await Sales_invoices.create({
        id_sale: sale.id,
        id_user: invoicePluginInfo.id_user,
        id_invoice: invoice.id,
      });
      await Sales.update({ id_invoice_supplier: invoice.id }, { where: { id: sale.id } });
    } catch (error) {
      console.log('(PRODUCT) ERROR ON NOTAZZ INTEGRATION SUPPLIER PRODUCT');
      if (error && error.response && error.response.data) {
        console.log(JSON.stringify(error.response.data));
      } else {
        console.log(error);
      }
    }
  }
};

export const NotazzInvoices = async () => {
  //old version, by global account
  console.log('--INICIANDO GLOBAL--');
  let totalSales = 1000;
  let offsetProducer = 0;
  try {
    while (totalSales !== 0) {
      const sales = await findSales(offsetProducer);
      console.log('--TAMANHO PRODUCER SALES--> ', sales.length);
      offsetProducer += 1000;
      totalSales = sales.length;
      if (totalSales < 1000) {
        totalSales = 0;
      }
      const delaysProducers = sales.map(async (sale, i) => {
        await delay(100 * (i + 1));
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
  let totalSalesSuppliers = 100;
  let offsetSuppliers = 0;
  try {
    while (totalSalesSuppliers !== 0) {
      const supplierSales = await findSalesSuppliers(offsetSuppliers);
      console.log('--TAMANHO SUPPLIERS SALES--> ', supplierSales.length);
      offsetSuppliers += 100;
      totalSalesSuppliers = supplierSales.length;
      if (totalSalesSuppliers < 100) {
        totalSalesSuppliers = 0;
      }
      const delaySuppliers = supplierSales.map(async (sale, i) => {
        await delay(1000 * (i + 1));
        await generateInvoiceSupplier(sale);
      });
      await Promise.all(delaySuppliers);
    }
  } catch (error) {
    console.log(error);
  }
  console.log('--FINALIZADO GLOBAL--');
  //  new version by product
  console.log('--INICIANDO POR PRODUTO--');
  await findNewSales();
  await findAffiliateSales();
  await findSuppliersProducts();
  console.log('--FINALIZADO POR PRODUTO--');
};
