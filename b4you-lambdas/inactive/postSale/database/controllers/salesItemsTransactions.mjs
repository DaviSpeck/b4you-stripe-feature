import { Sales_items_transactions } from '../models/Sales_items_transactions.mjs';

export const createSalesItemsTransactions = async (data, transaction) => {
  const sit = await Sales_items_transactions.create(data, { transaction });
  return sit;
};
