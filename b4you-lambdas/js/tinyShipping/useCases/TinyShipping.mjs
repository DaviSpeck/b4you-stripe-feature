import { Op, col } from 'sequelize';
import { Plugins } from '../database/models/Plugins.mjs';
import { Sales } from '../database/models/Sales.mjs';
import { Sales_items } from '../database/models/Sales_items.mjs';
import { Sales_items_plugins } from '../database/models/Sales_items_plugins.mjs';
import { Tiny } from '../services/TinyShipping.mjs';
import { findIntegrationTypeByKey } from '../types/integrationTypes.mjs';
import { delay } from '../utils/delay.mjs';

const sanitizeString = (str) => {
  return str.replace(/[!@#$%^&*+=]/g, '');
};

export class TinyShipping {
  #sale_id;
  #is_subscription;
  #id_sale_item;

  constructor(sale_id, is_subscription, id_sale_item) {
    this.#sale_id = sale_id;
    this.#is_subscription = is_subscription;
    this.#id_sale_item = id_sale_item;
  }

  async execute() {
    console.log('Iniciando tentativa de executar Tiny');
    console.log(this.#sale_id);
    const sale = await Sales.findOne({
      where: { id: this.#sale_id },
      include: [
        {
          association: 'sales_items',
          attributes: [
            'id',
            'price_product',
            'shipping_price',
            'quantity',
            'discount_amount',
            'discount_percentage',
            'payment_method',
            'id_product',
            'id_product_tiny',
            'id_status',
          ],
          include: [
            {
              association: 'offer',
              attributes: ['uuid', 'id', 'name', 'metadata', 'tiny_sku'],
            },
            {
              association: 'product',
              attributes: ['id', 'name', 'tiny_sku'],
            },
            {
              association: 'commissions',
              attributes: ['amount', 'id_role', 'id_user'],
              required: false,
              where: {
                id_user: { [Op.eq]: col('sales.id_user') },
              },
            },
          ],
        },
        {
          association: 'student',
          attributes: [
            'full_name',
            'document_number',
            'email',
            'whatsapp',
            'address',
            'document_type',
          ],
        },
      ],
    });

    if (!sale) {
      console.log('Sale with missing parameters. SALE ID->: ', this.#sale_id);
      return;
    }

    const plugin = await Plugins.findOne({
      where: {
        id_user: sale.id_user,
        id_plugin: findIntegrationTypeByKey('tiny').id,
        active: true,
      },
    });

    if (!plugin) {
      console.log('Plugin not found. SALE ID: ', this.#sale_id);
      return;
    }

    if (!sale) {
      console.log('Sale not found. SALE ID: ', this.#sale_id);
      return;
    }

    const tiny = new Tiny(plugin.settings.token);

    if (this.#is_subscription) {
      console.log('Is subscription, finding sales_items', this.#id_sale_item)
      const salesItems = await Sales_items.findAll({
        where: {
          id: this.#id_sale_item
        },
        include: [
          {
            association: 'offer',
            attributes: ['uuid', 'id', 'name', 'metadata', 'tiny_sku'],
          },
          {
            association: 'product',
            attributes: ['id', 'name', 'tiny_sku'],
          },
          {
            association: 'commissions',
            attributes: ['amount', 'id_role', 'id_user'],
            required: false,
            where: {
              id_user: sale.id_user,
            },
          },
        ],
      })
      if (salesItems.length > 0) {
        sale.sales_items = salesItems
      }
    }


    if (sale.id_order_tiny && sale.sales_items.some((item) => item.id_status === 4)) {
      await tiny.updateSaleStatus('cancelado', sale.id_order_tiny, sale.id_user, plugin.id_plugin);
      return;
    }

    const products = [];

    for await (const item of sale.sales_items) {
      let id = null;

      if (item.id_product_tiny !== null) {
        id = await tiny.getProduct(item.id_product_tiny);
      } else {
        id = await tiny.getProduct(item.offer.uuid);
      }
      if (!id) {
        await delay(1);
        const { id } = await tiny.createProduct({
          code:
            item.offer?.tiny_sku?.trim()
            ?? item.product?.tiny_sku?.trim()
            ?? item.offer?.uuid,
          name: `${item.product.name} ${item.offer.name}`,
          price: item.commissions[0]?.amount / item.quantity,
          id_product: item.id_product,
          id_user: sale.id_user,
          id_plugin: plugin.id_plugin,
        });

        if (id) {
          await Sales_items.update({ id_product_tiny: id }, { where: { id: item.id } });
        }

        products.push({
          id,
          code:
            item.offer?.tiny_sku?.trim() !== null
              ? item.offer?.tiny_sku?.trim()
              : item.product?.tiny_sku?.trim() !== null
                ? item.product?.tiny_sku?.trim()
                : item.offer.uuid,
        });
        continue;
      }

      products.push({
        id,
        code:
          item.offer?.tiny_sku?.trim() !== null
            ? item.offer?.tiny_sku?.trim()
            : item.product?.tiny_sku?.trim() !== null
              ? item.product?.tiny_sku?.trim()
              : item.offer.uuid,
      });
    }

    const toNumber = (v) => Number(v || 0);

    const discountTotal = sale.sales_items.reduce(
      (acc, el) => acc + toNumber(el.discount_amount),
      0
    );

    const shippingTotal = sale.sales_items.reduce(
      (acc, el) => acc + toNumber(el.shipping_price),
      0
    );

    const order = {
      date: sale.created_at,
      id_user: sale.id_user,
      id_plugin: plugin.id_plugin,
      shippingService: plugin.settings?.shipping_service,
      methods_shipping: plugin.settings?.methods_shipping,
      operation_nature: plugin.settings?.operation_nature,
      discount_amount: discountTotal,
      shipping_price: shippingTotal,
      client: {
        name: sale.student.full_name,
        email: sale.student.email,
        document_type: sanitizeString(sale.student.document_type) === "CPF" ? "F" : "J",
        cpf: sale.student.document_number,
        address: sanitizeString(sale.student.address?.street) || '',
        number: sanitizeString(sale.student.address?.number) || '',
        complement: sanitizeString(sale.student.address?.complement) || '',
        neighborhood: sanitizeString(sale.student.address?.neighborhood) || '',
        zipcode: sanitizeString(sale.student.address?.zipcode) || '',
        city: sanitizeString(sale.student?.address?.city) || '',
        state: sanitizeString(sale.student?.address?.state) || '',
        phone: sale.student.whatsapp,
      },
      items: sale.sales_items.map((element) => ({
        name: `${element.product.name} ${element.offer.name}`,
        quantity: element.quantity,
        amount: element.price_product / element.quantity,
        uuid:
          element.offer?.tiny_sku?.trim() != null
            ? element.offer?.tiny_sku?.trim()
            : element.product?.tiny_sku?.trim() != null
              ? element.product?.tiny_sku?.trim()
              : element.offer.uuid,
        discount_percentage: element.discount_percentage,
        productId: products.find(
          (product) =>
            product.code ===
            (element.offer?.tiny_sku?.trim() != null
              ? element.offer?.tiny_sku?.trim()
              : element.product?.tiny_sku?.trim() != null
                ? element.product?.tiny_sku?.trim()
                : element.offer.uuid)
        )?.id,
      })),
    };

    try {
      await delay(1);
      let responseTiny;
      if (sale.id_order_tiny) {
        console.log(`Pedido já interado id da tiny: ${sale.id_order_tiny}`);
        // responseTiny = await tiny.updateOrder(sale.id_order_tiny, order);
      } else {
        responseTiny = await tiny.createSale(order);
      }

      if (responseTiny?.data?.retorno?.registros?.registro?.id) {
        if (!this.#is_subscription) {
          await Sales.update(
            { id_order_tiny: responseTiny?.data?.retorno?.registros?.registro?.id }, //criar no banco
            { where: { id: sale.id } }
          );
        } else {
          for await (const id of this.#id_sale_item) {
            await Sales_items_plugins.create({
              id_tiny: responseTiny?.data?.retorno?.registros?.registro?.id,
              id_sale_item: id,
              body: order,
              response: responseTiny.data
            })
          }

        }
      }
      return responseTiny;
    } catch (error) {
      if (error?.response) {
        if (error.response.data) {
          console.log('Erro:', JSON.stringify(error.response.data));
          if (
            error.response.data?.retorno?.erros?.erro?.cod === 16 &&
            error.response.data?.retorno?.erros?.erro?.cod ===
            'Esta conta foi inativada, verifique a sua situacao para continuar utilizando o sistema.'
          ) {
            console.log('desativando conta por estar inativa');
            await Plugins.update({ where: { id: plugin.id } }, { active: 0 });
            return true;
          }
        }
      }
      throw error;
    }
  }
}
