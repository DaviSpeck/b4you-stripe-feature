module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('sales_items', 'id_offer', {
        type: Sequelize.BIGINT,
        defaultValue: null,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([queryInterface.removeColumn('sales_items', 'id_offer')]);
  },
};
