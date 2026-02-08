module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('market_images', 'id_type', {
        type: Sequelize.INTEGER,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('market_images', 'id_type'),
    ]);
  },
};
