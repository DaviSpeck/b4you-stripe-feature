const Product_Offer = require('../../database/models/Product_offer');
const Sales = require('../../database/models/Sales');
const Sales_items = require('../../database/models/Sales_items');
const Coupons_sales = require('../../database/models/Coupons_sales');
const Coupons = require('../../database/models/Coupons');
const { splitFullName, capitalizeName } = require('../../utils/formatters');
const ShopifyNotification = require('../../services/ShopifyService');
const { verifyRegionByZipcode } = require('../../utils/findZipcodeRegion');

module.exports = class ShopifyOrder {
  #id_offer;

  #id_sale;

  constructor({ id_offer, id_sale }) {
    this.#id_offer = id_offer;
    this.#id_sale = id_sale;
  }

  async execute(plugin) {
    const offer = await Product_Offer.findOne({
      where: {
        id: this.#id_offer,
      },
      attributes: ['id', 'metadata'],
    });

    const sale = await Sales.findOne({
      where: {
        id: this.#id_sale,
      },
    });

    const salesItems = await Sales_items.findAll({
      where: { id_sale: this.#id_sale },
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
    });
    let couponTicket = null;
    if (coupon) {
      couponTicket = await Coupons.findOne({
        where: {
          id: coupon.id_coupon,
        },
      });
    }
    const couponDetails = '';
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
                ? principalSaleItem.offer.metadata.line_items[0].shipping_data
                    .NO
                : 'Frete';
            break;
          case 'NE':
            shipping_lines_title =
              principalSaleItem.offer.metadata &&
              Array.isArray(principalSaleItem.offer.metadata.line_items) &&
              principalSaleItem.offer.metadata.line_items.length > 0 &&
              principalSaleItem.offer.metadata.line_items[0]?.shipping_data?.NE
                ? principalSaleItem.offer.metadata.line_items[0].shipping_data
                    .NE
                : 'Frete';
            break;
          case 'CO':
            shipping_lines_title =
              principalSaleItem.offer.metadata &&
              Array.isArray(principalSaleItem.offer.metadata.line_items) &&
              principalSaleItem.offer.metadata.line_items.length > 0 &&
              principalSaleItem.offer.metadata.line_items[0]?.shipping_data?.CO
                ? principalSaleItem.offer.metadata.line_items[0].shipping_data
                    .CO
                : 'Frete';

            break;
          case 'SE':
            shipping_lines_title =
              principalSaleItem.offer.metadata &&
              Array.isArray(principalSaleItem.offer.metadata.line_items) &&
              principalSaleItem.offer.metadata.line_items.length > 0 &&
              principalSaleItem.offer.metadata.line_items[0]?.shipping_data?.SE
                ? principalSaleItem.offer.metadata.line_items[0].shipping_data
                    .SE
                : 'Frete';
            break;
          case 'SU':
            shipping_lines_title =
              principalSaleItem.offer.metadata &&
              Array.isArray(principalSaleItem.offer.metadata.line_items) &&
              principalSaleItem.offer.metadata.line_items.length > 0 &&
              principalSaleItem.offer.metadata.line_items[0]?.shipping_data?.SU
                ? principalSaleItem.offer.metadata.line_items[0].shipping_data
                    .SU
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
            amount: totalSaleAmount.toFixed(2),
          },
        ],
        discount_codes: coupon
          ? [
              {
                code: couponTicket,
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
          country: 'Brazil',
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
        orderData.line_items = principalSaleItem.offer.metadata.line_items.map(
          (item) => ({
            ...item,
            variant_id: Number(item.variant_id),
          }),
        );

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
        const shopifyNotification = new ShopifyNotification(
          shopName,
          accessToken,
        );
        await shopifyNotification.createOrUpdateOrder(orderData);
      }
    }
  }
};
