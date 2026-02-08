module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('users', 'merlinInteractions', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }),
    ]);
  },
  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('users', 'merlinInteractions'),
    ]);
  },
};