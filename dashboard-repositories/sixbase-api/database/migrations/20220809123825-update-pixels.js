module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('pixels', 'id_role', {
        type: Sequelize.TINYINT,
        defaultValue: 1,
      }),
      queryInterface.removeColumn('pixels', 'is_affiliate'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('pixels', 'id_role'),
      queryInterface.addColumn('pixels', 'is_affiliate', {
        type: Sequelize.BOOLEAN,
      }),
    ]);
  },
};
