import { Sales_items } from '../models/Sales_items.mjs';

export const createSaleItem = async (data, transaction) => {
  const si = await Sales_items.create(data, { transaction });
  return si;
};
