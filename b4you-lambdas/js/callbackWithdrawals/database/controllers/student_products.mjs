import { Student_products } from '../models/Students_products.mjs';

export const updateStudentProducts = async (where, data, t = null) =>
  Student_products.findOne({ where }).then(async (result) => {
    if (result) {
      await result.update(data, { transaction: t });
    }
  });
