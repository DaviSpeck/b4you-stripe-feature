const transactionsWithdrawalType = [
  {
    id: 1,
    name: 'Manualmente',
    key: 'manual',
  },
  {
    id: 2,
    name: 'Via Pagar.me',
    key: 'pagarme',
  },
];

const findTransactionsWithdrawalType = (type) =>
  transactionsWithdrawalType.find((s) => s.id === type);

const findTransactionsWithdrawalTypeByKey = (key) =>
  transactionsWithdrawalType.find((s) => s.key === key);

module.exports = {
  transactionsWithdrawalType,
  findTransactionsWithdrawalType,
  findTransactionsWithdrawalTypeByKey,
};
