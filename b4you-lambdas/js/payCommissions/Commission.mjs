import { UpdateBalance } from './UpdateBalance.mjs';
import { Commissions } from '../database/models/Commissions.mjs';

export class Commission {
  #BalanceRepository;

  #database;

  constructor(BalanceRepository, database) {
    this.#BalanceRepository = BalanceRepository;
    this.#database = database;
  }

  async pay({ id_user, amount, id }) {
    const data = {
      id_user,
      amount,
      operation: 'increment',
    };
    console.log(`PAYING COMMISSION - DATA ${JSON.stringify(data)}`);
    await this.#database.sequelize.transaction(async (t) => {
      await new UpdateBalance(this.#BalanceRepository, t).execute(data);

      await Commissions.update({ id_status: 3 }, { where: { id }, transaction: t });

      console.log(`PAYING COMMISSION - COMPLETE`);
    });
  }
}
