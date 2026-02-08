import { date } from './date.mjs';
import { DATABASE_DATE_WITHOUT_TIME } from './utils.mjs';

export class Commission {
  constructor({ id_user, amount, id }, database) {
    this.id_user = id_user;
    this.amount = amount;
    this.id = id;
    this.database = database;
  }

  async pay() {
    console.log(`PAYING COMMISSION -> `, this.id);
    await this.database.incrementBalance(this.id_user, this.amount);
    await this.database.updateCommission(this.id, {
      release_date: date().format(DATABASE_DATE_WITHOUT_TIME),
      id_status: 3,
    });
    console.log(`PAYING COMMISSION - COMPLETE`);
  }
}
