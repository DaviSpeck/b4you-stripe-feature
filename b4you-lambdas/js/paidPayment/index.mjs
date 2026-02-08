import { Database } from './database/sequelize.mjs';
import SQS from './queues/aws.mjs';
import Cache from './config/Cache.mjs';
import ConversionApi from './services/ConversionApi.mjs';
import { capitalizeName } from './utils/formatters.mjs';
import { date } from './utils/date.mjs';
import { Charges } from './database/models/Charges.mjs';
import { Sales } from './database/models/Sales.mjs';
import { Sales_items } from './database/models/Sales_items.mjs';
import { Commissions } from './database/models/Commissions.mjs';
import { Coupons_sales } from './database/models/Coupons_sales.mjs';
import { Affiliates } from './database/models/Affiliates.mjs';
import { findRulesTypesByKey } from './utils/rulesTypes.mjs';
import { findChargeStatusByKey } from './status/chargeStatus.mjs';
import { ReferralCommissions } from './database/models/ReferralCommissions.mjs';
import { findRoleTypeByKey } from './types/roles.mjs';
import { findReferralCommissionStatus } from './status/referralCommissionsStatus.mjs';
import { Subscriptions } from './database/models/Subscriptions.mjs';
import { findSubscriptionStatusByKey } from './status/subscriptionsStatus.mjs';
import { findSalesStatusByKey } from './status/salesStatus.mjs';
import { Student_products } from './database/models/StudentsProducts.mjs';
import { Cart } from './database/models/Cart.mjs';
import productPhysicalEvents from './usecases/physicalIntegrations.mjs';



const response = {
  statusCode: 200,
  body: JSON.stringify('Hello from Lambda!'),
};

export const handler = async (event) => {
  console.log(event);

  const { MYSQL_DATABASE, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_USERNAME, MYSQL_PORT } = process.env;

  await Cache.connect();

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

  let dbTransaction = null;

  try {
    const { Records } = event;
    const [message] = Records;
    const { uuid } = JSON.parse(message.body);

    dbTransaction = await database.sequelize.transaction();

    const charge = await Charges.findOne({
      nest: true,
      attributes: ['id', 'id_user', 'payment_method', 'price'],
      where: { uuid },
      transaction: dbTransaction,
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
    if (!charge) {
      console.log('charge not found with uuid = ', uuid);
      await dbTransaction.rollback();
      await database.closeConnection();
      return response;
    }
    const { sales_items } = charge;
    const [mainProductSaleItem] = sales_items;
    await Cache.set(`sale_status_${mainProductSaleItem.uuid}`, 'confirmed', 10);

    const { product } = mainProductSaleItem;
    const paid_at = date().now();
    const sale = await Sales.findOne({
      nest: true,
      raw: true,
      where: { id: sales_items[0].id_sale },
      transaction: dbTransaction,
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
          attributes: ['id', 'email', 'full_name', 'whatsapp', 'document_number', 'status'],
        },
      ],
    });
    const { student } = sale;
    const coupon = await Coupons_sales.findOne({
      raw: true,
      where: {
        id_sale: sale.id,
      },
      transaction: dbTransaction,
    });

    if (sale && sale.fb_pixel_info) {
      dbTransaction.afterCommit(async () => {
        try {
          console.log(
            `TRYING TO PURCHASE EVENT ON FACEBOOK PIXEL -> SALE ID ${sales_items[0].id_sale} `
          );
          await new ConversionApi(sale.fb_pixel_info.pixel_id, sale.fb_pixel_info.token).purchase(
            sale.fb_pixel_info
          );
        } catch (error) {
          console.log(`ERROR PIXEL FACEBOOK CALLBACK PAID -> ${JSON.stringify(error)}`);
        }
      });
    }

    await Charges.update(
      { id_status: findChargeStatusByKey('paid').id, paid_at },
      {
        where: {
          id: charge.id,
        },
        transaction: dbTransaction,
      }
    );

    if (coupon) {
      await Coupons_sales.update(
        { paid: true },
        {
          where: {
            id: coupon.id,
          },
          transaction: dbTransaction,
        }
      );
    }
    let renew = false;
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
      const promisesSaleItem = [];
      try {
        const commissions = await Commissions.findAll({
          raw: true,
          where: {
            id_sale_item: id,
            id_role: findRoleTypeByKey('supplier').id,
          },
          transaction: dbTransaction,
        });
        if (commissions.length > 0) {
          dbTransaction.afterCommit(async () => {
            for await (const c of commissions) {
              await SQS.add('webhookEvent', {
                id_product,
                id_sale_item: id,
                id_user: c.id_user,
                id_event: findRulesTypesByKey('approved-payment').id,
              });
            }
          });
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
          { where: { id_sale_item: id }, transaction: dbTransaction }
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
            transaction: dbTransaction,
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

          await Subscriptions.update(
            {
              last_notify: null,
              renew: false,
              attemp_count: 0,
              next_attempt: null,
              id_status: findSubscriptionStatusByKey('active').id,
              next_charge: date(paid_at).add(frequency_quantity, payment_frequency),
            },
            {
              where: {
                id: id_subscription,
              },
              transaction: dbTransaction,
            }
          );
          paidCharges = await Sales_items.count({
            where: { id_subscription, id_status: 2 },
            transaction: dbTransaction,
          });
        }

        if (paidCharges === 0 || paidCharges === 1) {
          promisesSaleItem.push(
            Sales_items.update(
              {
                valid_refund_until: date().add(product.warranty, 'days'),
                id_status: findSalesStatusByKey('paid').id,
                paid_at,
              },
              {
                where: {
                  id,
                },
                transaction: dbTransaction,
              }
            )
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
              transaction: dbTransaction,
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
            Sales_items.update(
              {
                id_status: findSalesStatusByKey('paid').id,
                paid_at,
              },
              {
                where: {
                  id,
                },
                transaction: dbTransaction,
              }
            )
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
          await Student_products.create(
            {
              id_student: student.id,
              id_product,
              id_classroom: id_classroom || null,
              id_sale_item: id,
            },
            { transaction: dbTransaction }
          );
        }
        // eslint-disable-next-line no-loop-func
        dbTransaction.afterCommit(async () => {
          await Promise.all([
            SQS.add('woocommerce', {
              sale_item_id: id,
              sale_id: sale.id,
            }),
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
            SQS.add('shopify', {
              sale_id: sale.id,
              status: "paid"
            }),
          ]);
        });
        try {
          const currentSaleItem = sales_items.find((item) => item.id === id);
          console.log('trying send approved email', currentSaleItem.uuid, currentSaleItem.id_product)
          await SQS.add('studentApprovedPaymentEmails', {
            charge,
            currentStudent: student,
            product: saleProduct,
            saleItem: currentSaleItem,
            renew,
          });
        } catch (error) {
          console.log("error on send notification", error)
        }


        await Promise.all(promisesSaleItem);
      } catch (error) {
        // eslint-disable-next-line
        console.log(`error on transaction`, error);
        await dbTransaction.rollback();
        await database.closeConnection();
        return response;
      }
    }

    await SQS.add('zoppy', {
      sale_id: sale.id,
      event_name: 'updateSale',
      cart: null,
      id_user: sale.id_user,
    });

    await Cart.destroy({
      where: {
        id_sale_item: mainProductSaleItem.id,
        email: student.email,
      },
      transaction: dbTransaction,
    });
    try {
      if (ids_sales_items_subscriptions.length > 0) {
        console.log(
          'calling use case physical event subscription',
          sale.id,
          sale.id_user,
          mainProductSaleItem.id_offer,
          ids_sales_items_subscriptions
        );
        await productPhysicalEvents({
          id_sale: sale.id,
          id_user: sale.id_user,
          id_offer: mainProductSaleItem.id_offer,
          id_sale_item: ids_sales_items_subscriptions,
        });
      }
    } catch (error) {
      console.log('error on use case physical subscription');
    }

    await dbTransaction.commit();
  } catch (error) {
    console.log('Erro na transação principal:', error);
    if (dbTransaction) {
      await dbTransaction.rollback();
    }
  } finally {
    await database.closeConnection();
    await Cache.disconnect();
  }

  return response;
};
