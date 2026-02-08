import { Charges } from '../models/Charges.mjs';

export const createCharge = async (data, transaction) => {
  const charge = await Charges.create(data, { transaction });
  return charge;
};
