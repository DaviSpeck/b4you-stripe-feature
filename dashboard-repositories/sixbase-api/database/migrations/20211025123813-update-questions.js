module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('questions', 'id_product', {
        type: Sequelize.BIGINT,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([queryInterface.removeColumn('questions', 'id_product')]);
  },
};
