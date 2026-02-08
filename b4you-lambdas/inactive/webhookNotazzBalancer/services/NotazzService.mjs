import { Invoices } from '../database/models/Invoices.mjs';
import { Sales } from '../database/models/Sales.mjs';
import { Notazz } from './Notazz.mjs';
import { findIntegrationTypeByKey } from '../types/integrationsTypes.mjs';
import { findSalesStatusByKey } from '../status/salesStatus.mjs';

const userHasInvoicePlugin = ({ plugins = [] }) => {
  return plugins.length > 0;
};

const getPluginInfo = (user) => {
  const { plugins } = user;
  if (!plugins) return null;
  return plugins.find((plugin) => plugin.id_plugin === findIntegrationTypeByKey('notazz').id);
};

const getPluginInstance = (plugin) => {
  if (plugin.id_plugin === findIntegrationTypeByKey('notazz').id)
    return new Notazz(plugin.settings.api_key);
};

const generateInvoice = async (sale) => {
  const { user } = sale;
  if (!user) {
    console.log('user doesnt have notazz');
    throw new Error('user not found');
  }
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
};

export class NotazzService {
  constructor() {}

  async generateNota({ id_sale }) {
    const sale = await Sales.findOne({
      nest: true,
      subQuery: false,
      where: {
        id_invoice: null,
        id: id_sale,
      },
      attributes: [
        'id',
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
    if (!sale) {
      console.log('sale not found');
      return;
    }
    await generateInvoice(sale);
  }
}
