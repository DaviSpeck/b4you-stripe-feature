import { Student_products } from '../models/StudentProducts.mjs';

export const createStudentProducts = async (data, transaction) => {
  const sp = await Student_products.create(data, { transaction });
  return sp;
};
