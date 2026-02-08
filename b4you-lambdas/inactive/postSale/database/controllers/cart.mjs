import { Cart } from '../models/Cart.mjs';

export const deleteCart = async (where, force = false, t = null) =>
  Cart.destroy({ where, force, transaction: t });
