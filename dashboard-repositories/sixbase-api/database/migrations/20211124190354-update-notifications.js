module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('notifications', 'key', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('notifications', 'variant', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('notifications', 'params', {
        type: Sequelize.JSON,
      }),
      queryInterface.changeColumn('notifications', 'read', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('notifications', 'key'),
      queryInterface.removeColumn('notifications', 'variant'),
      queryInterface.removeColumn('notifications', 'params'),
    ]);
  },
};
