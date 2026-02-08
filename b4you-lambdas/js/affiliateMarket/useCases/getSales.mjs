import { Sales_items } from '../database/models/Sales_items.mjs';
import { findSalesStatusByKey } from '../status/salesStatus.mjs';
import { findProductMarketStatusByKey } from '../status/productMarketStatus.mjs';
import { Sequelize, Op } from 'sequelize';
import { findImageTypeByKey } from '../types/imageTypes.mjs';
import redis from 'redis';

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[áàäâã]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòöôõ]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/ç/g, 'c')
    // eslint-disable-next-line
    .replace(/[^\a-z0-9\-]+/g, '')
    // eslint-disable-next-line
    .replace(/\-\-+/g, '-');
export class ProductsSales {
  constructor() {}

  async execute() {
    console.log('INICIANDO');
    const today = new Date();
    const lastSevenDays = new Date(new Date().setDate(today.getDate() - 7));
    const sales = await Sales_items.findAll({
      nest: true,
      where: {
        id_status: findSalesStatusByKey('paid').id,
        paid_at: {
          [Op.gte]: lastSevenDays,
        },
      },
      group: ['id_product'],
      attributes: ['id_product', [Sequelize.fn('COUNT', Sequelize.col('sales_items.id')), 'total']],
      order: [[Sequelize.literal('total'), 'DESC']],
      include: [
        {
          association: 'product',
          attributes: ['name', 'uuid', 'cover', 'id'],
          where: {
            list_on_market: true,
            id_status_market: findProductMarketStatusByKey('active').id,
          },
          include: [
            {
              association: 'product_offer',
              attributes: ['price'],
              where: { allow_affiliate: true, affiliate_visible: true },
              required: true,
              separate: true,
              include: [{ association: 'plans', required: false }],
            },
            {
              association: 'affiliate_settings',
              attributes: ['commission'],
            },
            {
              association: 'affiliate_images',
              where: { id_type: findImageTypeByKey('market-cover').id },
              attributes: ['file'],
              required: false,
              separate: true,
            },
          ],
        },
      ],
    });

    const filteredSales = sales
      .map((r) => r.toJSON())
      .filter(({ product }) => {
        const plans = product.product_offer.map(({ plans: x }) => x).flat();
        return plans.length > 0 || product.product_offer.length > 0;
      })
      .map(({ product: { name, uuid, product_offer, affiliate_settings, affiliate_images } }) => {
        let maxPrice = 0;
        const plans = product_offer.map(({ plans: x }) => x).flat();
        if (plans.length > 0) {
          const [maxPlanPrice] = plans.sort((a, b) => b.price - a.price);
          maxPrice = maxPlanPrice.price;
        } else {
          maxPrice = product_offer.reduce((prev, current) =>
            prev.price > current.price ? prev : current
          ).price;
        }
        return {
          product: {
            uuid,
            name,
            cover: affiliate_images,
            slug: slugify(name),
          },
          maxPrice,
          maxCommission: Number(((maxPrice * affiliate_settings.commission) / 100).toFixed(2)),
        };
      });
    const data = {
      lastUpdate: today,
      rows: filteredSales,
      count: filteredSales.length,
    };
    const redisClient = redis.createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    });
    redisClient.on('connect', (err) => {
      console.log('connected');
    });
    redisClient.on('error', (err) => {
      console.log('error', err);
    });
    await redisClient.connect();
    console.log(`${process.env.ENVIRONMENT}_market_affiliate`);
    await redisClient.set(`${process.env.ENVIRONMENT}_market_affiliate`, JSON.stringify(data));
    await redisClient.disconnect();
    console.log(JSON.stringify(data));
    console.log('FINALIZADO');
  }
}
