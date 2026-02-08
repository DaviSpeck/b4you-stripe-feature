import { Coupons } from '../models/Coupons_sales.mjs';

export const findOneCouponSale = async (where) =>
  Coupons.findOne({ where, raw: true });

export const updateCouponSale = async (where, data) =>
  Coupons.update(data, { where });
