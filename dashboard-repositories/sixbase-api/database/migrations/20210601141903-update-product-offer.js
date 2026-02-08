module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('product_offer', 'start_offer', {
        type: Sequelize.DATE,
        allowNull: true,
      }),
      queryInterface.addColumn('product_offer', 'end_offer', {
        type: Sequelize.DATE,
        allowNull: true,
      }),
      queryInterface.addColumn('product_offer', 'description', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('product_offer', 'active', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      await queryInterface.removeColumn('product_offer', 'start_offer'),
      await queryInterface.removeColumn('product_offer', 'end_offer'),
      await queryInterface.removeColumn('product_offer', 'description'),
      await queryInterface.removeColumn('product_offer', 'active'),
    ]);
  },
};
