const DateHelper = require('../../utils/helpers/date');
const SQS = require('../../queues/aws');
const Cache = require('../../config/Cache');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const { updateSaleItem } = require('../../database/controllers/sales_items');
const {
  createStudentProducts,
} = require('../../database/controllers/student_products');
const { updateCharge } = require('../../database/controllers/charges');
const { findChargeStatusByKey } = require('../../status/chargeStatus');
const { findRulesTypesByKey } = require('../../types/integrationRulesTypes');
const { deleteCart } = require('../../database/controllers/cart');
const {
  findOneCouponSale,
  updateCouponSale,
} = require('../../database/controllers/coupons_sales');
const { findOneCoupon } = require('../../database/controllers/coupons');
const {
  updateSubscription,
} = require('../../database/controllers/subscriptions');
const {
  findSubscriptionStatusByKey,
} = require('../../status/subscriptionsStatus');
const { capitalizeName } = require('../../utils/formatters');
const ReferralCommissions = require('../../database/models/ReferralCommissions');
const {
  findReferralCommissionStatus,
} = require('../../status/referralCommissionStatus');
const date = require('../../utils/helpers/date');
const Sales = require('../../database/models/Sales');
const ConversionApi = require('../pixels/facebook/ConversionApi');
const logger = require('../../utils/logger');
const Charges = require('../../database/models/Charges');
const Affiliates = require('../../database/models/Affiliates');
const Subscriptions = require('../../database/models/Subscriptions');
const Sales_items = require('../../database/models/Sales_items');
const Plugins = require('../../database/models/Plugins');
const ShopifyNotification = require('../../services/ShopifyService');
const { splitFullName } = require('../../utils/formatters');
const models = require('../../database/models');
const Commissions = require('../../database/models/Commissions');
const { findRoleTypeByKey } = require('../../types/roles');
const { verifyRegionByZipcode } = require('../../utils/verifyRegionByZipcode');
const {
  productPhysicalEvents,
} = require('../subscriptions/physicalIntegrations');

const ShopifyId = 19;
let shipping_lines_title = '';
module.exports = class PaidPayment {
  static async execute({ psp_id, charge_uuid }) {
    const where = {};
    if (charge_uuid) {
      where.uuid = charge_uuid;
    } else {
      where.psp_id = psp_id;
    }

    const charge = await Charges.findOne({
      nest: true,
      attributes: ['id', 'id_user', 'payment_method', 'price', 'pix_code'],
      where,
      include: [
        {
          association: 'sales_items',
          where: {
            id_status: [1, 7],
          },
          attributes: [
            'id',
            'uuid',
            'id_sale',
            'payment_method',
            'created_at',
            'id_affiliate',
            'id_classroom',
            'id_product',
            'is_upsell',
            'id_subscription',
            'price',
            'quantity',
            'id_offer',
            'type',
            'shipping_price',
            'discount_amount',
            'integration_shipping_company',
          ],
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
                'payment_type',
              ],
            },
            {
              association: 'offer',
              attributes: ['id', 'name', 'metadata', 'allow_shipping_region'],
            },
          ],
        },
      ],
    });
    if (!charge) return null;
    if (charge.id_user === 47) {
      await SQS.add('paidPayment', {
        uuid: charge_uuid,
      });
      return null;
    }

    const { sales_items } = charge;
    const [mainProductSaleItem] = sales_items;
    await Cache.set(`sale_status_${mainProductSaleItem.uuid}`, 'confirmed', 10);

    const { product } = mainProductSaleItem;
    const paid_at = DateHelper().now();
    const sale = await Sales.findOne({
      nest: true,
      raw: true,
      where: { id: sales_items[0].id_sale },
      attributes: [
        'id',
        'fb_pixel_info',
        'id_student',
        'address',
        'email',
        'document_number',
        'whatsapp',
        'full_name',
        'id_user',
      ],
      include: [
        {
          association: 'student',
          attributes: [
            'id',
            'email',
            'full_name',
            'whatsapp',
            'document_number',
            'status',
          ],
        },
      ],
    });
    const { student } = sale;
    const coupon = await findOneCouponSale({
      id_sale: sale.id,
    });

    if (sale && sale.fb_pixel_info) {
      try {
        logger.info(
          `TRYING TO PURCHASE EVENT ON FACEBOOK PIXEL -> SALE ID ${sales_items[0].id_sale} `,
        );
        await new ConversionApi(
          sale.fb_pixel_info.pixel_id,
          sale.fb_pixel_info.token,
        ).purchase(sale.fb_pixel_info);
      } catch (error) {
        logger.error(
          `ERROR PIXEL FACEBOOK CALLBACK PAID -> ${JSON.stringify(error)}`,
        );
      }
    }

    const principalSaleItem = sales_items.find((e) => e.type === 1);

    let shopifyResponse = null;
    let shopifyData = null;

    try {
      const plugin = await Plugins.findOne({
        where: {
          id_user: product.id_user,
          id_plugin: ShopifyId,
        },
        raw: true,
      });
      if (plugin) {
        let couponDetails = '';
        if (coupon) {
          couponDetails = await findOneCoupon({
            id: coupon.id_coupon,
          });
        }

        const { shopName } = plugin.settings;
        const { accessToken } = plugin.settings;
        const { firstName, lastName } = splitFullName(sale.full_name);
        const totalSaleAmount = sales_items.reduce(
          (acc, obj) => acc + obj.price * obj.quantity,
          0,
        );

        const itensOrder = sales_items.map((element) => {
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

        shipping_lines_title = 'Frete';
        if (principalSaleItem.offer.allow_shipping_region === 1) {
          const cepRegion = verifyRegionByZipcode(sale.address.zipcode);
          switch (cepRegion) {
            case 'NO':
              shipping_lines_title =
                principalSaleItem.offer.metadata &&
                Array.isArray(principalSaleItem.offer.metadata.line_items) &&
                principalSaleItem.offer.metadata.line_items.length > 0 &&
                principalSaleItem.offer.metadata.line_items[0]?.shipping_data
                  ?.NO
                  ? principalSaleItem.offer.metadata.line_items[0].shipping_data
                      .NO
                  : 'Frete';
              break;
            case 'NE':
              shipping_lines_title =
                principalSaleItem.offer.metadata &&
                Array.isArray(principalSaleItem.offer.metadata.line_items) &&
                principalSaleItem.offer.metadata.line_items.length > 0 &&
                principalSaleItem.offer.metadata.line_items[0]?.shipping_data
                  ?.NE
                  ? principalSaleItem.offer.metadata.line_items[0].shipping_data
                      .NE
                  : 'Frete';
              break;
            case 'CO':
              shipping_lines_title =
                principalSaleItem.offer.metadata &&
                Array.isArray(principalSaleItem.offer.metadata.line_items) &&
                principalSaleItem.offer.metadata.line_items.length > 0 &&
                principalSaleItem.offer.metadata.line_items[0]?.shipping_data
                  ?.CO
                  ? principalSaleItem.offer.metadata.line_items[0].shipping_data
                      .CO
                  : 'Frete';

              break;
            case 'SE':
              shipping_lines_title =
                principalSaleItem.offer.metadata &&
                Array.isArray(principalSaleItem.offer.metadata.line_items) &&
                principalSaleItem.offer.metadata.line_items.length > 0 &&
                principalSaleItem.offer.metadata.line_items[0]?.shipping_data
                  ?.SE
                  ? principalSaleItem.offer.metadata.line_items[0].shipping_data
                      .SE
                  : 'Frete';
              break;
            case 'SU':
              shipping_lines_title =
                principalSaleItem.offer.metadata &&
                Array.isArray(principalSaleItem.offer.metadata.line_items) &&
                principalSaleItem.offer.metadata.line_items.length > 0 &&
                principalSaleItem.offer.metadata.line_items[0]?.shipping_data
                  ?.SU
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
              amount: totalSaleAmount,
            },
          ],
          discount_codes: coupon
            ? [
                {
                  code: couponDetails.coupon,
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
                value: student.document_number,
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
              phone: null,
            },
          ],

          note_attributes: [
            {
              name: 'additional_cpf_cnpj',
              value: student.document_number,
            },
            {
              name: 'additional_info_billing_number',
              value: sale.address.number,
            },
            {
              name: 'additional_info_billing_complement',
              value: sale.address.complement,
            },
            {
              name: 'payment_status',
              value: 'paid',
            },
            {
              name: 'payment_method',
              value: 'pix',
            },
            {
              name: 'additional_info_billing_street',
              value: sale.address.street,
            },
            {
              name: 'additional_info_pix_code',
              value: charge && charge.pix_code ? charge.pix_code : '',
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
          logger.info('Integracao shopify');
          logger.info(`${JSON.stringify(orderData)}`);
          const shopifyNotification = new ShopifyNotification(
            shopName,
            accessToken,
          );
          shopifyData = orderData;
          shopifyResponse = await shopifyNotification.createOrUpdateOrder(
            orderData,
          );
        }
      }
    } catch (error) {
      // eslint-disable-next-line
      logger.info('erro na integracao shopify');
      // eslint-disable-next-line
      console.log(`error shopify`, error);
    }

    await updateCharge(charge.id, {
      id_status: findChargeStatusByKey('paid').id,
      paid_at,
    });

    if (coupon) {
      await updateCouponSale({ id: coupon.id }, { paid: true });
    }
    let renew = false;

    // if (sale.id_user === 96495) {
    //   await SQS.add('webhookNotazzBalancer', {
    //     id_product: product.id,
    //     id_sale_item: principalSaleItem.id,
    //     id_user: 96495,
    //     id_event: findRulesTypesByKey('approved-payment').id,
    //     id_cart: null,
    //     id_sale: sale.id,
    //   });
    // }

    const ids_sales_items_subscriptions = [];

    for await (const {
      id,
      uuid,
      id_product,
      product: saleProduct,
      payment_method,
      created_at,
      id_affiliate,
      id_classroom,
      is_upsell,
      id_subscription,
    } of sales_items) {
      const dbTransaction = await models.sequelize.transaction();
      const promisesSaleItem = [];
      try {
        const commissions = await Commissions.findAll({
          raw: true,
          where: {
            id_sale_item: id,
            id_role: findRoleTypeByKey('supplier').id,
          },
        });
        if (commissions.length > 0) {
          for await (const c of commissions) {
            // if (c.id_user !== 96495) {
            await SQS.add('webhookEvent', {
              id_product,
              id_sale_item: id,
              id_user: c.id_user,
              id_event: findRulesTypesByKey('approved-payment').id,
            });
            // }
          }
        }
      } catch (error) {
        // eslint-disable-next-line
        console.log('error webhook approved supplier', error);
      }

      try {
        await ReferralCommissions.update(
          {
            id_status: findReferralCommissionStatus('release-pending').id,
            release_date: date().add(2, 'months').startOf('month'),
          },
          { where: { id_sale_item: id }, transaction: dbTransaction },
        );

        let paidCharges = 1;

        if (id_subscription) {
          if (
            saleProduct.content_delivery === 'physical' &&
            saleProduct.payment_type === 'subscription'
          ) {
            ids_sales_items_subscriptions.push(id);
          }
          const subscription = await Subscriptions.findOne({
            nest: true,
            where: { id: id_subscription },
            include: [
              {
                association: 'plan',
                attributes: ['frequency_quantity', 'payment_frequency'],
              },
            ],
          });
          dbTransaction.afterCommit(async () => {
            await SQS.add('invision', {
              sale_id: sale.id,
            });
          });

          const {
            plan: { frequency_quantity, payment_frequency },
          } = subscription;

          await updateSubscription(
            { id: id_subscription },
            {
              last_notify: null,
              renew: false,
              attemp_count: 0,
              next_attempt: null,
              id_status: findSubscriptionStatusByKey('active').id,
              next_charge: DateHelper(paid_at).add(
                frequency_quantity,
                payment_frequency,
              ),
            },
          );
          paidCharges = await Sales_items.count({
            where: { id_subscription, id_status: 2 },
          });
        }

        if (paidCharges === 0 || paidCharges === 1) {
          promisesSaleItem.push(
            updateSaleItem(
              {
                valid_refund_until: DateHelper().add(product.warranty, 'days'),
                id_status: findSalesStatusByKey('paid').id,
                paid_at,
              },
              { id },
              dbTransaction,
            ),
          );
          dbTransaction.afterCommit(async () => {
            if (
              saleProduct.content_delivery === 'physical' &&
              saleProduct.payment_type !== 'subscription'
            ) {
              // eslint-disable-next-line
              console.log(`BLING SHIPPING CALL ${sale.id} - ${is_upsell}`);
              await SQS.add('blingShipping', {
                sale_id: sale.id,
                is_upsell,
              });
            }
          });
          if (id_affiliate) {
            const affiliate = await Affiliates.findOne({
              raw: true,
              attributes: ['id_user'],
              where: { id: id_affiliate },
            });
            if (affiliate) {
              dbTransaction.afterCommit(async () => {
                await SQS.add('webhookEvent', {
                  id_product,
                  id_sale_item: id,
                  id_user: affiliate.id_user,
                  id_event: findRulesTypesByKey('approved-payment').id,
                });
              });
            }
          }
        } else {
          renew = true;
          promisesSaleItem.push(
            updateSaleItem(
              {
                id_status: findSalesStatusByKey('paid').id,
                paid_at,
              },
              { id },
              dbTransaction,
            ),
          );
          dbTransaction.afterCommit(async () => {
            await Promise.all([
              SQS.add('webhookEvent', {
                id_product,
                id_sale_item: id,
                id_user: charge.id_user,
                id_event: findRulesTypesByKey('renewed-subscription').id,
              }),
              SQS.add('integrations', {
                id_product,
                eventName: 'renewedSubscription',
                data: {
                  email: student.email,
                  full_name: capitalizeName(student.full_name),
                  phone: student.whatsapp,
                  sale_uuid: uuid,
                },
              }),
            ]);
          });
        }
        if (saleProduct.content_delivery === 'membership') {
          await createStudentProducts(
            {
              id_student: student.id,
              id_product,
              id_classroom: id_classroom || null,
              id_sale_item: id,
            },
            dbTransaction,
          );
        }
        // eslint-disable-next-line no-loop-func
        dbTransaction.afterCommit(async () => {
          await Promise.all([
            SQS.add('confirmSplits', {
              sale_item_id: id,
              paid_at,
              payment_method: charge.payment_method,
              created_at,
            }),
            SQS.add('generateNotifications', {
              sale_item_id: id,
            }),
            SQS.add('webhookEvent', {
              id_product,
              id_sale_item: id,
              id_user: charge.id_user,
              id_event: findRulesTypesByKey('approved-payment').id,
            }),
            SQS.add('studentApprovedPaymentEmails', {
              charge,
              currentStudent: student,
              product: saleProduct,
              saleItem: sales_items.find((s) => s.id === id),
              renew,
            }),
            SQS.add('integrations', {
              id_product,
              eventName: 'approvedPayment',
              data: {
                payment_method,
                email: student.email,
                full_name: capitalizeName(student.full_name),
                phone: student.whatsapp,
                sale: {
                  amount: charge.price,
                  created_at,
                  document_number: student.document_number,
                  paid_at,
                  sale_uuid: uuid,
                  products: [
                    {
                      uuid: saleProduct.uuid,
                      product_name: saleProduct.name,
                      quantity: 1,
                      price: charge.price,
                    },
                  ],
                },
              },
            }),

            SQS.add('tinyShipping', {
              sale_id: sale.id,
            }),
            SQS.add('woocommerce', {
              sale_item_id: id,
              sale_id: sale.id,
            }),
          ]);
        });
        await Promise.all(promisesSaleItem);
        await dbTransaction.commit();
      } catch (error) {
        // eslint-disable-next-line
        console.log(`error on transaction`, error);
        await dbTransaction.rollback();
      }
    }

    await SQS.add('studentApprovedPaymentEmails', {
      charge,
      currentStudent: student,
      product,
      saleItem: mainProductSaleItem,
      renew,
    });

    await SQS.add('zoppy', {
      sale_id: sale.id,
      event_name: 'updateSale',
      cart: null,
      id_user: sale.id_user,
    });

    await deleteCart(
      { email: student.email, id_sale_item: mainProductSaleItem.id },
      true,
    );

    try {
      if (ids_sales_items_subscriptions.length > 0) {
        console.log(
          'calling use case physical event subscription',
          sale.id,
          sale.id_user,
          mainProductSaleItem.id_offer,
          ids_sales_items_subscriptions,
        );
        await productPhysicalEvents({
          id_sale: sale.id,
          id_user: sale.id_user,
          id_offer: mainProductSaleItem.id_offer,
          id_sale_item: ids_sales_items_subscriptions,
          shopifyResponse,
          shopifyData,
        });
      }
    } catch (error) {
      console.log('error on use case physical subscription');
    }

    return charge;
  }
};
