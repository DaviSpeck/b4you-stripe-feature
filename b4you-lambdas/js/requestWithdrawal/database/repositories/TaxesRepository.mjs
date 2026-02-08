import { Taxes } from '../models/Taxes.mjs';

export class TaxesRepository {
  static async find() {
    return Taxes.findOne({
      order: [['id', 'desc']],
    });
  }
}
