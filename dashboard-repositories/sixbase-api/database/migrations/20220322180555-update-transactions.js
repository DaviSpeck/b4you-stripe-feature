module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('transactions', 'id_sale_item'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('transactions', 'id_sale_item', {
        type: Sequelize.BIGINT,
        allowNull: false,
      }),
    ]);
  },
};
