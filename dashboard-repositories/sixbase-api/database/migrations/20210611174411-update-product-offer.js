module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('product_offer', 'id_pre_offer', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
      queryInterface.addColumn('product_offer', 'id_post_offer', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
      queryInterface.addColumn('product_offer', 'price_pre_offer', {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: true,
      }),
      queryInterface.addColumn('product_offer', 'price_post_offer', {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('product_offer', 'id_pre_offer'),
      queryInterface.removeColumn('product_offer', 'id_post_offer'),
      queryInterface.removeColumn('product_offer', 'price_pre_offer'),
      queryInterface.removeColumn('product_offer', 'price_post_offer'),
    ]);
  },
};
