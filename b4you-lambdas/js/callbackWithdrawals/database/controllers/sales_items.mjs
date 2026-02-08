import { Sales_items } from '../models/Sales_items.mjs';

export const updateSaleItem = async (data, where, t = null) =>
  Sales_items.update(data, { where, transaction: t });
