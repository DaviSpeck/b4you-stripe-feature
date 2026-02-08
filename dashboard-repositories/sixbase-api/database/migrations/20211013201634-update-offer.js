module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('product_offer', 'id_classroom', {
        type: Sequelize.BIGINT,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('product_offer', 'id_classroom', {
        type: Sequelize.BIGINT,
        allowNull: false,
      }),
    ]);
  },
};
