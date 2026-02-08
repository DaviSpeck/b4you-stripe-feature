const _ = require('lodash');
const { findTransactionTypeByKey } = require('../../../types/transactionTypes');
const {
  findTransactionStatusByKey,
} = require('../../../status/transactionStatus');

module.exports = class FutureReleases {
  #id_user;

  #TransactionsRepository;

  #DatabaseConfig;

  constructor({ id_user }, TransactionsRepository, DatabaseConfig) {
    this.#id_user = id_user;
    this.#TransactionsRepository = TransactionsRepository;
    this.#DatabaseConfig = DatabaseConfig;
  }

  async execute() {
    const transactions = await this.#TransactionsRepository.findAll({
      id_user: this.#id_user,
      released: false,
      id_type: findTransactionTypeByKey('commission').id,
      release_date: {
        [this.#DatabaseConfig.OP.ne]: null,
      },
      id_status: findTransactionStatusByKey('pending').id,
    });
    const groupedByReleasedDate = _(transactions)
      .groupBy('release_date')
      .map((objs, key) => ({
        date: key,
        amount: _.sumBy(objs, 'user_net_amount'),
      }))
      .value();
    const sortedByDate = _.sortBy(groupedByReleasedDate, (o) => o.date);
    const futureReleases = sortedByDate.map(({ date, amount }) => ({
      date,
      amount,
    }));

    return futureReleases;
  }
};
