module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('verify_market', 'manager_link', {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('verify_market', 'manager_link'),
    ]);
  },
};


