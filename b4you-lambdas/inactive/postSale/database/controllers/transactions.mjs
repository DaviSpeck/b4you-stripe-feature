import { Transactions } from '../models/Transactions.mjs';

export const createTransaction = async (data, transaction) => {
  const t = await Transactions.create(data, { transaction });
  return t;
};
