module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('invoices', 'id_sale_item'),
      queryInterface.addColumn('invoices', 'id_transaction', {
        type: Sequelize.BIGINT,
        allowNull: false,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('invoices', 'id_sale_item', {
        type: Sequelize.BIGINT,
        allowNull: false,
      }),
      queryInterface.removeColumn('invoices', 'id_transaction'),
    ]);
  },
};
