module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('sales', 'id_order_notazz', {
        type: Sequelize.STRING,
        defaultValue: null,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('sales', 'id_order_notazz'),
    ]);
  },
};
