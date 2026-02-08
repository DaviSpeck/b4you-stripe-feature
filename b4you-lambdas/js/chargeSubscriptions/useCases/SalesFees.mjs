import { CreditCardFees } from './CardFees.mjs';

export class SalesFees {
  static async calculate({
    id_user,
    brand,
    installments,
    student_pays_interest,
    sales_items,
    discount,
    coupon_discount = 0,
    coupon = null,
    database,
  }) {
    const [pspFees] = await database.sequelize.query('select * from cost_central');
    const settings = await database.sequelize.query(
      'select * from sales_settings where id_user = :id_user',
      { replacements: { id_user }, plain: true }
    );
    const cardFees = await database.sequelize.query(
      'select * from fee_interest_card where is_default = 1',
      { plain: true }
    );
    settings.fee_interest_card = cardFees;
    const taxes = await database.sequelize.query('select * from taxes order by id desc limit 1', {
      plain: true,
    });
    return new CreditCardFees({
      fees: pspFees,
      taxes,
      settings,
      brand,
      installments,
      student_pays_interest,
      sales_items,
      discount,
      coupon_discount,
      coupon,
    }).execute();
  }
}
