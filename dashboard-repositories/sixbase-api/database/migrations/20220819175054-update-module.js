module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('modules', 'cover', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('modules', 'cover_key', {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('modules', 'cover'),
      queryInterface.removeColumn('modules', 'cover_key'),
    ]);
  },
};
