import { Sales } from '../database/models/Sales.mjs';
import { Plugins } from '../database/models/Plugins.mjs';
import { findIntegrationTypeByKey } from '../types/integrationTypes.mjs';
import { BlingV3 } from '../services/BlingShippingV3.mjs';
import { delay } from '../utils/delay.mjs';

const product_sku = [
  {
    uuid: '26478234-b188-45d5-83bc-c8c4c8b442cb',
    sku: 'PERFUME-ATTRACIONE-MEN-1UN',
  },
  {
    uuid: 'de3d1d10-0bca-4f22-945f-a18b2a209766',
    sku: 'PERFUME-ATTRACIONE-MEN-1UN',
  },
  {
    uuid: '6dbeac44-c7d7-4c6d-9a7b-3ac58822baaf',
    sku: 'TESTO-ENCAPSULADO-1UN',
  },
  {
    uuid: '2ecdbe18-85ac-4fd4-99da-0cc706736809',
    sku: 'TESTO-ENCAPSULADO-1UN',
  },
  {
    uuid: '3bfa61ff-1c7d-4510-9393-955f44203763',
    sku: 'TESTO-ENCAPSULADO-1UN',
  },
  { uuid: '83e86111-357e-4139-82be-97dec0789137', sku: 'SKU:PERFUME-ATTRACIONE-MEN-1UN' },
  { uuid: '9a944a90-3c0e-44b0-9afa-367a226e0926', sku: 'PERFUME-ATTRACIONE-MEN-1UN' },
  { uuid: '33301f10-ed95-41b1-956f-13a84d5b14aa', sku: 'PERFUME-NOVO-1UN' },
  { uuid: '680e9f14-9dbe-4bbc-acb7-11eb16771898', sku: 'PERFUME-NOVO-1UN' },
  { uuid: '0d1ce0b4-db35-4fb3-8c42-69cb21763329', sku: 'LIP-1' },
  { uuid: 'd9f392c3-5694-43ed-a2a1-6ab22eac644d', sku: 'HIDRATANTE-SHINE-1UNI' },
  { uuid: '2c18cb5a-e2b8-4627-bbf1-de94dbef17e9', sku: 'PERFUME-ATTRACIONE-MEN-1UN' },
  { uuid: 'dc4a106b-8779-4487-97f5-dad7aff88d76', sku: 'PERFUME-NOVO-1UN' },
  { uuid: 'c95b7ef0-ed16-4efd-9396-3b81e7bfa3dd', sku: 'HIDRATANTE-MEN-1UN' },
  { uuid: '8883acf6-7525-41d9-8e54-dfaec28d45a6', sku: 'HIDRATANTE-MEN-1UN' },
];

const sanitizeString = str => {
  return str.replace(/[!@#$%^&*+=]/g, '');
};

const formatCity = str => {
  if (str.toLowerCase() === 'santana do livramento') return "Sant'Ana do Livramento";
  return sanitizeString(str);
};

const formatPhone = number => {
  const str = number.toString().replace(/\D/g, '');
  if (str.length === 11) {
    return `(${str.slice(0, 2)})${str.slice(2)}`;
  }
  if (str.length === 10) {
    return `(${str.slice(0, 2)})${str.slice(2)}`;
  }
  return number;
};

export class BlingShippingV3 {
  constructor() {}

  async execute(sale) {
    const plugin = await Plugins.findOne({
      where: {
        id_user: sale.id_user,
        id_plugin: findIntegrationTypeByKey('blingshippingv3').id,
        active: true,
      },
    });

    if (!plugin) {
      console.log('Plugin not found v3. SALE ID: ', sale.id);
      return;
    }
    if (!sale) {
      console.log('Sale not found. SALE ID: ', sale.id);
      return;
    }

    const blingV3 = new BlingV3(plugin.settings.refresh_token, plugin.settings.access_token);

    try {
      if (!(await blingV3.verifyCredentials())) {
        const { refresh_token, access_token } = await blingV3.refreshToken();

        await Plugins.update(
          {
            settings: {
              ...plugin.settings,
              refresh_token,
              access_token,
            },
          },
          {
            where: {
              id: plugin.id,
            },
          }
        );
      }

      const products = [];

      for await (let item of sale.sales_items) {
        const productSKu = product_sku.find(e => e.uuid === item.product.uuid).sku;
        await delay(1);
        const { id } = await blingV3.getProduct(productSKu);
        if (!id) {
          await delay(1);
          const { id } = await blingV3.createProduct({
            code: productSKu,
            name: `${item.product.name} ${item.offer.name}`,
            price: item.price_product / item.quantity,
          });
          products.push({ id, code: productSKu, uuid: item.product.uuid });
        }
        products.push({ id, code: productSKu, uuid: item.product.uuid });
      }

      await delay(1);
      let client = await blingV3.getContact(sale.document_number);
      if (!client) {
        await delay(1);
        console.log('Cliente não existe existe, cadastrando...');
        client = await blingV3.createContact({
          name: sale.full_name,
          document: sale.document_number,
          type: 'F',
          email: sale.email,
          cellphone: formatPhone(sale.whatsapp),
          code: sale.document_number,
          contactType: 'Cliente',
          address: {
            street: sanitizeString(sale.address.street),
            number: sanitizeString(sale.address.number),
            complement: sanitizeString(sale.address.complement) || '',
            zipcode: sanitizeString(sale.address.zipcode),
            neighborhood: sanitizeString(sale.address.neighborhood),
            city: formatCity(sale.address.city),
            state: sanitizeString(sale.address.state),
          },
        });
        console.log('Cliente cadastrado:', client?.id);
      } else {
        console.log('Cliente já existe, usando:', client?.id);
      }
      let shipping = null;
      const tracking = sale.sales_items.find(e => e.integration_shipping_company !== null);
      if (tracking) {
        shipping = tracking.integration_shipping_company;
      }
      const order = {
        sale_uuid: sale.uuid,
        date: new Date(sale.created_at).toISOString().split('T')[0],
        shipping: plugin.settings.shipping,
        shippingService: shipping,
        clientId: client.id,
        freight: sale.sales_items.reduce((total, s) => total + s.shipping_price, 0),
        clientName: sale.student.full_name,
        address: {
          street: sanitizeString(sale.address.street),
          number: sanitizeString(sale.address.number),
          complement: sanitizeString(sale.address.complement) || '',
          neighborhood: sanitizeString(sale.address.neighborhood),
          zipcode: sanitizeString(sale.address.zipcode),
          city: formatCity(sale.address.city),
          state: sanitizeString(sale.address.state),
        },
        items: sale.sales_items.map(element => ({
          name: `${element.product.name} ${element.offer.name}`,
          quantity: element.quantity,
          amount: element.price_product / element.quantity,
          uuid: product_sku.find(e => e.uuid === element.product.uuid).sku,
          discount_percentage: element.discount_percentage,
          productId: products.find(product => product.uuid === element.product.uuid).id,
        })),
      };

      await delay(1);
      const responseBling = await blingV3.createOrder(order);
      console.log('Response bling', JSON.stringify(responseBling, null, 4));

      if (responseBling?.id) {
        await Sales.update({ id_order_bling: responseBling?.id }, { where: { id: sale.id } });
      }
      return responseBling;
    } catch (error) {
      if (error && error.response && error.response.data) {
        console.log('Erro Final ->', JSON.stringify(error.response.data));
      }
    }
  }
}
