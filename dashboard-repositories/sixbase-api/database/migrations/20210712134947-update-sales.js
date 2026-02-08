module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('sales', 'id_product'),
      queryInterface.removeColumn('sales', 'id_product_offer'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      await queryInterface.addColumn('sales', 'id_product', {
        type: Sequelize.BIGINT,
        allowNull: false,
      }),
      await queryInterface.addColumn('sales', 'id_product_offer', {
        type: Sequelize.BIGINT,
        allowNull: true,
      }),
    ]);
  },
};
