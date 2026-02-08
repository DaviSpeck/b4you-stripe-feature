import { Charges } from '../models/Charges.mjs';
import { rawData } from '../rawData.mjs';

export const updateCharge = async (id, chargeObj, t = null) => {
  const charge = await Charges.update(chargeObj, {
    where: {
      id,
    },
    transaction: t,
  });
  return charge;
};

export const findAllCharges = async (where) => {
  const charges = await Charges.findAll({
    where,
  });

  return rawData(charges);
};
