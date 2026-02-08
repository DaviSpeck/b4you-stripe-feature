/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('sales_items', 'installments', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.addColumn('sales_items', 'price_product', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'price_base', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'price_total', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'split_price', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'subscription_fee', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'shipping_price', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'fee_variable_percentage', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'fee_variable_amount', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'fee_fixed', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'fee_total', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'id_subscription', {
        type: Sequelize.BIGINT,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('sales_items', 'installments'),
      queryInterface.removeColumn('sales_items', 'price_product'),
      queryInterface.removeColumn('sales_items', 'price_base'),
      queryInterface.removeColumn('sales_items', 'price_total'),
      queryInterface.removeColumn('sales_items', 'split_price'),
      queryInterface.removeColumn('sales_items', 'subscription_fee'),
      queryInterface.removeColumn('sales_items', 'shipping_price'),
      queryInterface.removeColumn('sales_items', 'fee_variable_percentage'),
      queryInterface.removeColumn('sales_items', 'fee_variable_amount'),
      queryInterface.removeColumn('sales_items', 'fee_fixed'),
      queryInterface.removeColumn('sales_items', 'fee_total'),
      queryInterface.removeColumn('sales_items', 'id_subscription'),
    ]);
  },
};
