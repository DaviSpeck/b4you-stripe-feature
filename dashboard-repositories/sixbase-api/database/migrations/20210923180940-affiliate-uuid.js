module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('affiliates', 'uuid', {
        type: Sequelize.UUID,
        unique: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([queryInterface.removeColumn('affiliates', 'uuid')]);
  },
};
