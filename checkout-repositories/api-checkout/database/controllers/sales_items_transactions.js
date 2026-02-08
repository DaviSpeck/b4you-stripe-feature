const SalesItemsTransactions = require('../models/Sales_items_transactions');

const createSalesItemsTransactions = async (data, t = null) =>
  SalesItemsTransactions.create(data, { transaction: t });

const findAllSalesItemsTransactions = async (where) =>
  SalesItemsTransactions.findAll({
    where,
  });

module.exports = {
  createSalesItemsTransactions,
  findAllSalesItemsTransactions,
};
