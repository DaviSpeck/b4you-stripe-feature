module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('sales_items', 'payment_splited', {
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.removeColumn('charges', 'payment_splited'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('sales_items', 'payment_splited'),
      queryInterface.addColumn('charges', 'payment_splited', {
        type: Sequelize.BOOLEAN,
      }),
    ]);
  },
};
