import { Op } from 'sequelize';
import { Products } from '../models/Products.mjs';
import { date as DateHelper } from '../../utils/date.mjs';
const DATABASE_DATE = 'YYYY-MM-DD HH:mm:ss';

export const findUserProductsPaginated = async ({
  id_user,
  page,
  size,
  product_id,
  updated_at_min,
  updated_at_max,
}) => {
  const factor = parseInt(page, 10);
  const limit = parseInt(size, 10);
  const offset = factor * limit;
  const where = {};
  if (product_id) {
    where.id = product_id;
  } else {
    where.id_user = id_user;
  }
  if (updated_at_min && updated_at_max) {
    where.updated_at = {
      [Op.between]: [
        DateHelper(updated_at_min).format(DATABASE_DATE),
        DateHelper(updated_at_max).format(DATABASE_DATE),
      ],
    };
  }
  const products = await Products.findAndCountAll({
    where,
    limit,
    offset,
    attributes: [
      'id_nano',
      'name',
      'created_at',
      'updated_at',
      'payment_type',
      'cover',
      'sales_page_url',
      'logo',
      'support_email',
      'support_whatsapp',
      'warranty',
    ],
  });

  return products;
};
