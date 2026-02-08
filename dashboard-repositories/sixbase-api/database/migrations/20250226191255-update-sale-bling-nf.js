module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('sales', 'id_bling_invoice', {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('sales', 'id_bling_invoice'),
    ]);
  },
};
