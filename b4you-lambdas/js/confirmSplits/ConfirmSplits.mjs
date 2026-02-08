import { date } from './date.mjs';
import { Commission } from './Commission.mjs';
import { DATABASE_DATE_WITHOUT_TIME } from './utils.mjs';
import aws from './queues/aws.mjs';

const payment_methods = {
  pix: 'release_pix',
  billet: 'release_billet',
  credit_card: 'release_credit_card',
};

const releaseCommissionNow = (salesSettings, payment_method) =>
  salesSettings[payment_methods[payment_method]] === 0;

export class ConfirmSplits {
  constructor({ sale_item_id, paid_at, payment_method, created_at }, database) {
    this.sale_item_id = sale_item_id;
    this.paid_at = paid_at;
    this.payment_method = payment_method;
    this.created_at = created_at;
    this.database = database;
  }

  async execute() {
    const commissions = await this.database.findCommissions(this.sale_item_id);
    console.log('commissions => ', commissions);
    for await (const { id, id_user, amount, id_product } of commissions) {
      const user_sale_settings = await this.database.findUserSaleSettings(id_user);
      await aws.add('usersRevenue', {
        id_user,
        amount,
        paid_at: date(this.paid_at).subtract(3, 'hours').format(DATABASE_DATE_WITHOUT_TIME),
      });
      await aws.add('sales-metrics-hourly', {
        id_user,
        id_product,
        amount,
        paid_at: this.paid_at,
        created_at: this.created_at,
        statusAfter: 'paid',
        statusBefore: 'pending',
        payment_method: this.payment_method,
      });
      if (releaseCommissionNow(user_sale_settings, this.payment_method)) {
        await new Commission(
          {
            amount,
            id_user,
            id,
          },
          this.database
        ).pay();
      } else {
        await this.database.updateCommission(id, {
          id_status: 2,
          release_date: date(this.paid_at)
            .add(user_sale_settings[payment_methods[this.payment_method]], 'd')
            .format(DATABASE_DATE_WITHOUT_TIME),
        });
      }
    }
  }
}
