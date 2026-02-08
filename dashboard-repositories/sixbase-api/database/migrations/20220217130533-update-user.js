module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('users', 'nickname'),
      queryInterface.removeColumn('users', 'biography'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('users', 'nickname', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('users', 'biography', {
        type: Sequelize.TEXT,
      }),
    ]);
  },
};
